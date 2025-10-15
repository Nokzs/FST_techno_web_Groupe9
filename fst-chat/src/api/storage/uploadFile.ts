export const uploadFile = async (file: File, signedUrl: string) => {
  console.log(signedUrl);
  const formData = new FormData();
  formData.append("file", file);
  await fetch(signedUrl, {
    method: "PUT",
    body: formData,
  }).catch((error) => {
    console.error("Error uploading file:", error);
  });
};
