import { cinnostMap } from "./cinnostMap";

export function normalizeRows(jsonData) {
  return jsonData.map((row) => {
    const jmeno = String(row["Jméno"] || "").trim();
    const prijmeni = String(row["Příjmení"] || "").trim();
    row._pracovnikFullName =
      jmeno && prijmeni ? `${jmeno} ${prijmeni}` : jmeno || prijmeni;
    return row;
  });
}

export function zpracujPrehled(rows) {
  const pracovniciMap = new Map();

  rows.forEach((row) => {
    const prac = row._pracovnikFullName;
    const cas = row["Datum pořízení"];
    if (!prac || !(cas instanceof Date)) return;

    const casMs = cas.getTime();
    const kod = (
      String(row["Kód"] || "") + String(row["Kód prostoje/závady"] || "")
    ).trim();
    const nazevCinnosti = cinnostMap[kod] || kod;

    if (!pracovniciMap.has(prac)) {
      pracovniciMap.set(prac, {
        minCasMs: casMs,
        maxCasMs: casMs,
        posledniRadek: row,
        posledniCinnost: nazevCinnosti,
      });
    } else {
      const d = pracovniciMap.get(prac);
      if (casMs < d.minCasMs) d.minCasMs = casMs;
      if (casMs > d.maxCasMs) {
        d.maxCasMs = casMs;
        d.posledniRadek = row;
        d.posledniCinnost = nazevCinnosti;
      }
    }
  });

  return Array.from(pracovniciMap.entries()).map(([prac, d]) => {
    const r = d.posledniRadek;
    const maxDate = new Date(d.maxCasMs);
    // Porovnáváme čas záznamu s dnešním dnem (stejná hodina/minuta/vteřina)
    const refDate = new Date();
    refDate.setHours(
      maxDate.getHours(),
      maxDate.getMinutes(),
      maxDate.getSeconds(),
      0,
    );
    const diff = Date.now() - refDate.getTime();

    return {
      prac,
      posledniAkce: r["Akce"] || "",
      posledniCinnost: d.posledniCinnost,
      refTime: refDate.getTime(), // uložíme referenční čas pro live výpočet
      zakazka: r["Číslo zakázky"] || "PROSTOJ",
      zakaznik: r["Název"] || "PROSTOJ",
    };
  });
}

export function formatHms(ms) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
