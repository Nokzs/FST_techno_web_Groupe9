export const getSignedUrl = async (
  fileName: string,
  eventType: "profilePicture" | "messageFile",
  salonId?: string,
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
      salonId: salonId,
    }),
  }).then((res) => res.json());
};
