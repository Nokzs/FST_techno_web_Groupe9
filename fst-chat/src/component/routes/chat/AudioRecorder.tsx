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
  const durationRef = useRef<number>(0);
  const intervalRef = useRef<number>(null);
  const audioChunk = useRef<Blob[]>([]);
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("getUserMedia supported.");
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            noiseSuppression: true, // active la réduction de bruit
            echoCancellation: true, // supprime l’écho
            autoGainControl: true, // ajuste le gain automatiquement
          },
        })

        // Success callback
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.ondataavailable = (ev) => {
            if (audioChunk.current) {
              audioChunk.current.push(ev.data);
            }
          };
          mediaRecorder.onstop = () => {
            if (duration > 1) {
              const file = new File(audioChunk.current, `audio_message.webm`, {
                type: "audio/webm",
              });
              console.log(isCancel);
              if (!isCancel) {
                onStop(file);
              }
            }
            audioChunk.current = [];
          };
        })
        // Error callback
        .catch((err) => {
          console.error(`The following getUserMedia error occurred: ${err}`);
        });
    } else {
      console.log("getUserMedia not supported on your browser!");
    }
  }, [isCancel, duration]);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button === 0) {
      setIsCancel(false); // reset erreur
      setIsRecording(true); // commence à enregistrer

      mediaRecorderRef.current?.start();
      const startTime = Date.now();
      intervalRef.current = window.setInterval(() => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        setDuration(duration);
        durationRef.current = duration;
      }, 1000);
      window.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseUp = () => {
    window.removeEventListener("mouseup", handleMouseUp);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    if (!mediaRecorderRef.current) {
      return;
    }
    mediaRecorderRef.current?.stop();
    setIsRecording(false); // arrête l’enregistrement
    setIsCancel(false);
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
