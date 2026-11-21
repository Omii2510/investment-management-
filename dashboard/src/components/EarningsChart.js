import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { useTheme } from "../context/ThemeContext";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 shadow-2xl" style={{ minWidth: 160 }}>
      <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: ₹{Number(p.value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

export default function EarningsChart({ data }) {
  const { theme } = useTheme();
  if (!data || data.length === 0) return null;

  const hasCommission = data.some((d) => d.Commission > 0);
  const gridColor  = theme === "dark" ? "#334155" : "#e2e8f0";
  const tickColor  = theme === "dark" ? "#64748b" : "#94a3b8";

  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Earnings Overview</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>ROI earned per investment plan</p>
        </div>
        {!hasCommission && (
          <span className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "var(--text-muted)", background: "var(--bg-input)", border: "1px solid var(--border)" }}>
            💡 Commission appears when referrals earn ROI
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barCategoryGap="35%">
          <defs>
            <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} width={65}
            tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)", radius: 6 }} />
          <Legend wrapperStyle={{ fontSize: "0.8rem", paddingTop: "16px" }}
            formatter={(value) => <span style={{ color: tickColor }}>{value}</span>} />
          <Bar dataKey="ROI"        name="ROI Earned"  fill="url(#roiGrad)"  radius={[6, 6, 0, 0]} minPointSize={4} />
          <Bar dataKey="Commission" name="Commission"  fill="url(#commGrad)" radius={[6, 6, 0, 0]} minPointSize={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


