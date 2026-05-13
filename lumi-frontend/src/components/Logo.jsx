export default function Logo({ size = 32, withText = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, userSelect: "none" }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
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
        {/* Drop shape */}
        <path d="M16 3C16 3 7 13.5 7 19.5C7 24.2 11.03 28 16 28C20.97 28 25 24.2 25 19.5C25 13.5 16 3 16 3Z" fill="url(#lg)" />
        {/* Shine */}
        <ellipse cx="12.5" cy="15" rx="2.5" ry="4" fill="url(#shine)" transform="rotate(-15 12.5 15)" />
        <circle cx="19.5" cy="21" r="1.5" fill="white" fillOpacity="0.3" />
      </svg>
      {withText && (
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 500,
            fontSize: size * 0.75,
            color: "var(--accent3)",
            letterSpacing: "0.12em",
            lineHeight: 1,
          }}
        >
          LUMI
        </span>
      )}
    </div>
  );
}
