import { useState, useEffect, useRef } from "react";
import socket from "./socket";
import "./styles.css";

function getTime(ts) {
  return ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
}

export default function AdminDashboard({ onLogout }) {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const room = `room_${admin.country_id}_${admin.city_id}`;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typers, setTypers] = useState([]);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    socket.emit("join_room", { room, city_id: admin.city_id, country_id: admin.country_id });

    const onHistory = (history) => setMessages(history);
    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const onTyping = ({ sender, isTyping }) =>
      setTypers((prev) => isTyping ? [...new Set([...prev, sender])] : prev.filter((s) => s !== sender));

    socket.on("room_history", onHistory);
    socket.on("receive_message", onMessage);
    socket.on("typing", onTyping);

    return () => {
      socket.off("room_history", onHistory);
      socket.off("receive_message", onMessage);
      socket.off("typing", onTyping);
      clearTimeout(typingTimeout.current);
    };
  }, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typers]);

  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit("typing", { room, sender: admin.name, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() =>
      socket.emit("typing", { room, sender: admin.name, isTyping: false }), 1500);
  };

  const sendReply = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    clearTimeout(typingTimeout.current);
    socket.emit("typing", { room, sender: admin.name, isTyping: false });
    socket.emit("send_message", {
      room,
      message: {
        sender_id: admin._id,
        sender_type: "admin",
        sender_name: admin.name,
        message: text.trim(),
        city_id: admin.city_id,
        country_id: admin.country_id,
      },
    });
    setText("");
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    onLogout();
  };

  const userMsgs = messages.filter((m) => m.sender_type === "user").length;
  const adminMsgs = messages.filter((m) => m.sender_type === "admin").length;

  return (
    <div className="chat-wrapper">
      <div className="chat-header admin-header">
        <div className="chat-header-left">
          <div className="chat-avatar admin-avatar">🛡</div>
          <div className="chat-header-info">
            <h3>Admin Dashboard</h3>
            <span><span className="online-dot" />Logged in as <b>{admin.name}</b></span>
          </div>
        </div>
        <button className="btn-back" onClick={handleLogout}>Logout</button>
      </div>

      <div className="admin-stats">
        <div className="stat-pill">Total: <span>{messages.length}</span></div>
        <div className="stat-pill">Users: <span>{userMsgs}</span></div>
        <div className="stat-pill">Replies: <span>{adminMsgs}</span></div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && typers.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📭</span>No messages yet.
          </div>
        )}
        {messages.map((m, i) => {
          const isMine = m.sender_id === admin._id && m.sender_type === "admin";
          return (
            <div key={i} className={`msg-row ${isMine ? "admin-msg mine" : "other"}`}>
              {!isMine && <div className="msg-sender">👤 {m.sender_name}</div>}
              <div className="msg-bubble">{m.message}</div>
              <div className="msg-time">{getTime(m.createdAt)}</div>
            </div>
          );
        })}
        {typers.length > 0 && (
          <div className="msg-row other">
            <div className="msg-sender">{typers.join(", ")} {typers.length === 1 ? "is" : "are"} typing...</div>
            <div className="typing-bubble"><span className="typing-dots"><span /><span /><span /></span></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-bar" onSubmit={sendReply}>
        <input value={text} onChange={handleTyping} placeholder="Reply to users..." />
        <button type="submit" className="btn-send admin-send">➤</button>
      </form>
    </div>
  );
}
