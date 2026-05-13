import { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = { current: null };

  const showToast = useCallback((text) => {
    setMsg(text);
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2500);
  }, []);

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <div
        className="toast"
        style={{ opacity: visible ? 1 : 0, pointerEvents: "none" }}
      >
        {msg}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
