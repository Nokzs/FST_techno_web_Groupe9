import { useOutletContext } from "react-router";
import type { User } from "../../../../types/user";
import penSvg from "../../../../assets/edit-pen-svgrepo-com.svg";
import { ProfilePicture } from "../../../ui/ProfilePicture";
import { UpdateInput } from "../../../ui/UpdateInput";
export function Profil() {
  const user = useOutletContext() as User;
  return (
    <div className="flex-1 w-full flex justify-center">
      <div className="rounded-2xl shadow-md p-4 bg-white h-full border border-gray-200 w-full dark:bg-[#0d0f2a] dark:border dark:border-gray-700">
        <div
          id="card"
          className="bg-white dark:bg-[#0d0f2a] shadow-md m-auto h-full border-2 border-black rounded-2xl w-[80%] flex-1 flex flex-col items-center"
        >
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
          <LangList />
        </div>
      </div>
    </div>
  );
}
