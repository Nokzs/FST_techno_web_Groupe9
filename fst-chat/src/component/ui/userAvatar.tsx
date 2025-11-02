import { useState, useEffect, useRef } from "react";
import { avatarCache } from "../../cache/fileCache";

interface UserAvatarProps {
  url?: string;
  rootRef?: React.RefObject<HTMLElement>; // scroll container
}

export function UserAvatar({ url, rootRef }: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!url || avatarUrl) return;

    let isMounted = true;
    let objectUrl: string | null = null;

    const loadAvatar = async () => {
      if (avatarCache.has(url)) {
        objectUrl = URL.createObjectURL(avatarCache.get(url)!);
        setAvatarUrl(objectUrl);
        return;
      }
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        avatarCache.set(url, blob);
        if (isMounted) setAvatarUrl(objectUrl);
      } catch (e) {
        console.error("Erreur chargement avatar", e);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadAvatar();
            observer.disconnect();
          }
        });
      },
      {
        root: rootRef?.current || null, // observe le scroll container
        rootMargin: "100px",
      },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      observer.disconnect();
    };
  }, [url, rootRef]);

  return (
    <div
      ref={containerRef}
      className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-600">
          ?
        </div>
      )}
    </div>
  );
}
