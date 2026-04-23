import { useState } from "react";
import "./styles.css";

const CITIES = [
  { name: "London",     flag: "🏙️" },
  { name: "Birmingham", flag: "🌆" },
  { name: "Manchester", flag: "🏟️" },
];

export default function AdminLogin({ onLogin, onBack }) {
  const [adminName, setAdminName] = useState("");
  const [city, setCity] = useState("London");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (adminName.trim()) onLogin(adminName.trim(), city);
  };

  return (
    <div className="bg">
      <div className="card">
        <div className="logo">🛡️</div>
        <h1>Admin Portal</h1>
        <p className="subtitle">Manage city chat rooms</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Admin Name</label>
            <input
              placeholder="Enter admin name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label>Manage City</label>
          </div>
          <div className="city-grid">
            {CITIES.map((c) => (
              <div
                key={c.name}
                className={`city-card ${city === c.name ? "selected" : ""}`}
                onClick={() => setCity(c.name)}
              >
                <span className="city-flag">{c.flag}</span>
                {c.name}
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary admin-btn">
            Go to Dashboard →
          </button>
        </form>

        <hr className="divider" />
        <button className="btn-link" onClick={onBack}>
          ← Back to User Login
        </button>
      </div>
    </div>
  );
}
