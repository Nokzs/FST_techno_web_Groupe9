/**
 *
 * @description Envoie la question de l'utilisateur au back et retourne la réponse.
 * @param question La question posée par l'utilisateur.
 * @param channelId L'ID du canal de chat.
 * @returns La réponse du chatbot.
 */
export const sendCommand = async (
  channelId: string,
  command: string,
  userId: string,
  lang: string,
  useUserLanguage = true,
): Promise<string> => {
  const body = JSON.stringify({
    channelId,
    command,
    userId,
    language: lang,
    useUserLanguage,
  });

  const answerData = await fetch(
    `${import.meta.env.VITE_API_URL}/chatBot/command`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
      credentials: "include",
    },
  );
  const answer = await answerData.text();
  console.log(answer);
  return answer;
};
