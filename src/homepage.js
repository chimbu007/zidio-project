import React, { useState, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import "./App.css";

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

// ===== HOMEPAGE =====
function HomePage({ setCurrentUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <div>
      <nav className="navbar">
        <div className="logo">🏥 CityCare Hospital</div>
        <ul className="nav-links">
          <li><a href="#about">About Us</a></li>
          <li><a href="#specialization">Specializations</a></li>
          <li><a href="#team">Our Team</a></li>
          <li><a href="#blog">Blog</a></li>
          <li>
            <button onClick={handleLogout} className="btn btn-danger nav-btn">Logout</button>
          </li>
        </ul>
      </nav>

      <header className="hero">
        <h1>Welcome to <span>CityCare Hospital</span></h1>
        <p>Your health is our priority.</p>
        <button className="btn btn-primary" onClick={() => navigate("/upload")}>
          📊 Upload Excel Data
        </button>
      </header>

      <section id="about" className="info-section">
        <h2>About Us</h2>
        <p>CityCare Hospital has been providing exceptional healthcare services for over 20 years.</p>
      </section>

      <section id="specialization" className="info-section">
        <h2>Specializations</h2>
        <ul>
          <li>Cardiology</li>
          <li>Neurology</li>
          <li>Orthopedics</li>
          <li>Pediatrics</li>
          <li>General Surgery</li>
        </ul>
      </section>

      <section id="team" className="info-section">
        <h2>Our Team</h2>
        <div className="team-members">
          <div className="team-member"><h3>Dr. Alice Smith</h3><p>Chief Cardiologist</p></div>
          <div className="team-member"><h3>Dr. John Doe</h3><p>Neurosurgeon</p></div>
          <div className="team-member"><h3>Dr. Jane Williams</h3><p>Pediatrician</p></div>
        </div>
      </section>

      <section id="blog" className="info-section">
        <h2>Blog</h2>
        <div className="blog-posts">
          <div className="blog-post">
            <h3>5 Tips for a Healthy Heart</h3>
            <p>Learn how to maintain your heart health...</p>
          </div>
          <div className="blog-post">
            <h3>Understanding Child Nutrition</h3>
            <p>Key insights into balanced diets for children...</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ===== UPLOAD PAGE (MULTI-CHART) =====
function UploadPage() {
  const [uploads, setUploads] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [chartType, setChartType] = useState("line");
  const chartRef = useRef(null);

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
      title: { display: true, text: "Dynamic Excel Chart" },
    },
  };

  const downloadChart = () => {
    if (!chartRef.current) return;
    const url = chartRef.current.canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "chart.png";
    link.click();
  };

  const renderChart = () => {
    if (!xAxis || !yAxis) return <p>⚠️ Please select X and Y axis</p>;

    const chartProps = { ref: chartRef, data: chartData, options: chartOptions };

    switch (chartType) {
      case "line": return <Line {...chartProps} />;
      case "bar": return <Bar {...chartProps} />;
      case "pie": return <Pie {...chartProps} />;
      case "doughnut": return <Doughnut {...chartProps} />;
      case "radar": return <Radar {...chartProps} />;
      default: return null;
    }
  };

  return (
    <div className="info-section upload-container">
      <h2>📂 Upload Excel & Visualize Data</h2>
      <input type="file" accept=".xlsx, .xls, .csv" onChange={handleUpload} />

      {uploads.length > 0 && (
        <>
          <h3>Uploaded: {uploads[0].filename}</h3>
          <div className="selectors">
            <label>
              X-Axis:
              <select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
                <option value="">-- Select --</option>
                {columns.map((col, idx) => <option key={idx} value={col}>{col}</option>)}
              </select>
            </label>
            <label>
              Y-Axis:
              <select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
                <option value="">-- Select --</option>
                {columns.map((col, idx) => <option key={idx} value={col}>{col}</option>)}
              </select>
            </label>
          </div>

          <div className="chart-buttons">
            {["line","bar","pie","doughnut","radar"].map((type) => (
              <button
                key={type}
                className={`btn ${chartType===type ? "active" : ""}`}
                onClick={() => setChartType(type)}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          <button onClick={downloadChart} className="btn download-btn">⬇️ Download Chart</button>
        </>
      )}

      <div className="chart-box">{renderChart()}</div>
    </div>
  );
}

// ===== ADMIN DASHBOARD =====
function AdminDashboard({ setCurrentUser }) {
  const history = JSON.parse(localStorage.getItem("uploadHistory") || "[]");
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard info-section">
      <h2>👨‍💼 Admin Dashboard</h2>
      {history.length === 0 ? <p>No uploads yet.</p> : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Uploaded At</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={index}><td>{entry.filename}</td><td>{entry.timestamp}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={() => { setCurrentUser(null); navigate("/"); }} className="btn logout-btn">
        🚪 Logout
      </button>
    </div>
  );
}

// ===== LOGIN / SIGNUP =====
function AuthPage({ setCurrentUser }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u) => u.username === signupForm.username)) { setError("Username exists"); return; }
    users.push(signupForm);
    localStorage.setItem("users", JSON.stringify(users));
    alert("Signup successful! Please login.");
    setShowSignup(false); setSignupForm({ username: "", password: "" }); setError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (form.username === "admin" && form.password === "admin123") {
      setCurrentUser({ username: "admin", isAdmin: true });
      setError(""); return;
    }
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.username === form.username && u.password === form.password);
    if (user) { setCurrentUser({ ...user, isAdmin: false }); setError(""); }
    else setError("Invalid credentials");
  };

  return (
    <div className="auth-box">
      {!showSignup ? (
        <form onSubmit={handleLogin} className="login-box">
          <h2>Login</h2>
          {error && <p className="error">{error}</p>}
          <input type="text" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button type="submit" className="btn btn-primary">Login</button>
          <p>Don’t have an account? <span className="link" onClick={() => { setShowSignup(true); setError(""); }}>Signup</span></p>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="login-box">
          <h2>Signup</h2>
          {error && <p className="error">{error}</p>}
          <input type="text" placeholder="Username" value={signupForm.username} onChange={e => setSignupForm({ ...signupForm, username: e.target.value })} />
          <input type="password" placeholder="Password" value={signupForm.password} onChange={e => setSignupForm({ ...signupForm, password: e.target.value })} />
          <button type="submit" className="btn btn-success">Signup</button>
          <p>Already have an account? <span className="link" onClick={() => { setShowSignup(false); setError(""); }}>Login</span></p>
        </form>
      )}
    </div>
  );
}

// ===== MAIN APP =====
function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <Routes>
      <Route path="/" element={currentUser ? (currentUser.isAdmin ? <Navigate to="/admin" /> : <Navigate to="/home" />) : <AuthPage setCurrentUser={setCurrentUser} />} />
      <Route path="/home" element={currentUser && !currentUser.isAdmin ? <HomePage setCurrentUser={setCurrentUser} /> : <Navigate to="/" />} />
      <Route path="/upload" element={currentUser && !currentUser.isAdmin ? <UploadPage /> : <Navigate to="/" />} />
      <Route path="/admin" element={currentUser && currentUser.isAdmin ? <AdminDashboard setCurrentUser={setCurrentUser} /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
