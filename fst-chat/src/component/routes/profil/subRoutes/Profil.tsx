import { useOutletContext } from "react-router";
import type { User } from "../../../../types/user";
import penSvg from "../../../../assets/edit-pen-svgrepo-com.svg";
import { ProfilePicture } from "../../../ui/ProfilePicture";
import { UpdateInput } from "../../../ui/UpdateInput";
import { LangList } from "../../../ui/LangList";
import { useRef, useState } from "react";
export function Profil() {
  const user = useOutletContext() as User;
  //const tmpUser = structuredClone(user) as User;
  const [modif, setModif] = useState(false);
  const pseudoRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const langsRef = useRef<HTMLSelectElement>(null);
  const pictureRef = useRef<File>(null);

  const handleModif = () => {
    if (!modif) setModif(true);
  };
  return (
    <>
      <ProfilePicture
        src={
          user.urlPicture
            ? user.urlPicture
            : "https://avatar.iran.liara.run/public/20"
        }
        overlay={true}
        overlayPicture={penSvg}
        className="m-5 h-32 w-32"
      />
      <UpdateInput
        value={user.pseudo}
        name="pseudo"
        type="input"
        ref={pseudoRef}
        handleModif={handleModif}
      />
      <UpdateInput
        value={user.bio}
        name="bio"
        type="textarea"
        ref={bioRef}
        handleModif={handleModif}
      />
      <LangList user={user} ref={langsRef} handleModif={handleModif} />
      {modif && (
        <div className="flex flex-row justify-center gap-5">
          <button
            onClick={() =>
              console.log(
                pseudoRef.current?.value,
                bioRef.current?.value,
                langsRef.current?.selectedOptions[0].value,
                pictureRef.current?.src,
              )
            }
          >
            Enregistrer les modifications
          </button>
        </div>
      )}
    </>
  );
}
