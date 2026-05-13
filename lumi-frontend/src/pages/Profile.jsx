import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../components/Toast";

const SKIN_LABEL = {
  жирна: "Жирна шкіра",
  суха: "Суха шкіра",
  комбінована: "Комбінована шкіра",
  нормальна: "Нормальна шкіра",
};
const CONCERN_LABEL = {
  акне: "Акне",
  пігментація: "Пігментація",
  зневоднення: "Зволоження",
  зморшки: "Зморшки",
};

export default function Profile({ onSettings }) {
  const { user, userName, initials, skinProfile, logout } = useAuth();
  const { theme, setTheme, THEMES, THEME_META } = useTheme();
  const { showToast } = useToast();
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav("/", { replace: true });
  }

  function handleSupport() {
    window.location.href = "mailto:support@lumi.ua?subject=Підтримка LUMI&body=Привіт команда LUMI, мені потрібна допомога з:";
  }

  return (
    <div style={{ padding: "52px 20px 20px" }}>
      {/* Avatar + info */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 6px 20px rgba(0,0,0,.18)" }}>
          <span className="lumi-serif" style={{ color: "#fff", fontSize: 24, fontWeight: 400 }}>{initials}</span>
        </div>
        <div>
          <h3 className="lumi-serif" style={{ fontSize: 26, fontWeight: 500, color: "var(--accent3)" }}>{userName}</h3>
          <p style={{ fontSize: 13, color: "var(--sub)", fontWeight: 500 }}>{user?.email || ""}</p>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {skinProfile?.skin_type && (
              <span className="tag-l" style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid #C9A8E8", borderRadius: 20, padding: "5px 13px", fontSize: 12, fontWeight: 600 }}>
                💜 {SKIN_LABEL[skinProfile.skin_type] || skinProfile.skin_type}
              </span>
            )}
            {skinProfile?.main_concern && (
              <span className="tag" style={{ fontSize: 11 }}>
                {CONCERN_LABEL[skinProfile.main_concern] || skinProfile.main_concern}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Skin profile card */}
      {skinProfile && (
        <div className="lumi-card-accent" style={{ marginBottom: 20 }}>
          <p className="lumi-label" style={{ marginBottom: 10 }}>МІЙ ПРОФІЛЬ ШКІРИ</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["🪞 Тип шкіри", SKIN_LABEL[skinProfile.skin_type] || skinProfile.skin_type],
              ["💭 Турбота", CONCERN_LABEL[skinProfile.main_concern] || skinProfile.main_concern],
              ["🌸 Чутливість", skinProfile.is_sensitive ? "Є" : "Немає"],
              ["🌙 Сон", skinProfile.sleep_quality || "—"],
              ["🥗 Харчування", skinProfile.diet_quality || "—"],
              ["🧴 Рутина", skinProfile.current_routine || "—"],
            ].filter(([, v]) => v && v !== "—").map(([k, v], i) => (
              <div key={i} style={{ background: "var(--card)", borderRadius: 12, padding: "10px 12px", border: "1.5px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--hint)", fontWeight: 600, marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent3)" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theme picker */}
      <div className="lumi-card" style={{ marginBottom: 16 }}>
        <p className="lumi-label" style={{ marginBottom: 12 }}>🎨 ТЕМА ЗАСТОСУНКУ</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          {THEMES.map(t => (
            <button
              key={t}
              className={`theme-swatch ${theme === t ? "active" : ""}`}
              style={{ background: THEME_META[t].grad }}
              onClick={() => { setTheme(t); showToast(`${THEME_META[t].emoji} Тему "${THEME_META[t].label}" застосовано!`); }}
              title={THEME_META[t].label}
            >
              <span>{THEME_META[t].emoji}</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--hint)", fontWeight: 500 }}>
          Поточна: {THEME_META[theme].emoji} {THEME_META[theme].label} · Зберігається автоматично
        </p>
      </div>

      {/* Menu rows */}
      {[
        { emoji: "📋", title: "Пройти тест знову",    sub: "Оновити профіль шкіри",      action: () => nav("/quiz") },
        { emoji: "⚙️", title: "Налаштування",         sub: "Сповіщення, конфіденційність", action: onSettings },
        { emoji: "🧴", title: "Моя рутина",           sub: "Управління продуктами",        action: () => showToast("🧴 Розділ у розробці!") },
        { emoji: "📊", title: "Звіт за місяць",       sub: "Прогрес та статистика PDF",    action: () => showToast("📊 PDF звіт скоро буде!") },
        { emoji: "❤️", title: "Мої улюблені",         sub: "Збережені продукти",           action: () => showToast("❤️ Розділ у розробці!") },
        { emoji: "💌", title: "Підтримка LUMI",       sub: "support@lumi.ua",               action: handleSupport },
        { emoji: "⭐", title: "Оцінити застосунок",   sub: "Твій відгук важливий для нас", action: () => showToast("⭐ Дякуємо за підтримку!") },
        { emoji: "ℹ️", title: "Про застосунок",       sub: "LUMI v1.0.0 · Зроблено з 💕",  action: () => showToast("🌸 LUMI v1.0 — зроблено з любов'ю!") },
      ].map((row, i) => (
        <div key={i} className="profile-row" onClick={row.action}>
          <span style={{ fontSize: 20, width: 32, textAlign: "center" }}>{row.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{row.title}</div>
            <div style={{ fontSize: 12, color: "var(--sub)", fontWeight: 500 }}>{row.sub}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="var(--hint)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      ))}

      <div style={{ height: 16 }} />
      <button
        onClick={handleLogout}
        style={{ width: "100%", border: "1.5px solid #F5B0B0", borderRadius: 14, padding: 13, color: "#C23030", fontSize: 14, cursor: "pointer", background: "none", fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}
      >
        Вийти з акаунту
      </button>
      <div style={{ height: 8 }} />
    </div>
  );
}
