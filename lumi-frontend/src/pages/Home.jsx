import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { saveLog, getStreak, getRecommendations } from "../services/api";
import { useToast } from "../components/Toast";

const TIPS = [
  "Пий більше води вранці — гідратація шкіри починається зсередини 💧",
  "Завжди знімай макіяж перед сном — це уповільнює старіння 🌙",
  "SPF щодня, навіть у хмарну погоду — УФ-промені проникають крізь хмари ☀️",
  "Масаж обличчя нефритовим роликом вранці розганяє лімфу та прибирає набряки 💚",
  "Шовкова подушка зменшує тертя та зберігає вологу шкіри 😴",
];

const STEPS = [
  { key: "morning_cleanser",    emoji: "🧴", label: "Очищувальний гель",     section: "morning", step: 1 },
  { key: "morning_moisturizer", emoji: "💧", label: "Гіалуронова сироватка", section: "morning", step: 2 },
  { key: "morning_spf",         emoji: "☀️", label: "Крем SPF 50+",          section: "morning", step: 3 },
  { key: "evening_cleanser",    emoji: "🌿", label: "Вечірнє очищення",       section: "evening", step: 1 },
  { key: "evening_moisturizer", emoji: "✨", label: "Нічний крем",            section: "evening", step: 2 },
];

// ─── Хелпери для localStorage ───────────────────────────────────────────────

// Ключ для конкретного дня: "lumi_log_<userId>_<YYYY-MM-DD>"
function logKey(userId, dateStr) {
  return `lumi_log_${userId}_${dateStr}`;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// Читає відмітки за конкретний день. Якщо немає — повертає [false×5]
export function readChecks(userId, dateStr) {
  try {
    const raw = localStorage.getItem(logKey(userId, dateStr));
    if (!raw) return [false, false, false, false, false];
    return JSON.parse(raw);
  } catch {
    return [false, false, false, false, false];
  }
}

// Записує відмітки за конкретний день
function writeChecks(userId, dateStr, values) {
  localStorage.setItem(logKey(userId, dateStr), JSON.stringify(values));
}

// ────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { userId, userName, initials, skinProfile } = useAuth();
  const { showToast } = useToast();

  const today = todayStr();

  const [checks, setChecks] = useState(() => readChecks(userId, today));
  const [streak, setStreak]     = useState(0);
  const [spfOn,  setSpfOn]      = useState(() => readChecks(userId, today)[2]);
  const [insights, setInsights] = useState([]);
  const [tip]  = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    getStreak(userId).then(d => setStreak(d.streak || 0)).catch(() => {});
    getRecommendations(userId).then(d => setInsights(d.analysis_insights || [])).catch(() => {});
  }, [userId]);

  async function toggleCheck(i) {
    const next = [...checks];
    next[i] = !next[i];
    setChecks(next);
    if (i === 2) setSpfOn(next[2]);

    // Зберігаємо за сьогоднішньою датою — Progress зможе прочитати
    writeChecks(userId, today, next);

    try {
      await saveLog(userId, today, next);
      const d = await getStreak(userId);
      setStreak(d.streak || 0);
    } catch { /* offline */ }

    if (next[i]) showToast("✅ Відмітку збережено!");
  }

  const morningDone = checks.slice(0, 3).filter(Boolean).length;
  const eveningDone = checks.slice(3, 5).filter(Boolean).length;
  const totalDone   = morningDone + eveningDone;
  const pct         = Math.round((totalDone / 5) * 100);

  const spfDash = spfOn ? "276 276" : `${Math.round(276 * 0.68)} 276`;

  return (
    <div style={{ padding: "52px 20px 20px" }}>
      {/* Greeting */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <p className="lumi-label" style={{ marginBottom: 5 }}>
            {new Date().toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
          </p>
          <h2 className="lumi-serif" style={{ fontSize: 30, fontWeight: 500, color: "var(--accent3)", lineHeight: 1.15 }}>
            Привіт,<br /><em>{userName?.split(" ")[0] || "Красунечко"}! 🌸</em>
          </h2>
        </div>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(0,0,0,.15)" }}>
          <span className="lumi-serif" style={{ color: "#fff", fontSize: 14, fontWeight: 400 }}>{initials}</span>
        </div>
      </div>

      {/* SPF Card */}
      <div className="lumi-card-accent" style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
        <div
          style={{ position: "relative", width: 104, height: 104, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}
          onClick={() => toggleCheck(2)}
          title="Натисни щоб відмітити SPF"
        >
          <svg width="104" height="104" viewBox="0 0 104 104">
            <circle cx="52" cy="52" r="44" fill="none" stroke="var(--surface2)" strokeWidth="9" />
            <circle
              cx="52" cy="52" r="44" fill="none"
              stroke="url(#sg)" strokeWidth="9"
              strokeDasharray={spfDash}
              strokeLinecap="round"
              className="spf-ring"
              style={{ transform: "rotate(-90deg)", transformOrigin: "52px 52px" }}
            />
            <defs>
              <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent2)" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position: "absolute", textAlign: "center" }}>
            <div className="lumi-serif" style={{ fontSize: 22, fontWeight: 600, color: "var(--accent3)", lineHeight: 1 }}>
              {spfOn ? "✓" : "68"}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--accent)", marginTop: 2 }}>SPF</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p className="lumi-label" style={{ marginBottom: 5 }}>ЗАХИСТ ВІД СОНЦЯ</p>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent3)", marginBottom: 5 }}>
            {spfOn ? "SPF захист активний! 🎉" : "68% денного захисту"}
          </div>
          <div style={{ fontSize: 12, color: "var(--sub)", marginBottom: 10, fontWeight: 500 }}>
            {spfOn ? "Чудово! Поновити о 14:00 ☀️" : "Натисни на кільце або відміть крок 3 🌤"}
          </div>
          <span className="tag-a">⚡ Нагадування</span>
        </div>
      </div>

      {/* Tip */}
      <div className="lumi-card" style={{ marginBottom: 16, borderLeft: "4px solid var(--accent)" }}>
        <p className="lumi-label" style={{ marginBottom: 8 }}>ПОРАДА ДНЯ ВІД AI 🌿</p>
        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.65, fontWeight: 500 }}>{tip}</p>
      </div>

      {/* Streak */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span className="streak">🔥 {streak} {streak === 1 ? "день" : streak < 5 ? "дні" : "днів"} підряд</span>
        {streak >= 7 && <span className="tag-g">🏆 Рекорд!</span>}
      </div>

      {/* Progress bar */}
      <div className="lumi-card-sm" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="lumi-label">РУТИНА СЬОГОДНІ</span>
          <span style={{ fontSize: 12, color: "var(--accent2)", fontWeight: 700 }}>{totalDone}/5</span>
        </div>
        <div className="pb-track">
          <div className="pb-fill" style={{ width: `${pct}%` }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--hint)", marginTop: 6, fontWeight: 500 }}>
          {pct === 100 ? "🎉 Рутину виконано! Чудово!" : `${pct}% — ще трохи!`}
        </p>
      </div>

      {/* Quick log buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }} className="log-buttons-container">
        <div className="log-btn log-m" style={{ cursor: "default" }}>
          <span style={{ fontSize: 28 }}>☀️</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#8C5010" }}>Ранок</span>
          <span style={{ fontSize: 11, color: "#C48040", fontWeight: 500 }}>{morningDone}/3 кроків</span>
        </div>
        <div className="log-btn log-e" style={{ cursor: "default" }}>
          <span style={{ fontSize: 28 }}>🌙</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#5840A0" }}>Вечір</span>
          <span style={{ fontSize: 11, color: "#8070C0", fontWeight: 500 }}>{eveningDone}/2 кроків</span>
        </div>
      </div>

      {/* Checklist */}
      <p className="lumi-label" style={{ marginBottom: 12 }}>МОЯ РУТИНА СЬОГОДНІ</p>

      {/* Morning */}
      <p style={{ fontSize: 11, color: "var(--sub)", fontWeight: 700, marginBottom: 8, marginLeft: 2 }}>☀️ РАНКОВА РУТИНА</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
        {STEPS.filter(s => s.section === "morning").map((s, si) => (
          <div key={s.key} className={`check-row ${checks[si] ? "done" : ""}`} onClick={() => toggleCheck(si)}>
            <div className="check-box">
              {checks[si] && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4.5L4 7.5L10 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: checks[si] ? "var(--accent2)" : "var(--accent)", flexShrink: 0 }} />
            <span style={{ fontSize: 14, flex: 1, fontWeight: 600 }}>{s.emoji} {s.label}</span>
            <span style={{ fontSize: 12, color: "var(--hint)" }}>Крок {s.step}</span>
          </div>
        ))}
      </div>

      {/* Evening */}
      <p style={{ fontSize: 11, color: "var(--sub)", fontWeight: 700, marginBottom: 8, marginLeft: 2 }}>🌙 ВЕЧІРНЯ РУТИНА</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {STEPS.filter(s => s.section === "evening").map((s, si) => {
          const i = si + 3;
          return (
            <div key={s.key} className={`check-row ${checks[i] ? "done" : ""}`} onClick={() => toggleCheck(i)}>
              <div className="check-box">
                {checks[i] && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4.5L4 7.5L10 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: checks[i] ? "var(--accent2)" : "var(--surface2)", flexShrink: 0 }} />
              <span style={{ fontSize: 14, flex: 1, fontWeight: 600 }}>{s.emoji} {s.label}</span>
              <span style={{ fontSize: 12, color: "var(--hint)" }}>Крок {s.step}</span>
            </div>
          );
        })}
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <>
          <p className="lumi-label" style={{ marginBottom: 12 }}>✨ AI ІНСАЙТИ</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {insights.map((ins, i) => (
              <div key={i} className="lumi-card" style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65 }}>
                {ins}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Skin profile reminder */}
      {!skinProfile && (
        <div className="lumi-card-accent" style={{ textAlign: "center", padding: "20px" }}>
          <p style={{ fontSize: 14, color: "var(--accent3)", fontWeight: 600, marginBottom: 12 }}>
            🌸 Пройди тест для персональних рекомендацій
          </p>
          <a href="/quiz" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ fontSize: 14 }}>Пройти тест →</button>
          </a>
        </div>
      )}
    </div>
  );
}