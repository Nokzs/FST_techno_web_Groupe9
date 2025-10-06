import { useState, useRef } from "react";
import penSvg from "../../assets/edit-pen-svgrepo-com.svg";
import { cn } from "../../utils/cn";
type updateInputProps = {
  value: string;
  name: string;
  className?: string;
  type?: "input" | "textarea";
  updatable?: boolean;
};
export function UpdateInput({
  value,
  name,
  className,
  type = "input",
  updatable = true,
}: updateInputProps) {
  const [update, setUpdate] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
        {type === "input" ? (
          <input
            ref={inputRef}
            type="text"
            className="border-b-2  border-black dark:text-white dark:border-white p-2 w-full max-w-lg dark:bg-blue-950 bg-gray-100 rounded-3xl pl-5 focus:outline-red-800"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={!update}
            onBlur={() => setUpdate(updatable && false)}
            onFocus={() => setUpdate(updatable && true)}
          />
        ) : (
          <textarea
            ref={textareaRef}
            className="border-b-2 min-h-32 max-h-64 w-full max-w-lg p-2 shadow-black  border-black dark:border-white outline-black outline-2  dark:bg-blue-950 bg-gray-100 rounded-3xl pl-5 focus:outline-red-800 resize"
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
}
