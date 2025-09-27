import { ReactTyped } from "react-typed";
import { useRef, useState } from "react";
import { TchatHomePage } from "../ui/TchatHomePage";
import { useTranslation } from "react-i18next";
import { messages, message2 } from "../../assets/exportData";
export function HomePage() {
  const [showNextText, setShowNextText] = useState<boolean>(false);
  const secondScreenRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  console.log(t("homePage.heroMessage.part1") || "null");
  return (
    <div className="transition-colors  duration-1000 h-screen snap-mandatory scroll-smooth snap-y font-home overflow-y-auto scroll-unshow dark:bg-gradient-to-r dark:from-[#010221] dark:via-[#080c3b] dark:to-[#080c3f] bg-gradient-to-r from-white via-gray-100 to-gray-200  ">
      <div className="h-screen snap-start  text-white justify-center flex-col items-center flex">
        <div
          id="hero"
          className="dark:text-white text-gray-900 justify-center items-center flex font-bold pl-8 pr-8 flex-col gap-10"
        >
          <ReactTyped
            strings={[t("homePage.heroMessage.part1")]}
            className="pl-4 pr-4 text-4xl"
            typeSpeed={50}
            showCursor={false}
            onComplete={() => {
              setShowNextText(true);
            }}
          />
          {showNextText && (
            <ReactTyped
              showCursor={false}
              strings={[t("homePage.heroMessage.part2")]}
              className="pl-4 pr-4 text-2xl"
              typeSpeed={20}
            />
          )}
          <button
            className="bg-green-600 hover:bg-green-700 pl-10 pr-10 p-5 text-3xl rounded-2xl cursor-pointer"
            onClick={() => {
              secondScreenRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            En apprendre plus
          </button>
        </div>
      </div>

      <div
        className="h-screen snap-start flex items-center justify-center flex-col gap-10"
        ref={secondScreenRef}
      >
        <div className="flex w-screen flex-row gap-10 mt-5  overflow-y-hidden">
          <TchatHomePage messages={messages} />
          <TchatHomePage messages={message2} />
        </div>

        <ReactTyped
          className="dark:text-white text-dark text-2xl font-home"
          typeSpeed={10}
          strings={[t("homePage.translate")]}
          startWhenVisible
        ></ReactTyped>
      </div>
    </div>
  );
}
