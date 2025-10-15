import { useOutletContext } from "react-router";
import type { User } from "../../../../types/user";
import penSvg from "../../../../assets/edit-pen-svgrepo-com.svg";
import { ProfilePicture } from "../../../ui/ProfilePicture";
import { UpdateInput } from "../../../ui/UpdateInput";
import { LangList } from "../../../ui/LangList";
import { useRef, useState } from "react";
import { getSignedUrl } from "../../../../api/storage/signedUrl";
import { uploadFile } from "../../../../api/storage/uploadFile";
import { getPublicUrl } from "../../../../api/storage/getPublicUrl";
import { updateUser } from "../../../../api/user/updateUser";
export function Profil() {
  const user = useOutletContext() as User;
  const [modif, setModif] = useState(false);
  const pseudoRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const langsRef = useRef<HTMLSelectElement>(null);
  const pictureRef = useRef<File>(null);
  const srcRef = user.urlPicture;
  const cancelUpdate = () => {
    /* pseudoRef.current.value = user.pseudo;
    bioRef.current.value = user.bio;
    langsRef.current.value = user.language;
    user.urlPicture || "https://avatar.iran.liara.run/public/20"; */
  };
  const handleModif = () => {
    console.log("j'affiche");
    if (!modif) setModif(true);
  };
  const onUpdateSubmit = async () => {
    if (pictureRef.current) {
      const { signedUrl, path } = await getSignedUrl(
        "profilPicture",
        "profilPicture",
      );

      await uploadFile(pictureRef.current, signedUrl);
      const { publicUrl } = await getPublicUrl(path, user);
      const pseudo = pseudoRef.current?.value;
      const bio = bioRef.current?.value;
      const lang = langsRef.current?.value;
      user.pseudo = pseudo || user.pseudo;
      user.bio = bio || user.bio;
      user.language = lang || user.language;
      user.urlPicture = publicUrl || user.urlPicture;
      await updateUser(user);
    }
  };

  return (
    <>
      <ProfilePicture
        src={user.urlPicture || "https://avatar.iran.liara.run/public/20"}
        overlay={true}
        ref={pictureRef}
        overlayPicture={penSvg}
        handleModif={handleModif}
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
            className="dark:bg-blue-950 rounded-xl dark:hover:bg-blue-800 dark:text-white font-bold py-2 px-4 bg-green-700 hover:bg-green-500 "
            onClick={onUpdateSubmit}
          >
            Enregistrer les modifications
          </button>
          <button
            onClick={cancelUpdate}
            className="dark:bg-blue-950 uppercase rounded-xl dark:hover:bg-blue-800 dark:text-white font-bold py-2 px-4 bg-green-700 hover:bg-green-500"
          >
            annuler
          </button>
        </div>
      )}
    </>
  );
}
