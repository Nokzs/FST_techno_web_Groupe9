import { ReactTyped } from "react-typed";
import { useRef, useState } from "react";
export function HomePage() {
  const [showNextText, setShowNextText] = useState<boolean>(false);
  const secondScreenRef = useRef<HTMLDivElement | null>(null);

  const messages = [
    {
      id: 1,
      sender: "Léa",
      text: "Salut ! Comment ça va ?",
      lang: "fr",
      time: "10:05",
    },
    {
      id: 2,
      sender: "Alex",
      text: "Très bien, et toi ?",
      lang: "fr",
      time: "10:06",
    },
    {
      id: 3,
      sender: "María",
      text: "¡Hola! ¿Qué tal estáis?",
      lang: "es",
      time: "10:07",
    },
    {
      id: 4,
      sender: "Yuki",
      text: "元気ですか？ (Genki desu ka?)",
      lang: "ja",
      time: "10:08",
    },
    {
      id: 5,
      sender: "Léa",
      text: "On parle toutes les langues ici 😂",
      lang: "fr",
      time: "10:09",
    },
    {
      id: 6,
      sender: "Alex",
      text: "That’s awesome! We should keep going in English now.",
      lang: "en",
      time: "10:10",
    },
    {
      id: 7,
      sender: "María",
      text: "Vale, perfecto 👍",
      lang: "es",
      time: "10:11",
    },
    {
      id: 8,
      sender: "Yuki",
      text: "いいね！ (Ii ne!)",
      lang: "ja",
      time: "10:12",
    },
    {
      id: 9,
      sender: "Léa",
      text: "Alors qui veut traduire tout ça ? 😅",
      lang: "fr",
      time: "10:13",
    },
  ];
  const message2 = [
    {
      id: 1,
      sender: "Léa",
      text: "Salut ! Comment ça va ?",
      lang: "fr",
      time: "10:05",
    },
    {
      id: 2,
      sender: "Alex",
      text: "Très bien, et toi ?",
      lang: "fr",
      time: "10:06",
    },
    {
      id: 3,
      sender: "María",
      text: "Salut ! Comment ça va ?",
      lang: "fr",
      time: "10:07",
    },
    {
      id: 4,
      sender: "Yuki",
      text: "Comment ça va ?",
      lang: "fr",
      time: "10:08",
    },
    {
      id: 5,
      sender: "Léa",
      text: "On parle toutes les langues ici 😂",
      lang: "fr",
      time: "10:09",
    },
    {
      id: 6,
      sender: "Alex",
      text: "C’est génial ! On devrait continuer en anglais maintenant.",
      lang: "fr",
      time: "10:10",
    },
    {
      id: 7,
      sender: "María",
      text: "D’accord, parfait 👍",
      lang: "fr",
      time: "10:11",
    },
    {
      id: 8,
      sender: "Yuki",
      text: "Super !",
      lang: "fr",
      time: "10:12",
    },
    {
      id: 9,
      sender: "Léa",
      text: "Alors qui veut tout traduire ? 😅",
      lang: "fr",
      time: "10:13",
    },
  ];
  return (
    <div className="transition-colors  duration-1000 h-screen snap-mandatory scroll-smooth snap-y font-home overflow-y-auto scroll-unshow dark:bg-gradient-to-r dark:from-[#010221] dark:via-[#080c3b] dark:to-[#080c3f] bg-gradient-to-r from-white via-gray-100 to-gray-200  ">
      <div className="h-screen snap-start  text-white justify-center flex-col items-center flex">
        <div
          id="hero"
          className="dark:text-white text-gray-900 justify-center items-center flex font-bold pl-8 pr-8 flex-col gap-10"
        >
          <ReactTyped
            strings={["Discuter avec vos amis"]}
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
              strings={[
                "Découvre de nouvelles personnes qui partagent vos passions",
              ]}
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
        className="h-screen snap-start flex items-center justify-center flex-col"
        ref={secondScreenRef}
      >
        <div className="flex w-screen flex-row gap-10 mt-5  overflow-y-hidden">
          <div className="bg-white rounded-3xl flex-1 break-all flex flex-col-reverse border-8 gap-1 pt-2 pb-2 border-black dark:border-none">
            {messages.map((el) => (
              <div
                key={el.id}
                className={`text-sm flex flex-col border-2 p-2 justify-between rounded-2xl 
                   ${
                     el.sender === "Léa"
                       ? "self-start bg-blue-700"
                       : "self-end bg-green-700"
                   } text-white border-black`}
              >
                <div className="">{el.text}</div>
                <div className="flex flex-row justify-between items-center gap-1">
                  <p>{el.sender}</p>
                  <p>{el.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-3xl w-max-[400px] flex flex-1 flex-col-reverse border-8 border-black dark:border-none mlr-10">
            <div className="self-start rounded-2xl border-black h-min  border-2 m-10 p-5 text-sm  bg-green-700  text-white">
              Salut ca va ?
            </div>
          </div>
        </div>

        <ReactTyped
          className="text-white text-2xl font-home"
          typeSpeed={20}
          strings={[
            "N'ayez plus peur la barrière de la langue, notre application la franchit pour vous",
          ]}
          startWhenVisible
        ></ReactTyped>
      </div>
    </div>
  );
}
