import { useOutletContext } from "react-router";
import type { User } from "../../../../types/user";
import penSvg from "../../../../assets/edit-pen-svgrepo-com.svg";
import { ProfilePicture } from "../../../ui/ProfilePicture";
import { UpdateInput } from "../../../ui/UpdateInput";
import { LangList } from "../../../ui/LangList";
export function Profil() {
  const user = useOutletContext() as User;
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
          <UpdateInput value={user.pseudo} name="pseudo" type="input" />
          <UpdateInput value={user.bio} name="bio" type="textarea" />
          <LangList user={user}/>
      </>
  );
}





