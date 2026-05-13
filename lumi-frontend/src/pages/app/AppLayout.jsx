import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ChatWidget from "../../components/ChatWidget";

// Імпортуємо сторінки
import Home     from "../Home";
import Scan     from "../Scan";
import Progress from "../Progress";
import Profile  from "../Profile";

export default function AppLayout() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("home");

  useEffect(() => {
    if (!user) nav("/"); // Якщо не залогінена — на старт
  }, [user, nav]);

  useEffect(() => {
    // Додаємо клас до body для сторінок з меню
    document.body.classList.add('has-sidebar');
    return () => {
      // Видаляємо клас при демонтуванні
      document.body.classList.remove('has-sidebar');
    };
  }, []);

  if (!user) return null;

  return (
    <div className="lumi-app">
      
      {/* ════ НАВІГАЦІЯ (Бокова панель на десктопі / Меню на мобілці) ════ */}
      <nav className="bottom-nav">
        
        {/* Логотип LUMI: видно тільки на ноутах */}
        <div className="nav-logo hidden md:block mb-8 pl-4">
          <h2 className="lumi-serif text-[28px] font-bold text-[#C25880] m-0">
            LUMI
          </h2>
        </div>

        {/* Пункт: Дім */}
        <div 
          className={`nav-item ${tab === "home" ? "active" : ""}`}
          onClick={() => setTab("home")}
        >
          <div className="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <span className="nav-label">Дім</span>
        </div>

        {/* Пункт: Скан */}
        <div 
          className={`nav-item ${tab === "scan" ? "active" : ""}`}
          onClick={() => setTab("scan")}
        >
          <div className="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
              <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
              <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
              <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </div>
          <span className="nav-label">Скан</span>
        </div>

        {/* Пункт: Прогрес */}
        <div 
          className={`nav-item ${tab === "stats" ? "active" : ""}`}
          onClick={() => setTab("stats")}
        >
          <div className="nav-icon">
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <span className="nav-label">Прогрес</span>
        </div>

        {/* Пункт: Профіль */}
        <div 
          className={`nav-item ${tab === "profile" ? "active" : ""}`}
          onClick={() => setTab("profile")}
        >
          <div className="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span className="nav-label">Профіль</span>
        </div>
      </nav>

      {/* ════ ОСНОВНИЙ КОНТЕНТ ════ */}
      <main className="lumi-scroll w-full">
        {tab === "home"    && <Home />}
        {tab === "scan"    && <Scan />}
        {tab === "stats"   && <Progress />}
        {tab === "profile" && <Profile onSettings={() => {}} />}
      </main>

      {/* ════ ВІДЖЕТ ЧАТУ ════ */}
      <ChatWidget />

    </div>
  );
}