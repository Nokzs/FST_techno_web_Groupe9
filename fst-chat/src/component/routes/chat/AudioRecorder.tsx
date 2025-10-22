import { useRef, useState, useEffect } from "react";
import { cn } from "../../../utils/cn";
interface AudioRecorderProps {
  onStop: (file: File) => void;
}

export function AudioRecorder({ onStop }: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isCancel, setIsCancel] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const intervalRef = useRef<number>(null);
  const audioChunk = useRef<Blob[]>([]);
  useEffect(() => {
    // 1️⃣ Première initialisation — ne se fait qu’une fois
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true,
          },
        })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
        })
        .catch((err) => {
          console.error("getUserMedia error:", err);
        });
    }
  }, []); // 👈 une seule fois au montage

  useEffect(() => {
    // 2️⃣ Réattache les handlers quand certaines dépendances changent
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.ondataavailable = (ev) => {
      audioChunk.current.push(ev.data);
    };

    recorder.onstop = () => {
      console.log(duration);
      if (duration > 1) {
        console.log(
          isCancel ? "Enregistrement annulé" : "Enregistrement terminé",
        );
        const file = new File(audioChunk.current, "audio_message.webm", {
          type: "audio/webm",
        });
        if (!isCancel) {
          onStop(file);
        }
      }
      setIsRecording(false);
      setIsCancel(false);
      audioChunk.current = [];
    };
  }, [onStop, isCancel, duration]); // 👈 tu peux y mettre ce dont dépendent les handlers

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button === 0 && mediaRecorderRef.current) {
      console.log("Démarrage de l’enregistrement audio");
      setIsCancel(false); // reset erreur
      setIsRecording(true); // commence à enregistrer
      setDuration(0);
      mediaRecorderRef.current?.start();
      const startTime = Date.now();
      intervalRef.current = window.setInterval(() => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        setDuration(duration);
      }, 100);
      window.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseUp = () => {
    console.log("Arrêt de l’enregistrement audio");
    window.removeEventListener("mouseup", handleMouseUp);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    if (!mediaRecorderRef.current) {
      return;
    }
    mediaRecorderRef.current?.stop();
  };

  const handleMouseLeave = () => {
    if (isRecording) {
      setIsCancel(true);
    }
  };
  const handleMouseEnter = () => {
    if (isRecording) {
      setIsCancel(false);
    }
  };
  const displayDuration = (duration: number) => {
    const seconde = duration % 60;
    const minute = Math.floor(duration / 60);
    return `${minute.toString().padStart(2, "0")}:${seconde.toString().padStart(2, "0")}`;
  };
  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "text-white h-full flex items-center justify-center transition-all duration-500 ease-in-out rounded-lg whitespace-nowrap",
        isCancel
          ? "bg-yellow-600 min-w-64" // plus large pour cancel
          : isRecording
            ? "bg-red-600 min-w-64 animate-pulse"
            : "bg-green-700 min-w-[100px] hover:bg-green-800",
      )}
    >
      <div className="flex items-center justify-center gap-2 truncate px-2">
        {isCancel ? (
          <>
            <p className="text-lg truncate">Relâchez pour annuler</p>
          </>
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
