import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Line, Bar, Pie, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./UploadPage.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

function UploadPage() {
  const [uploads, setUploads] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [chartType, setChartType] = useState("line");
  const chartRef = React.useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const newHistory = JSON.parse(localStorage.getItem("uploadHistory") || "[]");
      newHistory.push({ filename: file.name, timestamp: new Date().toLocaleString() });
      localStorage.setItem("uploadHistory", JSON.stringify(newHistory));

      setUploads([{ filename: file.name, data: sheet }]);
      setGraphData(sheet);
      setColumns(Object.keys(sheet[0]));
    };
    reader.readAsArrayBuffer(file);
  };

  const chartData = {
    labels: graphData.map((row) => row[xAxis]),
    datasets: [
      {
        label: `${yAxis} vs ${xAxis}`,
        data: graphData.map((row) => row[yAxis]),
        backgroundColor: [
          "rgba(75,192,192,0.6)",
          "rgba(255,99,132,0.6)",
          "rgba(54,162,235,0.6)",
          "rgba(255,206,86,0.6)",
          "rgba(153,102,255,0.6)",
        ],
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "📊 Dynamic Excel Chart" },
    },
  };

  // ✅ Fixed Download Function
  const downloadChart = () => {
    if (!chartRef.current) return;
    const url = chartRef.current.canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chart.png";
    link.click();
  };

  const renderChart = () => {
    if (!xAxis || !yAxis)
      return <p className="info-text">⚠️ Please select X and Y axis.</p>;

    const chartProps = { ref: chartRef, data: chartData, options: chartOptions };

    switch (chartType) {
      case "line":
        return <Line {...chartProps} />;
      case "bar":
        return <Bar {...chartProps} />;
      case "pie":
        return <Pie {...chartProps} />;
      case "doughnut":
        return <Doughnut {...chartProps} />;
      case "radar":
        return <Radar {...chartProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="upload-container">
      <h2 className="page-title">📂 Upload Excel & Visualize Data</h2>
      <div className="upload-box">
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleUpload}
          id="fileInput"
          hidden
        />
        <label htmlFor="fileInput" className="upload-label">
          Drag & Drop or <span>Browse</span>
        </label>
      </div>

      {uploads.length > 0 && (
        <div className="chart-settings">
          <h3>Uploaded: {uploads[0].filename}</h3>

          <div className="selectors">
            <label>
              X-Axis:
              <select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
                <option value="">-- Select --</option>
                {columns.map((col, idx) => (
                  <option key={idx} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Y-Axis:
              <select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
                <option value="">-- Select --</option>
                {columns.map((col, idx) => (
                  <option key={idx} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="chart-buttons">
            <button
              className={`btn ${chartType === "line" ? "active" : ""}`}
              onClick={() => setChartType("line")}
            >
              📈 Line
            </button>
            <button
              className={`btn ${chartType === "bar" ? "active" : ""}`}
              onClick={() => setChartType("bar")}
            >
              📊 Bar
            </button>
            <button
              className={`btn ${chartType === "pie" ? "active" : ""}`}
              onClick={() => setChartType("pie")}
            >
              🥧 Pie
            </button>
            <button
              className={`btn ${chartType === "doughnut" ? "active" : ""}`}
              onClick={() => setChartType("doughnut")}
            >
              🍩 Doughnut
            </button>
            <button
              className={`btn ${chartType === "radar" ? "active" : ""}`}
              onClick={() => setChartType("radar")}
            >
              📡 Radar
            </button>
          </div>

          <button onClick={downloadChart} className="btn download-btn">
            ⬇️ Download Chart
          </button>
        </div>
      )}

      <div className="chart-box">{renderChart()}</div>
    </div>
  );
}

export default UploadPage;
