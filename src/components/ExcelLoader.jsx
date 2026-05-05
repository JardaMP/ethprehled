import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import "./ExcelLoader.css";

const REQUIRED_COLUMNS = [
  "Datum pořízení",
  "Jméno",
  "Příjmení",
  "Akce",
  "Kód",
  "Kód prostoje/závady",
  "Číslo zakázky",
  "Název",
  "Celkový čas [min]",
  "Ukončeno",
];

export default function ExcelLoader({ onDataLoaded }) {
  const [loadedFile, setLoadedFile] = useState(null);
  const [loadTime, setLoadTime] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    const validExt = [".xlsx", ".xls", ".csv"];
    if (!validExt.some((e) => file.name.toLowerCase().endsWith(e))) {
      alert("Nepodporovaný formát. Prosím vyberte .xlsx, .xls nebo .csv.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
        { defval: "" },
      );

       console.log("Nalezené hlavičky:", Object.keys(jsonData[0] || {}));
       console.log(jsonData);

      // ── Ochrana před prázdným souborem ──
      if (jsonData.length === 0) {
        alert("Soubor neobsahuje žádná data.");
        return;
      }

      // ── Validace povinných sloupců (trim() odstraní mezery a BOM znaky) ──
      const headers = Object.keys(jsonData[0]).map((h) =>
        h.replace(/^\uFEFF/, "").trim()
      );
      const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

      if (missing.length > 0) {
        alert(
          `Soubor neobsahuje požadované sloupce:\n\n• ${missing.join("\n• ")}\n\nZkontrolujte prosím sloupce v Excelu.`
        );
        return; // soubor se nenačte, stav se nezmění
      }

      // ── Načtení proběhlo v pořádku ──
      const now = new Date();
      const formattedTime = now.toLocaleString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setLoadedFile({ name: file.name, size: (file.size / 1024).toFixed(1) });
      setLoadTime(formattedTime);

      if (onDataLoaded) onDataLoaded(jsonData, formattedTime, now.getTime());
    };

    reader.readAsArrayBuffer(file); // ← musí být ZDE, mimo onload
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleReset = () => {
    setLoadedFile(null);
    setLoadTime(null);
    if (onDataLoaded) onDataLoaded(null, null, null);
  };

  return (
    <section className="excel-loader">
      <div
        className={`excel-loader__dropzone ${isDragging ? "excel-loader__dropzone--active" : ""}`}
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current.click()}
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
    </section>
  );
}