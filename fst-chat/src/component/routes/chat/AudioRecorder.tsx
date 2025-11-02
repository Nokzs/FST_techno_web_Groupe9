import { useRef, useState } from "react";
import { cn } from "../../../utils/cn";

interface AudioRecorderProps {
  onStop: (file: File) => void;
}

export function AudioRecorder({ onStop }: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const durationRef = useRef<number>(0); // Ref pour la durée exacte
  const isCancelRef = useRef<boolean>(false); // Ref pour l’annulation exacte
  const isRecordingRef = useRef<boolean>(false); // Ref pour l’état exact
  const intervalRef = useRef<number | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [duration, setDuration] = useState(0);

  const cleanup = () => {
    window.removeEventListener("mouseup", handleMouseUp);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    durationRef.current = 0;
    isCancelRef.current = false;
    isRecordingRef.current = false;
    setIsRecording(false);
    setIsCancel(false);
    setDuration(0);
  };

  const handleMouseDown = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;

    try {
      // 🔹 On obtient le micro uniquement au moment de l’enregistrement
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (ev) => audioChunks.current.push(ev.data);

      recorder.onstop = () => {
        const currentDuration = durationRef.current;
        if (!isCancelRef.current && currentDuration > 1) {
          const file = new File(audioChunks.current, "audio_message.webm", {
            type: "audio/webm",
          });
          onStop(file);
        }
        cleanup();
      };

      // 🔹 Initialisation state & refs
      setIsRecording(true);
      isRecordingRef.current = true;
      setIsCancel(false);
      isCancelRef.current = false;
      setDuration(0);
      durationRef.current = 0;

      recorder.start();

      // 🔹 Timer pour mise à jour de la durée
      const startTime = Date.now();
      intervalRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        durationRef.current = seconds;
        setDuration(seconds); // ✅ update visuel
      }, 100);

      // 🔹 Capture global du mouseup
      window.addEventListener("mouseup", handleMouseUp);
    } catch (err) {
      console.error("Erreur d’accès au micro :", err);
    }
  };

  const handleMouseUp = () => {
    window.removeEventListener("mouseup", handleMouseUp);
    if (
      isRecordingRef.current &&
      mediaRecorderRef.current?.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    } else {
      cleanup();
    }
  };

  const handleMouseLeave = () => {
    if (isRecordingRef.current) {
      setIsCancel(true); // pour l’affichage
      isCancelRef.current = true; // pour la logique d’annulation
    }
  };

  const handleMouseEnter = () => {
    if (isRecordingRef.current) {
      setIsCancel(false);
      isCancelRef.current = false;
    }
  };

  const displayDuration = (d: number) => {
    const s = d % 60;
    const m = Math.floor(d / 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "text-white h-full flex items-center justify-center transition-all duration-500 ease-in-out rounded-lg whitespace-nowrap select-none",
        isCancel
          ? "bg-yellow-600 min-w-64"
          : isRecording
            ? "bg-red-600 min-w-64 animate-pulse"
            : "bg-green-700 min-w-[100px] hover:bg-green-800",
      )}
    >
      <div className="flex items-center justify-center gap-2 truncate px-2">
        {isCancel ? (
          <p className="text-lg truncate">Relâchez pour annuler</p>
        ) : isRecording ? (
          <>
            <p>🎙️</p>
            <span>{displayDuration(duration)}</span>
          </>
        ) : (
          "🎤"
        )}
      </div>
    </button>
  );
}
