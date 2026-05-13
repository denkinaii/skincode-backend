import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../components/Toast";

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 46, height: 26, borderRadius: 13, position: "relative", cursor: "pointer",
        background: value ? "var(--accent2)" : "var(--border)", transition: "background .3s", flexShrink: 0,
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3, left: value ? 23 : 3,
        transition: "left .3s", boxShadow: "0 2px 6px rgba(0,0,0,.2)",
      }} />
    </div>
  );
}

function PrivacyToggles() {
  const [analytics, setAnalytics] = useState(true);
  const [personal,  setPersonal]  = useState(true);
  return (
    <div className="lumi-card" style={{ marginBottom: 20 }}>
      {[
        { label: "Аналітика використання",   sub: "Допомагає покращити застосунок", val: analytics, set: setAnalytics },
        { label: "Персоналізований контент",  sub: "AI підбирає контент під тебе",   val: personal,  set: setPersonal  },
      ].map((item, i, arr) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < arr.length-1 ? "1.5px solid var(--border)" : "none" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: "var(--sub)", fontWeight: 500 }}>{item.sub}</div>
          </div>
          <Toggle value={item.val} onChange={item.set} />
        </div>
      ))}
    </div>
  );
}

export default function Settings({ onBack }) {
  const { user, userName, logout } = useAuth();
  const { theme, setTheme, THEMES, THEME_META } = useTheme();
  const { showToast } = useToast();

  const [notifs, setNotifs] = useState({
    morning:    JSON.parse(localStorage.getItem("lumi_notif_morning")    ?? "true"),
    evening:    JSON.parse(localStorage.getItem("lumi_notif_evening")    ?? "true"),
    spf:        JSON.parse(localStorage.getItem("lumi_notif_spf")        ?? "true"),
    tips:       JSON.parse(localStorage.getItem("lumi_notif_tips")       ?? "false"),
    newsletter: JSON.parse(localStorage.getItem("lumi_notif_newsletter") ?? "false"),
  });

  function setNotif(key, val) {
    const next = { ...notifs, [key]: val };
    setNotifs(next);
    localStorage.setItem(`lumi_notif_${key}`, JSON.stringify(val));
    showToast(val ? "🔔 Сповіщення увімкнено" : "🔕 Сповіщення вимкнено");
  }

  function deleteAccount() {
    if (window.confirm("Видалити акаунт? Всі дані буде втрачено.")) {
      logout();
      window.location.href = "/";
    }
  }

  function clearData() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("lumi_"));
    keys.forEach(k => localStorage.removeItem(k));
    showToast("🗑 Всі дані очищено!");
  }

  return (
    <div className="lumi-app">
      <div style={{ overflowY: "auto", flex: 1, padding: "52px 20px 80px" }}>
        {/* Back */}
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 24, color: "var(--sub)", fontSize: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
        >← Назад до профілю</button>

        <h2 className="lumi-serif" style={{ fontSize: 32, fontWeight: 500, color: "var(--accent3)", marginBottom: 28 }}>
          Налаштування ⚙️
        </h2>

        {/* Account info */}
        <p className="lumi-label" style={{ marginBottom: 12 }}>АКАУНТ</p>
        <div className="lumi-card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="lumi-serif" style={{ color: "#fff", fontSize: 16 }}>
                {userName?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{userName}</div>
              <div style={{ fontSize: 12, color: "var(--sub)", fontWeight: 500 }}>{user?.email || ""}</div>
            </div>
          </div>
          <button className="btn-secondary" style={{ fontSize: 13, padding: "10px" }} onClick={() => showToast("✏️ Редагування профілю скоро!")}>
            Редагувати профіль
          </button>
        </div>

        {/* Theme */}
        <p className="lumi-label" style={{ marginBottom: 12 }}>🎨 ТЕМА ЗАСТОСУНКУ</p>
        <div className="lumi-card" style={{ marginBottom: 20 }}>
          <div className="theme-swatches-container">
            {THEMES.map(t => (
              <button
                key={t}
                className={`theme-swatch ${theme === t ? "active" : ""}`}
                style={{ background: THEME_META[t].grad }}
                onClick={() => { setTheme(t); showToast(`${THEME_META[t].emoji} Тему "${THEME_META[t].label}" застосовано!`); }}
                title={THEME_META[t].label}
              >
                <span>{THEME_META[t].emoji}</span>
                <span className="theme-label">{THEME_META[t].label}</span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--hint)", fontWeight: 500 }}>
            {THEMES.map(t => <span key={t}>{THEME_META[t].emoji} {THEME_META[t].label} &nbsp;</span>)}
          </p>
        </div>

        {/* Notifications */}
        <p className="lumi-label" style={{ marginBottom: 12 }}>🔔 СПОВІЩЕННЯ</p>
        <div className="lumi-card" style={{ marginBottom: 20 }}>
          {[
            { key: "morning",    label: "Ранкова рутина",    sub: "Нагадування о 8:00" },
            { key: "evening",    label: "Вечірня рутина",    sub: "Нагадування о 21:00" },
            { key: "spf",        label: "SPF поновлення",    sub: "Нагадування о 14:00" },
            { key: "tips",       label: "Поради від AI",     sub: "Щоденна порада" },
            { key: "newsletter", label: "Новини LUMI",       sub: "Акції та новинки" },
          ].map((item, i, arr) => (
            <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < arr.length-1 ? "1.5px solid var(--border)" : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "var(--sub)", fontWeight: 500 }}>{item.sub}</div>
              </div>
              <Toggle value={notifs[item.key]} onChange={v => setNotif(item.key, v)} />
            </div>
          ))}
        </div>

        {/* Privacy */}
        <p className="lumi-label" style={{ marginBottom: 12 }}>🔒 КОНФІДЕНЦІЙНІСТЬ</p>
        <PrivacyToggles />

        {/* Data & Support */}
        <p className="lumi-label" style={{ marginBottom: 12 }}>ПІДТРИМКА ТА ДАНІ</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {[
            { emoji: "💌", label: "Написати підтримці", action: () => { window.location.href = "mailto:support@lumi.ua?subject=Підтримка LUMI"; } },
            { emoji: "📄", label: "Умови використання",  action: () => showToast("📄 Відкриваємо умови...") },
            { emoji: "🔐", label: "Політика конфіденційності", action: () => showToast("🔐 Відкриваємо політику...") },
            { emoji: "🗑",  label: "Очистити всі дані застосунку", action: clearData },
          ].map((row, i) => (
            <div key={i} className="profile-row" style={{ marginBottom: 0 }} onClick={row.action}>
              <span style={{ fontSize: 20, width: 32, textAlign: "center" }}>{row.emoji}</span>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{row.label}</div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="var(--hint)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: "var(--hint)", textAlign: "center", marginBottom: 20, fontWeight: 500 }}>
          LUMI v1.0.0 · Зроблено з 💕 в Україні
        </p>

        <button
          onClick={deleteAccount}
          style={{ width: "100%", border: "1.5px solid #F5B0B0", borderRadius: 14, padding: 13, color: "#C23030", fontSize: 14, cursor: "pointer", background: "none", fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}
        >
          Видалити акаунт
        </button>
      </div>
    </div>
  );
}
