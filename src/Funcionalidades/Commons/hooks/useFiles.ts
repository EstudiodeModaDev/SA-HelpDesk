import React from "react";

export function useFiles() {
  const [files, setFiles] = React.useState<File[]>([]);

  const addFiles = React.useCallback((incoming: FileList | File[]) => {
    const nextFiles = Array.from(incoming).filter(Boolean);

    setFiles((prev) => {
      const map = new Map<string, File>();

      for (const file of prev) {
        map.set(`${file.name}-${file.size}-${file.lastModified}`, file);
      }

      for (const file of nextFiles) {
        map.set(`${file.name}-${file.size}-${file.lastModified}`, file);
      }

      return Array.from(map.values());
    });
  }, []);

  const removeFile = React.useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetFiles = React.useCallback(() => {
    setFiles([]);
  }, []);

  return {
    files,
    addFiles,
    removeFile,
    setFiles,
    resetFiles
  };
}