import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Reset browser defaults
const style = document.createElement("style");
style.textContent = "body { margin: 0; padding: 0; }";
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
