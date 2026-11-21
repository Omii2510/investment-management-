const LEVEL_BADGE_STYLES = [
  { badge: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", dot: "bg-indigo-500", gradient: "from-indigo-500 to-violet-600" },
  { badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",       dot: "bg-cyan-500",   gradient: "from-cyan-400 to-sky-500" },
  { badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",    dot: "bg-amber-500",  gradient: "from-amber-400 to-orange-500" },
  { badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500", gradient: "from-emerald-400 to-teal-500" },
];

function UserNode({ user, levelIndex }) {
  const style = LEVEL_BADGE_STYLES[levelIndex % LEVEL_BADGE_STYLES.length];
  const isActive = user.accountStatus === "Active";
  return (
    <div className="flex items-center gap-3 rounded-xl p-3 min-w-[200px] transition-all duration-200"
      style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
        {user.fullName?.[0]?.toUpperCase() || "U"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{user.fullName}</p>
        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user.referralCode}</p>
      </div>
      <span className={`badge flex-shrink-0 ${isActive ? "badge-green" : "badge-red"}`}>
        {user.accountStatus}
      </span>
    </div>
  );
}

export default function ReferralTree({ levels, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-40 shimmer" />
        {[...Array(2)].map((_, i) => (
          <div key={i}>
            <div className="h-6 w-24 shimmer rounded-full mb-3" />
            <div className="flex gap-3 flex-wrap">
              {[...Array(3)].map((_, j) => <div key={j} className="h-16 w-52 shimmer" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!levels || levels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12" style={{ color: "var(--text-muted)" }}>
        <div className="text-4xl mb-3 opacity-40">🌱</div>
        <p className="text-sm">No referrals yet. Share your referral code to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Referral Hierarchy</h3>
        <span className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "var(--text-muted)", background: "var(--bg-input)", border: "1px solid var(--border)" }}>
          {levels.reduce((s, l) => s + l.totalUsers, 0)} total referrals
        </span>
      </div>
      {levels.map((lvl, idx) => {
        const style = LEVEL_BADGE_STYLES[idx % LEVEL_BADGE_STYLES.length];
        return (
          <div key={lvl.level}>
            <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border mb-3 ${style.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              Level {lvl.level} — {lvl.totalUsers} user{lvl.totalUsers !== 1 ? "s" : ""}
            </div>
            <div className="flex flex-wrap gap-3">
              {lvl.users.map((u) => <UserNode key={u._id} user={u} levelIndex={idx} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
