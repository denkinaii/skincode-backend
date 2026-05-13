import { useState } from "react";
import { favoritesAPI } from "../services/api";

const CATEGORY_ICONS = {
  cleanser: "🫧",
  moisturizer: "💧",
  spf: "☀️",
  serum: "✨",
  toner: "🌿",
  default: "🧴",
};

const SKIN_TYPE_COLORS = {
  "жирна": "bg-rose-50 text-rose-600 border-rose-200",
  "суха": "bg-amber-50 text-amber-700 border-amber-200",
  "комбінована": "bg-violet-50 text-violet-600 border-violet-200",
  "нормальна": "bg-green-50 text-green-700 border-green-200",
  "всі типи": "bg-pink-50 text-pink-600 border-pink-200",
};

export default function ProductCard({
  product,
  userId,
  isFavorited = false,
  onFavoriteToggle,
  compact = false,
}) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const icon = CATEGORY_ICONS[product.category?.toLowerCase()] ?? CATEGORY_ICONS.default;
  const skinTagClass = SKIN_TYPE_COLORS[product.target_skin_type] ?? "bg-pink-50 text-pink-600 border-pink-200";

  async function handleFavorite(e) {
    e.stopPropagation();
    if (!userId || loading) return;

    setLoading(true);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);

    try {
      await favoritesAPI.toggle(userId, product.id);
      setFavorited((prev) => !prev);
      onFavoriteToggle?.(product.id, !favorited);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-[#F5D4E4] shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE0EC] to-[#FFB8D4] flex items-center justify-center text-xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#4A1230] text-sm truncate">{product.name}</p>
          <p className="text-xs text-[#B07090] truncate">{product.brand}</p>
        </div>
        <button
          onClick={handleFavorite}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 hover:bg-pink-50 flex-shrink-0"
          aria-label={favorited ? "Видалити з улюблених" : "Додати в улюблені"}
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill={favorited ? "#C25880" : "none"}
            stroke={favorited ? "#C25880" : "#CCA0BA"} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className={heartAnim ? "scale-125" : "scale-100"}
            style={{ transition: "transform 0.2s" }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-[20px] border border-[#F5D4E4] p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-[#FFE0EC] to-[#FFF0F5] opacity-60 group-hover:opacity-80 transition-opacity" />

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFE0EC] to-[#FFB8D4] flex items-center justify-center text-2xl shadow-sm">
          {icon}
        </div>
        <button
          onClick={handleFavorite}
          disabled={loading}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FFF0F5] hover:bg-[#FFE0EC] transition-colors duration-150 disabled:opacity-50"
          aria-label={favorited ? "Видалити з улюблених" : "Додати в улюблені"}
        >
          <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill={favorited ? "#C25880" : "none"}
            stroke={favorited ? "#C25880" : "#CCA0BA"}
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: heartAnim ? "scale(1.3)" : "scale(1)", transition: "transform 0.2s ease" }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="relative">
        <h3 className="font-bold text-[#4A1230] text-sm leading-snug mb-0.5 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-[#B07090] font-medium mb-3">{product.brand}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {product.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFE0EC] border border-[#FFB8D4] text-[#C25880] text-xs font-600">
              {product.category}
            </span>
          )}
          {product.target_skin_type && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${skinTagClass}`}>
              {product.target_skin_type}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
