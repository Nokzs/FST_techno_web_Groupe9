import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import penSvg from "../../assets/edit-pen-svgrepo-com.svg?url";
import { cn } from "../../utils/cn";
type updateInputProps = {
  value: string;
  name: string;
  className?: string;
  type?: "input" | "textarea" | "password";
  updatable?: boolean;
  ref?: React.Ref<HTMLInputElement> | React.Ref<HTMLTextAreaElement>;
  handleModif?: () => void;
  error?: boolean;
  showError?: boolean;
};
/**
 *
 *@description Composant d'input ou textarea modifiable avec icône de stylo pour activer la modification.
 *@param {string} value - Valeur initiale de l'input ou textarea.
 *@param {string} name - Nom affiché au-dessus de l'input ou textarea.
 *@param {string} [className] - Classes CSS supplémentaires pour le conteneur.
 *@param {"input" | "textarea"} [type="input"] - Type de champ, soit "input" soit "textarea".
 *@param {boolean} [updatable=true] - Indique si le champ est modifiable.
 *@param {React.Ref<HTMLInputElement> | React.Ref<HTMLTextAreaElement>} [ref] - Référence vers l'élément input ou textarea.
 *@param {() => void} [handleModif] - Fonction appelée lors de la modification de la valeur.
 */
export const UpdateInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  updateInputProps
>(
  (
    {
      value,
      name,
      className,
      type = "input",
      updatable = true,
      handleModif,
      error,
      showError = false,
    },
    ref,
  ) => {
    const [update, setUpdate] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    //permet d'associer le ref passé en props au ref interne du composant
    useImperativeHandle(
      ref,
      () =>
        type === "input" || type === "password"
          ? inputRef.current!
          : textareaRef.current!,
      [type],
    );

    return (
      <div
        className={cn(
          "flex flex-col  w-full items-center justify-center",
          className,
        )}
      >
        <p className=" text-dark dark:text-white text-2xl mb-1 uppercase">
          {name}
        </p>

        <div className="flex flex-row items-center justify-center h-auto w-full">
          {type === "input" || type === "password" ? (
            <input
              ref={inputRef}
              type={type}
              className={cn(
                "border-b-2  border-black dark:text-white dark:border-white p-2 mr-2 w-full max-w-lg dark:bg-blue-950 bg-gray-100 rounded-xl pl-5 focus:outline-red-800",
                showError
                  ? error
                    ? "border-red-500 dark:border-red-500 focus:border-red-500"
                    : "border-green-700 dark:border-green-700 focus:border-green-700"
                  : "",
              )}
              value={inputValue}
              disabled={!update}
              onBlur={() => setUpdate(updatable && false)}
              onFocus={() => setUpdate(updatable && true)}
              onChange={(e) => {
                if (handleModif) {
                  handleModif();
                  setInputValue(e.target.value);
                }
              }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              className="border-b-2 min-h-32 max-h-64 w-full max-w-lg p-2 shadow-black mr-2 border-black dark:text-white dark:border-white outline-black outline-2  dark:bg-blue-950 bg-gray-100 rounded-xl pl-5 focus:outline-red-800 resize"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!update}
              onBlur={() => setUpdate(updatable && false)}
              onFocus={() => setUpdate(updatable && true)}
            />
          )}
          {updatable && (
            <img
              src={penSvg}
              alt="pen"
              className="h-[50px] dark:invert-100 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setUpdate(true);
                requestAnimationFrame(() => {
                  if (type === "input") {
                    inputRef.current?.focus();
                  } else {
                    textareaRef.current?.focus();
                  }
                });
                inputRef.current?.focus();
              }}
            />
          )}
        </div>
      </div>
    );
  },
);
