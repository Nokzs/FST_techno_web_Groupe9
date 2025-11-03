// component/routes/MessagesPage.tsx
import { useState, useRef, useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { getSignedUrl } from "../../../api/storage/signedUrl";
import { v4 as uuidv4 } from "uuid";
import { getMessageFilePublicUrl } from "../../../api/message/getMessageFilePublicUrl";
import { uploadFile } from "../../../api/storage/uploadFile";
import { type MessageFile, type Message } from "../../../types/messageFileType";
import { MessageItem } from "./MessageItem";
import { socket } from "../../../socket";
import { NavLink, useParams } from "react-router";
import { LanguageSwitcher } from "../../ui/languageSwitcher";
import { useTranslation } from "react-i18next";
import type { User } from "../../../types/user";
import { getUserProfile } from "../../../api/user/getUserProfile";
import { ChatBotWindow } from "../../ui/ChatBotWindows";
import type { MessageLoaderData } from "../../../loaders/messageLoader";
import { PinnedMessages } from "./PinnedMessages";
import { useMessages } from "../../../hooks/useMessages";
import { MembersList } from "../../../api/members/members-list";
import { can } from "../../../utils/roles";
type MessagesProps = {
  channelId: string;
  prefetchData: MessageLoaderData;
};
export function Messages({ channelId, prefetchData }: MessagesProps) {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const [replyMessage, setReplyMessage] = useState<Message | undefined>(
    undefined,
  );
  const { serverId } = useParams<{ serverId: string }>();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const { messages, pinnedMessage } = useMessages(
    channelId,
    topRef,
    messagesEndRef,
    prefetchData,
    setReplyMessage,
    user,
    messagesRef,
    setTypingUsers,
  );

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
  }, []);

  const addMessage = async (text: string, files: File[]) => {
    if (!user?.id || !channelId) return;

    const messagesFiles: MessageFile[] = [];

    // Cas avec fichiers
    if (files.length > 0) {
      const optimisticMessage = {
        senderId: user?.id,
        channelId,
        content: text,
        receiverId: replyMessage ? replyMessage.senderId._id : undefined,
        replyMessage: replyMessage || null,
        files: [] as MessageFile[],
        sending: true,
      };

      // Envoi de la version finale avec fichiers
      const finalMessage = {
        _id:"",
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
        senderId: user?.id,
        channelId,
        content: text,
        receiverId: replyMessage ? replyMessage.senderId?._id : undefined,
        replyMessage: replyMessage || null,
        files: [],
        sending: false,
      };
      socket.emit("sendMessage", message);
    }
  };

  const [members, setMembers] = useState<User[]>([]);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  const [membersCollapsed, setMembersCollapsed] = useState(false);
  const [myRole, setMyRole] =
    useState<import("../../../utils/roles").AppRole>(null);
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    if (!serverId) return;
    // rejoindre la room du serveur pour recevoir les updates temps réel
    console.log("[Messages] watchServer emit", { serverId });
    socket.emit("watchServer", { serverId });
    const onMemberJoined = ({
      serverId: sid,
      user,
    }: {
      serverId: string;
      user: User;
    }) => {
      console.log("[Messages] serverMemberJoined received", {
        sid,
        expected: serverId,
        userId: user?.id,
      });
      if (sid !== serverId) return;
      setMembers((prev) =>
        prev.some((u) => u.id === user.id) ? prev : [...prev, user],
      );
    };
    const onMemberLeft = ({
      serverId: sid,
      userId,
    }: {
      serverId: string;
      userId: string;
    }) => {
      if (sid !== serverId) return;
      setMembers((prev) => prev.filter((u) => u.id !== userId));
    };
    socket.on("serverMemberJoined", onMemberJoined);
    socket.on("serverMemberLeft", onMemberLeft);
    socket.on(
      "serverPresenceUpdate",
      ({
        serverId: sid,
        onlineUserIds,
      }: {
        serverId: string;
        onlineUserIds: string[];
      }) => {
        if (sid !== serverId) return;
        setOnlineIds(onlineUserIds || []);
      },
    );
    socket.on("serverDeleted", ({ serverId: sid }: { serverId: string }) => {
      if (sid === serverId) {
        window.location.href = "/servers";
      }
    });
    (async () => {
      try {
        const res = await fetch(`${API_URL}/servers/${serverId}/members`, {
          credentials: "include",
        });
        const data = await res.json();
        if (Array.isArray(data)) setMembers(data);
        try {
          const rr = await fetch(`${API_URL}/servers/${serverId}/me`, {
            credentials: "include",
          });
          const jr = await rr.json();
          if (jr?.role) setMyRole(jr.role);
        } catch {
          /* ignore */
        }
        try {
          const rmap = await fetch(`${API_URL}/roles/server/${serverId}`, {
            credentials: "include",
          });
          const jmap = await rmap.json();
          if (jmap && typeof jmap === "object")
            setMemberRoles(jmap as Record<string, string>);
        } catch {
          /* ignore */
        }
      } catch (e) {
        console.error("Erreur récupération membres:", e);
      }
    })();
    return () => {
      socket.off("serverMemberJoined", onMemberJoined);
      socket.off("serverMemberLeft", onMemberLeft);
      socket.off("serverPresenceUpdate");
      socket.off("serverDeleted");
      console.log("[Messages] unwatchServer emit", { serverId });
      socket.emit("unwatchServer", { serverId });
    };
  }, [serverId]);

  // Redirection si le salon courant est supprimé
  useEffect(() => {
    if (!serverId || !channelId) return;
    const handler = ({ channelId: deletedId }: { channelId: string }) => {
      if (deletedId === channelId) {
        socket.emit("leaveRoom", channelId);
        window.location.href = `/servers`;
      }
    };
    socket.on("channelDeleted", handler);
    return () => {
      socket.off("channelDeleted", handler);
    };
  }, [serverId, channelId]);

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

          <span className="mx-2">{t("tchat.tchatRoom")}</span>
          <button
            className="text-sm text-blue-600 hover:underline ml-auto"
            onClick={() => setMembersCollapsed((v) => !v)}
            aria-expanded={!membersCollapsed}
            title={
              membersCollapsed
                ? "Afficher la liste des membres"
                : "Masquer la liste des membres"
            }
          >
            {membersCollapsed ? "Afficher membres" : "Masquer membres"}
          </button>
        </h1>

        {/* Bouton pour ouvrir le drawer des messages épinglés */}
        <button
          onClick={() => setDrawerOpen((draw) => !draw)}
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
              ROLE={myRole}
              key={msg._id + index}
              messageRef={messagesRef}
              message={msg}
              isOwner={msg.senderId._id === user?.id}
              currentUserId={user?.id || ""}
              channelId={channelId!}
              onReply={setReplyMessage}
            />
          ))}
          {messages.length > 0 && (
            <div
              id="TopRef"
              ref={topRef}
              style={{ minHeight: "1px", visibility: "hidden" }}
            />
          )}
        </div>
        {typingUsers.length > 0 && (
          <div className="px-2 pb-2 text-sm text-gray-600 dark:text-gray-300">
            {typingUsers.length === 1
              ? t("tchat.typing.one", { name: typingUsers[0] })
              : typingUsers.length === 2
                ? t("tchat.typing.two", {
                    name1: typingUsers[0],
                    name2: typingUsers[1],
                  })
                : t("tchat.typing.many", {
                    name1: typingUsers[0],
                    name2: typingUsers[1],
                    count: typingUsers.length - 2,
                  })}
          </div>
        )}
        {!can(myRole, "MEMBER") ? (
          <div className="p-4 border-t text-sm text-gray-500 dark:text-gray-400">
            Lecture seule sur ce serveur.
          </div>
        ) : (
          <ChatInput
            sendMessage={addMessage}
            replyMessage={replyMessage}
            onReply={setReplyMessage}
          />
        )}

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
              <PinnedMessages messages={pinnedMessage} role={myRole} />
            </div>
          </div>
        )}
      </div>
      {/* Members sidebar */}
      <div
        className={
          (membersCollapsed ? "w-0 " : "w-64 ") +
          "transition-all duration-200 overflow-hidden border-l border-gray-200 dark:border-gray-700 bg-white/40 dark:bg-gray-900/20 shrink-0 flex flex-col"
        }
      >
        {!membersCollapsed && (
          <>
            <div className="p-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Membres ({members.length})
              </span>
            </div>
            <MembersList
              user={user}
              serverId={serverId!}
              users={members}
              onlineIds={onlineIds}
              className="bg-transparent p-2"
              myRole={myRole || undefined}
              rolesByUserId={memberRoles}
              onRoleChange={(uid, role) =>
                setMemberRoles((prev) => ({ ...prev, [uid]: role }))
              }
            />
          </>
        )}
      </div>
    </>
  );
}
