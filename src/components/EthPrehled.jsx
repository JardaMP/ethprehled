import { useState, useEffect } from "react";
import { zpracujPrehled, formatHms } from "../utils/dataProcessing";
import { cinnostMap } from "../utils/cinnostMap";
import "./EthPrehled.css";

export default function EthPrehled({ data, loadTime, loadTimestamp }) {
  const [prehled, setPrehled] = useState([]);
  
  const [modalWorker, setModalWorker] = useState(null);

  // Zpracuj data při každém novém načtení souboru
  useEffect(() => {
  const now = Date.now();
  const zpracovano = zpracujPrehled(data).map((row) => ({
    ...row,
    uplMs: now - row.refTime,
  }));
  zpracovano.sort((a, b) => a.refTime - b.refTime); // nejstarší aktivita nahoře
  setPrehled(zpracovano);
}, [data]);

  const getDetailRows = (jmeno) => {
  const rows = data
    .filter((row) => row._pracovnikFullName === jmeno)
    .filter((row) => row["Datum pořízení"] instanceof Date)
    .sort((a, b) => a["Datum pořízení"].getTime() - b["Datum pořízení"].getTime());

  return rows.map((r, i) => {
    let trvaniMs;
    if (i === 0 && rows.length === 1) {
      trvaniMs = (loadTimestamp ?? Date.now()) - r["Datum pořízení"].getTime();
    } else if (i === 0) {
      // první řádek – trvání neznámé
      trvaniMs = 0; 
    } else if (i === rows.length - 1) {
      trvaniMs = (loadTimestamp ?? Date.now()) - r["Datum pořízení"].getTime();
      } else {
      // střední řádky – od předchozího záznamu k tomuto
      trvaniMs = r["Datum pořízení"].getTime() - rows[i - 1]["Datum pořízení"].getTime();
    }
    return { ...r, trvaniMs };
  });
};

  return (
    <section className="eth-prehled">
      <div className="eth-prehled__header-row">
  <h2 className="eth-prehled__title">
    Aktuální přehled na terminálech ETH v čase:</h2>
  {loadTime && (
    <span className="eth-prehled__title"> {loadTime}
    </span>
  )}
</div>

      <div className="eth-prehled__table-wrap">
        <table className="eth-prehled__table">
          <thead>
            <tr>
              <th>Pracovník</th>
              <th>Poslední akce</th>
              <th>Poslední činnost</th>
              <th>Uplynulý čas</th>
              <th>Zakázka</th>
              <th>Zákazník</th>
              <th>Stav</th>
            </tr>
          </thead>
          <tbody>
            {prehled.map((row) => {
              const { uplMs }  = row;
              const isProstojZ = row.zakazka === "PROSTOJ";
              const isProstojN = row.zakaznik === "PROSTOJ";
              const isStavA = row.stav === "A";

              return (
                <tr key={row.prac}>
  <td>
    <button className="eth-prehled__name-btn" onClick={() => setModalWorker(row.prac)}>
      {row.prac}
    </button>
  </td>
  <td>{row.posledniAkce}</td>
  <td>{row.posledniCinnost}</td>
  <td className="eth-prehled__time">{formatHms(uplMs)}</td>
  <td className={isProstojZ ? "eth-prehled__cell--prostoj" : ""}>{row.zakazka}</td>
  <td className={isProstojN ? "eth-prehled__cell--prostoj" : ""}>{row.zakaznik}</td>
  <td className={isStavA ? "eth-prehled__cell--stav-a" : ""}>{row.stav}</td>
</tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modální okno – detail pracovníka */}
      {modalWorker && (
        <div
          className="eth-modal__overlay"
          onClick={(e) => e.target === e.currentTarget && setModalWorker(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Detail pracovníka ${modalWorker}`}
        >
          <div className="eth-modal__content">
            <button
              className="eth-modal__close"
              onClick={() => setModalWorker(null)}
              aria-label="Zavřít"
            >
              &times;
            </button>
            <h3 className="eth-modal__title">
              Historie činností: {modalWorker}
            </h3>

            <div className="eth-modal__table-wrap">
              <table className="eth-prehled__table">
  <thead>
    <tr>
      <th>Čas pořízení</th>
      <th>Akce</th>
      <th>Činnost</th>
      <th>Zakázka</th>
      <th>Zákazník</th>
      <th>Trvání</th>
    </tr>
  </thead>
  <tbody>
    {getDetailRows(modalWorker).map((r, i) => {
      const kod = (
        String(r["Kód"] || "") +
        String(r["Kód prostoje/závady"] || "")
      ).trim();
      const cinnost = cinnostMap[kod] || kod;
      const cas = r["Datum pořízení"].toLocaleTimeString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return (
        <tr key={i}>
          <td className="eth-prehled__time">{cas}</td>
          <td>{r["Akce"] || ""}</td>
          <td>{cinnost}</td>
          <td>{r["Číslo zakázky"] || "---"}</td>
          <td>{r["Název"] || "---"}</td>
          <td className="eth-prehled__time">
            {i === 0 ? "---" : formatHms(r.trvaniMs)}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
                
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
