/**
 *
 * @description Envoie la question de l'utilisateur au back et retourne la réponse.
 * @param question La question posée par l'utilisateur.
 * @param channelId L'ID du canal de chat.
 * @returns La réponse du chatbot.
 */
export const sendQuestion = async (
  channelId: string,
  userId?: string,
): Promise<string> => {
  console.log(
    "Sending question to chatbot:",
    question,
    "Channel ID:",
    channelId,
  );
  const body = JSON.stringify({ channelId, userId });
  const answerData = await fetch(
    `${import.meta.env.VITE_API_URL}/chatBot/ask`,
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
  return answer;
};
