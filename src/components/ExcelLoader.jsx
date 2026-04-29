import { useState, useRef } from "react";
import "./ExcelLoader.css";

export default function ExcelLoader() {
  const [loadedFile, setLoadedFile] = useState(null);
  const [loadTime, setLoadTime] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;

    const validExtensions = [".xlsx", ".xls", ".csv"];
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );

    if (!hasValidExt) {
      alert("Nepodporovaný formát. Prosím vyberte .xlsx, .xls nebo .csv.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const now = new Date();
      setLoadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1),
      });
      setLoadTime(
        now.toLocaleString("cs-CZ", {
          // day: "2-digit",
          // month: "2-digit",
          // year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };

    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = ""; // reset pro opakované načtení stejného souboru
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleReset = () => {
    setLoadedFile(null);
    setLoadTime(null);
  };

  return (
    <section className="excel-loader">
      <h2 className="excel-loader__title"></h2>

      <div
        className={`excel-loader__dropzone ${isDragging ? "excel-loader__dropzone--active" : ""}`}
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current.click()}
        aria-label="Oblast pro nahrání souboru"
      >
        <svg
          className="excel-loader__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <p className="excel-loader__dropzone-text">
          Přetáhněte soubor sem nebo <span>klikněte pro výběr</span>
        </p>
        <p className="excel-loader__dropzone-hint">
          Podporované formáty: .xlsx, .xls, .csv
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="excel-loader__input"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {loadedFile && loadTime && (
        <div className="excel-loader__result" role="status" aria-live="polite">
          <div className="excel-loader__result-row">
            <span className="excel-loader__result-label">Čas načtení</span>
            <span className="excel-loader__result-value excel-loader__result-value--accent">
              {loadTime}
            </span>
          </div>
          <button className="excel-loader__reset" onClick={handleReset}>
            Načíst jiný soubor
          </button>
        </div>
      )}
    </section>
  );
}
