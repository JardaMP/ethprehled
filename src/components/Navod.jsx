import { useState } from "react";
import krok1 from "../assets/navod/EvidenceNaTerminalech.png";
import krok2 from "../assets/navod/HeliosVyplneniData.png";
import krok3 from "../assets/navod/ExportDoExcelu.png";
import krok4 from "../assets/navod/NahratExcel.png";
import "./Navod.css";

// Kroky návodu – přidej nebo uprav obrázky a popisky zde
const kroky = [
  {
    id: 1,
    obrazek: krok1,
    nadpis: "Krok 1 – Přihlášení do Heliosu",
    popis:
      "Přihlaste se do Heliosu a přejděte do „Evidence na terminálech ETH“.",
  },
  {
    id: 2,
    obrazek: krok2, // sem vlož cestu k obrázku, 
    nadpis: "Krok 2 – Vybrání sestavy",
    popis:
      "Vyberte sestavu „Soudek - evidence na terminálech ETH - pro Excel“ a vyplňte aktuální datum.",
  },
  {
    id: 3,
    obrazek: krok3, // sem vlož cestu k obrázku,
    nadpis: "Krok 3 – Export do Excelu",
    popis:
      "Označte všechny řádky pro vybrané datum (Ctrl+A) a zvolte export „MS Excel“ (Ctrl+E). Soubor uložte do počítače.",
  },
  {
    id: 4,
    obrazek: krok4,
    nadpis: "Krok 4 – Vložení souboru do aplikace",
    popis:
      "Uložený Excel přetáhněte do této aplikace nebo klikněte pro výběr souboru.",
  },
];

export default function Navod() {
  const [otevreny, setOtevreny] = useState(false);
  const [aktivniKrok, setAktivniKrok] = useState(0);

  return (
    <>
      {/* Tlačítko pro otevření návodu */}
      <button
        className="navod__btn-trigger"
        onClick={() => setOtevreny(true)}
        aria-label="Otevřít návod"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Zobrazit návod
      </button>

      {/* Modální okno s návodem */}
      {otevreny && (
        <div
          className="navod__overlay"
          onClick={(e) => e.target === e.currentTarget && setOtevreny(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Návod k použití"
        >
          <div className="navod__modal">
            {/* Hlavička */}
            <div className="navod__header">
              <h2 className="navod__title">Návod k použití</h2>
              <button
                className="navod__close"
                onClick={() => setOtevreny(false)}
                aria-label="Zavřít návod"
              >
                &times;
              </button>
            </div>

            {/* Záložky kroků */}
            <div className="navod__tabs" role="tablist">
              {kroky.map((k, i) => (
                <button
                  key={k.id}
                  role="tab"
                  aria-selected={i === aktivniKrok}
                  className={`navod__tab ${
                    i === aktivniKrok ? "navod__tab--aktivni" : ""
                  }`}
                  onClick={() => setAktivniKrok(i)}
                >
                  <span className="navod__tab-cislo">{k.id}</span>
                  <span className="navod__tab-nadpis">{k.nadpis.split(" – ")[0]}</span>
                </button>
              ))}
            </div>

            {/* Obsah aktivního kroku */}
            <div className="navod__obsah">
              {/* Obrázek */}
              <div className="navod__obrazek-wrap">
                {kroky[aktivniKrok].obrazek ? (
                  <img
                    src={kroky[aktivniKrok].obrazek}
                    alt={kroky[aktivniKrok].nadpis}
                    className="navod__obrazek"
                  />
                ) : (
                  <div className="navod__obrazek-placeholder">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Obrázek bude doplněn</span>
                  </div>
                )}
              </div>

              {/* Popis */}
              <div className="navod__popis-wrap">
                <h3 className="navod__krok-nadpis">
                  {kroky[aktivniKrok].nadpis}
                </h3>
                <p className="navod__krok-popis">{kroky[aktivniKrok].popis}</p>
              </div>
            </div>

            {/* Navigace Předchozí / Další */}
            <div className="navod__navigace">
              <button
                className="navod__nav-btn"
                onClick={() => setAktivniKrok((k) => Math.max(0, k - 1))}
                disabled={aktivniKrok === 0}
              >
                ← Předchozí
              </button>
              <span className="navod__krok-info">
                {aktivniKrok + 1} / {kroky.length}
              </span>
              <button
                className="navod__nav-btn"
                onClick={() =>
                  setAktivniKrok((k) => Math.min(kroky.length - 1, k + 1))
                }
                disabled={aktivniKrok === kroky.length - 1}
              >
                Další →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}