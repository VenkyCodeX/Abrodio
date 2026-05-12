import { useState, useEffect, useRef } from "react";
import socket from "./socket";
import "./styles.css";

function getTime(ts) {
  return ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
}

export default function Chat({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const room = `room_${user.country_id}_${user.city_id}`;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typers, setTypers] = useState([]);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    socket.emit("join_room", { room, city_id: user.city_id, country_id: user.country_id });

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
    socket.emit("typing", { room, sender: user.name, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() =>
      socket.emit("typing", { room, sender: user.name, isTyping: false }), 1500);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    clearTimeout(typingTimeout.current);
    socket.emit("typing", { room, sender: user.name, isTyping: false });
    socket.emit("send_message", {
      room,
      message: {
        sender_id: user._id,
        sender_type: "user",
        sender_name: user.name,
        message: text.trim(),
        city_id: user.city_id,
        country_id: user.country_id,
      },
    });
    setText("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar">{user.name[0].toUpperCase()}</div>
          <div className="chat-header-info">
            <h3>💬 Abrodio</h3>
            <span><span className="online-dot" />Logged in as <b>{user.name}</b></span>
          </div>
        </div>
        <button className="btn-back" onClick={handleLogout}>Logout</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && typers.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">💬</span>No messages yet. Say hello!
          </div>
        )}
        {messages.map((m, i) => {
          const isMine = m.sender_id === user._id && m.sender_type === "user";
          return (
            <div key={i} className={`msg-row ${isMine ? "mine" : m.sender_type === "admin" ? "other admin-msg" : "other"}`}>
              {!isMine && <div className="msg-sender">{m.sender_type === "admin" ? "🛡 " : "👤 "}{m.sender_name}</div>}
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

      <form className="chat-input-bar" onSubmit={sendMessage}>
        <input value={text} onChange={handleTyping} placeholder="Type a message..." />
        <button type="submit" className="btn-send">➤</button>
      </form>
    </div>
  );
}
