import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { AudioRecorder as VoiceRecorder } from "react-audio-voice-recorder";

type ChatInputProps = {
  sendMessage: (message: string, files: File[]) => void;
};

export function ChatInput({ sendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!message.trim() && files.length === 0) return;
    sendMessage(message, files);
    setMessage("");
    setFiles([]);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) {
      setFiles((prev) => [...prev, ...dropped]);
    }
  };

  // Callback quand le composant audio lib retourne un blob
  const onRecordingComplete = (blob: Blob) => {
    // Transformer en File
    const file = new File([blob], `audio_${Date.now()}.webm`, {
      type: blob.type,
    });
    setFiles((prev) => [...prev, file]);
  };

  return (
    <div
      className="p-4 border-t flex flex-col gap-2 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-blue-200/30 border-2 border-blue-400 border-dashed rounded-lg pointer-events-none" />
      )}

      {files.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {files.map((file, i) => (
            <div key={i} className="relative w-20 h-20 flex-shrink-0">
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded-lg shadow"
                />
              ) : file.type.startsWith("audio/") ? (
                <audio
                  controls
                  src={URL.createObjectURL(file)}
                  className="w-20 h-20 rounded-lg shadow"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-lg shadow text-xs text-center p-1">
                  📎{" "}
                  {file.name.length > 10
                    ? file.name.slice(0, 10) + "..."
                    : file.name}
                </div>
              )}
              <button
                onClick={() => handleRemoveFile(i)}
                className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 relative">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xl"
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-xl"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div
              ref={pickerRef}
              className="absolute bottom-12 left-0 z-50 shadow-lg"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                lazyLoadEmojis
                width={300}
                height={400}
                defaultSkinTone={SkinTones.MEDIUM_LIGHT}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        <input
          type="text"
          value={message}
          onChange={handleTextChange}
          placeholder="Écris un message..."
          className="flex-1 border-2 dark:border-white border-black rounded-lg px-3 py-2 focus:outline-none text-black dark:text-white bg-white dark:bg-gray-800"
        />

        {message.trim() || files.length > 0 ? (
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Envoyer
          </button>
        ) : (
          <VoiceRecorder
            onRecordingComplete={onRecordingComplete}
            audioTrackConstraints={{
              noiseSuppression: true,
              echoCancellation: true,
            }}
            downloadOnSavePress={false}
          />
        )}
      </div>
    </div>
  );
}
