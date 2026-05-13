import { useState, useEffect } from "react";
import { logAPI } from "../services/api";

export default function Dashboard() {
  const [streak, setStreak] = useState(0);
  const [water, setWater] = useState(0);
  const [spf, setSpf] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await logAPI.getStreak(1);
        setStreak(data.streak || 0);
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-sub dark:text-hint text-xs font-bold uppercase tracking-widest mb-1">Ранок • 10 травня</p>
          <h2 className="font-serif text-3xl font-bold text-wine dark:text-mist">Привіт, Аліно ✨</h2>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold bg-blossom dark:bg-plum text-berry dark:text-petal px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm">
            Нормальна / Суха
          </span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-darkSurface p-6 rounded-[32px] border border-border dark:border-plum shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sub dark:text-hint mb-4">Рівень SPF</p>
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${spf ? "grayscale-0" : "grayscale opacity-30"}`}>☀️</span>
              <button 
                onClick={() => setSpf(!spf)}
                className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                  spf ? "bg-green-100 text-green-700" : "bg-petal dark:bg-wine text-wine dark:text-mist"
                }`}
              >
                {spf ? "Нанесено" : "Оновити"}
              </button>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-rose opacity-5 rounded-full"></div>
        </div>

        <div className="bg-white dark:bg-darkSurface p-6 rounded-[32px] border border-border dark:border-plum shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sub dark:text-hint mb-4">Стрік</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="text-xl font-bold text-wine dark:text-mist">{streak} днів</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-berry opacity-5 rounded-full"></div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-white to-petal dark:from-darkSurface dark:to-wine p-8 rounded-[40px] border border-border dark:border-plum shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-xl font-bold text-wine dark:text-mist">Трекер води</h3>
          <span className="text-sm font-bold text-berry dark:text-rose">{water * 250} мл / 2000 мл</span>
        </div>
        <div className="h-3 w-full bg-white dark:bg-darkBg rounded-full overflow-hidden border border-border dark:border-plum mb-6">
          <div 
            className="h-full bg-gradient-to-r from-rose to-berry transition-all duration-500" 
            style={{ width: `${(water * 250 / 2000) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
            <button
              key={glass}
              onClick={() => setWater(glass)}
              className={`flex-1 h-10 rounded-xl flex items-center justify-center transition-all ${
                glass <= water 
                  ? "bg-rose text-white shadow-inner scale-95" 
                  : "bg-white dark:bg-darkBg text-hint border border-border dark:border-plum"
              }`}
            >
              💧
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-wine dark:text-mist px-2">Поради на сьогодні</h3>
        <div className="bg-white dark:bg-darkSurface p-5 rounded-[28px] border border-border dark:border-plum flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blossom dark:bg-plum flex items-center justify-center flex-shrink-0 text-xl shadow-sm">
            💪
          </div>
          <div>
            <h4 className="font-bold text-sm text-wine dark:text-mist mb-1">Спорт та шкіра</h4>
            <p className="text-xs text-sub dark:text-hint leading-relaxed">
              Не забувай вмиватися м'яким гелем одразу після тренування в залі, щоб запобігти висипанням.
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-darkSurface p-5 rounded-[28px] border border-border dark:border-plum flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lilac dark:bg-darkBg flex items-center justify-center flex-shrink-0 text-xl shadow-sm border border-lavender dark:border-plum">
            🍗
          </div>
          <div>
            <h4 className="font-bold text-sm text-wine dark:text-mist mb-1">Нутриціологія</h4>
            <p className="text-xs text-sub dark:text-hint leading-relaxed">
              Куряче філе — чудове джерело протеїну для відновлення клітин шкіри. Додай до нього свіжий салат.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}