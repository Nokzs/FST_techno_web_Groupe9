// component/routes/MessagesPage.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { ChatInput } from "./ChatInput";
import { getSignedUrl } from "../../../api/storage/signedUrl";
import { v4 as uuidv4 } from "uuid";
import { getMessageFilePublicUrl } from "../../../api/message/getMessageFilePublicUrl";
import { uploadFile } from "../../../api/storage/uploadFile";
import { type MessageFile, type Message } from "../../../types/messageFileType";
import { MessageItem } from "./MessageItem";
import { socket } from "../../../socket";
import { NavLink, useLoaderData } from "react-router";
import { LanguageSwitcher } from "../../ui/languageSwitcher";
import { useTranslation } from "react-i18next";
import type { User } from "../../../types/user";
import { getUserProfile } from "../../../api/user/getUserProfile";
import { ChatBotWindow } from "../../ui/ChatBotWindows";
import type { MessageLoaderData } from "../../../loaders/messageLoader";
import { PinnedMessages } from "./PinnedMessages";
type MessagesProps = {
  channelId: string | undefined;
  prefetchData: MessageLoaderData;
};
export function Messages({ channelId, prefetchData }: MessagesProps) {
  const { t } = useTranslation();
  const { hasMore, messagesArr, pinnedMessages } =
    useLoaderData<MessageLoaderData>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState<Message[]>(pinnedMessages);
  const [messages, setMessages] = useState<Message[]>(messagesArr);
  const [user, setUser] = useState<User | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const [replyMessage, setReplyMessage] = useState<Message | undefined>(
    undefined,
  );

  const hasMoreRef = useRef<boolean>(hasMore);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  // Scroll automatique après chaque nouveau message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const paginateMessages = useCallback(() => {
    if (!channelId || messages.length === 0) return;
    if (!hasMoreRef.current) return;
    socket.emit(
      "getMessages",
      { channelId, date: messages[messages.length - 1]?.createdAt },
      ({ messages: newMessages, hasMore }) => {
        const filtered = newMessages.filter((msg) => {
          return (
            msg.channelId === channelId &&
            !messages.find((m) => m._id === msg._id)
          );
        });
        setMessages((prev) => [...prev, ...filtered]);
        hasMoreRef.current = hasMore;
      },
    );
  }, [channelId, messages]);

  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMoreRef.current) {
          // Petit délai de debounce
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(async () => {
            paginateMessages();
          }, 400); // 400ms de délai entre deux appels
        }
      },
      {
        root: null, // le conteneur scrollable (null = viewport)
        rootMargin: "0px",
        threshold: 0.1,
      },
    );

    const current = topRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [topRef, paginateMessages]);

  /*Résumé du UseEffect : récupération du profil utilisateur au montage du composant.*/
  useEffect(() => {
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    const fetchUser = async () => {
      try {
        const profile = await getUserProfile(abortSignal);
        setUser(profile);
      } catch (err) {
        console.error("Erreur récupération user :", err);
      }
    };
    fetchUser();
    return () => {
      abortController.abort();
    };
  }, []);

  // 🔹 Connexion socket + récupération des messages
  useEffect(() => {
    if (!channelId) return;
    if (!prefetchData) return;
    if (prefetchData.channelId !== channelId) return;

    setReplyMessage(undefined);
    hasMoreRef.current = prefetchData.hasMore;
    setMessages(prefetchData.messagesArr);
    setPinnedMessage(prefetchData.pinnedMessages);
  }, [channelId]);

  useEffect(() => {
    socket.emit("joinChannelRoom", channelId);

    socket.on("newMessage", (message: Message) => {
      if (message.channelId !== channelId) return;
      setMessages((prev) => {
        if (prev.find((m) => m._id === message._id)) return prev;
        return [message, ...prev];
      });

      socket.emit("read", { userId: user.id, channelId });
      scrollToBottom();
    });
    socket.on("deleteMessage", (messageId: string) => {
      // on met à true la valeur de isDeleted pour le messageId
      setMessages((messages) =>
        messages.map((msg) => {
          if (msg._id === messageId) return {...msg,isDeleted:true}; // message supprimé
          if (msg.replyMessage?._id === messageId)
            return { ...msg, replyMessage: {...msg.replyMessage,isDeleted:true} }; // mettre à jour la réponse
          return msg;
        })
      );
    });
    socket.on("newReactions", (updatedMessage: Message) => {
      if (updatedMessage.channelId !== channelId) return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg,
        ),
      );
    });

    // Gestion de la mise à jour du message avec fichiers
    socket.on("updateMessageFiles", (updatedMessage: Message) => {
      if (updatedMessage.channelId !== channelId) return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id
            ? { ...updatedMessage, sending: false }
            : msg,
        ),
      );
    });

    socket.on("pinMessage", (message: Message) => {
      setMessages((messages) =>
        messages.map((msg) => {
          return msg._id === message._id ? message : msg;
        }),
      );
      setPinnedMessage((messages) =>
        message.isPin
          ? [...messages.filter((m) => m._id !== message._id), message]
          : messages.filter((m) => m._id !== message._id),
      );
    });
    return () => {
      console.log("je quitte la room");
      socket.emit("leaveRoom", channelId);
      socket.off("newMessage");
      socket.off("deleteMessage");
      socket.off("newReactions");
      socket.off("updateMessageFiles");
      socket.off("pinMessage");
    };
  }, [channelId, user]);

  const addMessage = async (text: string, files: File[]) => {
    if (!user.id || !channelId) return;

    const messagesFiles: MessageFile[] = [];

    // Cas avec fichiers
    if (files.length > 0) {
      const optimisticMessage = {
        senderId: user.id,
        channelId,
        content: text,
        receiverId: replyMessage ? replyMessage.senderId._id : undefined,
        replyMessage: replyMessage || null,
        files: [] as MessageFile[],
        sending: true,
      };

      // Envoi de la version finale avec fichiers
      const finalMessage = {
        senderId: user.id,
        channelId,
        content: text,
        receiverId: replyMessage ? replyMessage.senderId._id : undefined,
        replyMessage: replyMessage || null,
        files: messagesFiles,
        sending: false,
      };
      // Envoi de la version optimistique
      socket.emit("sendMessage", optimisticMessage, (message: Message) => {
        finalMessage._id = message._id;
      });

      // Upload des fichiers
      await Promise.all(
        files.map(async (file) => {
          const { signedUrl, path } = await getSignedUrl(
            `file_${uuidv4()}`,
            "messageFile",
            channelId,
          );

          await uploadFile(file, signedUrl, true);

          const { publicUrl } = await getMessageFilePublicUrl(path, channelId);
          messagesFiles.push({
            originalName: file.name + ".gz",
            url: publicUrl,
            mimetype: "application/gzip",
            originalMymeType: file.type,
          });
        }),
      );

      socket.emit("updateMessageFiles", finalMessage);
    } else {
      // Cas sans fichiers : envoi direct
      const message = {
        senderId: user.id,
        channelId,
        content: text,
        receiverId: replyMessage ? replyMessage.senderId._id : undefined,
        replyMessage: replyMessage || null,
        files: [],
        sending: false,
      };
      socket.emit("sendMessage", message);
    }
  };

  if (!channelId) {
    return <></>;
  }

  return (
    <>
      <ChatBotWindow channelId={channelId} userId={user} />
      <div className="h-screen flex flex-col p-10 w-full relative">
        <LanguageSwitcher className="absolute top-0 right-0 mt-4" />

        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          <NavLink to="/servers">
            {"<-"}
            {t("tchat.tchatRoom")}
          </NavLink>
        </h1>

        {/* Bouton pour ouvrir le drawer des messages épinglés */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="px-4 py-2 bg-yellow-400 text-black rounded mb-2 self-start"
        >
          📌 Messages épinglés
        </button>

        {/* Liste des messages */}
        <div
          key={channelId}
          ref={messagesRef}
          className="flex-1 overflow-y-auto flex flex-col-reverse gap-4 messages-container"
        >
          <div ref={messagesEndRef} />
          {messages.slice().map((msg, index: number) => (
            <MessageItem
              key={msg._id + index}
              messageRef={messagesRef!}
              message={msg}
              isOwner={msg.senderId._id === user?.id}
              currentUserId={user?.id}
              channelId={channelId!}
              onReply={setReplyMessage}
            />
          ))}
          {messages.length > 0 && <div ref={topRef}></div>}
        </div>

        <ChatInput
          sendMessage={addMessage}
          replyMessage={replyMessage}
          onReply={setReplyMessage}
        />

        {/* Drawer des messages épinglés */}
        {drawerOpen && (
          <div className="fixed top-0 right-0 w-80 h-full bg-gray-900 text-white shadow-lg z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="font-bold text-lg">📌 Messages épinglés</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-white text-lg font-bold"
              >
                X
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <PinnedMessages messages={pinnedMessage} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
