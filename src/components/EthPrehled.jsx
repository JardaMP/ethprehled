import { useState, useEffect } from "react";
import { zpracujPrehled, formatHms } from "../utils/dataProcessing";
import { cinnostMap } from "../utils/cinnostMap";
import "./EthPrehled.css";

export default function EthPrehled({ data }) {
  const [prehled, setPrehled] = useState([]);
  const [tick, setTick] = useState(0);
  const [modalWorker, setModalWorker] = useState(null);

  // Zpracuj data při každém novém načtení souboru
  useEffect(() => {
    const zpracovano = zpracujPrehled(data);
    zpracovano.sort((a, b) => a.refTime - b.refTime); // nejstarší aktivita nahoře
    setPrehled(zpracovano);
  }, [data]);

  // Live aktualizace uplynulého času každou sekundu
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDetailRows = (jmeno) =>
    data
      .filter((row) => row._pracovnikFullName === jmeno)
      .filter((row) => row["Datum pořízení"] instanceof Date)
      .sort(
        (a, b) => a["Datum pořízení"].getTime() - b["Datum pořízení"].getTime(),
      );

  return (
    <section className="eth-prehled">
      <h2 className="eth-prehled__title">Přehled pracovníků</h2>

      <div className="eth-prehled__table-wrap">
        <table className="eth-prehled__table">
          <thead>
            <tr>
              <th>Pracovník</th>
              <th>Uplynulý čas</th>
              <th>Poslední činnost</th>
              <th>Zakázka</th>
              <th>Zákazník</th>
              <th>Stav</th>
            </tr>
          </thead>
          <tbody>
            {prehled.map((row) => {
              const uplMs = Date.now() - row.refTime;
              const isProstojZ = row.zakazka === "PROSTOJ";
              const isProstojN = row.zakaznik === "PROSTOJ";
              const isStavA = row.stav === "A";

              return (
                <tr key={row.prac}>
                  <td>
                    <button
                      className="eth-prehled__name-btn"
                      onClick={() => setModalWorker(row.prac)}
                    >
                      {row.prac}
                    </button>
                  </td>
                  <td className="eth-prehled__time">{formatHms(uplMs)}</td>
                  <td>{row.posledniCinnost}</td>
                  <td
                    className={isProstojZ ? "eth-prehled__cell--prostoj" : ""}
                  >
                    {row.zakazka}
                  </td>
                  <td
                    className={isProstojN ? "eth-prehled__cell--prostoj" : ""}
                  >
                    {row.zakaznik}
                  </td>
                  <td className={isStavA ? "eth-prehled__cell--stav-a" : ""}>
                    {row.stav}
                  </td>
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
                    <th>Činnost</th>
                    <th>Zakázka</th>
                    <th>Zákazník</th>
                    <th>Stav</th>
                  </tr>
                </thead>
                <tbody>
                  {getDetailRows(modalWorker).map((r, i) => {
                    const kod = (
                      String(r["Kód"] || "") +
                      String(r["Kód prostoje/závady"] || "")
                    ).trim();
                    const cinnost = cinnostMap[kod] || kod;
                    const cas = r["Datum pořízení"].toLocaleTimeString(
                      "cs-CZ",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      },
                    );
                    return (
                      <tr key={i}>
                        <td className="eth-prehled__time">{cas}</td>
                        <td>{cinnost}</td>
                        <td>{r["Číslo zakázky"] || "---"}</td>
                        <td>{r["Název"] || "---"}</td>
                        <td
                          className={
                            r["Ukončeno"] === "A"
                              ? "eth-prehled__cell--stav-a"
                              : ""
                          }
                        >
                          {r["Ukončeno"] || ""}
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
