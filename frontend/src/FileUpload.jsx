import { useState } from "react";

export default function FileUpload() {
  const [files, setFiles] = useState([]);
  const [fullscreen, setFullscreen] = useState(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;

    const mapped = selected.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.includes("image")
        ? "image"
        : file.type.includes("pdf")
        ? "pdf"
        : "other",
      name: file.name,
    }));

    setFiles((prev) => [...prev, ...mapped]);
  };

  const clearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.url));
    setFiles([]);
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>Upload Your Files</h1>
      <p style={{ fontSize: "16px", color: "#bbb" }}>
        Select images or PDFs. Click a file to open it fullscreen.
      </p>

      <div style={{ marginTop: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "15px",
            fontWeight: "bold",
          }}
        >
          Choose Files:
        </label>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{
            padding: "10px",
            border: "1px solid #444",
            borderRadius: "6px",
            background: "#222",
            color: "white",
            width: "100%",
          }}
        />
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2 style={{ marginBottom: "15px" }}>Uploaded Files</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {files.map((file, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px",
                  background: "#1a1a1a",
                  borderRadius: "8px",
                  border: "1px solid #333",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.4)",
                  color: "white",
                }}
              >
                {file.type === "image" && (
                  <img
                    src={file.url}
                    alt={file.name}
                    style={{
                      width: "100%",
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: "1px solid #555",
                    }}
                    onClick={() => setFullscreen(file)}
                  />
                )}

                {file.type === "pdf" && (
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      borderRadius: "6px",
                      border: "1px solid #555",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "#2a2a2a",
                      cursor: "pointer",
                    }}
                    onClick={() => setFullscreen(file)}
                  >
                    <p style={{ color: "#ccc" }}>📄 Click to open PDF</p>
                  </div>
                )}

                {file.type === "other" && (
                  <p>{file.name} — cannot preview.</p>
                )}

                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "14px",
                    wordBreak: "break-all",
                    color: "#ccc",
                  }}
                >
                  {file.name}
                </p>
              </div>
            ))}
          </div>

          <button
            style={{
              marginTop: "25px",
              padding: "10px 18px",
              background: "#d9534f",
              border: "none",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "15px",
            }}
            onClick={clearAll}
          >
            Clear All Files
          </button>
        </div>
      )}

      {fullscreen && (
        <div
          onClick={() => setFullscreen(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "zoom-out",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          {fullscreen.type === "image" ? (
            <img
              src={fullscreen.url}
              alt={fullscreen.name}
              style={{
                maxWidth: "95%",
                maxHeight: "95%",
                objectFit: "contain",
                borderRadius: "8px",
                border: "2px solid #666",
              }}
            />
          ) : (
            <iframe
              src={fullscreen.url}
              style={{
                width: "90%",
                height: "90%",
                border: "none",
                background: "white",
                borderRadius: "8px",
              }}
              title={fullscreen.name}
            />
          )}
        </div>
      )}
    </div>
  );
}
