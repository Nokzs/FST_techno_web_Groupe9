import { type MessageFile } from "../../../types/messageFileType";
import { useEffect, useRef, useState } from "react";
import { gunzipSync } from "fflate";
import { cn } from "../../../utils/cn";
import { AudioPlayer } from "react-audio-play";
import { useDarkMode } from "../../../hooks/useDarkMode";
type FilePreviewProps = {
  file: MessageFile;
  scrollContainerRef?: React.RefObject<HTMLElement | null>; // facultatif
};

export function FilePreview({ file, scrollContainerRef }: FilePreviewProps) {
  const [decompressedUrl, setDecompressedUrl] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isCompressed = file.originalName.endsWith(".gz");
  const mime = file.originalMymeType || file.mimetype || "image/";

  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");
  const isAudio = mime.startsWith("audio/");
  const isPdf = mime === "application/pdf";
  const { darkMode } = useDarkMode();
  // Observer pour déclencher la pré-décompression
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // plus besoin d'observer après déclenchement
        } else {
          setIsVisible(false);
        }
      },
      {
        root: scrollContainerRef?.current,
        rootMargin: "500px 0px 500px 0px", // 500px avant/après le viewport
        threshold: 0, // déclenche dès qu’un pixel est dans la zone
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [scrollContainerRef]);

  // Décompression uniquement si visible et compressé
  useEffect(() => {
    if (!isCompressed || !isVisible) {
      // si plus visible, on révoque l’URL précédente
      if (decompressedUrl) {
        URL.revokeObjectURL(decompressedUrl);
        setDecompressedUrl(null);
      }
      return;
    }
    const controller = new AbortController();
    const signal = controller.signal;

    const decompress = async () => {
      try {
        const res = await fetch(file.url, { signal });
        const arrayBuffer = await res.arrayBuffer();
        const compressed = new Uint8Array(arrayBuffer);
        const decompressed = gunzipSync(compressed);
        const blob = new Blob([decompressed], { type: mime });
        setDecompressedUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error("Erreur lors de la décompression :", err, file);
      }
    };

    decompress();

    return () => controller.abort();
  }, [file.url, mime, isCompressed, isVisible, decompressedUrl]);

  const displayUrl = isCompressed ? decompressedUrl : file.url;

  return (
    <div
      ref={ref}
      className={cn(
        "inline-block h-auto",
        isAudio ? "w-full max-w-full" : "w-28 sm:w-32 md:w-40 aspect-square",
      )}
    >
      {!displayUrl && isCompressed ? (
        <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse" />
      ) : isImage ? (
        <img
          src={displayUrl!}
          alt={file.originalName}
          className="w-full h-full object-cover rounded-lg shadow"
        />
      ) : isVideo ? (
        <video
          controls
          src={displayUrl!}
          className="w-full h-full rounded-lg shadow"
        />
      ) : isAudio ? (
        <div
          className={cn(
            "w-full flex items-center justify-start p-2 bg-gray-700/20 rounded-lg shadow-sm",
          )}
        >
          <AudioPlayer
            src={displayUrl!}
            controls
            className="w-full rounded-2xl overflow-x-hidden"
            color={darkMode ? "#f0f0f0" : "#1a1a1a"}
            sliderColor="#94b9ff"
            backgroundColor={darkMode ? "#1a1a1a" : "#f0f0f0"}
          />
        </div>
      ) : isPdf ? (
        <a
          href={displayUrl!}
          download={file.originalName.replace(/\.gz$/, "")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          📄 {file.originalName.replace(/\.gz$/, "")}
        </a>
      ) : (
        <a
          href={displayUrl!}
          download={file.originalName.replace(/\.gz$/, "")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          {isCompressed ? "🗜️" : "📎"} {file.originalName.replace(/\.gz$/, "")}
        </a>
      )}
    </div>
  );
}
