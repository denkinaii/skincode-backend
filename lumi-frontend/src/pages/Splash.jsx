import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function Splash() {
  const nav = useNavigate();

  return (
    <div className="lumi-app" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 36px", position: "relative", overflow: "hidden" }}>
      {/* Decorative petals */}
      <div style={{ position: "absolute", top: 36, left: -8, transform: "rotate(-20deg)", fontSize: 60, opacity: 0.25, userSelect: "none", pointerEvents: "none" }}>🌸</div>
      <div style={{ position: "absolute", top: 80, right: -4, transform: "rotate(15deg)", fontSize: 40, opacity: 0.2, userSelect: "none", pointerEvents: "none" }}>✿</div>
      <div style={{ position: "absolute", bottom: 200, left: 14, transform: "rotate(10deg)", fontSize: 44, opacity: 0.2, userSelect: "none", pointerEvents: "none" }}>🌺</div>
      <div style={{ position: "absolute", bottom: 240, right: 6, transform: "rotate(-25deg)", fontSize: 36, opacity: 0.18, userSelect: "none", pointerEvents: "none" }}>❀</div>

      {/* 💧 Твоє нове лого-крапелька */}
      <div className="float fade-up" style={{ marginBottom: 24 }}>
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="lg" x1="10" y1="2" x2="22" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent2)" />
            </linearGradient>
            <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path 
            d="M16 3C16 3 7 13.5 7 19.5C7 24.2 11.03 28 16 28C20.97 28 25 24.2 25 19.5C25 13.5 16 3 16 3Z" 
            fill="url(#lg)" 
          />
          <ellipse cx="12.5" cy="15" rx="2" ry="4" fill="url(#shine)" transform="rotate(15 12.5 15)" />
        </svg>
      </div>

      <h1 className="lumi-serif fade-up" style={{ fontSize: 58, fontWeight: 500, color: "var(--accent3)", letterSpacing: "0.03em", lineHeight: 1, animationDelay: "0.1s" }}>
        LUMI
      </h1>
      <p className="fade-up" style={{ fontSize: 14, color: "var(--sub)", marginTop: 8, marginBottom: 6, letterSpacing: "0.05em", fontWeight: 600, animationDelay: "0.18s" }}>
        твій персональний ШІ-дерматолог
      </p>
      <p className="fade-up" style={{ fontSize: 13, color: "var(--hint)", marginBottom: 52, animationDelay: "0.24s" }}>
        🌸 Догляд, створений саме для тебе
      </p>

      <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", animationDelay: "0.3s" }}>
        <button className="btn-primary" onClick={() => nav("/register")}>
          ✨ Розпочати безкоштовно
        </button>
        <button className="btn-secondary" onClick={() => nav("/app")}>
          Увійти в акаунт
        </button>
      </div>

      <p className="fade-up" style={{ fontSize: 12, color: "var(--hint)", marginTop: 28, animationDelay: "0.38s" }}>
        Понад 12 000 перевірених компонентів · Безкоштовно
      </p>
    </div>
  );
}
