import { useLoaderData } from "react-router";
import {
  fetchMessages,
  type MessageLoaderData,
} from "../loaders/messageLoader";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import type { Message } from "../types/messageFileType";
import { socket } from "../socket";
import type { User } from "../types/user";
import { fetchSync, mergeMessages } from "../api/message/fetchSync";

export const useMessages = (
  channelId: string,
  topRef: RefObject<HTMLDivElement | null>,
  messagesEndRef: RefObject<HTMLDivElement | null>,
  prefetchData: MessageLoaderData | undefined,
  setReplyMessage: Dispatch<SetStateAction<Message | undefined>>,
  user: User | null,
  messageRef: RefObject<HTMLDivElement | null>,
  setTypingUsers: Dispatch<SetStateAction<string[]>>,
): {
  messages: Message[];
  pinnedMessage: Message[];
} => {
  const { hasMore, messagesArr, pinnedMessages } =
    useLoaderData<MessageLoaderData>();
  const [messages, setMessages] = useState<Message[]>(messagesArr);

  const [pinnedMessage, setPinnedMessage] = useState<Message[]>(pinnedMessages);
  const hasMoreRef = useRef<boolean>(hasMore);
  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };
  const paginateMessagesHTTP = useCallback(async () => {
    if (!channelId || messages.length === 0) return;
    if (!hasMoreRef.current) return;

    try {
      const lastMessageDate = messages[messages.length - 1]?.createdAt;
      const data = await fetchMessages(channelId, lastMessageDate);
      const filtered = data.messages.filter(
        (msg) => !messages.find((m) => m._id === msg._id),
      );

      // Mise à jour du state
      setMessages((prev) => [...prev, ...filtered]);
      hasMoreRef.current = data.hasMore;
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [channelId, messages]);
  /*   const paginateMessages = useCallback(() => {
    if (!channelId || messages.length === 0) return;
    if (!hasMoreRef.current) return;
    socket.emit(
      "getMessages",
      { channelId, date: messages[messages.length - 1]?.createdAt },
      ({ messages: newMessages, hasMore }) => {
        const filtered = newMessages.filter((msg: Message) => {
          return (
            msg.channelId === channelId &&
            !messages.find((m: Message) => m._id === msg._id)
          );
        });
        setMessages((prev) => [...prev, ...filtered]);
        hasMoreRef.current = hasMore;
      },
    );
  }, [channelId, messages]); */

  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMoreRef.current) {
          // Petit délai de debounce
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(async () => {
            paginateMessagesHTTP();
          }, 100);
        }
      },
      {
        root: messageRef.current, // le conteneur scrollable (null = viewport)
        rootMargin: "400px",
        threshold: 0,
      },
    );

    const current = topRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [topRef.current, paginateMessagesHTTP, messageRef.current]);

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
    if (!channelId) return;
    if (!user) return;
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
          if (msg._id === messageId) return { ...msg, isDeleted: true }; // message supprimé
          if (msg.replyMessage?._id === messageId)
            return {
              ...msg,
              replyMessage: { ...msg.replyMessage, isDeleted: true },
            }; // mettre à jour la réponse
          return msg;
        }),
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

    socket.on("disconnect", () => {
      const lastDisconnectAt = new Date().toISOString();

      const handleReconnect = async () => {
        const lastMessage = messages[messages.length - 1]?.createdAt;
        const syncMessage = await fetchSync(
          lastDisconnectAt,
          lastMessage,
          channelId,
        );
        mergeMessages(syncMessage, setMessages);
        socket.off("reconnect", handleReconnect);
      };

      // ⚡ On n’écoute la reconnexion que si on vient de se déconnecter
      socket.on("reconnect", handleReconnect);
    });

    socket.on(
      "typingUpdate",
      ({
        channelId: chId,
        users,
      }: {
        channelId: string;
        users: { id: string; pseudo: string }[];
      }) => {
        if (chId !== channelId) return;
        const currentId = user?.id;
        const names = users
          .filter((u) => u.id !== currentId)
          .map((u) => u.pseudo || u.id);
        setTypingUsers(names);
      },
    );

    return () => {
      socket.emit("leaveRoom", channelId);
      socket.off("newMessage");
      socket.off("deleteMessage");
      socket.off("newReactions");
      socket.off("updateMessageFiles");
      socket.off("pinMessage");
      socket.off("disconnect");
      socket.off("typingUpdate");
    };
  }, [channelId, user]);
  return { messages, pinnedMessage };
};
