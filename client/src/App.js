import { useState } from "react";
import UserLogin from "./UserLogin";
import Chat from "./Chat";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

export default function App() {
  const [screen, setScreen] = useState("userLogin"); // userLogin | chat | adminLogin | adminDashboard
  const [user, setUser] = useState(null);   // { username, city }
  const [admin, setAdmin] = useState(null); // { adminName, city }

  if (screen === "userLogin")
    return (
      <UserLogin
        onLogin={(username, city, role) => {
          if (role === "admin") { setScreen("adminLogin"); return; }
          setUser({ username, city });
          setScreen("chat");
        }}
      />
    );

  if (screen === "chat")
    return <Chat username={user.username} city={user.city} onBack={() => setScreen("userLogin")} />;

  if (screen === "adminLogin")
    return (
      <AdminLogin
        onLogin={(adminName, city) => {
          setAdmin({ adminName, city });
          setScreen("adminDashboard");
        }}
        onBack={() => setScreen("userLogin")}
      />
    );

  if (screen === "adminDashboard")
    return <AdminDashboard adminName={admin.adminName} city={admin.city} onBack={() => setScreen("adminLogin")} />;
}
