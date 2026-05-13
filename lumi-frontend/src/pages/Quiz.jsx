import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { submitQuiz } from "../services/api";
import questions from "../data/questions.json";

export default function Quiz() {
  const nav = useNavigate();
  const { userId, saveProfile } = useAuth();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const q = questions[idx];
  const total = questions.length;
  const pct = Math.round(((idx + 1) / total) * 100);
  const letters = ["а", "б", "в", "г"];

  function pick(value) {
    setAnswers(prev => ({ ...prev, [q.key]: value }));
  }

  async function next() {
    if (idx < total - 1) {
      setIdx(i => i + 1);
    } else {
      // Формуємо payload для профілю згідно з SkinProfileCreate у main.py
      const profile = {
        user_id:             userId,
        gender:              answers.gender || "other",
        age:                 parseInt(answers.age) || 20,
        skin_type:           answers.skin_type || "нормальна",
        is_sensitive:        answers.is_sensitive === "true" || answers.is_sensitive === "moderate",
        main_concern:        answers.main_concern || "зневоднення",
        breakouts_frequency: answers.breakouts_frequency || "рідко",
        diet_quality:        answers.diet_quality || "без системи",
        sleep_quality:       answers.sleep_quality || "норма",
        allergies:           answers.allergies || "немає",
        current_routine:     answers.current_routine || "мінімальна",
        // Додаткові поля, якщо вони потрібні бекенду (можна залишити null)
        health_issues:       null,
        menstrual_cycle_stage: null
      };

      setSubmitting(true);
      
      // Зберігаємо локально в контекст та localStorage
      saveProfile(profile);

      try {
        // Відправляємо на бекенд
        await submitQuiz(userId, profile);
      } catch (error) {
        console.error("Помилка при збереженні анкету на сервері:", error);
        // Навіть якщо бекенд офлайн, ми вже зберегли дані локально через saveProfile
      } finally {
        setSubmitting(false);
        nav("/results");
      }
    }
  }

  function prev() {
    if (idx > 0) setIdx(i => i - 1);
    else nav(-1);
  }

  return (
    <div className="lumi-app">
      <div className="lumi-scroll" style={{ padding: "52px 28px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="lumi-label">ОПИТУВАННЯ</span>
          <span style={{ fontSize: 12, color: "var(--hint)", fontWeight: 600 }}>{idx + 1} / {total}</span>
        </div>

        {/* Progress */}
        <div className="pb-track" style={{ marginBottom: 30 }}>
          <div className="pb-fill" style={{ width: `${pct}%` }} />
        </div>

        <span className="lumi-serif" style={{ fontSize: 13, color: "var(--accent)", fontStyle: "italic" }}>
          Питання №{idx + 1}
        </span>

        <h2 className="lumi-serif fade-up" style={{ fontSize: 26, fontWeight: 500, color: "var(--accent3)", lineHeight: 1.3, margin: "10px 0 8px" }}>
          {q.question}
        </h2>

        {q.hint && (
          <p style={{ fontSize: 12, color: "var(--hint)", marginBottom: 26, fontWeight: 500 }}>
            💡 {q.hint}
          </p>
        )}

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`quiz-opt ${answers[q.key] === opt.value ? "selected" : ""}`}
              onClick={() => pick(opt.value)}
            >
              <span className="quiz-opt-letter">{letters[i]}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-secondary" style={{ flex: "0 0 54px", fontSize: 20, padding: 0, height: 54 }} onClick={prev}>←</button>
          <button
            className="btn-primary"
            onClick={next}
            disabled={submitting}
            style={{ flex: 1 }}
          >
            {submitting
              ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, borderColor: "rgba(255,255,255,.4)", borderTopColor: "#fff" }} />
              : idx < total - 1 ? "Далі →" : "Отримати результати 🌸"
            }
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={next}
          style={{ background: "none", border: "none", width: "100%", marginTop: 16, fontSize: 13, color: "var(--hint)", cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 600 }}
        >
          Пропустити питання →
        </button>
      </div>
    </div>
  );
}