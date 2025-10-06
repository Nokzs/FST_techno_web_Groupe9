import { cn } from "../../utils/cn";
import { useState, forwardRef } from "react";
type ProfilePictureProps = {
  src?: string;
  overlay?: boolean;
  overlayPicture?: string;
  className?: string;
  handleModif?: () => void;
};

export const ProfilePicture = forwardRef<File | null, ProfilePictureProps>(
  (
    {
      src,
      overlay = false,
      overlayPicture,
      className,
      handleModif,
    }: ProfilePictureProps,
    ref,
  ) => {
    const [srcPicture, setSrcPicture] = useState(src);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Stocke le fichier dans la ref
      if (ref) {
        if (typeof ref === "function") {
          ref(file); // ref callback
        } else {
          (ref as React.MutableRefObject<File | null>).current = file;
        }
      }

      // Génère l'aperçu
      const reader = new FileReader();
      reader.onload = () => {
        setSrcPicture(reader.result as string);
        handleModif?.();
      };
      reader.readAsDataURL(file);
    };

    return (
      <div className={cn("relative group rounded-full", className)}>
        <label className="cursor-pointer relative">
          <img
            src={srcPicture}
            className="object-contain w-full h-full rounded-full"
          />
          <input
            type="file"
            accept="*.png, *.jpg, *.jpeg"
            className="absolute inset-0 opacity-0 z-50 cursor-pointer"
            onChange={handleFileChange}
          />
        </label>
        {overlay && (
          <div className="absolute h-full w-full transition-opacity inset-0 group-hover:opacity-100 bg-black/40 rounded-full opacity-0  flex items-center justify-center text-white font-bold">
            <img src={overlayPicture} alt="pen" className="h-[30%] w-[30%]" />
          </div>
        )}
      </div>
    );
  },
);
