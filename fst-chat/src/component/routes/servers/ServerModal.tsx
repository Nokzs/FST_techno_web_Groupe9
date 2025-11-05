import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { Server } from "../../../api/servers/servers-page";
import { useTranslation } from "react-i18next";

type ServerModalProps = {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpenServer: (tags: string) => void;
  handleCloseServer: (tags: string) => void;
  isPublic: boolean;
  server: Server;
};

export const ServerModal = ({
  setShowModal,
  handleOpenServer,
  handleCloseServer,
  server,
  isPublic,
}: ServerModalProps) => {
  const { t } = useTranslation();
  const [tags, setTags] = useState<string[]>(server.tags || []);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = inputValue.trim();

    // Valider le tag avec "Espace" ou "Entrée"
    if ((e.key === " " || e.key === "Enter") && value) {
      e.preventDefault();
      if (!tags.includes(value)) {
        setTags([...tags, value]);
      }
      setInputValue("");
    }

    // Supprimer ou éditer le dernier tag avec "Backspace"
    else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      e.preventDefault();
      const lastTag = tags[tags.length - 1];
      setTags(tags.slice(0, -1));
      setInputValue(lastTag); // Permet de modifier le tag précédent
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    const tagsString = tags.join(", ");
    handleOpenServer(tagsString);
  };

  const handleClose = () => {
    const tagsString = tags.join(", ");
    handleCloseServer(tagsString);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Fond semi-transparent */}
      <div
        className="absolute inset-0 bg-black opacity-40 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
        onClick={() => setShowModal(false)}
      />

      {/* Contenu de la modal */}
      <div className="relative bg-gray-300 dark:bg-gray-800 text-white rounded-2xl shadow-2xl w-full max-w-md p-6 pointer-events-auto animate-fadeIn scale-95">
        <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
          {isPublic ? t("room.update") : t("room.open")}
        </h2>

        <label className="block dark:text-white text-black text-sm font-medium mb-1">
          {t("room.tags")}
        </label>

        {/* Champ de tags */}
        <div
          className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-600 focus-within:border-blue-500
          max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent"
          onClick={() => inputRef.current?.focus()}
        >
          {tags.length > 0 &&
            tags.map(
              (tag, index) =>
                tag.trim() && (
                  <div
                    key={index}
                    className="flex items-center bg-blue-600 text-white px-2 py-1 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      className="ml-1 text-white hover:text-gray-200"
                      onClick={() => handleRemoveTag(index)}
                    >
                      ×
                    </button>
                  </div>
                ),
            )}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow p-1 bg-transparent outline-none text-black dark:text-white placeholder-neutral-400"
            placeholder={t("room.tagsPlaceholder")}
          />
        </div>

        {/* Boutons */}
        <div className="flex justify-between items-center mt-6">
          <button
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            onClick={() => setShowModal(false)}
          >
            {t("room.cancel")}
          </button>

          <div className="flex gap-2">
            {isPublic && (
              <button
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                onClick={handleClose}
              >
                {t("room.close")}
              </button>
            )}
            <button
              className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
              onClick={handleConfirm}
            >
              {t("room.confirm")}
            </button>
          </div>
        </div>

        {/* Bouton fermer (X) */}
        <button
          className="absolute top-3 right-3 text-gray-300 hover:text-white font-bold"
          onClick={() => setShowModal(false)}
        >
          X
        </button>
      </div>
    </div>,
    document.body,
  );
};
