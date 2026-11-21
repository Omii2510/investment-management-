import { useState, useEffect } from "react";
import { getPlans, createInvestment } from "../api";

const PLAN_STYLES = [
  { gradient: "from-indigo-500 to-violet-600", accent: "#6366f1" },
  { gradient: "from-cyan-400 to-sky-500",      accent: "#22d3ee" },
  { gradient: "from-amber-400 to-orange-500",  accent: "#f59e0b" },
];

export default function CreateInvestmentModal({ onClose, onSuccess }) {
  const [plans, setPlans]           = useState([]);
  const [selected, setSelected]     = useState(null);
  const [amount, setAmount]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    getPlans()
      .then((res) => { setPlans(res.data.data); setSelected(res.data.data[0]); })
      .catch(() => setError("Failed to load investment plans. Please try again."))
      .finally(() => setPlansLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createInvestment({ planCode: selected.planCode, investmentAmount: Number(amount) });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create investment");
    } finally {
      setLoading(false);
    }
  };

  const dailyReturn = selected && amount ? ((Number(amount) * selected.dailyROIPercentage) / 100).toFixed(2) : null;
  const totalReturn = selected && amount ? ((Number(amount) * selected.dailyROIPercentage * selected.durationDays) / 100).toFixed(2) : null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-box modal-box-lg animate-slide-up">
        <div className="modal-header">
          <div>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>New Investment</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Choose a plan and enter your amount</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="p-6">
          {error && <div className="alert-error flex items-center gap-2 mb-5 animate-fade-in">⚠️ {error}</div>}

          {plansLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 shimmer" />)}
            </div>
          ) : plans.length === 0 && !error ? (
            <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>No investment plans available.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="label mb-3">Select Plan</label>
              <div className="space-y-2 mb-5">
                {plans.map((p, i) => {
                  const style = PLAN_STYLES[i % PLAN_STYLES.length];
                  const isSelected = selected?.planCode === p.planCode;
                  return (
                    <button key={p.planCode} type="button"
                      onClick={() => { setSelected(p); setAmount(""); }}
                      className={`plan-card w-full ${isSelected ? "plan-card-selected" : ""}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                            {p.dailyROIPercentage}%
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.planName}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              ₹{p.minAmount.toLocaleString()} – ₹{p.maxAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold" style={{ color: isSelected ? style.accent : "var(--text-secondary)" }}>
                            {p.dailyROIPercentage}% daily
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.durationDays} days</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <label className="label">Investment Amount (₹)</label>
              <input className="input-field mb-1" type="number"
                placeholder={selected ? `Min ₹${selected.minAmount.toLocaleString()}` : "Enter amount"}
                value={amount} onChange={(e) => setAmount(e.target.value)}
                min={selected?.minAmount} max={selected?.maxAmount} required />
              {selected && (
                <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
                  Range: ₹{selected.minAmount.toLocaleString()} – ₹{selected.maxAmount.toLocaleString()}
                </p>
              )}

              {dailyReturn && (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="return-box">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Daily Return</p>
                    <p className="text-base font-bold text-emerald-500">₹{Number(dailyReturn).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="return-box">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Total Return</p>
                    <p className="text-base font-bold text-indigo-500">₹{Number(totalReturn).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Processing...
                  </span>
                ) : "Invest Now"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
