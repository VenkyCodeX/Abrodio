import { useState } from "react";
import "./styles.css";

const CITIES = [
  { name: "London",     flag: "🏙️" },
  { name: "Birmingham", flag: "🌆" },
  { name: "Manchester", flag: "🏟️" },
];

export default function UserLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("London");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) onLogin(username.trim(), city);
  };

  return (
    <div className="bg">
      <div className="card">
        <div className="logo">💬</div>
        <h1>City Chat</h1>
        <p className="subtitle">Connect with your city in real-time</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Your Name</label>
            <input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label>Select City</label>
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

          <button type="submit" className="btn-primary">
            Enter Chat →
          </button>
        </form>

        <hr className="divider" />
        <button className="btn-link" onClick={() => onLogin(null, null, "admin")}>
          🛡 Admin? Login here
        </button>
      </div>
    </div>
  );
}
