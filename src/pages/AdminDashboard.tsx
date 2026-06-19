// @ts-nocheck


import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Users,
  Car,
  Wrench,
  FolderOpen,
  FileText,
  Check,
  X,
  LogOut,
  Clock,
  Search,
  Lock,
  MapPin,
  User,
  Calendar,
  Eye,
  MessageSquare,
  RefreshCw,
  Phone,
  Sun,
  Moon,
} from "lucide-react";

const ADMIN_SUPABASE_URL = "https://weihzfwybxeondsrjubs.supabase.co";
const ADMIN_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ViaLNQQH5wY1Vo796zprfg_9cB8PHpT";

const supabase = createClient(ADMIN_SUPABASE_URL, ADMIN_SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storageKey: "myauto-admin-weihzfwybxeondsrjubs-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

type SessionUser = {
  id: string;
  phone?: string;
  email?: string;
};

export default function AdminDashboard() {
  // Authentication states
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login form states
  const [phoneNumber, setPhoneNumber] = useState("+77772373000");
  const [otpToken, setOtpToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Tab Navigation state
  const [activeTab, setActiveTab] = useState<"dashboard" | "moderation" | "clients" | "partners" | "orders" | "sos" | "audit">("dashboard");

  // Database Data states
  const [stats, setStats] = useState({
    clients: 0,
    partners: 0,
    pending: 0,
    sos: 0,
  });
  const [partners, setPartners] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal / Detail states
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [selectedSuperChat, setSelectedSuperChat] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const savedTheme = localStorage.getItem("admin_theme") as "dark" | "light" | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("admin_theme", newTheme);
  };

  const handleSelectClient = async (client: any) => {
    setSelectedClient(client);
    try {
      const { data, error } = await supabase
        .from("super_chat_archives")
        .select("*")
        .eq("user_id", client.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        const mappedData = data.map((chat: any) => ({
          ...chat,
          title: chat.title || chat.session_title || "Диалог с AI",
          saved_at: chat.saved_at || chat.created_at || new Date().toISOString(),
        }));
        setSelectedClient((prev: any) => prev ? { ...prev, super_chat_archives: mappedData } : null);
      }
    } catch (e) {
      console.error("Failed to load chat archives for client:", e);
    }
  };

  // 1. Session and Auth Check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSessionUser({
          id: session.user.id,
          phone: session.user.phone,
          email: session.user.email,
        });
        checkSuperAdminStatus(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSessionUser({
          id: session.user.id,
          phone: session.user.phone,
          email: session.user.email,
        });
        checkSuperAdminStatus(session.user.id);
      } else {
        setSessionUser(null);
        setIsSuperAdmin(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSuperAdminStatus = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("super_admins")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (error) throw error;
      setIsSuperAdmin(!!data);
    } catch (e) {
      console.error("Super Admin check error:", e);
      setIsSuperAdmin(false);
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Fetch Data functions
  const fetchDashboardStats = async () => {
    try {
      const [
        { count: clientsCount },
        { count: partnersCount },
        { count: pendingCount },
        { count: sosCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("pro_profiles").select("*", { count: "exact", head: true }).eq("role", "partner"),
        supabase.from("pro_profiles").select("*", { count: "exact", head: true }).eq("moderation_status", "in_review"),
        supabase.from("help_requests").select("*", { count: "exact", head: true }).eq("status", "active"),
      ]);

      setStats({
        clients: clientsCount || 0,
        partners: partnersCount || 0,
        pending: pendingCount || 0,
        sos: sosCount || 0,
      });
    } catch (e) {
      console.error("Failed to load dashboard stats:", e);
    }
  };

  const fetchTabRecords = useCallback(async () => {
    if (!isSuperAdmin) return;
    setDataLoading(true);
    try {
      if (activeTab === "dashboard") {
        await fetchDashboardStats();
      } else if (activeTab === "moderation" || activeTab === "partners") {
        const { data } = await supabase
          .from("pro_profiles")
          .select("*")
          .order("created_at", { ascending: false });
        setPartners(data || []);
      } else if (activeTab === "clients") {
        const { data } = await supabase
          .from("profiles")
          .select("*, user_vehicles(*)")
          .order("created_at", { ascending: false });
        setClients(data || []);
      } else if (activeTab === "orders") {
        const { data } = await supabase
          .from("pro_market_orders")
          .select("*, profiles(first_name, last_name, phone_number), pro_profiles(business_name), order_offers(*)")
          .order("created_at", { ascending: false });
        setOrders(data || []);
      } else if (activeTab === "sos") {
        const { data } = await supabase
          .from("help_requests")
          .select("*, profiles!help_requests_user_id_fkey(first_name, last_name, phone_number)")
          .order("created_at", { ascending: false });
        setHelpRequests(data || []);
      } else if (activeTab === "audit") {
        const { data } = await supabase
          .from("admin_activity_logs")
          .select("*")
          .order("created_at", { ascending: false });
        setAuditLogs(data || []);
      }
    } catch (e) {
      console.error(`Error loading records for ${activeTab}:`, e);
    } finally {
      setDataLoading(false);
    }
  }, [activeTab, isSuperAdmin]);

  useEffect(() => {
    fetchTabRecords();
  }, [activeTab, fetchTabRecords]);

  // 3. Auth Actions
  const normalizePhoneE164 = (phone: string): string => {
    const d = phone.replace(/\D/g, "");
    if (d.length === 11 && d.startsWith("7")) return `+${d}`;
    if (d.length === 11 && d.startsWith("8")) return `+7${d.slice(1)}`;
    return phone.startsWith("+") ? phone.replace(/\s/g, "") : `+${d}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);
    try {
      const cleanPhone = normalizePhoneE164(phoneNumber);
      const { data, error } = await supabase.functions.invoke("send-otp-whatsapp", {
        body: { phone: cleanPhone, language: "ru" },
      });
      if (error) throw error;
      if (!data || !data.success) {
        throw new Error(data?.error || "Ошибка отправки OTP-кода.");
      }
      setOtpSent(true);
    } catch (err: any) {
      setAuthError(err.message || "Ошибка отправки OTP-кода.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);
    try {
      const cleanPhone = normalizePhoneE164(phoneNumber);
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: {
          phone: cleanPhone,
          phone_number: cleanPhone,
          code: otpToken.trim(),
        },
      });
      if (error) throw error;
      if (!data || !data.success || !data.session) {
        throw new Error(data?.error || "Неверный код верификации.");
      }
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      if (sessionError) throw sessionError;
    } catch (err: any) {
      setAuthError(err.message || "Неверный код верификации.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // 4. Moderation Action (Approve / Reject)
  const handleUpdateModerationStatus = async (partnerId: string, status: "approved" | "rejected") => {
    setActionSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("update_partner_moderation_status", {
        p_partner_id: partnerId,
        p_new_status: status,
      });

      if (error) throw error;

      setPartners((prev) =>
        prev.map((p) => (p.id === partnerId ? { ...p, moderation_status: status } : p))
      );
      setSelectedPartner(null);
      setShowRejectionInput(false);
      setRejectionReason("");
      fetchTabRecords();
    } catch (err: any) {
      alert("Ошибка модерации: " + err.message);
    } finally {
      setActionSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm text-zinc-400">Авторизация...</p>
        </div>
      </div>
    );
  }

  if (sessionUser && isSuperAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 p-6">
        <div className="max-w-md w-full rounded-2xl border border-red-900/30 bg-zinc-900/40 p-8 text-center backdrop-blur-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Доступ ограничен</h1>
          <p className="text-sm text-zinc-400 mb-6">
            Этот аккаунт ({sessionUser.phone || sessionUser.email}) не зарегистрирован как суперадминистратор.
          </p>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-red-600 hover:bg-red-700 py-3 text-sm font-semibold transition"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 p-6">
        <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-md">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <Lock className="h-6 w-6 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">myAuto SuperAdmin</h1>
            <p className="text-sm text-zinc-400 mt-2">Панель управления платформой</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded-xl border border-red-900/30 bg-red-500/10 text-xs text-red-400">
              {authError}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Номер телефона (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+77772373000"
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3.5 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/40 py-3.5 text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                {authSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                Получить OTP код
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Одноразовый код (OTP)
                </label>
                <input
                  type="text"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3.5 px-4 text-center text-lg font-bold tracking-wider text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/40 py-3.5 text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                {authSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                Войти в систему
              </button>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition mt-2"
              >
                Изменить номер телефона
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col">
        <div className="p-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold">
              A
            </div>
            <div>
              <h2 className="text-sm font-bold leading-none">myAuto</h2>
              <span className="text-xs text-zinc-500">Super Admin Console</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "dashboard" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <Activity className="h-4 w-4" />
            Дашборд
          </button>
          <button
            onClick={() => setActiveTab("moderation")}
            className={`flex items-center justify-between w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "moderation" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4" />
              Модерация СТО
            </div>
            {stats.pending > 0 && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-500 border border-amber-500/20 font-bold">
                {stats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "clients" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <Users className="h-4 w-4" />
            Клиенты & Гараж
          </button>
          <button
            onClick={() => setActiveTab("partners")}
            className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "partners" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <Wrench className="h-4 w-4" />
            СТО & Магазины
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "orders" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            Заказы рынка
          </button>
          <button
            onClick={() => setActiveTab("sos")}
            className={`flex items-center justify-between w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "sos" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4" />
              Дорожная помощь (SOS)
            </div>
            {stats.sos > 0 && (
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-500 border border-red-500/20 font-bold">
                {stats.sos}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "audit" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            Логи аудита
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-900 mt-auto">
          <div className="flex items-center justify-between">
            <div className="truncate max-w-[150px]">
              <p className="text-xs font-bold leading-none truncate">Суперадмин</p>
              <span className="text-[10px] text-zinc-500 truncate">телефон: 87772373000</span>
            </div>
            <button
              onClick={handleSignOut}
              className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition"
              title="Выйти"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold capitalize">{activeTab === "sos" ? "SOS" : activeTab === "moderation" ? "Модерация" : activeTab}</h1>
            {dataLoading && <RefreshCw className="h-4 w-4 animate-spin text-zinc-500" />}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchTabRecords}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold transition text-zinc-300"
            >
              <RefreshCw className="h-3 w-3" />
              Обновить
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-zinc-400">Клиенты</span>
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="text-3xl font-bold">{stats.clients}</h3>
                  <p className="text-xs text-zinc-500 mt-2">Зарегистрированных водителей</p>
                </div>

                <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-zinc-400">СТО и Партнеры</span>
                    <Wrench className="h-5 w-5 text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-bold">{stats.partners}</h3>
                  <p className="text-xs text-zinc-500 mt-2">Одобренных сервисов и магазинов</p>
                </div>

                <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-zinc-400">На модерации</span>
                    <ShieldCheck className="h-5 w-5 text-amber-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-amber-500">{stats.pending}</h3>
                  <p className="text-xs text-zinc-500 mt-2">СТО ждут проверки анкет</p>
                </div>

                <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-zinc-400">Активные SOS</span>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-red-500">{stats.sos}</h3>
                  <p className="text-xs text-zinc-500 mt-2">Вызовов помощи прямо сейчас</p>
                </div>
              </div>

              {/* Notification Banner */}
              {stats.pending > 0 && (
                <div className="rounded-2xl border border-amber-900/30 bg-amber-500/5 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-200">Требуется модерация</h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        Новые партнеры заполнили анкеты и ожидают одобрения для доступа к заказам.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("moderation")}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-semibold transition"
                  >
                    Перейти к проверке ({stats.pending})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MODERATION QUEUE */}
          {activeTab === "moderation" && (
            <div className="space-y-6">
              <div className="border border-zinc-900 rounded-2xl bg-zinc-950 overflow-hidden">
                <div className="p-6 border-b border-zinc-900">
                  <h3 className="font-bold text-zinc-200">Очередь модерации партнеров</h3>
                </div>
                <div className="divide-y divide-zinc-900">
                  {partners.filter(p => p.moderation_status === "in_review").length === 0 ? (
                    <div className="p-8 text-center text-sm text-zinc-500">
                      Нет партнеров в очереди на модерацию.
                    </div>
                  ) : (
                    partners.filter(p => p.moderation_status === "in_review").map((partner) => (
                      <div key={partner.id} className="p-6 flex items-center justify-between hover:bg-zinc-900/20 transition">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center font-bold text-zinc-300 border border-zinc-800">
                            {partner.business_name?.[0] || "?"}
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-100">{partner.business_name || "Без названия"}</h4>
                            <p className="text-xs text-zinc-400 mt-1">
                              Категория: <span className="font-semibold text-emerald-400">{partner.specialization}</span> • Город: {partner.city} • Тел: {partner.phone || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedPartner(partner)}
                            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold border border-zinc-800 transition"
                          >
                            Анкета
                          </button>
                          <button
                            onClick={() => handleUpdateModerationStatus(partner.id, "approved")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold transition"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Одобрить
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLIENTS DIRECTORY */}
          {activeTab === "clients" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по имени, телефону, городу..."
                    className="w-full rounded-xl border border-zinc-900 bg-zinc-950 py-3.5 pl-11 pr-4 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border border-zinc-900 rounded-2xl bg-zinc-950 overflow-hidden">
                <table className="w-full border-collapse text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-900/30 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-900">
                    <tr>
                      <th className="px-6 py-4">Клиент</th>
                      <th className="px-6 py-4">Телефон</th>
                      <th className="px-6 py-4">Город</th>
                      <th className="px-6 py-4">Гараж</th>
                      <th className="px-6 py-4 text-right">Детали</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {clients
                      .filter((c) => {
                        const q = searchQuery.toLowerCase();
                        return (
                          (c.first_name || "").toLowerCase().includes(q) ||
                          (c.last_name || "").toLowerCase().includes(q) ||
                          (c.phone_number || "").includes(q) ||
                          (c.city || "").toLowerCase().includes(q)
                        );
                      })
                      .map((client) => (
                        <tr key={client.id} className="hover:bg-zinc-900/10 transition">
                          <td className="px-6 py-4 font-semibold text-zinc-100">
                            {client.first_name} {client.last_name}
                          </td>
                          <td className="px-6 py-4">{client.phone_number}</td>
                          <td className="px-6 py-4">{client.city || "—"}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 text-xs font-semibold text-zinc-300">
                              <Car className="h-3 w-3" />
                              {client.user_vehicles?.length || 0} авто
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleSelectClient(client)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold transition"
                            >
                              Карточка
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PARTNERS DIRECTORY */}
          {activeTab === "partners" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по названию СТО, специализации..."
                    className="w-full rounded-xl border border-zinc-900 bg-zinc-950 py-3.5 pl-11 pr-4 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">Все статусы</option>
                  <option value="approved">Одобренные</option>
                  <option value="in_review">На модерации</option>
                  <option value="waiting">В ожидании</option>
                  <option value="rejected">Отклоненные</option>
                </select>
              </div>

              <div className="border border-zinc-900 rounded-2xl bg-zinc-950 overflow-hidden">
                <table className="w-full border-collapse text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-900/30 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-900">
                    <tr>
                      <th className="px-6 py-4">Название</th>
                      <th className="px-6 py-4">Специализация</th>
                      <th className="px-6 py-4">Город</th>
                      <th className="px-6 py-4">Рейтинг</th>
                      <th className="px-6 py-4">Модерация</th>
                      <th className="px-6 py-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {partners
                      .filter((p) => {
                        const q = searchQuery.toLowerCase();
                        const matchQuery = (p.business_name || "").toLowerCase().includes(q) || (p.specialization || "").toLowerCase().includes(q);
                        const matchStatus = statusFilter === "all" || p.moderation_status === statusFilter;
                        return matchQuery && matchStatus;
                      })
                      .map((partner) => (
                        <tr key={partner.id} className="hover:bg-zinc-900/10 transition">
                          <td className="px-6 py-4 font-semibold text-zinc-100">
                            {partner.business_name || "Без названия"}
                          </td>
                          <td className="px-6 py-4 capitalize text-emerald-400 text-xs">{partner.specialization}</td>
                          <td className="px-6 py-4">{partner.city}</td>
                          <td className="px-6 py-4">⭐ {partner.rating || "—"}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                                partner.moderation_status === "approved"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : partner.moderation_status === "rejected"
                                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              }`}
                            >
                              {partner.moderation_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedPartner(partner)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold transition"
                            >
                              Карточка
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS VIEW */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="border border-zinc-900 rounded-2xl bg-zinc-950 overflow-hidden">
                <table className="w-full border-collapse text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-900/30 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-900">
                    <tr>
                      <th className="px-6 py-4">Заказ</th>
                      <th className="px-6 py-4">Клиент</th>
                      <th className="px-6 py-4">Автомобиль</th>
                      <th className="px-6 py-4">Категория</th>
                      <th className="px-6 py-4">Статус</th>
                      <th className="px-6 py-4">Партнер</th>
                      <th className="px-6 py-4 text-right">Офферы</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-900/10 transition">
                        <td className="px-6 py-4 font-semibold text-zinc-100 max-w-[200px] truncate">
                          {order.description || "—"}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {order.profiles?.first_name} ({order.profiles?.phone_number})
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {order.car_make} {order.car_model} ({order.car_year})
                        </td>
                        <td className="px-6 py-4 capitalize text-emerald-400 text-xs">{order.category}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${
                              order.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : order.status === "cancelled"
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold">
                          {order.pro_profiles?.business_name || "—"}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-xs text-zinc-300">
                          {order.order_offers?.length || 0} предложений
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SOS ALERTS */}
          {activeTab === "sos" && (
            <div className="space-y-6">
              <div className="border border-zinc-900 rounded-2xl bg-zinc-950 overflow-hidden">
                <table className="w-full border-collapse text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-900/30 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-900">
                    <tr>
                      <th className="px-6 py-4">Описание</th>
                      <th className="px-6 py-4">Клиент</th>
                      <th className="px-6 py-4">Адрес</th>
                      <th className="px-6 py-4">Статус</th>
                      <th className="px-6 py-4">Создан</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {helpRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500">
                          Нет активных вызовов SOS.
                        </td>
                      </tr>
                    ) : (
                      helpRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-zinc-900/10 transition">
                          <td className="px-6 py-4 font-semibold text-zinc-100 max-w-[250px] truncate">
                            {req.message}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {req.profiles?.first_name} {req.profiles?.last_name} ({req.profiles?.phone_number})
                          </td>
                          <td className="px-6 py-4 text-xs">
                            📍 {req.address || `(${req.latitude.toFixed(4)}, ${req.longitude.toFixed(4)})`}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${
                                req.status === "helped"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : req.status === "cancelled"
                                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {new Date(req.created_at).toLocaleString("ru-RU")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT LOGS */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              <div className="border border-zinc-900 rounded-2xl bg-zinc-950 overflow-hidden">
                <table className="w-full border-collapse text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-900/30 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-900">
                    <tr>
                      <th className="px-6 py-4">Админ ID</th>
                      <th className="px-6 py-4">Действие</th>
                      <th className="px-6 py-4">Целевой ID</th>
                      <th className="px-6 py-4">Детали изменения</th>
                      <th className="px-6 py-4">Дата</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500">
                          Журнал аудита пуст.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-900/10 transition text-xs">
                          <td className="px-6 py-4 truncate max-w-[150px]">{log.admin_id}</td>
                          <td className="px-6 py-4 font-semibold text-zinc-300">{log.action}</td>
                          <td className="px-6 py-4 truncate max-w-[150px]">{log.target_id || "—"}</td>
                          <td className="px-6 py-4 font-mono text-[10px] text-zinc-400">
                            {JSON.stringify(log.details)}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(log.created_at).toLocaleString("ru-RU")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* DETAIL MODAL: PARTNER DETAIL / MODERATION SHEET */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="max-w-2xl w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <h2 className="text-lg font-bold">Анкета: {selectedPartner.business_name || "Без названия"}</h2>
              <button
                onClick={() => {
                  setSelectedPartner(null);
                  setShowRejectionInput(false);
                }}
                className="h-8 w-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm text-zinc-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">Роль / Статус модерации</label>
                  <p className="font-semibold text-zinc-200 capitalize mt-1">
                    {selectedPartner.role} ({selectedPartner.moderation_status})
                  </p>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">Основная специализация</label>
                  <p className="font-semibold text-emerald-400 capitalize mt-1">
                    {selectedPartner.specialization}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Адрес и Город</label>
                <p className="font-semibold text-zinc-200 mt-1">
                  {selectedPartner.address || "—"} ({selectedPartner.city})
                </p>
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Телефон СТО</label>
                <p className="font-semibold text-zinc-200 mt-1">{selectedPartner.phone || "—"}</p>
              </div>

              {selectedPartner.coordinates && (
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">Координаты</label>
                  <p className="font-semibold text-zinc-200 mt-1 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-zinc-500" />
                    {JSON.stringify(selectedPartner.coordinates)}
                  </p>
                </div>
              )}

              {selectedPartner.working_hours && (
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">Рабочее время</label>
                  <pre className="font-mono text-xs text-zinc-400 mt-1 bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                    {JSON.stringify(selectedPartner.working_hours, null, 2)}
                  </pre>
                </div>
              )}

              {selectedPartner.services_prices && (
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">Услуги и Прайс-лист</label>
                  <pre className="font-mono text-xs text-zinc-400 mt-1 bg-zinc-950 p-3 rounded-xl border border-zinc-900 max-h-[150px] overflow-y-auto">
                    {JSON.stringify(selectedPartner.services_prices, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedPartner.moderation_status !== "approved" && (
              <div className="border-t border-zinc-800 pt-6 mt-8 space-y-4">
                {!showRejectionInput ? (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowRejectionInput(true)}
                      className="px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-semibold border border-red-500/20 transition"
                    >
                      Отклонить
                    </button>
                    <button
                      onClick={() => handleUpdateModerationStatus(selectedPartner.id, "approved")}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold transition"
                    >
                      <Check className="h-4 w-4" />
                      Одобрить и опубликовать
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Укажите причину отклонения анкеты..."
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-red-500 focus:outline-none h-20"
                    />
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setShowRejectionInput(false)}
                        className="px-4 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-xs font-semibold transition text-zinc-400"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={() => handleUpdateModerationStatus(selectedPartner.id, "rejected")}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold transition"
                      >
                        Подтвердить отклонение
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAIL MODAL: CLIENT CARD */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="max-w-2xl w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <h2 className="text-lg font-bold">Карточка клиента: {selectedClient.first_name} {selectedClient.last_name}</h2>
              <button
                onClick={() => setSelectedClient(null)}
                className="h-8 w-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm text-zinc-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">Телефон</label>
                  <p className="font-semibold text-zinc-200 mt-1">{selectedClient.phone_number}</p>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">Город</label>
                  <p className="font-semibold text-zinc-200 mt-1">{selectedClient.city || "—"}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Гараж автомобиля</label>
                {selectedClient.user_vehicles?.length === 0 ? (
                  <p className="text-xs text-zinc-500">В гараже нет зарегистрированных автомобилей.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.user_vehicles?.map((veh: any) => (
                      <div key={veh.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-zinc-200">{veh.model} ({veh.year} г.)</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">VIN: {veh.vin || "—"}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 font-bold font-mono text-xs text-zinc-300">
                            {veh.license_plate}
                          </span>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Пробег: {veh.mileage} км</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Сессии AI Суперчата</label>
                {selectedClient.super_chat_archives?.length === 0 ? (
                  <p className="text-xs text-zinc-500">Нет сохраненных сессий.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.super_chat_archives?.map((chat: any) => (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedSuperChat(chat)}
                        className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/20 hover:bg-zinc-950/60 cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-emerald-500" />
                          <p className="font-semibold text-zinc-300 truncate max-w-[300px]">{chat.title}</p>
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(chat.saved_at).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUPERCHAT TRANSCRIPT VIEW */}
      {selectedSuperChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="max-w-xl w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <h2 className="text-md font-bold truncate">Сессия Суперчата: {selectedSuperChat.title}</h2>
              <button
                onClick={() => setSelectedSuperChat(null)}
                className="h-8 w-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-xs">
              {Array.isArray(selectedSuperChat.messages) ? (
                selectedSuperChat.messages.map((m: any, idx: number) => (
                  <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-xl p-3 ${
                        m.role === "user"
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-zinc-950 border border-zinc-850 text-zinc-200 rounded-bl-none"
                      }`}
                    >
                      <p>{m.content || m.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-zinc-500 py-4">Логи диалога отсутствуют или имеют неверный формат.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}