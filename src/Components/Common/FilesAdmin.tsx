import "./filesAdmin.css"

type Props = {
  title?: string
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveFile: (index: number) => void;
  submitting: boolean;
  files: File[];
}

export default function FilesAdmin({ title, onAddFiles, submitting, files, onRemoveFile }: Props) {

  return (
    <div>
      {/* Archivo */}
      <div className="documentar-field documentar-col-2">
        <label className="documentar-label" htmlFor="archivo">{title ?? "Adjuntar archivos"}</label>

          <input id="archivo" type="file" multiple onChange={(e) => {
            const selectedFiles = e.target.files;
            if (!selectedFiles || selectedFiles.length === 0) return;

            onAddFiles(selectedFiles);
            e.currentTarget.value = "";
          }}
          disabled={submitting}
          className="documentar-input"
        />
      </div>

      {files.length > 0 && (
        <div className="documentar-field documentar-col-2">
          <label className="documentar-label">Archivos seleccionados</label>

          <div className="documentar-files">
            {files.map((file, index) => (
              <div key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="documentar-file-item">
                <div className="documentar-file-info">
                  <span className="documentar-file-name">{file.name}</span>
                  <span className="documentar-file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <button type="button" className="documentar-file-remove" onClick={() => onRemoveFile(index)} disabled={submitting}>Eliminar</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
