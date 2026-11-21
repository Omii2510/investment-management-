import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-page)" }}>
      {/* Left branding panel — always dark */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #2e1065 100%)" }}>
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">₹</div>
            <span className="text-xl font-bold text-white">InvestPro</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Grow your wealth<br />
            <span style={{ background: "linear-gradient(to right,#a5b4fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              intelligently
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Track investments, earn daily ROI, and build passive income through our referral network.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "Daily ROI",       value: "Up to 2%" },
            { label: "Plans",           value: "3 Tiers" },
            { label: "Referral Levels", value: "3 Levels" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "1rem" }}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative" style={{ background: "var(--bg-page)" }}>
        {/* Theme toggle — top right */}
        <div className="absolute top-5 right-5">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">₹</div>
            <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>InvestPro</span>
          </div>

          <div className="auth-card-inner">
            <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Welcome back</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Sign in to your account to continue</p>

            {error && (
              <div className="alert-error flex items-center gap-2 mb-5 animate-fade-in">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input className="input-field" type="email" placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input className="input-field" style={{ paddingRight: "3.5rem" }}
                    type={showPassword ? "text" : "password"} placeholder="Enter your password"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium transition-colors"
                    style={{ color: "var(--text-muted)" }}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-indigo-500 hover:text-indigo-400 transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
