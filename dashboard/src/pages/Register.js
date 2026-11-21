import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import api from "../api";

const fields = [
  { name: "fullName",     label: "Full Name",     type: "text",     placeholder: "John Doe" },
  { name: "email",        label: "Email Address", type: "email",    placeholder: "you@example.com" },
  { name: "mobileNumber", label: "Mobile Number", type: "tel",      placeholder: "10-digit mobile number" },
  { name: "password",     label: "Password",      type: "password", placeholder: "Minimum 8 characters" },
  { name: "referralCode", label: "Referral Code", type: "text",     placeholder: "Optional — enter if you have one", optional: true },
];

export default function Register() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", mobileNumber: "", password: "", referralCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      loginUser(res.data.token, res.data.data);
      navigate("/");
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors?.length ? errors.map((e) => e.message).join(", ") : err.response?.data?.message || "Registration failed");
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
            Start your<br />
            <span style={{ background: "linear-gradient(to right,#a5b4fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              investment journey
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Join thousands of investors earning daily returns. Get started in under 2 minutes.
          </p>
        </div>
        <div className="relative z-10 space-y-3">
          {[
            "Daily ROI credited automatically",
            "Earn commissions from your referral network",
            "Track everything in real-time",
          ].map((text) => (
            <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
              <span className="text-emerald-400">✓</span> {text}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto relative" style={{ background: "var(--bg-page)" }}>
        <div className="absolute top-5 right-5">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md py-8 animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">₹</div>
            <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>InvestPro</span>
          </div>

          <div className="auth-card-inner">
            <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Create account</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Fill in your details to get started</p>

            {error && (
              <div className="alert-error flex items-start gap-2 mb-5 animate-fade-in">
                <span className="mt-0.5">⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="label">
                    {f.label}
                    {f.optional && <span className="normal-case ml-1 font-normal" style={{ color: "var(--text-muted)", textTransform: "none", letterSpacing: "normal" }}>(optional)</span>}
                  </label>
                  <div className="relative">
                    <input className="input-field"
                      name={f.name}
                      type={f.name === "password" ? (showPassword ? "text" : "password") : f.type}
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={handleChange}
                      required={!f.optional}
                    />
                    {f.name === "password" && (
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium transition-colors"
                        style={{ color: "var(--text-muted)" }}>
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-indigo-500 hover:text-indigo-400 transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
