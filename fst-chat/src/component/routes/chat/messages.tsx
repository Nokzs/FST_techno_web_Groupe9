// component/routes/MessagesPage.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { ChatInput } from "./ChatInput";
import { getSignedUrl } from "../../../api/storage/signedUrl";
import { v4 as uuidv4 } from "uuid";
import { getMessageFilePublicUrl } from "../../../api/message/getMessageFilePublicUrl";
import { uploadFile } from "../../../api/storage/uploadFile";
import { type MessageFile, type Message } from "./messageFileType";
import { MessageItem } from "./MessageItem";
import { socket } from "../../../socket";
import { NavLink, useLoaderData } from "react-router";
import { LanguageSwitcher } from "../../ui/languageSwitcher";
import { useTranslation } from "react-i18next";
import type { User } from "../../../types/user";
import { getUserProfile } from "../../../api/user/getUserProfile";
import { ChatBotWindow } from "../../ui/ChatBotWindows";
import type { MessageLoaderData } from "../../../loaders/messageLoader";
type MessagesProps = {
  channelId: string | undefined;
  prefetchData:MessageLoaderData;
};
export function Messages({ channelId, prefetchData }: MessagesProps) {
  const { t } = useTranslation();
  const {hasMore,messagesArr} = useLoaderData();
  console.log("les données du loader sont", typeof hasMore)

  const takePrefetchData = prefetchData && prefetchData.channelId === channelId 
  console.log("je dois prendre les données prefetch", takePrefetchData ? "oui":"non")
  const [messages, setMessages] = useState<Message[]>( takePrefetchData ? prefetchData.messagesArr : messagesArr);
  const [user, setUser] = useState<User | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const [replyMessage, setReplyMessage] = useState<Message | undefined>(
    undefined,
  );

  const hasMoreRef = useRef<boolean>(takePrefetchData ? prefetchData.hasMore : hasMore);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  // Scroll automatique après chaque nouveau message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const paginateMessages = useCallback(() => {
    socket.emit(
      "getMessages",
      { channelId, date: messages[messages.length - 1]?.createdAt },
      ({ messages, hasMore }) => {
        setMessages((oldMessages) => [...oldMessages, ...messages]);
        hasMoreRef.current = hasMore;
      },
    );
  }, [channelId, messages]);

  /*Résumé du UseEffect : installer un IntersectionObserver 
  pour charger plus de messages lorsque l'utilisateur fait défiler vers le haut.*/
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];
        if (first.isIntersecting   && hasMoreRef.current) {
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
      //abortController.abort();
    };
  }, []);

  // 🔹 Connexion socket + récupération des messages
  useEffect(() => {
    if (!channelId) return;

     const takePrefetchData = prefetchData && prefetchData.channelId === channelId 
     setReplyMessage(undefined)
    setMessages(takePrefetchData ? prefetchData.messagesArr : messagesArr)
    console.log("resultat ?",
takePrefetchData ? prefetchData.hasMore : hasMore
    )
    hasMoreRef.current  = true
    // rejoindre la "room" du channel
    //socket.emit("joinChannelRoom", channelId);
    /*socket.emit(
      "getMessages",
      { channelId, date: null },
      ({ messages, hasMore }: { messages: Message[]; hasMore: boolean }) => {
        console.log("Récupération des messages pour le channel :", channelId);

        console.log("Messages reçus :", messages);

        setMessages(messages);

        console.log("Messages chargés :", messages);

        hasMoreRef.current = hasMore;

        scrollToBottom();

        setLoading(false);
      },
    );*/
    
    socket.emit("joinChannelRoom", channelId);
    scrollToBottom()
    socket.on("newMessage", (message: Message) => {
      console.log("Événement newMessage reçu :", message);
      if (message.channelId === channelId) {
        console.log("Nouveau message reçu :", message);
        setMessages((prev) => [message, ...prev]);
        scrollToBottom();
      }
    });
    socket.on("newReactions", (updatedMessage: Message) => {
      console.log(
        "Message mis à jour avec de nouvelles réactions :",
        updatedMessage,
      );
      setMessages((messages) =>
        messages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg,
        ),
      );
    });
    // Gestion de la mise à jour du message avec fichiers
    socket.on("updateMessageFiles", (updatedMessage: Message) => {
      console.log("Message mis à jour avec des fichiers :", updatedMessage);

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMessage._id
            ? { ...updatedMessage, sending: false } // met sending à false pour la version finale
            : msg,
        ),
      );
    });
    return () => {
      console.log("je quitte la room");
      socket.emit("leaveRoom", channelId);
      socket.off("newMessage");
      socket.off("newReactions");
      socket.off("updateMessageFiles");
    };
  }, [channelId]);

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

      console.log(finalMessage);
      // Upload des fichiers
      await Promise.all(
        files.map(async (file) => {
          const { signedUrl, path } = await getSignedUrl(
            `file_${uuidv4()}`,
            "messageFile",
            channelId,
          );

          await uploadFile(file, signedUrl);

          const { publicUrl } = await getMessageFilePublicUrl(path, channelId);
          messagesFiles.push({
            originalName: file.name + ".gz",
            url: publicUrl,
            mimetype: "application/gzip",
            originalMymeType: file.type,
          });
        }),
      );

      console.log("Envoi du message final avec fichiers :", finalMessage);
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
      <div className="h-screen flex flex-col p-10 w-full">
        <LanguageSwitcher className="absolute top-0 right-0 mt-4" />
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          <NavLink to="/servers">{"<-"}</NavLink>
          {t("tchat.tchatRoom")}
        </h1>

        {/* Liste des messages */}
        <div
          ref={messagesRef}
          className="flex-1 overflow-y-auto flex flex-col-reverse gap-4 messages-container"
        >
          <div ref={messagesEndRef} />
          {messages.slice().map((msg, index: number) => (
            <MessageItem
              key={index}
              messageRef={messagesRef}
              message={msg}
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
      </div>
    </>
  );
}
