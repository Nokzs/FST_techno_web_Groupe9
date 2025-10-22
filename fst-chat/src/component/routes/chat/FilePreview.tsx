import { type MessageFile } from "./messageFileType";

export function FilePreview({ file }: { file: MessageFile }) {
  const isImage = file.mimetype.startsWith("image/");
  const isVideo = file.mimetype.startsWith("video/");
  const isAudio = file.mimetype.startsWith("audio/");
  const isPdf = file.mimetype === "application/pdf";

  if (isImage) {
    return (
      <img
        src={file.url}
        alt={file.originalName}
        className="w-32 h-32 object-cover rounded-lg shadow"
      />
    );
  }

  if (isVideo) {
    return (
      <video controls src={file.url} className="w-48 h-32 rounded-lg shadow" />
    );
  }

  if (isAudio) {
    return (
      <audio
        controls
        src={file.url}
        className="w-full max-w-sm rounded-lg shadow"
      />
    );
  }

  if (isPdf) {
    return (
      <a
        href={file.url}
        target="_blank"
        download={file.url}
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        📄 {file.originalName}
      </a>
    );
  }

  // Fichiers autres (ZIP, DOCX, etc.)
  return (
    <a
      href={file.url}
      target="_blank"
      download={file.url}
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
    >
      📎 {file.originalName}
    </a>
  );
}
