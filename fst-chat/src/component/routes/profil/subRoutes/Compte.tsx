import { useRef, useState } from "react";
import { UpdateInput } from "../../../ui/UpdateInput";
import { updateUser } from "../../../../api/user/updateUser";
import { useOutletContext } from "react-router-dom";
import type { User } from "../../../../types/user";
export function Compte() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [modif, setModif] = useState(false);

  const user = useOutletContext() as User;
  const [error, setError] = useState<boolean>(false);
  const handleModif = () => {
    if (!modif) setModif(true);

    if (passwordRef.current && passwordRef.current?.value?.length < 6) {
      setError(true);
      return;
    } else {
      if (passwordRef.current?.value === confirmPasswordRef.current?.value) {
        setError(false);
        return;
      } else {
        setError(true);
      }
    }
  };
  const onSubmit = () => {
    if (!error) {
      updateUser({ ...user, password: passwordRef.current?.value });
    }
  };
  return (
    <>
      <UpdateInput
        value=""
        type="password"
        ref={passwordRef}
        name="Password"
        handleModif={handleModif}
        showError={modif}
        error={error}
      />
      <UpdateInput
        value=""
        type="password"
        ref={confirmPasswordRef}
        name="Confirm password"
        handleModif={handleModif}
        showError={modif}
        error={error}
      />
      {modif && (
        <div className="flex flex-row justify-center gap-5">
          <button
            className="dark:bg-blue-950 rounded-xl dark:hover:bg-blue-800 dark:text-white font-bold py-2 px-4 bg-green-700 hover:bg-green-500 "
            onClick={onSubmit}
          >
            Enregistrer les modifications
          </button>
          <button className="dark:bg-blue-950 uppercase rounded-xl dark:hover:bg-blue-800 dark:text-white font-bold py-2 px-4 bg-green-700 hover:bg-green-500">
            annuler
          </button>
        </div>
      )}
    </>
  );
}
