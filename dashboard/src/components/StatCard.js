const glowMap = {
  "#6366f1": "stat-glow-indigo",
  "#22d3ee": "stat-glow-cyan",
  "#f59e0b": "stat-glow-amber",
  "#10b981": "stat-glow-emerald",
};

const gradientMap = {
  "#6366f1": "from-indigo-500 to-violet-600",
  "#22d3ee": "from-cyan-400 to-sky-500",
  "#f59e0b": "from-amber-400 to-orange-500",
  "#10b981": "from-emerald-400 to-teal-500",
};

export default function StatCard({ title, value, icon, color, loading }) {
  const glow     = glowMap[color]     || "";
  const gradient = gradientMap[color] || "from-indigo-500 to-violet-600";

  return (
    <div className={`glass-card p-5 flex items-center gap-4 animate-slide-up ${glow} transition-all duration-300 hover:-translate-y-0.5`}>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest truncate" style={{ color: "var(--text-muted)" }}>
          {title}
        </p>
        {loading ? (
          <div className="h-7 w-28 mt-1.5 shimmer" />
        ) : (
          <p className="text-2xl font-bold mt-0.5 truncate" style={{ color }}>
            {value ?? "—"}
          </p>
        )}
      </div>
    </div>
  );
}
