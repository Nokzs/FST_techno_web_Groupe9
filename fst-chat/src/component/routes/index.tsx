import { ReactTyped } from "react-typed";
import { useState } from "react";
export function HomePage() {
  const [showNextText, setShowNextText] = useState<boolean>(false);
  return (
    <div className="h-screen snap-mandatory scroll-smooth snap-y overflow-y-auto scroll-unshow dark:bg-gradient-to-r dark:from-[#010221] dark:via-[#080c3b] dark:to-[#080c3f] bg-gradient-to-r from-white via-gray-100 to-gray-200  ">
      <div className="h-screen snap-start  text-white justify-center flex-col items-center flex">
        <div
          id="hero"
          className="dark:text-white text-gray-900 justify-center items-center flex font-bold text-4xl pl-8 pr-8 flex-col gap-10"
        >
          <ReactTyped
            strings={["Discuter avec vos amis"]}
            className="pl-4 pr-4"
            typeSpeed={50}
            showCursor={false}
            onComplete={() => {
              setShowNextText(true);
            }}
          />
          {showNextText && (
            <ReactTyped
              showCursor={false}
              strings={[
                "Découvre de nouvelles personnes qui partagent vos passions",
              ]}
              className="pl-4 pr-4"
              typeSpeed={80}
            />
          )}
          <button
            className="bg-green-600 hover:bg-green-700 pl-10 pr-10 p-5 text-3xl rounded-2xl cursor-pointer"
            onClick={() => {}}
          >
            Learn more
          </button>
        </div>
      </div>
      <div className="h-screen snap-start"></div>
    </div>
  );
}
