import { useState, useEffect, useRef } from "react";
import socket from "./socket";
import "./styles.css";

const cityFlags = { London: "🏙️", Birmingham: "🌆", Manchester: "🏟️" };

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Chat({ username, city, onBack }) {
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
    socket.emit("typing", { room, sender: username, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing", { room, sender: username, isTyping: false });
    }, 1500);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    clearTimeout(typingTimeout.current);
    socket.emit("typing", { room, sender: username, isTyping: false });
    socket.emit("send_message", {
      room,
      message: { sender: username, text: text.trim(), isAdmin: false, time: getTime() },
    });
    setText("");
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar">{username[0].toUpperCase()}</div>
          <div className="chat-header-info">
            <h3>{cityFlags[city]} {city} Chat Room</h3>
            <span><span className="online-dot" />Logged in as <b>{username}</b></span>
          </div>
        </div>
        <button className="btn-back" onClick={onBack}>← Leave</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && typers.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            No messages yet. Say hello!
          </div>
        )}

        {messages.map((m, i) => {
          const isMine = m.sender === username && !m.isAdmin;
          const isAdmin = m.isAdmin;
          return (
            <div key={i} className={`msg-row ${isMine ? "mine" : isAdmin ? "other admin-msg" : "other"}`}>
              {!isMine && (
                <div className="msg-sender">{isAdmin ? "🛡 " : "👤 "}{m.sender}</div>
              )}
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

      <form className="chat-input-bar" onSubmit={sendMessage}>
        <input
          value={text}
          onChange={handleTyping}
          placeholder="Type a message..."
        />
        <button type="submit" className="btn-send">➤</button>
      </form>
    </div>
  );
}
