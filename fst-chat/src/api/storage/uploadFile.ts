import { gzipSync } from "fflate";
export const uploadFile = async (file: File, signedUrl: string) => {
  const formData = new FormData();

  // Lire le fichier en ArrayBuffer
  const arrayBuffer = new Uint8Array(await file.arrayBuffer());
  // Compresser
  const compressed = gzipSync(arrayBuffer);
  // Créer un nouveau File compressé
  const compressedFiles = new File([compressed], file.name + ".gz", {
    type: file.type,
  });
  console.log(compressedFiles);
  formData.append("file", compressedFiles);

  await fetch(signedUrl, {
    method: "PUT",
    body: formData,
  }).catch((error) => {
    console.error("Error uploading file:", error);
  });
};
