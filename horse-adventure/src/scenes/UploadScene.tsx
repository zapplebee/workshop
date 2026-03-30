import { useEffect, useState } from "react";

type UploadEntry = {
  name: string;
  size: number;
  updatedAt: number;
};

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadScene({
  onGoToGrasslands,
  onGoToCleanroom,
}: {
  onGoToGrasslands: () => void;
  onGoToCleanroom: () => void;
}) {
  const [files, setFiles] = useState<UploadEntry[]>([]);
  const [status, setStatus] = useState("Upload files here so they land in `tmp/uploads/` on the server.");
  const [loading, setLoading] = useState(false);

  const refreshFiles = async () => {
    const response = await fetch("/api/uploads");
    const payload = (await response.json()) as { files: UploadEntry[] };
    setFiles(payload.files);
  };

  useEffect(() => {
    refreshFiles().catch(() => {
      setStatus("Could not load uploaded files.");
    });
  }, []);

  return (
    <div className="scene-shell upload-shell">
      <div className="upload-panel">
        <div className="scene-nav upload-nav">
          <button className="scene-nav-button" type="button" onClick={onGoToGrasslands}>
            Grasslands
          </button>
          <button className="scene-nav-button" type="button" onClick={onGoToCleanroom}>
            Cleanroom
          </button>
          <button className="scene-nav-button is-active" type="button">
            Upload
          </button>
        </div>

        <div className="upload-title">Remote Asset Upload</div>
        <p className="upload-help">Upload images or other files into `tmp/uploads/` so they can be accessed from this machine.</p>

        <form
          className="upload-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const formData = new FormData(form);
            const file = formData.get("file");

            if (!(file instanceof File) || file.size === 0) {
              setStatus("Choose a file before uploading.");
              return;
            }

            setLoading(true);
            setStatus(`Uploading ${file.name}...`);

            try {
              const response = await fetch("/api/uploads", {
                method: "POST",
                body: formData,
              });
              const payload = (await response.json()) as { error?: string; file?: { name: string; path: string } };

              if (!response.ok || payload.error) {
                setStatus(payload.error ?? "Upload failed.");
              } else {
                setStatus(`Saved ${payload.file?.name} to ${payload.file?.path}.`);
                form.reset();
                await refreshFiles();
              }
            } catch {
              setStatus("Upload failed.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="upload-picker">
            <span>Choose file</span>
            <input name="file" type="file" />
          </label>
          <button className="upload-submit" type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        <div className="upload-status">{status}</div>

        <div className="upload-list-shell">
          <div className="upload-list-title">Uploaded Files</div>
          {files.length ? (
            <div className="upload-list">
              {files.map((file) => (
                <div key={file.name} className="upload-row">
                  <div>
                    <div className="upload-file-name">{file.name}</div>
                    <div className="upload-file-meta">{formatBytes(file.size)} · {new Date(file.updatedAt).toLocaleString()}</div>
                  </div>
                  <div className="upload-file-path">{`tmp/uploads/${file.name}`}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="upload-empty">No uploaded files yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
