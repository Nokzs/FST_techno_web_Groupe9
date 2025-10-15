//import { useState } from "react";

/*// Interface commune pour les fournisseurs de stockage
const storageProviders = {
  supabase: {
    connect: (url: string, key: string) => {
      const { createClient } = await import("@supabase/supabase-js");
    },
    upload: async (filePath: string, file: string, bucket: string) => {
      // Implémentation Supabase upload
    },
    getPublicUrl: (filePath: string, bucket: string) => {
      // Implémentation Supabase getPublicUrl
    },
    delete: async (filePath: string, bucket: string) => {
      // Implémentation Supabase delete
    },
  },
};

export function useStorage(initialProvider = "supabase") {
  const [providerName, setProviderName] = useState(initialProvider);
  const [error, setError] = useState<Error | null>(null);

  const upload = async (filePath: string, file: string, bucket: string) => {
    setError(null);
    try {
      const result = await storageProviders[providerName].upload(
        filePath,
        file,
        bucket,
      );
      return result;
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
      throw err;
    }
  };

  const getPublicUrl = (filePath: string, bucket: string) => {
    return storageProviders[providerName].getPublicUrl(filePath, bucket);
  };

  const remove = async (filePath: string, bucket: string) => {
    setError(null);
    try {
      const result = await storageProviders[providerName].delete(
        filePath,
        bucket,
      );
      return result;
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
      throw err;
    }
  };

  const changeProvider = (newProvider: string) => {
    if (!storageProviders[newProvider]) {
      throw new Error(`Provider ${newProvider} not supported.`);
    }
    setProviderName(newProvider);
  };

  return {
    upload,
    getPublicUrl,
    remove,
    error,
    providerName,
    changeProvider,
  };
}*/
