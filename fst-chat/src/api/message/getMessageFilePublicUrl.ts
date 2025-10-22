export const getMessageFilePublicUrl = async (
  fileName: string,
  channelId: string,
): Promise<{ publicUrl: string }> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return fetch(
    `${apiUrl}/messages/filePublicUrl?fileName=${fileName}&channelId=${channelId}`,
    { method: "GET", credentials: "include" },
  ).then((res) => res.json());
};
