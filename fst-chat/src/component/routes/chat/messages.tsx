// component/routes/MessagesPage.tsx
import { useState, useRef, useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { getSignedUrl } from "../../../api/storage/signedUrl";
import { v4 as uuidv4 } from "uuid";
import { getMessageFilePublicUrl } from "../../../api/message/getMessageFilePublicUrl";
import { uploadFile } from "../../../api/storage/uploadFile";
import { type MessageFile, type Message } from "./messageFileType";
import { MessageItem } from "./MessageItem";
import { socket } from "../../../socket";
import { NavLink, useParams } from "react-router";
import { LanguageSwitcher } from "../../ui/languageSwitcher";
import { useTranslation } from "react-i18next";
import type { User } from "../../../types/user";
import { getUserProfile } from "../../../api/user/getUserProfile";
import { MembersList } from "../../../api/members/members-list";
import { can } from "../../../utils/roles";


export function Messages() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const [replyMessage, setReplyMessage] = useState<Message | undefined>(
    undefined,
  );
  const { serverId, channelId } = useParams<{ serverId: string; channelId: string }>();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll automatique après chaque nouveau message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

   useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (err) {
        console.error("Erreur récupération user :", err);
      }
    };
    fetchUser();
  }, []);

  // 🔹 Connexion socket + récupération des messages
  useEffect(() => {
    if (!channelId) return;

    // rejoindre la "room" du channel
    console.log("je rentre dans la room");
    socket.emit("joinChannelRoom", channelId);

    socket.emit("getMessages", channelId, (messages: Message[]) => {
      console.log("Récupération des messages pour le channel :", channelId);
      setMessages(messages);
      setLoading(false);
      scrollToBottom();
    });

    socket.on("newMessage", (message: Message) => {
      console.log("Événement newMessage reçu :", message);
      if (message.channelId === channelId) {
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
    socket.on(
      "typingUpdate",
      ({ channelId: chId, users }: { channelId: string; users: { id: string; pseudo: string }[] }) => {
        if (chId !== channelId) return;
        const currentId = user?.id;
        const names = users
          .filter((u) => u.id !== currentId)
          .map((u) => u.pseudo || u.id);
        setTypingUsers(names);
      },
    );
    return () => {
      console.log("je quitte la room");
      socket.emit("leaveRoom", channelId);
      socket.off("newMessage");
      socket.off("typingUpdate");
    };
  }, [channelId, user?.id]);

  // 🔹 Envoi d’un message
  const addMessage = async (text: string, files: File[]) => {
    if (!user.id || !channelId) return;
    const messagesFiles: MessageFile[] = [];
    if (files.length > 0) {
      // pour chaque image, on demande un lien d'upload à l'aide de la fonction getPresignedUrl
      await Promise.all(
        files.map(async (file) => {
          const { signedUrl, path } = await getSignedUrl(
            `file_${uuidv4()}`,
            "messageFile",
            "1",
          );

          await uploadFile(file, signedUrl);

          const { publicUrl } = await getMessageFilePublicUrl(path, "1");

          messagesFiles.push({
            originalName: file.name,
            url: publicUrl,
            mimetype: file.type,
          });
        }),
      );
    }
    const newMessage = {
      senderId: user.id,
      channelId: channelId,
      content: text,
      receiverId: replyMessage ? replyMessage.senderId._id : undefined,
      replyMessage: replyMessage || null,
    };

    socket.emit("sendMessage", { ...newMessage, files: messagesFiles });
    console.log("Message envoyé :", newMessage);
  };

  const [members, setMembers] = useState<User[]>([]);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  const [membersCollapsed, setMembersCollapsed] = useState(false);
  const [myRole, setMyRole] = useState<import('../../../utils/roles').AppRole>(null);
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    if (!serverId) return;
    // rejoindre la room du serveur pour recevoir les updates temps réel
    console.log('[Messages] watchServer emit', { serverId });
    socket.emit('watchServer', { serverId });
    const onMemberJoined = ({ serverId: sid, user }: { serverId: string; user: User }) => {
      console.log('[Messages] serverMemberJoined received', { sid, expected: serverId, userId: user?.id });
      if (sid !== serverId) return;
      setMembers((prev) => (prev.some((u) => u.id === user.id) ? prev : [...prev, user]));
    };
    const onMemberLeft = ({ serverId: sid, userId }: { serverId: string; userId: string }) => {
      if (sid !== serverId) return;
      setMembers((prev) => prev.filter((u) => u.id !== userId));
    };
    socket.on('serverMemberJoined', onMemberJoined);
    socket.on('serverMemberLeft', onMemberLeft);
    socket.on('serverPresenceUpdate', ({ serverId: sid, onlineUserIds }: { serverId: string; onlineUserIds: string[] }) => {
      if (sid !== serverId) return;
      setOnlineIds(onlineUserIds || []);
    });
    socket.on('serverDeleted', ({ serverId: sid }: { serverId: string }) => {
      if (sid === serverId) {
        window.location.href = '/servers';
      }
    });
    (async () => {
      try {
        const res = await fetch(`${API_URL}/servers/${serverId}/members`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (Array.isArray(data)) setMembers(data);
        try {
          const rr = await fetch(`${API_URL}/servers/${serverId}/me`, { credentials: 'include' });
          const jr = await rr.json();
          if (jr?.role) setMyRole(jr.role);
        } catch { /* ignore */ }
        try {
          const rmap = await fetch(`${API_URL}/roles/server/${serverId}`, { credentials: 'include' });
          const jmap = await rmap.json();
          if (jmap && typeof jmap === 'object') setMemberRoles(jmap as Record<string, string>);
        } catch { /* ignore */ }
      } catch (e) {
        console.error('Erreur récupération membres:', e);
      }
    })();
    return () => {
      socket.off('serverMemberJoined', onMemberJoined);
      socket.off('serverMemberLeft', onMemberLeft);
      socket.off('serverPresenceUpdate');
      socket.off('serverDeleted');
      console.log('[Messages] unwatchServer emit', { serverId });
      socket.emit('unwatchServer', { serverId });
    };
  }, [serverId]);

  // Redirection si le salon courant est supprimé
  useEffect(() => {
    if (!serverId || !channelId) return;
    const handler = ({ channelId: deletedId }: { channelId: string }) => {
      if (deletedId === channelId) {
        socket.emit('leaveRoom', channelId);
        window.location.href = `/servers`;
      }
    };
    socket.on('channelDeleted', handler);
    return () => {
      socket.off('channelDeleted', handler);
    };
  }, [serverId, channelId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-800 dark:text-white">
        {t("tchat.loadingMessages")}
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Main chat column */}
      <div className="flex-1 flex flex-col p-10">
        <LanguageSwitcher className="absolute top-0 right-0 mt-4" />
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center justify-between">
          <NavLink to="/servers">{"<-"}</NavLink>
          <span className="mx-2">{t("tchat.tchatRoom")}</span>
          <button
            className="text-sm text-blue-600 hover:underline ml-auto"
            onClick={() => setMembersCollapsed((v) => !v)}
            aria-expanded={!membersCollapsed}
            title={membersCollapsed ? 'Afficher la liste des membres' : 'Masquer la liste des membres'}
          >
            {membersCollapsed ? 'Afficher membres' : 'Masquer membres'}
          </button>
        </h1>

      {/* Liste des messages */}
      <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-4 messages-container">
        <div ref={messagesEndRef} />
        {messages.slice().map((msg, index: number) => (
          <MessageItem
            key={index}
            message={msg}
            currentUserId={user.id}
            channelId={channelId!}
            onReply={setReplyMessage}
          />
        ))}
      </div>
      {typingUsers.length > 0 && (
        <div className="px-2 pb-2 text-sm text-gray-600 dark:text-gray-300">
          {typingUsers.length === 1
            ? t("tchat.typing.one", { name: typingUsers[0] })
            : typingUsers.length === 2
            ? t("tchat.typing.two", { name1: typingUsers[0], name2: typingUsers[1] })
            : t("tchat.typing.many", {
                name1: typingUsers[0],
                name2: typingUsers[1],
                count: typingUsers.length - 2,
              })}
        </div>
      )}
        {!can(myRole, 'MEMBER') ? (
          <div className="p-4 border-t text-sm text-gray-500 dark:text-gray-400">
            Lecture seule sur ce serveur.
          </div>
        ) : (
          <ChatInput
            sendMessage={addMessage}
            replyMessage={replyMessage}
            onReply={setReplyMessage}
            channelId={channelId}
          />
        )}
      </div>
      {/* Members sidebar */}
      <div className={(membersCollapsed ? "w-0 " : "w-64 ") + "transition-all duration-200 overflow-hidden border-l border-gray-200 dark:border-gray-700 bg-white/40 dark:bg-gray-900/20 shrink-0 flex flex-col"}>
        {!membersCollapsed && (
          <>
            <div className="p-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Membres ({members.length})
              </span>
            </div>
            <MembersList
              serverId={serverId!}
              users={members}
              onlineIds={onlineIds}
              className="bg-transparent p-2"
              myRole={myRole || undefined}
              rolesByUserId={memberRoles}
              onRoleChange={(uid, role) => setMemberRoles(prev => ({ ...prev, [uid]: role }))}
            />
          </>
        )}
      </div>
    </div>
  );
}
