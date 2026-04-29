import { useState } from "react";
import Header from "./components/Header";
import ExcelLoader from "./components/ExcelLoader";
import EthPrehled from "./components/EthPrehled";
import { normalizeRows } from "./utils/dataProcessing";
import "./App.css";

function App() {
  const [excelData, setExcelData] = useState(null);

  const handleDataLoaded = (jsonData) => {
    if (!jsonData) {
      setExcelData(null);
      return;
    }
    setExcelData(normalizeRows(jsonData));
  };

  return (
    <>
      <Header />
      <main>
        <ExcelLoader onDataLoaded={handleDataLoaded} />
        {excelData && <EthPrehled data={excelData} />}
      </main>
    </>
  );
}

export default App;
