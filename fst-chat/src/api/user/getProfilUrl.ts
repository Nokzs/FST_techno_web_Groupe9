export const getProfilUrl = async (): Promise<{ publicUrl: string }> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return fetch(`${apiUrl}/user/profilPictureUrl`, {
    method: "GET",
    credentials: "include",
  }).then((res) => res.json());
};
