import { useState } from "react";
import Header from "./components/Header";
import ExcelLoader from "./components/ExcelLoader";
import EthPrehled from "./components/EthPrehled";
import { normalizeRows } from "./utils/dataProcessing";
import Navod from "./components/Navod";
import "./App.css";

function App() {
  const [excelData, setExcelData] = useState(null);
  const [loadTime, setLoadTime] = useState(null);
  const [loadTimestamp, setLoadTimestamp] = useState(null); // ← přidat

  const handleDataLoaded = (jsonData, time, timestamp) => {     // ← přidat time a timestamp
  if (!jsonData) {
    setExcelData(null);
    setLoadTime(null);
    setLoadTimestamp(null); // ← přidat
    return;
  }
  setExcelData(normalizeRows(jsonData));
  setLoadTime(time);                               // ← přidat
  setLoadTimestamp(timestamp);                       // ← přidat
};

  return (
    <>
      <Header />
      <main>
        <Navod />
        <ExcelLoader onDataLoaded={handleDataLoaded} />
        {excelData && <EthPrehled data={excelData} loadTime={loadTime} loadTimestamp={loadTimestamp} />}
      </main>
    </>
  );
}

export default App;
