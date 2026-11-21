import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getDashboard, getInvestments, getROIHistory, getReferralIncome, getReferralTree, runROIJob } from "../api";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import EarningsChart from "../components/EarningsChart";
import ReferralTree from "../components/ReferralTree";
import CreateInvestmentModal from "../components/CreateInvestmentModal";
import ProfileModal from "../components/ProfileModal";
import ThemeToggle from "../components/ThemeToggle";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function StatusBadge({ value, activeColor = "emerald" }) {
  const map = {
    Active:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Completed: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    Cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
    Credited:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Pending:   "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Failed:    "bg-red-500/10 text-red-400 border-red-500/30",
  };
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${map[value] || "bg-slate-700 text-slate-300 border-slate-600"}`}>
      {value}
    </span>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [summary, setSummary]           = useState(null);
  const [investments, setInvestments]   = useState([]);
  const [roiHistory, setRoiHistory]     = useState([]);
  const [referralIncome, setReferralIncome] = useState([]);
  const [referralLevels, setReferralLevels] = useState([]);
  const [loading, setLoading] = useState({ summary: true, investments: true, roi: true, referral: true, tree: true });
  const [error, setError]     = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [roiJobLoading, setRoiJobLoading] = useState(false);
  const [roiJobMsg, setRoiJobMsg]         = useState(null);
  const [activeTab, setActiveTab] = useState("investments");

  const setDone = (key) => setLoading((p) => ({ ...p, [key]: false }));

  const fetchAll = useCallback(async () => {
    setLoading({ summary: true, investments: true, roi: true, referral: true, tree: true });
    setError(null);

    const [summaryRes, investRes] = await Promise.allSettled([getDashboard(), getInvestments()]);

    if (summaryRes.status === "fulfilled") setSummary(summaryRes.value.data.data);
    else setError(summaryRes.reason?.response?.data?.message || "Failed to load dashboard summary");
    setDone("summary");

    const invList = investRes.status === "fulfilled" ? (investRes.value.data.data || []) : [];
    if (investRes.status === "rejected") setError((p) => p || investRes.reason?.response?.data?.message || "Failed to load investments");
    setInvestments(invList);
    setDone("investments");

    if (invList.length > 0) {
      const roiResults = await Promise.allSettled(invList.map((inv) => getROIHistory(inv._id)));
      setRoiHistory(roiResults.flatMap((r) => r.status === "fulfilled" ? (r.value.data.data || []) : []));
    } else {
      setRoiHistory([]);
    }
    setDone("roi");

    const [incomeRes, treeRes] = await Promise.allSettled([getReferralIncome(), getReferralTree()]);
    setReferralIncome(incomeRes.status === "fulfilled" ? (incomeRes.value.data.data || []) : []);
    setDone("referral");
    setReferralLevels(treeRes.status === "fulfilled" ? (treeRes.value.data.data?.levels || []) : []);
    setDone("tree");
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRunROIJob = async () => {
    setRoiJobLoading(true);
    setRoiJobMsg(null);
    try {
      await runROIJob();
      setRoiJobMsg({ type: "success", text: "ROI job ran successfully!" });
      fetchAll();
    } catch (err) {
      setRoiJobMsg({ type: "error", text: err.response?.data?.message || "ROI job failed" });
    } finally {
      setRoiJobLoading(false);
      setTimeout(() => setRoiJobMsg(null), 4000);
    }
  };

  const totalCommission = referralIncome.reduce((s, r) => s + r.incomeAmount, 0);
  const chartData = investments.map((inv) => {
    const roi = roiHistory.filter((r) => String(r.investment) === String(inv._id)).reduce((s, r) => s + r.roiAmount, 0);
    return { name: inv.planDetails?.planName || "Plan", ROI: parseFloat(roi.toFixed(2)), Commission: parseFloat(totalCommission.toFixed(2)) };
  });

  const investmentCols = [
    { key: "planDetails",         label: "Plan",       render: (v) => <span className="font-medium" style={{ color: "var(--text-primary)" }}>{v?.planName}</span> },
    { key: "investmentAmount",    label: "Amount",     render: (v) => <span className="font-semibold text-indigo-400">{fmt(v)}</span> },
    { key: "dailyROIPercentage",  label: "Daily ROI",  render: (v) => <span className="text-emerald-400 font-medium">{v}%</span> },
    { key: "startDate",           label: "Start",      render: (v) => fmtDate(v) },
    { key: "endDate",             label: "End",        render: (v) => fmtDate(v) },
    { key: "investmentStatus",    label: "Status",     render: (v) => <StatusBadge value={v} /> },
  ];

  const roiCols = [
    { key: "date",      label: "Date",       render: (v) => fmtDate(v) },
    { key: "roiAmount", label: "ROI Amount", render: (v) => <span className="font-semibold text-emerald-400">{fmt(v)}</span> },
    { key: "status",    label: "Status",     render: (v) => <StatusBadge value={v} /> },
  ];

  const referralCols = [
    { key: "generatedBy",   label: "From User",   render: (v) => <span className="font-medium" style={{ color: "var(--text-primary)" }}>{v?.fullName || "—"}</span> },
    { key: "referralLevel", label: "Level",       render: (v) => (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
        Level {v}
      </span>
    )},
    { key: "incomeAmount",  label: "Commission",  render: (v) => <span className="font-semibold text-cyan-400">{fmt(v)}</span> },
    { key: "date",          label: "Date",        render: (v) => fmtDate(v) },
  ];

  const tabs = [
    { id: "investments", label: "Investments",      count: investments.length },
    { id: "roi",         label: "ROI History",      count: roiHistory.length },
    { id: "referrals",   label: "Referral Income",  count: referralIncome.length },
    { id: "tree",        label: "Referral Tree",    count: null },
  ];

  return (
    <div className="min-h-screen app-page">
      {showModal   && <CreateInvestmentModal onClose={() => setShowModal(false)} onSuccess={fetchAll} />}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}

      {/* Navbar */}
      <nav className="app-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold shadow-lg">₹</div>
            <span className="text-base font-bold hidden sm:block" style={{ color: "var(--text-primary)" }}>InvestPro</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 btn-ghost text-sm">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                {user?.fullName?.[0]?.toUpperCase()}
              </div>
              <span className="hidden sm:block">{user?.fullName?.split(" ")[0]}</span>
            </button>

            <button onClick={() => setShowModal(true)} className="btn-primary text-sm px-4 py-2">
              <span className="hidden sm:inline">+ New Investment</span>
              <span className="sm:hidden">+</span>
            </button>

            <button onClick={handleRunROIJob} disabled={roiJobLoading}
              className="btn-ghost text-xs border-cyan-700/50 text-cyan-400 hover:text-cyan-300 hover:border-cyan-600 px-3 py-2">
              {roiJobLoading ? (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : <span className="hidden sm:inline">▶ Run ROI</span>}
              <span className="sm:hidden">▶</span>
            </button>

            <ThemeToggle />

            <button onClick={logout} className="btn-ghost text-xs px-3 py-2">
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">↩</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 app-page">
        {/* Alerts */}
        {error     && <div className="alert-error  flex items-center gap-2 animate-fade-in">⚠️ {error}</div>}
        {roiJobMsg && <div className={roiJobMsg.type === "success" ? "alert-success" : "alert-error"} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {roiJobMsg.type === "success" ? "✅" : "❌"} {roiJobMsg.text}
        </div>}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Invested"  value={fmt(summary?.totalInvestments)}       icon="💰" color="#6366f1" loading={loading.summary} />
          <StatCard title="ROI Earned"      value={fmt(summary?.totalROIEarned)}          icon="📈" color="#22d3ee" loading={loading.summary} />
          <StatCard title="Level Income"    value={fmt(summary?.totalLevelIncomeEarned)}  icon="🤝" color="#f59e0b" loading={loading.summary} />
          <StatCard title="Wallet Balance"  value={fmt(summary?.walletBalance)}           icon="👛" color="#10b981" loading={loading.summary} />
        </div>

        {/* Chart */}
        {chartData.length > 0 && <EarningsChart data={chartData} />}

        {/* Tabs */}
        <div className="glass-card overflow-hidden">
          <div className="tab-bar flex overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? "tab-btn-active" : ""}`}>
                {tab.label}
                {tab.count !== null && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={activeTab === tab.id
                      ? { background: "rgba(99,102,241,0.15)", color: "#818cf8" }
                      : { background: "var(--bg-input)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-0">
            {activeTab === "investments" && (
              <DataTable title="" columns={investmentCols} data={investments} loading={loading.investments} emptyMsg="No investments yet. Click '+ New Investment' to get started." />
            )}
            {activeTab === "roi" && (
              <DataTable title="" columns={roiCols} data={roiHistory} loading={loading.roi} emptyMsg="No ROI history yet." />
            )}
            {activeTab === "referrals" && (
              <DataTable title="" columns={referralCols} data={referralIncome} loading={loading.referral} emptyMsg="No referral income yet. Share your referral code to start earning." />
            )}
            {activeTab === "tree" && (
              <div className="p-6">
                <ReferralTree levels={referralLevels} loading={loading.tree} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
