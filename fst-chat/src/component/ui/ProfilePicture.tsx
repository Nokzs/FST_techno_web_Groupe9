import { cn } from "../../utils/cn";
type ProfilePictureProps = {
  src?: string;
  overlay?: boolean;
  overlayPicture?: string;
  className?: string;
};

export function ProfilePicture({
  src,
  overlay = false,
  overlayPicture,
  className,
}: ProfilePictureProps) {
  return (
    <div className={cn("relative group rounded-full", className)}>
      <img src={src} className="object-contain w-full h-full rounded-full" />
      {overlay && (
        <div className="absolute h-full w-full transition-opacity inset-0 group-hover:opacity-100 bg-black/40 rounded-full opacity-0  flex items-center justify-center text-white font-bold">
          <img src={overlayPicture} alt="pen" className="h-[30%] w-[30%]" />
        </div>
      )}
    </div>
  );
}
