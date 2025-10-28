import { type MessageFile } from "./messageFileType";
import { useEffect, useRef, useState } from "react";
import { gunzipSync } from "fflate";

type FilePreviewProps = {
  file: MessageFile;
  scrollContainerRef?: React.RefObject<HTMLElement>; // facultatif
};

export function FilePreview({ file, scrollContainerRef }: FilePreviewProps) {
  console.log(file)
  const [decompressedUrl, setDecompressedUrl] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isCompressed = file.originalName.endsWith(".gz");
  const mime = file.originalMymeType || file.mimetype || "image/";

  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");
  const isAudio = mime.startsWith("audio/");
  const isPdf = mime === "application/pdf";

  // Observer pour déclencher la pré-décompression
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log("je suis vu")
          setIsVisible(true);
          observer.disconnect(); // plus besoin d'observer après déclenchement
        }
        else{
          setIsVisible(false)
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
        console.error("Erreur lors de la décompression :", err);
      }
    };

    decompress();

    return () => controller.abort();
  }, [file.url, mime, isCompressed, isVisible,decompressedUrl]);

  const displayUrl = isCompressed ? decompressedUrl : file.url;

  return (
    <div ref={ref} className="inline-block w-32 h-32">
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
        <audio
          controls
          src={displayUrl!}
          className="w-full rounded-lg shadow"
        />
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
