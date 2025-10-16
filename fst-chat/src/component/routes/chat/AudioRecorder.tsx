import { useState, useRef } from "react";

type AudioRecorderProps = {
  onRecorded: (file: File) => void;
};

export function AudioRecorder({ onRecorded }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const file = new File([blob], `audio_${Date.now()}.webm`, {
          type: "audio/webm",
        });
        setAudioUrl(URL.createObjectURL(blob));
        onRecorded(file);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Erreur d'accès au micro :", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`px-3 py-2 rounded-lg text-white ${
          recording ? "bg-red-500" : "bg-green-500"
        }`}
      >
        {recording ? "🛑 Stop" : "🎙️ Enregistrer"}
      </button>

      {audioUrl && (
        <audio
          controls
          src={audioUrl}
          className="mt-2 w-full max-w-xs rounded-lg shadow"
        />
      )}
    </div>
  );
}
