import { useState, useRef, useEffect } from "react";
import { sendChat } from "../services/api";   // ← використовуємо існуючий API
import { useAuth } from "../context/AuthContext";

export default function ChatWidget() {
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: "ai", text: "Привіт! Я LUMI 🌸 Чим можу допомогти з доглядом за шкірою?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Плавний скрол до останнього повідомлення
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [msgs, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setMsgs(p => [...p, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      // Тепер іде через FastAPI-бекенд, а не через localhost:3001
      const data = await sendChat(userId, text);
      const reply = data?.reply || data?.message || data?.text
        || "Я отримала твоє питання, але щось пішло не так 🌸";
      setMsgs(p => [...p, { role: "ai", text: reply }]);
    } catch (error) {
      setMsgs(p => [...p, {
        role: "ai",
        text: "Ой! Здається, я трохи відволіклась на догляд за собою. Спробуй ще раз за хвилинку! ✨",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(!open)} aria-label="Чат з LUMI AI">
        <svg className="chat-fab-icon" viewBox="0 0 22 22" fill="none" style={{ width: "24px", height: "24px" }}>
          {open
            ? <path d="M4 4l14 14M18 4L4 18" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            : <path d="M11 2C6.03 2 2 5.58 2 10c0 2.03.83 3.88 2.2 5.24L3 20l4.76-1.2C8.98 19.57 9.97 20 11 20c4.97 0 9-3.58 9-8s-4.03-8-9-8z" fill="#fff"/>
          }
        </svg>
      </button>

      <div className={`chat-panel ${open ? "open" : ""}`}>
        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: "1.5px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--grad-soft)" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 18 }}>🌸</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent3)" }}>LUMI AI</div>
            <div style={{ fontSize: 11, color: "var(--sub)", fontWeight: 500 }}>Твій персональний помічник</div>
          </div>
          <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", boxShadow: "0 0 0 2px var(--card)" }} />
        </div>

        {/* Messages */}
        <div
          className="chat-messages"
          ref={scrollRef}
          style={{ overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}
        >
          {msgs.map((m, i) => (
            <div key={i} className={`msg-bubble ${m.role === "user" ? "msg-user" : "msg-ai"}`}>
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="msg-bubble msg-ai" style={{ alignSelf: "flex-start", display: "flex", gap: 4, padding: "12px 16px" }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: "12px", borderTop: "1.5px solid var(--border)", display: "flex", gap: 8 }}>
          <input
            className="lumi-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Запитати про догляд..."
            style={{ flex: 1, fontSize: 13, padding: "10px 14px", borderRadius: "12px" }}
          />
          <button
            onClick={send}
            disabled={loading}
            className="btn-primary"
            style={{ width: "42px", height: "42px", padding: 0, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", opacity: loading ? 0.6 : 1 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}