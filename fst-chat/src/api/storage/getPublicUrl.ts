export const getPublicUrl = async (
  filePath: string,
): Promise<{ publicUrl: string }> => {
  return { publicUrl: filePath };
};
