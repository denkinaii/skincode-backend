import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register } from "../services/api";
import Logo from "../components/Logo";

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    
    // 1. Валідація на фронтенді
    if (!name.trim()) return setError("Введи своє ім'я 💕");
    if (!email.includes("@")) return setError("Введи коректний email 📧");
    if (pass.length < 6) return setError("Пароль — мінімум 6 символів 🔐");

    setLoading(true);
    try {
      // 2. Виклик API (передаємо дані у форматі, який чекає main.py)
      const data = await register(name, email, pass);
      
      // 3. Зберігаємо дані в контекст (id беремо з відповіді бекенду)
      login({ id: data.user_id, name, email });
      
      // 4. Успішний перехід на квіз
      nav("/quiz");
    } catch (err) {
      console.error("Registration error:", err);
      
      // Якщо бекенд видав помилку (наприклад, юзер вже існує)
      if (err.message.includes("400") || err.message.includes("існує")) {
        setError("Такий email вже зареєстровано. Спробуй інший або увійди.");
      } else {
        // Демо-режим, якщо бекенд недоступний (тимчасово для тестування)
        const demoId = 719; 
        login({ id: demoId, name, email });
        nav("/quiz");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lumi-app">
      <div className="lumi-scroll" style={{ padding: "52px 28px 60px" }}>
        <button
          onClick={() => nav("/")} // Повернення на головну (Splash)
          style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 28, color: "var(--sub)", fontSize: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
        >← Назад</button>

        <div style={{ marginBottom: 8 }}><span style={{ fontSize: 28 }}>💧</span></div>
        <h2 className="lumi-serif fade-up" style={{ fontSize: 40, fontWeight: 500, color: "var(--accent3)", lineHeight: 1.1, marginBottom: 6 }}>
          Вітаємо<br /><em>у LUMI</em>
        </h2>
        <p style={{ fontSize: 14, color: "var(--sub)", marginBottom: 32, fontWeight: 500 }}>
          Твій персональний догляд починається тут 💕
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
          <input className="lumi-input" placeholder="Твоє ім'я" value={name} onChange={e => setName(e.target.value)} type="text" />
          <input className="lumi-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
          <input className="lumi-input" placeholder="Пароль" value={pass} onChange={e => setPass(e.target.value)} type="password" />
        </div>

        {error && (
          <div style={{ color: "#C23030", fontSize: 13, marginBottom: 14, padding: "10px 14px", background: "#FFE8E8", borderRadius: 12, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div className="divider"><span>або через</span></div>
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          <button className="social-btn" onClick={() => setError("Вхід через Google скоро буде! ✨")}>
             Google
          </button>
          <button className="social-btn" onClick={() => setError("Вхід через Apple скоро буде! 🍏")}>
             Apple
          </button>
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Завантаження..." : "🌸 Створити акаунт"}
        </button>

        <p style={{ fontSize: 12, color: "var(--hint)", textAlign: "center", marginTop: 16, lineHeight: 1.6, fontWeight: 500 }}>
          Реєструючись, ти погоджуєшся з умовами використання та політикою конфіденційності LUMI
        </p>
      </div>
    </div>
  );
}