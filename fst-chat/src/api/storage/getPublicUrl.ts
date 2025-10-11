export const getPublicUrl = async (
  filePath: string,
): Promise<{ publicUrl: string }> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return fetch(`${apiUrl}/storage/publicUrl/${filePath}`, {
    method: "GET",
    credentials: "include",
  }).then((res) => res.json());
};
