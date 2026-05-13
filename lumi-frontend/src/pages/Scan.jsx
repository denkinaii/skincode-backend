import { useState } from "react";
import { useToast } from "../components/Toast";

const DB = {
  niacinamide: {
    name: "Niacinamide 10% + Zinc 1%",
    score: 92, brand: "The Ordinary",
    safe:    ["Niacinamide", "Zinc PCA", "Aqua", "Glycerin", "Pentylene Glycol"],
    warn:    ["Dimethyl Isosorbide"],
    danger:  [],
    warning: "",
    tip: "Чудова формула! Ніацинамід звужує пори та вирівнює тон. Можна поєднувати з більшістю засобів. Уникай одночасного нанесення з вітаміном С.",
  },
  retinol: {
    name: "Retinol 0.5% in Squalane",
    score: 78, brand: "The Ordinary",
    safe:    ["Squalane", "Caprylic/Capric Triglyceride"],
    warn:    ["Retinol"],
    danger:  ["Не використовувати з AHA/BHA кислотами"],
    warning: "⚡ Не поєднуй з пілінгами та кислотами — може спричинити подразнення",
    tip: "Ретинол найкраще наносити ввечері на суху шкіру. Починай з 2 рази на тиждень.",
  },
  spf: {
    name: "Invisible Fluid SPF 50+",
    score: 95, brand: "Altruist",
    safe:    ["Aqua", "Zinc Oxide", "Titanium Dioxide", "Glycerin", "Niacinamide"],
    warn:    [],
    danger:  [],
    warning: "",
    tip: "Мінеральний сонцезахист — найбезпечніший вибір. Підходить навіть для чутливої шкіри.",
  },
  vitaminc: {
    name: "Vitamin C Suspension 23%",
    score: 65, brand: "The Ordinary",
    safe:    ["Ascorbic Acid", "Aqua"],
    warn:    ["Alcohol Denat.", "Propylene Glycol"],
    danger:  ["Не з ретинолом!", "Не з AHA/BHA кислотами!"],
    warning: "⚠ Висока концентрація! Можливе поколювання. Тест на маленькій ділянці обов'язковий.",
    tip: "Краще на ніч, оскільки може підвищувати фотосенсибілізацію.",
  },
};

const RECENT = [
  { emoji: "✨", name: "Vichy Mineral 89 Serum",          tag: "tag-g", tagLabel: "✓ Безпечно" },
  { emoji: "🧪", name: "The Ordinary Niacinamide 10%",    tag: "tag-g", tagLabel: "✓ Безпечно" },
  { emoji: "💧", name: "Bioderma Sensibio H2O",           tag: "tag-a", tagLabel: "⚠ Обережно" },
  { emoji: "🌿", name: "Cosrx Snail 96 Mucin Essence",    tag: "tag-g", tagLabel: "✓ Безпечно" },
  { emoji: "🧴", name: "La Roche-Posay Toleriane",        tag: "tag-r", tagLabel: "✗ Конфлікт" },
];

export default function Scan() {
  const { showToast } = useToast();
  const [query,  setQuery]  = useState("");
  const [result, setResult] = useState(null);

  function search() {
    const q = query.toLowerCase().replace(/\s/g, "");
    const key = Object.keys(DB).find(k => q.includes(k) || k.includes(q));
    if (key) {
      setResult(DB[key]);
    } else if (query.trim()) {
      // Generic result for unknown ingredients
      setResult({
        name: query,
        score: 80 + Math.floor(Math.random() * 15),
        brand: "—",
        safe:   query.split(/[,+\s]+/).filter(Boolean).slice(0, 3),
        warn:   [],
        danger: [],
        warning: "",
        tip: "Формула виглядає безпечною. Рекомендуємо завжди перевіряти нові засоби на маленькій ділянці шкіри спочатку.",
      });
    }
  }

  function reset() { setResult(null); setQuery(""); }

  const scoreColor = result
    ? result.score >= 85 ? "#1E6B45" : result.score >= 65 ? "#8C5010" : "#9C2020"
    : "#1E6B45";
  const scoreBg = result
    ? result.score >= 85 ? "#E8F7EF" : result.score >= 65 ? "#FFF0E0" : "#FFE8E8"
    : "#E8F7EF";

  return (
    <div style={{ padding: "52px 20px 20px" }}>
      <h2 className="lumi-serif" style={{ fontSize: 34, fontWeight: 500, color: "var(--accent3)", marginBottom: 4 }}>
        Аналіз<br /><em>складників 🔬</em>
      </h2>
      <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 24, fontWeight: 500 }}>
        Введи назву продукту або інгредієнта
      </p>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <input
          className="lumi-input"
          placeholder="Niacinamide, Retinol, SPF..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          style={{ paddingRight: 54 }}
        />
        <button
          onClick={search}
          style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "var(--grad)", border: "none", borderRadius: 10, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#fff" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Method buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 26 }}>
        <button className="scan-btn" onClick={() => showToast("📷 Камера скоро буде доступна!")}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="2" y="4" width="22" height="18" rx="4" stroke="var(--accent)" strokeWidth="1.5"/><circle cx="13" cy="13" r="5" stroke="var(--accent)" strokeWidth="1.5"/><circle cx="20" cy="7" r="1.5" fill="var(--accent)"/></svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Камера</span>
        </button>
        <button className="scan-btn" onClick={() => showToast("📸 Фото-скан скоро буде!")}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M3 10V8a3 3 0 013-3h2M3 16v2a3 3 0 003 3h2M23 10V8a3 3 0 00-3-3h-2M23 16v2a3 3 0 01-3 3h-2" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="13" cy="13" r="4" stroke="var(--accent)" strokeWidth="1.5"/></svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Фото</span>
        </button>
        <button className="scan-btn" onClick={() => showToast("⚖️ Порівняння скоро буде!")}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 3l2.4 7H23l-5.9 4.3 2.3 7L13 17l-6.4 4.3 2.3-7L3 10h7.6L13 3z" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round"/></svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Порівняти</span>
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div className="fade-up">
          <div className="lumi-card" style={{ marginBottom: 14 }}>
            {/* Score header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: scoreBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="lumi-serif" style={{ fontSize: 20, fontWeight: 600, color: scoreColor }}>{result.score}</span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{result.name}</div>
                <div style={{ fontSize: 13, color: "var(--sub)", fontWeight: 500 }}>
                  {result.score >= 85 ? "✅ Безпечна формула" : result.score >= 65 ? "⚠ Є нюанси" : "❌ Обережно!"}
                </div>
              </div>
            </div>

            {/* Warning box */}
            {result.warning && (
              <div style={{ background: "#FFF0E0", border: "1.5px solid #F5D0A0", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
                <p style={{ fontSize: 13, color: "#8C5010", lineHeight: 1.55, fontWeight: 600 }}>{result.warning}</p>
              </div>
            )}

            {/* Safe */}
            {result.safe.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#1E6B45", marginBottom: 7 }}>✓ БЕЗПЕЧНІ КОМПОНЕНТИ</div>
                {result.safe.map((s, i) => <span key={i} className="ib ib-s">{s}</span>)}
              </div>
            )}

            {/* Warn */}
            {result.warn.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#8C5010", marginBottom: 7 }}>⚠ ПОТРЕБУЮТЬ УВАГИ</div>
                {result.warn.map((s, i) => <span key={i} className="ib ib-c">{s}</span>)}
              </div>
            )}

            {/* Danger */}
            {result.danger.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#9C2020", marginBottom: 7 }}>✗ НЕБЕЗПЕЧНЕ ПОЄДНАННЯ</div>
                {result.danger.map((s, i) => <span key={i} className="ib ib-d">{s}</span>)}
              </div>
            )}
          </div>

          {/* Tip */}
          {result.tip && (
            <div className="lumi-card-accent" style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "var(--accent2)", marginBottom: 7 }}>💡 ПОРАДА LUMI AI</p>
              <p style={{ fontSize: 13, color: "var(--accent3)", lineHeight: 1.65, fontWeight: 500 }}>{result.tip}</p>
            </div>
          )}

          <button className="btn-secondary" onClick={reset} style={{ marginBottom: 28 }}>← Новий пошук</button>
        </div>
      )}

      {/* Recent */}
      {!result && (
        <>
          <p className="lumi-label" style={{ marginBottom: 14 }}>НЕЩОДАВНО ПЕРЕГЛЯНУТІ 💄</p>
          {RECENT.map((item, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < RECENT.length - 1 ? "1.5px solid var(--border)" : "none", cursor: "pointer" }}
              onClick={() => { setQuery(item.name); setTimeout(search, 0); }}
            >
              <div className="prod-thumb" style={{ width: 38, height: 38, fontSize: 16 }}>{item.emoji}</div>
              <span style={{ fontSize: 14, flex: 1, fontWeight: 600 }}>{item.name}</span>
              <span className={item.tag} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid", borderRadius: 20, padding: "5px 13px", fontSize: 12, fontWeight: 600 }}>
                {item.tagLabel}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
