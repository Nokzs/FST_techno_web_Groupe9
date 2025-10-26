export const sendQuestion = async (
  question: string,
  userId: string,
  channelId: string,
): Promise<string> => {
  console.log(
    "Envoi de la question au chatbot :",
    question,
    "pour user :",
    userId,
    "dans le channel :",
    channelId,
  );
  return "bonne question";
};
