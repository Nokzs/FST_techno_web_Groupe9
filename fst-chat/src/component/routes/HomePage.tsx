import { ReactTyped } from "react-typed";
import { useRef, useState } from "react";
import { TchatHomePage } from "../ui/TchatHomePage";
import { useTranslation } from "react-i18next";
import { messages, message2 } from "../../assets/exportData";
import { NavBar } from "../NavBar";
export function HomePage() {
  const [showNextText, setShowNextText] = useState<boolean>(false);
  const secondScreenRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  console.log(t("homePage.heroMessage.part1") || "null");
  return (
    <>
      <NavBar />
      <div className="transition-colors  duration-1000 h-screen snap-mandatory overflow-hidden scroll-smooth snap-y font-home overflow-y-auto scroll-unshow bg-main ">
        <div className="h-screen snap-start  text-white justify-center flex-col items-center flex">
          <div
            id="hero"
            className="dark:text-white text-gray-900 justify-center items-center flex font-bold pl-8 pr-8 flex-col gap-10"
          >
            <ReactTyped
              key={"a"}
              strings={[t("homePage.heroMessage.part1")]}
              className="pl-4 pr-4 text-3xl text-center"
              typeSpeed={50}
              showCursor={false}
              onComplete={() => {
                setShowNextText(true);
              }}
            />
            {showNextText && (
              <ReactTyped
                key={"b"}
                showCursor={false}
                strings={[t("homePage.heroMessage.part2")]}
                className="pl-4 pr-4 text-2xl text-center"
                typeSpeed={20}
              />
            )}
            <button
              className="bg-green-600 hover:bg-green-700 pl-10 pr-10 p-5 text-2xl rounded-xl cursor-pointer"
              onClick={() => {
                secondScreenRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("homePage.heroMessage.learn")}
            </button>
          </div>
        </div>

        <div
          className="h-[calc(100vh-60px)] snap-start flex items-center justify-center flex-col gap-10"
          ref={secondScreenRef}
        >
          <div className="flex w-screen lg:flex-row flex-col gap-10 mt-5 justify-center lg:items-stretch items-center  overflow-y-hidden">
            <TchatHomePage
              messages={messages}
              className={["ml-2 mr-2 lg:mr-0 pb-5 mb-5"]}
            />

            <ReactTyped
              className="dark:text-white text-dark md:text-xl text-lg text-center font-home lg:hidden"
              typeSpeed={10}
              strings={[t("homePage.translate")]}
              startWhenVisible
              showCursor={false}
            ></ReactTyped>
            <TchatHomePage
              messages={message2}
              className="mr-2 ml-2 lg:ml-0 pb-5 mb-5"
            />
          </div>

          <ReactTyped
            className="dark:text-white text-dark md:text-xl text-lg font-home hidden lg:block  "
            typeSpeed={10}
            strings={[t("homePage.translate")]}
            startWhenVisible
            showCursor={false}
          ></ReactTyped>
        </div>
      </div>
    </>
  );
}
