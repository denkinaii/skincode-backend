import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const http = axios.create({
  baseURL: BASE,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.response.use(
  (r) => r.data,
  (e) => Promise.reject(new Error(e.response?.data?.detail || "Помилка сервера"))
);

// ── Auth ────────────────────────────────────────────────────────
export const register = (name, email, password) =>
  // Змінено password_hash на password, як у моделі UserCreate у main.py
  http.post("/register", { username: name, email, password: password });

// ── Quiz / Profile ───────────────────────────────────────────────
export const submitQuiz = (userId, answers) =>
  // Відправляємо user_id та всі відповіді одним об'єктом
  http.post("/submit-quiz", { user_id: userId, ...answers });

// ── Products ────────────────────────────────────────────────────
export const getProducts = (params = {}) =>
  http.get("/products", { params });

// ── Recommendations ─────────────────────────────────────────────
export const getRecommendations = (userId) =>
  http.get(`/recommendations/${userId}`);

// ── Favorites ───────────────────────────────────────────────────
export const toggleFavorite = (userId, productId) =>
  http.post("/favorites", { user_id: userId, product_id: productId });

export const getFavorites = (userId) =>
  http.get(`/favorites/${userId}`);

// ── Daily Log ───────────────────────────────────────────────────
export const saveLog = (userId, logDate, checks) =>
  http.post("/daily-log", {
    user_id: userId,
    log_date: logDate,
    morning_cleanser:    checks[0],
    morning_moisturizer: checks[1],
    morning_spf:         checks[2],
    evening_cleanser:    checks[3],
    evening_moisturizer: checks[4],
  });

export const getStreak = (userId) =>
  http.get(`/streak/${userId}`);

// ── Chat ────────────────────────────────────────────────────────
export const sendChat = (userId, message) =>
  http.post("/chat", { user_id: userId, message });