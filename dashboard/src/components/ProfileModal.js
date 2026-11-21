import { useState } from "react";

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value || "—"}</span>
    </div>
  );
}

export default function ProfileModal({ user, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(user?.referralCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-box animate-slide-up">
        <div className="modal-header">
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>My Profile</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0">
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{user?.fullName}</p>
              <span className="badge badge-active mt-1 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                Active
              </span>
            </div>
          </div>

          {/* Info rows */}
          <div className="mb-5">
            <InfoRow label="Email"  value={user?.email} />
            <InfoRow label="Mobile" value={user?.mobileNumber} />
          </div>

          {/* Referral code */}
          <div className="sub-panel">
            <p className="label mb-3">Your Referral Code</p>
            <div className="flex items-center gap-3 mb-3">
              <code className="code-block flex-1">{user?.referralCode}</code>
              <button onClick={copyCode}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex-shrink-0"
                style={copied
                  ? { background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }
                  : { background: "linear-gradient(to right,#4f46e5,#7c3aed)", color: "#fff", border: "none", cursor: "pointer" }
                }>
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Share this code so others can register under you and you earn referral commissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
