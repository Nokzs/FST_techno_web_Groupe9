import { gzipSync } from "fflate";
export const uploadFile = async (
  file: File,
  signedUrl: string,
  compress: boolean,
) => {
  const formData = new FormData();
  let fileUrl;
  if (compress) {
    // Lire le fichier en ArrayBuffer
    const arrayBuffer = new Uint8Array(await file.arrayBuffer());
    // Compresser
    const compressed = gzipSync(arrayBuffer);
    // Créer un nouveau File compressé
    fileUrl = new File([compressed], file.name + ".gz", {
      type: file.type,
    });
  }
  formData.append("file", fileUrl);

  await fetch(signedUrl, {
    method: "PUT",
    body: formData,
  }).catch((error) => {
    console.error("Error uploading file:", error);
  });
};
