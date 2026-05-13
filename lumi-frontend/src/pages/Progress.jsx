import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getStreak } from "../services/api";
import { useToast } from "../components/Toast";
import { readChecks } from "./Home"; // імпортуємо хелпер з Home.jsx

const DAYS_UK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

// ─── Будуємо дані за останні 7 днів із localStorage ─────────────────────────
function buildWeeklyData(userId) {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const checks = readChecks(userId, dateStr);
    const done = checks.filter(Boolean).length;
    result.push(Math.round((done / 5) * 100));
  }
  return result;
}

// ─── Donut ───────────────────────────────────────────────────────────────────
function Donut({ pct, color1, color2, size = 84 }) {
  const r = 32, c = 2 * Math.PI * r;
  const dash = `${Math.round(c * pct / 100)} ${c}`;
  return (
    <div className="donut-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface)" strokeWidth="8" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={`url(#dg-${color1.replace(/[^a-zA-Z0-9]/g,"")})`} strokeWidth="8"
          strokeDasharray={dash} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: `${size/2}px ${size/2}px`, transition: "stroke-dasharray .5s ease" }}
        />
        <defs>
          <linearGradient id={`dg-${color1.replace(/[^a-zA-Z0-9]/g,"")}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color1} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        </defs>
      </svg>
      <div className="donut-inner">
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent3)" }}>{pct}%</div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export default function Progress() {
  const { userId } = useAuth();
  const { showToast } = useToast();
  const [streak, setStreak] = useState(0);
  const [photos, setPhotos] = useState({ before: null, after: null });

  // Будуємо реальні дані тижня з localStorage
  const [weekly, setWeekly] = useState(() => buildWeeklyData(userId));

  useEffect(() => {
    getStreak(userId).then(d => setStreak(d.streak || 0)).catch(() => {});
    const stored = localStorage.getItem(`lumi_photos_${userId}`);
    if (stored) setPhotos(JSON.parse(stored));
    // Оновлюємо дані при переході на сторінку
    setWeekly(buildWeeklyData(userId));
  }, [userId]);

  // ── Підраховуємо реальну статистику з тижневих даних ──────────────────────

  // Дні, де щось виконано (> 0%)
  const activeDays = weekly.filter(p => p > 0).length;

  // Середній відсоток за тиждень для ранку (кроки 0-2) та вечора (кроки 3-4)
  const morningPct = (() => {
    let total = 0, count = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const checks = readChecks(userId, dateStr);
      const morningDone = checks.slice(0, 3).filter(Boolean).length;
      total += Math.round((morningDone / 3) * 100);
      count++;
    }
    return Math.round(total / count);
  })();

  const eveningPct = (() => {
    let total = 0, count = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const checks = readChecks(userId, dateStr);
      const eveningDone = checks.slice(3, 5).filter(Boolean).length;
      total += Math.round((eveningDone / 2) * 100);
      count++;
    }
    return Math.round(total / count);
  })();

  // Відсоток виконання SPF за тиждень
  const spfPct = (() => {
    let done = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const checks = readChecks(userId, dateStr);
      if (checks[2]) done++;
    }
    return Math.round((done / 7) * 100);
  })();

  // Поточний день тижня для підсвітки
  const today  = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  // ── Фото-журнал ───────────────────────────────────────────────────────────

  function handlePhoto(slot) {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const next = { ...photos, [slot]: ev.target.result };
        setPhotos(next);
        localStorage.setItem(`lumi_photos_${userId}`, JSON.stringify(next));
        showToast("📸 Фото збережено!");
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: "52px 20px 20px" }}>
      <h2 className="lumi-serif" style={{ fontSize: 34, fontWeight: 500, color: "var(--accent3)", marginBottom: 20 }}>
        Твій<br /><em>прогрес 📈</em>
      </h2>

      {/* Streak */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <span className="streak">🔥 {streak} {streak === 1 ? "день" : streak < 5 ? "дні" : "днів"} підряд</span>
        {streak >= 7 && <span className="tag-g">🏆 Чемпіон!</span>}
        {streak === 0 && <span style={{ fontSize: 13, color: "var(--hint)", fontWeight: 500 }}>Починай сьогодні! 💪</span>}
      </div>

      {/* Donut stats — РЕАЛЬНІ дані з localStorage */}
      <div className="lumi-card" style={{ marginBottom: 18 }}>
        <p className="lumi-label" style={{ marginBottom: 16 }}>ДОТРИМАННЯ РУТИНИ (7 ДНІВ)</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "space-around" }}>
          <div style={{ textAlign: "center" }}>
            <Donut pct={morningPct} color1="var(--accent)" color2="var(--accent2)" />
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--sub)", marginTop: 7 }}>Ранкова</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <Donut pct={eveningPct} color1="#C9A8E8" color2="#6B42A8" />
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--sub)", marginTop: 7 }}>Вечірня</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <Donut pct={spfPct} color1="#F5B88A" color2="#D06820" />
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--sub)", marginTop: 7 }}>SPF</div>
          </div>
        </div>
      </div>

      {/* Тижневий календар — РЕАЛЬНІ дані */}
      <p className="lumi-label" style={{ marginBottom: 12 }}>ЦЕЙ ТИЖДЕНЬ</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
        {DAYS_UK.map((day, i) => {
          const isToday = i === todayIdx;
          const pct = weekly[i];
          const done = pct >= 80;
          const partial = pct > 0 && pct < 80;
          return (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: isToday ? "var(--accent2)" : "var(--hint)", fontWeight: 700, marginBottom: 6 }}>
                {day}
              </div>
              <div style={{
                height: 36,
                borderRadius: 10,
                background: isToday
                  ? "var(--grad)"
                  : done
                  ? "var(--surface)"
                  : partial
                  ? "var(--surface2)"
                  : "var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                transition: "background 0.3s",
              }}>
                {done
                  ? "✓"
                  : isToday
                  ? <span style={{ color: "#fff", fontWeight: 700, fontSize: 10 }}>сьогодні</span>
                  : partial
                  ? <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent3)" }}>{pct}%</span>
                  : "·"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ранок / Вечір — РЕАЛЬНІ відсотки */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
        <div className="lumi-card-sm">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>☀️ Ранкова</div>
          <div className="lumi-serif" style={{ fontSize: 26, fontWeight: 600, color: "var(--accent3)" }}>{morningPct}%</div>
          <div style={{ fontSize: 11, color: "var(--sub)", marginBottom: 7, fontWeight: 500 }}>
            {activeDays} / 7 активних днів
          </div>
          <div className="pb-track"><div className="pb-fill" style={{ width: `${morningPct}%` }} /></div>
        </div>
        <div className="lumi-card-sm">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>🌙 Вечірня</div>
          <div className="lumi-serif" style={{ fontSize: 26, fontWeight: 600, color: "var(--accent3)" }}>{eveningPct}%</div>
          <div style={{ fontSize: 11, color: "var(--sub)", marginBottom: 7, fontWeight: 500 }}>
            {activeDays} / 7 активних днів
          </div>
          <div className="pb-track"><div className="pb-fill" style={{ width: `${eveningPct}%` }} /></div>
        </div>
      </div>

      {/* Фото-журнал */}
      <p className="lumi-label" style={{ marginBottom: 12 }}>ФОТО-ЖУРНАЛ ПРОГРЕСУ 📸</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
        {["before", "after"].map(slot => (
          <div
            key={slot}
            onClick={() => handlePhoto(slot)}
            style={photos[slot] ? {
              flex: 1, borderRadius: 16, height: 130, overflow: "hidden", cursor: "pointer",
              border: "2px solid var(--surface2)",
            } : undefined}
            className={photos[slot] ? undefined : "photo-slot"}
          >
            {photos[slot]
              ? <img src={photos[slot]} alt={slot} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                    <rect x="2" y="4" width="22" height="18" rx="4" stroke="var(--surface2)" strokeWidth="1.5"/>
                    <circle cx="13" cy="13" r="5" stroke="var(--surface2)" strokeWidth="1.5"/>
                    <circle cx="20" cy="7" r="1.5" fill="var(--surface2)"/>
                  </svg>
                  <span>{slot === "before" ? "Фото початку" : "Фото зараз"}</span>
                  <span style={{ fontSize: 11, color: "var(--hint)" }}>Натисни щоб завантажити</span>
                </>
            }
          </div>
        ))}
      </div>

      {/* AI Insight */}
      <div className="lumi-card-accent">
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "var(--accent2)", marginBottom: 7 }}>
          🌸 AI ІНСАЙТ
        </p>
        <p style={{ fontSize: 14, color: "var(--accent3)", lineHeight: 1.65, fontWeight: 500 }}>
          {activeDays === 0
            ? "Починай сьогодні! Відмічай кроки на головній сторінці і тут відобразиться твій реальний прогрес 💪"
            : activeDays >= 5
            ? `Фантастично! Ти дотримуєшся рутини ${activeDays} з 7 днів цього тижня. Так тримати! 💕`
            : `Ти вже виконала рутину ${activeDays} з 7 днів. Підтягни регулярність — ефект з'явиться вже через 2 тижні! 🌸`
          }
        </p>
      </div>
    </div>
  );
}