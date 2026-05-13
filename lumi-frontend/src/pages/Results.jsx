import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRecommendations } from "../services/api";

const SKIN_LABEL = {
  жирна: "Жирна шкіра",
  суха: "Суха шкіра",
  комбінована: "Комбінована шкіра",
  нормальна: "Нормальна шкіра",
};

const CONCERN_PRODUCTS = {
  акне: [
    { name: "CeraVe Foaming Cleanser", brand: "CeraVe", cat: "Очищення", emoji: "🧴", link: "makeup.com.ua" },
    { name: "The Ordinary Niacinamide 10%", brand: "The Ordinary", cat: "Сироватка", emoji: "✨", link: "iherb.com" },
    { name: "La Roche-Posay Effaclar Duo", brand: "La Roche-Posay", cat: "Зволоження", emoji: "💧", link: "rozetka.ua" },
    { name: "Altruist SPF 50+ Fluid", brand: "Altruist", cat: "Захист SPF", emoji: "☀️", link: "iherb.com" },
  ],
  пігментація: [
    { name: "Vichy Mineral 89 Serum", brand: "Vichy", cat: "Сироватка", emoji: "✨", link: "makeup.com.ua" },
    { name: "Cosrx Snail Mucin Essence", brand: "Cosrx", cat: "Есенція", emoji: "🌿", link: "iherb.com" },
    { name: "Neutrogena Hydro Boost", brand: "Neutrogena", cat: "Зволоження", emoji: "💧", link: "rozetka.ua" },
    { name: "Bioré UV Aqua Rich SPF 50", brand: "Bioré", cat: "Захист SPF", emoji: "☀️", link: "iherb.com" },
  ],
  зневоднення: [
    { name: "La Roche-Posay Toleriane", brand: "La Roche-Posay", cat: "Очищення", emoji: "🧴", link: "makeup.com.ua" },
    { name: "Hada Labo Hyaluronic Lotion", brand: "Hada Labo", cat: "Тонер", emoji: "💧", link: "iherb.com" },
    { name: "Neutrogena Hydro Boost Gel", brand: "Neutrogena", cat: "Зволоження", emoji: "🌊", link: "rozetka.ua" },
    { name: "Altruist SPF 50+ Fluid", brand: "Altruist", cat: "Захист SPF", emoji: "☀️", link: "iherb.com" },
  ],
  зморшки: [
    { name: "CeraVe Hydrating Cleanser", brand: "CeraVe", cat: "Очищення", emoji: "🧴", link: "makeup.com.ua" },
    { name: "The Ordinary Retinol 0.2%", brand: "The Ordinary", cat: "Ретинол", emoji: "✨", link: "iherb.com" },
    { name: "Olay Regenerist Micro-Sculpting", brand: "Olay", cat: "Зволоження", emoji: "💫", link: "rozetka.ua" },
    { name: "Eucerin Sun Face Oil Control SPF 50", brand: "Eucerin", cat: "Захист SPF", emoji: "☀️", link: "makeup.com.ua" },
  ],
};

const INSIGHTS = {
  "менше 6 годин": "🌙 Нестача сну підвищує кортизол, що змушує шкіру виробляти більше себуму. Намагайся спати 7–8 годин — це один з найкращих безкоштовних засобів для шкіри.",
  "цукор та швидкі вуглеводи": "💡 Надмір цукру провокує глікацію — руйнування колагену. Спробуй замінити солодощі на фрукти та горіхи.",
  акне: "⚡ При акне важливо не пересушувати шкіру — це посилює виробництво себуму. Використовуй м'яке очищення та легке зволоження.",
  пігментація: "☀️ SPF щодня — ключ до освітлення пігментації. УФ-промені посилюють плями навіть у хмарну погоду.",
};

export default function Results() {
  const nav = useNavigate();
  const { skinProfile, userId } = useAuth();
  const [apiProducts, setApiProducts] = useState([]);
  const [apiInsights, setApiInsights] = useState([]);

  useEffect(() => {
    getRecommendations(userId)
      .then(d => {
        setApiProducts(d.recommended_products || []);
        setApiInsights(d.analysis_insights || []);
      })
      .catch(() => {});
  }, [userId]);

  const concern = skinProfile?.main_concern || "зневоднення";
  const skinType = skinProfile?.skin_type || "комбінована";
  const products = CONCERN_PRODUCTS[concern] || CONCERN_PRODUCTS.зневоднення;

  // Build personalized insights
  const localInsights = [];
  if (skinProfile?.sleep_quality === "менше 6 годин") localInsights.push(INSIGHTS["менше 6 годин"]);
  if (skinProfile?.diet_quality?.includes("цукор")) localInsights.push(INSIGHTS["цукор та швидкі вуглеводи"]);
  if (concern === "акне") localInsights.push(INSIGHTS.акне);
  if (concern === "пігментація") localInsights.push(INSIGHTS.пігментація);
  if (!localInsights.length) localInsights.push("✨ Твої показники в нормі! Дотримуйся базового зволоження та захисту SPF щодня.");

  const insights = apiInsights.length ? apiInsights : localInsights;

  return (
    <div className="lumi-app">
      <div className="lumi-scroll" style={{ padding: "52px 28px 60px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="float" style={{ fontSize: 56, marginBottom: 16 }}>🌸</div>
          <h2 className="lumi-serif fade-up" style={{ fontSize: 36, fontWeight: 500, color: "var(--accent3)", marginBottom: 8 }}>
            Твій профіль<br /><em>готовий!</em>
          </h2>
          <p style={{ fontSize: 14, color: "var(--sub)", lineHeight: 1.7, maxWidth: 300, margin: "0 auto", fontWeight: 500 }}>
            На основі твоїх відповідей LUMI AI склав персональний догляд для{" "}
            <strong style={{ color: "var(--accent2)" }}>{SKIN_LABEL[skinType] || "твоєї шкіри"}</strong> ✨
          </p>
        </div>

        {/* Profile tags */}
        <div className="lumi-card-accent" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <span className="tag-l">💜 {SKIN_LABEL[skinType] || skinType}</span>
            {skinProfile?.is_sensitive && <span className="tag tag-a">🔆 Чутлива</span>}
            <span className="tag">💭 {skinProfile?.main_concern || "Зволоження"}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.65, fontWeight: 500 }}>
            Твій профіль збережено. LUMI враховуватиме ці дані в усіх рекомендаціях.
          </p>
        </div>

        {/* AI Insights */}
        <p className="lumi-label" style={{ marginBottom: 12 }}>✨ АНАЛІЗ ВІД LUMI AI</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {insights.map((ins, i) => (
            <div key={i} className="lumi-card" style={{ borderLeft: "4px solid var(--accent)", fontSize: 13, color: "var(--text)", lineHeight: 1.65 }}>
              {ins}
            </div>
          ))}
        </div>

        {/* Recommended products */}
        <p className="lumi-label" style={{ marginBottom: 14 }}>💕 ТВІЙ ПЕРСОНАЛЬНИЙ ДОГЛЯД</p>
        {products.map((p, i) => (
          <div key={i} className="prod-card">
            <div className="prod-thumb">{p.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "var(--sub)", fontWeight: 500 }}>{p.brand} · {p.cat}</div>
            </div>
            <a href={`https://${p.link}`} target="_blank" rel="noreferrer" className="prod-link">{p.link.split(".")[0]} →</a>
          </div>
        ))}

        <div style={{ height: 28 }} />
        <button className="btn-primary" onClick={() => nav("/app")}>
          Перейти до застосунку →
        </button>
      </div>
    </div>
  );
}
