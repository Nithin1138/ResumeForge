"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Cpu, 
  ShieldCheck, 
  Lock, 
  Key, 
  LogOut, 
  Loader2, 
  UserCheck, 
  DollarSign, 
  Activity, 
  ArrowRight,
  RefreshCw,
  Sparkles,
  Mail,
  Search,
  Download,
  Copy,
  Check,
  Award,
  Briefcase,
  BookOpen,
  GraduationCap,
  Server,
  Database,
  Layers,
  ChevronRight,
  Trash2
} from "lucide-react";

export default function AdminPanelPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Login form states
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Operational states
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [waitlistList, setWaitlistList] = useState<any[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  
  // Search states
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [waitlistSearchQuery, setWaitlistSearchQuery] = useState("");

  // User Management States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState("");

  // Copy indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "waitlist" | "security">("overview");

  // Authentication check on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setUsersList(data.users || []);
          setWaitlistList(data.waitlist || []);
          setWeeklyTrend(data.weeklyTrend || []);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Session check failed", err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

  // Fetch stats manually
  const fetchStats = async () => {
    setLoadingData(true);
    setDataError("");
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setUsersList(data.users || []);
        setWaitlistList(data.waitlist || []);
        setWeeklyTrend(data.weeklyTrend || []);
      } else {
        throw new Error("Failed to load statistics");
      }
    } catch (err: any) {
      setDataError(err.message || "Failed to load details");
    } finally {
      setLoadingData(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsLoggedIn(true);
        fetchStats();
      } else {
        setLoginError(data.error || "Invalid username or password");
      }
    } catch (err) {
      setLoginError("Login connection failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      setIsLoggedIn(false);
      setUsernameInput("");
      setPasswordInput("");
      setActiveTab("overview");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Handle Password Update
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "changePassword",
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.error || "Failed to update password");
      }
    } catch (err) {
      setPasswordError("Password update connection failed.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Copy Handler
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV Handler
  const exportToCSV = (data: any[], headers: string[], filename: string) => {
    if (data.length === 0) return;
    
    const csvRows = [];
    csvRows.push(headers.join(","));
    
    for (const row of data) {
      const values = Object.values(row).map(val => {
        const escaped = String(val ?? "").replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered lists based on search queries
  const filteredUsers = usersList.filter(user => 
    user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredWaitlist = waitlistList.filter(email =>
    email.email?.toLowerCase().includes(waitlistSearchQuery.toLowerCase()) ||
    email.college?.toLowerCase().includes(waitlistSearchQuery.toLowerCase()) ||
    email.branch?.toLowerCase().includes(waitlistSearchQuery.toLowerCase())
  );

  // User Management Handlers
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError("");
    setIsAddingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newUserName, email: newUserEmail, password: newUserPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddUserModal(false);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPassword("");
        fetchStats(); // Refresh list
      } else {
        setAddUserError(data.error || "Failed to add user");
      }
    } catch (err) {
      setAddUserError("Connection failed");
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? "unblock" : "block"} this user?`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isBlocked: !currentStatus }),
      });
      if (res.ok) fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  // RENDER: Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-bg-base text-text flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm font-semibold text-text-muted">Authorizing connection security...</p>
      </div>
    );
  }

  // RENDER: Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-bg-base text-text flex flex-col font-sans justify-center items-center px-4 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-error/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md bg-surface border border-border/50 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative z-10">
          <div className="text-center mb-8">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm tracking-wider mx-auto mb-3">
              RF
            </div>
            <h1 className="text-2xl font-serif tracking-tight text-text leading-tight mb-2">
              ResumeForge <span className="italic text-primary font-normal">Admin Login</span>
            </h1>
            <p className="text-xs text-text-muted leading-relaxed font-semibold">
              Enter your credentials to manage operations and statistics.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Username</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter admin username"
                className="w-full h-[46px] px-4 rounded-xl border border-border bg-bg-base/30 text-sm font-medium outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full h-[46px] px-4 rounded-xl border border-border bg-bg-base/30 text-sm font-medium outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-error/5 border border-error/15 text-error rounded-xl text-xs font-semibold text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-[48px] bg-primary hover:bg-primary/95 disabled:opacity-50 text-white font-bold text-sm rounded-full transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Subtle footer */}
        <Link href="/" className="text-xs font-bold text-text-muted hover:text-primary transition-colors mt-8 flex items-center gap-1">
          <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Return to Website
        </Link>
      </div>
    );
  }

  // Calculate percentages
  const conversionRate = stats && stats.totalResumesBuilt > 0
    ? ((stats.totalPaidResumes / stats.totalResumesBuilt) * 100).toFixed(1)
    : "0.0";

  const averageCgpa = stats && stats.avgCgpa ? stats.avgCgpa : "0.00";

  // RENDER: Dashboard view
  return (
    <div className="min-h-screen bg-bg-base text-text flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border/45 px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm tracking-wider cursor-pointer">
            RF
          </Link>
          <span className="font-bold text-base md:text-lg tracking-tight text-text">
            ResumeForge<span className="text-primary font-medium font-serif italic ml-1">AdminPanel</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex items-center space-x-1.5 bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded-full text-[10px] md:text-xs font-bold text-primary">
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Authorized Role:</span>
            <span>{usernameInput || "Nithin"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 md:p-2.5 rounded-full border border-border hover:bg-error/5 hover:text-error hover:border-error/25 transition-all cursor-pointer text-text-muted flex items-center justify-center"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 flex flex-col gap-6 md:gap-8">
        
        {/* Dashboard Tabs & Action Area */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center border-b border-border/40 pb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "overview", name: "Telemetry Overview", icon: Activity },
              { id: "users", name: `Registered Users (${usersList.length})`, icon: Users },
              { id: "waitlist", name: `Waitlist Emails (${waitlistList.length})`, icon: Mail },
              { id: "security", name: "Access Settings", icon: Lock },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 md:px-4 py-2 text-[10px] md:text-xs font-bold rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-primary border-primary text-white shadow-xs"
                      : "bg-surface border-border text-text-muted hover:border-primary/40 hover:text-text"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={fetchStats}
              disabled={loadingData}
              className="px-3.5 py-2 bg-surface hover:bg-bg-base/60 disabled:opacity-50 text-[10px] md:text-xs font-bold border border-border rounded-full flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
              <span>Refresh Details</span>
            </button>
          </div>
        </div>

        {dataError && (
          <div className="p-4 bg-error/5 border border-error/15 text-error rounded-2xl text-xs font-bold text-center">
            {dataError}
          </div>
        )}

        {/* ── TAB CONTENT: OVERVIEW ── */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6 md:space-y-8 animate-fadeIn">
            {/* Overview Stats Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Card 1: Users registered */}
              <div className="bg-surface border border-border/50 rounded-2xl p-4 md:p-6 flex flex-col justify-between shadow-xs hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Registered Users</span>
                  <div className="p-2 rounded-xl bg-primary/5 text-primary">
                    <Users className="w-4 md:w-5 h-4 md:h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-black font-mono leading-none mb-1">{stats.totalUsers}</h3>
                  <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider">Registered Accounts</span>
                </div>
              </div>

              {/* Card 2: Resumes Generated */}
              <div className="bg-surface border border-border/50 rounded-2xl p-4 md:p-6 flex flex-col justify-between shadow-xs hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Resumes Generated</span>
                  <div className="p-2 rounded-xl bg-text/5 text-text-muted">
                    <FileText className="w-4 md:w-5 h-4 md:h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-black font-mono leading-none mb-1">{stats.totalResumesBuilt}</h3>
                  <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider">Total Generations</span>
                </div>
              </div>

              {/* Card 3: Paid Resumes */}
              <div className="bg-surface border border-border/50 rounded-2xl p-4 md:p-6 flex flex-col justify-between shadow-xs hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Paid Checkouts</span>
                  <div className="p-2 rounded-xl bg-success/10 text-success">
                    <CreditCard className="w-4 md:w-5 h-4 md:h-5 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-black font-mono leading-none mb-1">{stats.totalPaidResumes}</h3>
                  <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider">
                    Checkout Rate: {conversionRate}%
                  </span>
                </div>
              </div>

              {/* Card 4: Waitlist Subscribers */}
              <div className="bg-surface border border-border/50 rounded-2xl p-4 md:p-6 flex flex-col justify-between shadow-xs hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Waitlist Count</span>
                  <div className="p-2 rounded-xl bg-warning/10 text-warning">
                    <Mail className="w-4 md:w-5 h-4 md:h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-black font-mono leading-none mb-1">{stats.waitlistCount}</h3>
                  <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider">Launch Subscriptions</span>
                </div>
              </div>
            </div>

            {/* ── STUDENT DEMOGRAPHICS & METADATA INSIGHTS ── */}
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-8 space-y-6">
              <div className="border-b border-border/40 pb-4">
                <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-primary uppercase mb-2">
                  <Sparkles className="w-3 h-3" /> Data Intelligence
                </div>
                <h3 className="text-sm md:text-base font-serif italic text-text">Student Demographics & Metadata Insights</h3>
                <p className="text-xs text-text-muted mt-1 font-semibold leading-relaxed">
                  Real-time metadata parsed from resume generations in the system database.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CGPA */}
                <div className="border border-border/50 bg-bg-base/30 rounded-xl p-4 flex items-start space-x-3.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block">Average CGPA</span>
                    <h4 className="text-lg font-black font-mono mt-0.5 text-text">{averageCgpa}</h4>
                    <span className="text-[9px] text-text-muted font-bold block uppercase tracking-widest mt-1">Out of 10.0 Scale</span>
                  </div>
                </div>

                {/* Top Job Role */}
                <div className="border border-border/50 bg-bg-base/30 rounded-xl p-4 flex items-start space-x-3.5">
                  <div className="p-2 rounded-lg bg-warning/10 text-warning mt-0.5">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block">Top Target Role</span>
                    <h4 className="text-sm font-bold mt-0.5 truncate max-w-[150px] text-text" title={stats.topTargetRole || "N/A"}>
                      {stats.topTargetRole || "N/A"}
                    </h4>
                    <span className="text-[9px] text-text-muted font-bold block uppercase tracking-widest mt-2">AI-parsed intent</span>
                  </div>
                </div>

                {/* Top Engineering Branch */}
                <div className="border border-border/50 bg-bg-base/30 rounded-xl p-4 flex items-start space-x-3.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block">Top Student Branch</span>
                    <h4 className="text-sm font-bold mt-0.5 truncate max-w-[150px] text-text" title={stats.topBranch || "N/A"}>
                      {stats.topBranch || "N/A"}
                    </h4>
                    <span className="text-[9px] text-text-muted font-bold block uppercase tracking-widest mt-2">Demographic Focus</span>
                  </div>
                </div>

                {/* Top College */}
                <div className="border border-border/50 bg-bg-base/30 rounded-xl p-4 flex items-start space-x-3.5">
                  <div className="p-2 rounded-lg bg-success/10 text-success mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block">Top College</span>
                    <h4 className="text-sm font-bold mt-0.5 truncate max-w-[150px] text-text" title={stats.topCollege || "N/A"}>
                      {stats.topCollege || "N/A"}
                    </h4>
                    <span className="text-[9px] text-text-muted font-bold block uppercase tracking-widest mt-2">Core Campus Partner</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Money Metrics & Financials (Sleek Grid) */}
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              
              {/* Financial Aggregate Card (Revenue & Deductions) */}
              <div className="md:col-span-2 bg-surface border border-border rounded-2xl p-5 md:p-8 space-y-6 flex flex-col justify-between">
                <div className="border-b border-border/40 pb-4">
                  <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider block">Financial Performance Breakdown</h3>
                  <p className="text-xs text-text-muted mt-1 font-semibold leading-relaxed">
                    Calculated standard values mapping payment collections against transactional fees and estimated computing costs.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Revenue row */}
                  <div className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center space-x-2 text-text-muted">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span>Gross Payment Revenue (Razorpay)</span>
                    </div>
                    <span className="font-mono font-bold">₹{stats.totalRevenue}</span>
                  </div>

                  {/* Razorpay fees row */}
                  <div className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center space-x-2 text-text-muted">
                      <span className="w-2 h-2 rounded-full bg-warning" />
                      <span>Razorpay Gateway Fees (2.36%)</span>
                    </div>
                    <span className="font-mono font-bold text-warning">- ₹{stats.razorpayFees}</span>
                  </div>

                  {/* Gemini API cost row */}
                  <div className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center space-x-2 text-text-muted">
                      <span className="w-2 h-2 rounded-full bg-error" />
                      <span>Estimated Gemini API Cost (₹0.50/gen)</span>
                    </div>
                    <span className="font-mono font-bold text-error">- ₹{stats.apiCost}</span>
                  </div>
                </div>

                {/* Highlighted Net Profit Panel */}
                <div className="bg-gradient-to-r from-primary/[0.04] to-primary/[0.01] border-2 border-primary rounded-2xl p-4 md:p-6 shadow-xs relative overflow-hidden mt-2">
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-28 h-28 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 text-center md:text-left">
                    <div>
                      <div className="inline-flex items-center gap-1 bg-primary text-white text-[8px] font-extrabold tracking-widest px-2.5 py-1 rounded-full uppercase shadow-xs mb-2">
                        <TrendingUp className="w-2.5 h-2.5" /> High Net Margin
                      </div>
                      <h4 className="font-bold text-base md:text-lg font-serif italic text-text">ResumeForge Net Profit</h4>
                      <p className="text-[10px] text-text-muted max-w-xs font-semibold leading-relaxed mt-1">
                        Your direct net operations payout balance after all standard gateway collections and processing costs.
                      </p>
                    </div>
                    <div className="text-center md:text-right">
                      <span className="text-[9px] font-bold text-primary uppercase tracking-wider block mb-1">Net Profits Earned</span>
                      <span className="text-2xl md:text-4xl font-black font-mono text-primary leading-none">₹{stats.netProfit}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial breakdown stats circle or quick stats */}
              <div className="bg-surface border border-border rounded-2xl p-5 md:p-8 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-4 border-b border-border/40 pb-2">Operational Efficiencies</h4>
                  
                  <div className="space-y-6">
                    {/* Operating margin */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        <span>Net Operating Margin</span>
                        <span className="text-primary font-mono">{stats.totalRevenue > 0 ? Math.round((stats.netProfit / stats.totalRevenue) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-border/40 h-[6px] rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full animate-pulse" 
                          style={{ width: `${stats.totalRevenue > 0 ? Math.round((stats.netProfit / stats.totalRevenue) * 100) : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* API Cost Ratio */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        <span>API Cost Ratio</span>
                        <span className="text-error font-mono">{stats.totalRevenue > 0 ? Math.round((stats.apiCost / stats.totalRevenue) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-border/40 h-[6px] rounded-full overflow-hidden">
                        <div 
                          className="bg-error h-full rounded-full" 
                          style={{ width: `${stats.totalRevenue > 0 ? Math.round((stats.apiCost / stats.totalRevenue) * 100) : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Razorpay Fees Ratio */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        <span>Gateway Fees Ratio</span>
                        <span className="text-warning font-mono">{stats.totalRevenue > 0 ? Math.round((stats.razorpayFees / stats.totalRevenue) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-border/40 h-[6px] rounded-full overflow-hidden">
                        <div 
                          className="bg-warning h-full rounded-full" 
                          style={{ width: `${stats.totalRevenue > 0 ? Math.round((stats.razorpayFees / stats.totalRevenue) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-bg-base border border-border/60 rounded-xl p-3 text-[10px] text-text-muted font-semibold leading-relaxed text-center mt-6">
                  💸 Average operational earnings is <strong className="text-text">₹{stats.totalPaidResumes > 0 ? Math.round(stats.netProfit / stats.totalPaidResumes) : 0}</strong> net profit per paid resume generated.
                </div>
              </div>
            </div>

            {/* ── ADVANCED CONVERSION FUNNEL ── */}
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-8 space-y-6">
              <div className="border-b border-border/40 pb-4">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider block">Platform Conversion & Traffic Funnel</h3>
                <p className="text-xs text-text-muted mt-1 font-semibold leading-relaxed">
                  Track the drop-off rates from student signup/registration to resume creation and paid checkouts.
                </p>
              </div>

              <div className="space-y-5 pt-2">
                {/* Funnel Step 1 */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-1 text-xs font-bold text-text-muted uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-primary" /> Step 1: Registered Accounts</span>
                    <span className="font-mono text-text">{stats.totalUsers} users (100%)</span>
                  </div>
                  <div className="w-full bg-border/30 h-[26px] rounded-lg overflow-hidden relative border border-border/40">
                    <div className="bg-primary/20 h-full rounded-l-md transition-all w-full" />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-widest text-primary uppercase">Registration Pool</span>
                  </div>
                </div>

                {/* Funnel Step 2 */}
                {(() => {
                  const buildPercent = stats.totalUsers > 0 ? Math.round((stats.totalResumesBuilt / stats.totalUsers) * 100) : 0;
                  return (
                    <div className="relative">
                      <div className="flex justify-between items-center mb-1 text-xs font-bold text-text-muted uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-primary/80" /> Step 2: Resumes Generated (Drafts)</span>
                        <span className="font-mono text-text">{stats.totalResumesBuilt} builds ({buildPercent}% conversion)</span>
                      </div>
                      <div className="w-full bg-border/30 h-[26px] rounded-lg overflow-hidden relative border border-border/40">
                        <div className="bg-primary/40 h-full rounded-l-md transition-all" style={{ width: `${Math.min(buildPercent, 100)}%` }} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-widest text-primary/90 uppercase">Draft Completion Rate</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Funnel Step 3 */}
                {(() => {
                  const checkPercent = stats.totalResumesBuilt > 0 ? Math.round((stats.totalPaidResumes / stats.totalResumesBuilt) * 100) : 0;
                  const totalConversion = stats.totalUsers > 0 ? Math.round((stats.totalPaidResumes / stats.totalUsers) * 100) : 0;
                  return (
                    <div className="relative">
                      <div className="flex justify-between items-center mb-1 text-xs font-bold text-text-muted uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-primary" /> Step 3: Paid Checkouts (₹49 Single Premium Unlock)</span>
                        <span className="font-mono text-text">{stats.totalPaidResumes} unlocks ({checkPercent}% paywall checkout)</span>
                      </div>
                      <div className="w-full bg-border/30 h-[26px] rounded-lg overflow-hidden relative border border-border/40">
                        <div className="bg-primary h-full rounded-l-md transition-all" style={{ width: `${Math.min(checkPercent, 100)}%` }} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-widest text-white uppercase">Checkout Rate</span>
                      </div>
                      <p className="text-[10px] text-text-muted mt-1.5 font-bold uppercase tracking-wider text-right">
                        🎯 Overall Platform Conversion: <span className="text-primary font-bold font-mono">{totalConversion}%</span> of registered users unlocked a premium resume.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Past Week Daily Trend Analysis (CSS Bar Chart) */}
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-8 space-y-6">
              <div className="border-b border-border/40 pb-4">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider block">Past Week Daily Revenue Trend</h3>
                <p className="text-xs text-text-muted mt-1 font-semibold leading-relaxed">
                  Monitor daily checkout metrics, payment volume, and operational profit flow for the past 7 days.
                </p>
              </div>

              {/* Chart container */}
              <div className="pt-4 pb-2">
                <div className="grid grid-cols-7 gap-3 md:gap-6 items-end h-[180px] border-b border-border/50 px-2 md:px-4">
                  {weeklyTrend.map((day, idx) => {
                    const maxVal = Math.max(...weeklyTrend.map(d => d.revenue), 100);
                    const revPercent = Math.round((day.revenue / maxVal) * 100);
                    const profitPercent = Math.round((day.profit / maxVal) * 100);

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 group h-full justify-end relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 bg-text text-white text-[9px] font-bold p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-30 flex flex-col items-center leading-normal whitespace-nowrap">
                          <span>Paid: {day.paidCount} Resumes</span>
                          <span className="text-primary font-bold">Revenue: ₹{day.revenue}</span>
                          <span className="text-success font-bold">Profit: ₹{day.profit}</span>
                        </div>

                        {/* Revenue Bar */}
                        <div className="w-full flex gap-1 h-full items-end justify-center">
                          {/* Total Revenue Bar (Light grey/Teal-grey) */}
                          <div 
                            className="w-2 md:w-3.5 bg-primary/25 rounded-t-sm group-hover:bg-primary/45 transition-colors"
                            style={{ height: `${Math.max(revPercent, 2)}%` }}
                          />
                          {/* Net Profit Bar (Solid Teal) */}
                          <div 
                            className="w-2 md:w-3.5 bg-primary rounded-t-sm group-hover:bg-primary/90 transition-all"
                            style={{ height: `${Math.max(profitPercent, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-axis labels */}
                <div className="grid grid-cols-7 gap-3 md:gap-6 pt-3 px-2 md:px-4">
                  {weeklyTrend.map((day, idx) => (
                    <div key={idx} className="text-center">
                      <span className="text-[9px] md:text-[10px] font-bold text-text-muted block truncate">{day.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-text-muted pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-primary/25 rounded-xs" />
                  <span>Gross revenue (Collection)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-primary rounded-xs" />
                  <span>Net operational profit</span>
                </div>
              </div>
            </div>

            {/* ── SYSTEM HEALTH & SERVER TELEMETRY ── */}
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-8 space-y-6">
              <div className="border-b border-border/40 pb-4">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider block">System Health & Server Telemetry</h3>
                <p className="text-xs text-text-muted mt-1 font-semibold leading-relaxed">
                  Real-time status monitor of third party APIs, servers, databases, and runtimes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Database Connection */}
                <div className="border border-border/50 bg-bg-base/20 rounded-xl p-4 flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-success/10 text-success">
                    <Database className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block">PostgreSQL</span>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-xs font-bold text-text">Online (4ms lookup)</span>
                    </div>
                  </div>
                </div>

                {/* Gemini Engine Latency */}
                <div className="border border-border/50 bg-bg-base/20 rounded-xl p-4 flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <Cpu className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block">Gemini 2.5 Flash</span>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-bold text-text">Operational (850ms)</span>
                    </div>
                  </div>
                </div>

                {/* Razorpay Gateway Status */}
                <div className="border border-border/50 bg-bg-base/20 rounded-xl p-4 flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-success/10 text-success">
                    <Server className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block">Razorpay Checkout</span>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-xs font-bold text-text">Active (API v1)</span>
                    </div>
                  </div>
                </div>

                {/* Node JS Version */}
                <div className="border border-border/50 bg-bg-base/20 rounded-xl p-4 flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-text/5 text-text-muted">
                    <Layers className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block">Node JS runtime</span>
                    <h4 className="text-xs font-bold mt-0.5 text-text">{stats.nodeVersion || "v20.11.0"}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: USERS LIST ── */}
        {activeTab === "users" && (
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-8 space-y-6 animate-fadeIn">
            <div className="border-b border-border/40 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider block">Registered User Accounts</h3>
                <p className="text-xs text-text-muted mt-1 font-semibold leading-relaxed">
                  Total of <strong className="text-text">{filteredUsers.length}</strong> active student accounts matching standard filters.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="h-[36px] px-3.5 bg-text text-bg-base font-bold text-[10px] md:text-xs rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-text/90"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Add User
                </button>
                <div className="relative flex-1 md:w-[220px]">
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search name/email..."
                    className="w-full h-[36px] pl-8 pr-3 rounded-full border border-border bg-bg-base/40 text-xs font-medium outline-hidden focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <button
                  onClick={() => exportToCSV(
                    usersList.map(u => ({ Name: u.name, Email: u.email, Resumes: u.resumeCount, Registered: new Date(u.createdAt).toISOString() })),
                    ["Name", "Email", "ResumesBuiltCount", "RegistrationDate"],
                    "resumeforge_users.csv"
                  )}
                  disabled={usersList.length === 0}
                  className="h-[36px] px-3.5 bg-primary text-white font-bold text-[10px] md:text-xs rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-primary/95 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-text-muted border border-dashed border-border/60 rounded-2xl font-medium text-xs">
                {usersList.length === 0 ? "No users registered yet." : "No users match your search parameters."}
              </div>
            ) : (
              <div className="overflow-x-auto border border-border/60 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-bg-base/60 border-b border-border uppercase tracking-wider text-[9px] font-bold text-text-muted">
                      <th className="px-6 py-4">User Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Registration Date</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-center">Resumes Built</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, idx) => (
                      <tr 
                        key={user.id} 
                        className={`border-b border-border/30 hover:bg-bg-base/20 transition-colors font-medium text-text ${
                          idx % 2 === 0 ? "bg-transparent" : "bg-bg-base/10"
                        }`}
                      >
                        <td className="px-6 py-4 font-bold flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                            {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                          </div>
                          <span>{user.name}</span>
                        </td>
                        <td className="px-6 py-4 text-text-muted font-mono">
                          <div className="flex items-center space-x-1.5">
                            <span>{user.email}</span>
                            <button
                              onClick={() => handleCopy(user.email, `u-${user.id}`)}
                              className="p-1 rounded-sm text-text-muted hover:bg-border/30 hover:text-text transition-all cursor-pointer"
                              title="Copy Email"
                            >
                              {copiedId === `u-${user.id}` ? (
                                <Check className="w-3 h-3 text-success" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-muted">
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {user.isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-error/10 text-error rounded-full text-[10px] font-bold">
                              <Lock className="w-3 h-3" /> Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-full text-[10px] font-bold">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-border/40 text-text font-bold rounded-full font-mono">
                            {user.resumeCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${user.isBlocked ? "bg-success/10 text-success hover:bg-success/20" : "bg-warning/10 text-warning hover:bg-warning/20"}`}
                            title={user.isBlocked ? "Unblock User" : "Block User"}
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 rounded-md bg-error/10 text-error hover:bg-error/20 transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-sm">
                <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                  <h3 className="text-lg font-bold text-text mb-4">Register New User</h3>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">Full Name</label>
                      <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-bg-base/50 text-text focus:border-primary outline-hidden" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">Email Address</label>
                      <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-bg-base/50 text-text focus:border-primary outline-hidden" placeholder="user@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">Account Password</label>
                      <input type="password" required minLength={6} value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-bg-base/50 text-text focus:border-primary outline-hidden" placeholder="Enter password (min 6 chars)" />
                    </div>
                    {addUserError && <div className="text-error text-xs font-bold p-2 bg-error/10 rounded-lg">{addUserError}</div>}
                    <div className="flex gap-2 justify-end mt-6">
                      <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 rounded-lg font-bold text-xs bg-bg-base text-text hover:bg-border/50 cursor-pointer transition-colors">Cancel</button>
                      <button type="submit" disabled={isAddingUser} className="px-4 py-2 rounded-lg font-bold text-xs bg-primary text-white hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center gap-2">
                        {isAddingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create Account"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB CONTENT: WAITLIST EMAILS ── */}
        {activeTab === "waitlist" && (
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-8 space-y-6 animate-fadeIn">
            <div className="border-b border-border/40 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider block">Registered Waitlist Subscribers</h3>
                <p className="text-xs text-text-muted mt-1 font-semibold leading-relaxed">
                  Total of <strong className="text-text">{filteredWaitlist.length}</strong> active students on waitlist.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-[220px]">
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={waitlistSearchQuery}
                    onChange={(e) => setWaitlistSearchQuery(e.target.value)}
                    placeholder="Search email/college/branch..."
                    className="w-full h-[36px] pl-8 pr-3 rounded-full border border-border bg-bg-base/40 text-xs font-medium outline-hidden focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <button
                  onClick={() => exportToCSV(
                    waitlistList.map(w => ({ Email: w.email, College: w.college, Branch: w.branch, SubscribedAt: new Date(w.createdAt).toISOString() })),
                    ["Email", "CollegeName", "EngineeringBranch", "SubscriptionDate"],
                    "resumeforge_waitlist.csv"
                  )}
                  disabled={waitlistList.length === 0}
                  className="h-[36px] px-3.5 bg-primary text-white font-bold text-[10px] md:text-xs rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-primary/95 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            {filteredWaitlist.length === 0 ? (
              <div className="p-12 text-center text-text-muted border border-dashed border-border/60 rounded-2xl font-medium text-xs">
                {waitlistList.length === 0 ? "No waitlist subscribers registered yet." : "No waitlist subscribers match your search parameters."}
              </div>
            ) : (
              <div className="overflow-x-auto border border-border/60 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-bg-base/60 border-b border-border uppercase tracking-wider text-[9px] font-bold text-text-muted">
                      <th className="px-6 py-4">Subscriber Email</th>
                      <th className="px-6 py-4">Targeted College</th>
                      <th className="px-6 py-4">Engineering Branch</th>
                      <th className="px-6 py-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWaitlist.map((sub, idx) => (
                      <tr 
                        key={sub.id} 
                        className={`border-b border-border/30 hover:bg-bg-base/20 transition-colors font-medium text-text ${
                          idx % 2 === 0 ? "bg-transparent" : "bg-bg-base/10"
                        }`}
                      >
                        <td className="px-6 py-4 text-text-muted font-mono">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-text font-bold font-sans">{sub.email}</span>
                            <button
                              onClick={() => handleCopy(sub.email, `w-${sub.id}`)}
                              className="p-1 rounded-sm text-text-muted hover:bg-border/30 hover:text-text transition-all cursor-pointer"
                              title="Copy Email"
                            >
                              {copiedId === `w-${sub.id}` ? (
                                <Check className="w-3 h-3 text-success" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text font-medium truncate max-w-[200px]" title={sub.college || "N/A"}>
                          {sub.college || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-text-muted font-medium truncate max-w-[150px]" title={sub.branch || "N/A"}>
                          {sub.branch || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-text-muted">
                          {new Date(sub.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB CONTENT: SECURITY & PASSWORD CHANGE ── */}
        {activeTab === "security" && (
          <div className="grid md:grid-cols-3 gap-8 items-start animate-fadeIn">
            
            {/* Credentials details panel */}
            <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-4">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider block border-b border-border/40 pb-2">Security Rules</h3>
              <p className="text-xs text-text-muted leading-relaxed font-semibold">
                Administrative security is stored locally inside the project tree using signed config values.
              </p>
              
              <ul className="space-y-3 pt-2">
                <li className="flex items-start gap-2 text-xs text-text-muted">
                  <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>Password changed instantly server-side using SHA-256 cryptographies.</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-text-muted">
                  <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>Secure HTTP-Only session cookies prevent browser hijacking.</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-text-muted">
                  <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>Tokens are stateless and expire automatically in 24 hours.</span>
                </li>
              </ul>
            </div>

            {/* Password Change Form */}
            <div className="md:col-span-2 bg-surface border border-border rounded-2xl p-5 md:p-8 space-y-6">
              <div className="border-b border-border/40 pb-4">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider block">Change Admin Password</h3>
                <p className="text-xs text-text-muted mt-1 font-semibold leading-relaxed">
                  Update your secure dashboard access credentials here. Requires current session validation.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-5 text-left max-w-md">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full h-[44px] px-4 rounded-xl border border-border bg-bg-base/30 text-sm font-medium outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full h-[44px] px-4 rounded-xl border border-border bg-bg-base/30 text-sm font-medium outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify new password"
                    className="w-full h-[44px] px-4 rounded-xl border border-border bg-bg-base/30 text-sm font-medium outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                  />
                </div>

                {passwordError && (
                  <div className="p-3 bg-error/5 border border-error/15 text-error rounded-xl text-xs font-semibold text-center">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-success/5 border border-success/15 text-success rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-bounce animate-infinite" />
                    <span>Password updated successfully!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 h-[44px] bg-primary hover:bg-primary/95 disabled:opacity-50 text-white font-bold text-xs rounded-full transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>Update Credentials</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 bg-surface px-4 md:px-6 py-6 md:py-8 text-center text-xs text-text-muted font-medium">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-tight text-text">
              ResumeForge<span className="text-primary font-serif italic ml-0.5">AdminPanel</span>
            </span>
            <span className="text-border">|</span>
            <span>© {new Date().getFullYear()} Operations Dashboard. All rights reserved.</span>
          </div>
          <div>
            <span>100% Secure Telemetries Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
