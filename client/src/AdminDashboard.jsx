import { useState, useEffect, useRef } from "react";
import socket from "./socket";
import "./styles.css";

const cityFlags = { London: "🏙️", Birmingham: "🌆", Manchester: "🏟️" };

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AdminDashboard({ adminName, city, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typers, setTypers] = useState([]);
  const room = `city_${city}`;
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    socket.emit("join_room", { room });

    const onHistory = (history) => setMessages(history);
    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const onTyping = ({ sender, isTyping }) => {
      setTypers((prev) =>
        isTyping ? [...new Set([...prev, sender])] : prev.filter((s) => s !== sender)
      );
    };

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
    socket.emit("typing", { room, sender: adminName, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing", { room, sender: adminName, isTyping: false });
    }, 1500);
  };

  const sendReply = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    clearTimeout(typingTimeout.current);
    socket.emit("typing", { room, sender: adminName, isTyping: false });
    socket.emit("send_message", {
      room,
      message: { sender: adminName, text: text.trim(), isAdmin: true, time: getTime() },
    });
    setText("");
  };

  const userMessages = messages.filter((m) => !m.isAdmin).length;
  const adminMessages = messages.filter((m) => m.isAdmin).length;

  return (
    <div className="chat-wrapper">
      <div className="chat-header admin-header">
        <div className="chat-header-left">
          <div className="chat-avatar admin-avatar">🛡</div>
          <div className="chat-header-info">
            <h3>{cityFlags[city]} {city} — Admin Dashboard</h3>
            <span><span className="online-dot" />Monitoring as <b>{adminName}</b></span>
          </div>
        </div>
        <button className="btn-back" onClick={onBack}>← Back</button>
      </div>

      <div className="admin-stats">
        <div className="stat-pill">Total: <span>{messages.length}</span></div>
        <div className="stat-pill">Users: <span>{userMessages}</span></div>
        <div className="stat-pill">Replies: <span>{adminMessages}</span></div>
        <div className="stat-pill">Room: <span>city_{city}</span></div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && typers.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            No messages in {city} yet.
          </div>
        )}

        {messages.map((m, i) => {
          const isMine = m.isAdmin && m.sender === adminName;
          return (
            <div key={i} className={`msg-row ${isMine ? "admin-msg mine" : "other"}`}>
              {!isMine && <div className="msg-sender">👤 {m.sender}</div>}
              <div className="msg-bubble">{m.text}</div>
              <div className="msg-time">{m.time || ""}</div>
            </div>
          );
        })}

        {/* Typing indicator — inside messages div so it scrolls into view */}
        {typers.length > 0 && (
          <div className="msg-row other">
            <div className="msg-sender">
              {typers.join(", ")} {typers.length === 1 ? "is" : "are"} typing...
            </div>
            <div className="typing-bubble">
              <span className="typing-dots">
                <span /><span /><span />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form className="chat-input-bar" onSubmit={sendReply}>
        <input
          value={text}
          onChange={handleTyping}
          placeholder={`Reply to ${city} users...`}
        />
        <button type="submit" className="btn-send admin-send">➤</button>
      </form>
    </div>
  );
}
