export const getSignedUrl = async (
  fileName: string,
  eventType: "profilPicture",
): Promise<{ signedUrl: string; path: string }> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return fetch(`${apiUrl}/storage/signedUrl`, {
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({
      fileName: fileName,
      eventType: eventType,
    }),
  }).then((res) => res.json());
};
