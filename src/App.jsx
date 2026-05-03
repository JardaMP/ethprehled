import { useState } from "react";
import Header from "./components/Header";
import ExcelLoader from "./components/ExcelLoader";
import EthPrehled from "./components/EthPrehled";
import { normalizeRows } from "./utils/dataProcessing";
import "./App.css";

function App() {
  const [excelData, setExcelData] = useState(null);
  const [loadTime, setLoadTime] = useState(null);

  const handleDataLoaded = (jsonData, time) => {     // ← přidat time
  if (!jsonData) {
    setExcelData(null);
    setLoadTime(null);
    return;
  }
  setExcelData(normalizeRows(jsonData));
  setLoadTime(time);                               // ← přidat
};

  return (
    <>
      <Header />
      <main>
        <ExcelLoader onDataLoaded={handleDataLoaded} />
        {excelData && <EthPrehled data={excelData} loadTime={loadTime} />}
      </main>
    </>
  );
}

export default App;
