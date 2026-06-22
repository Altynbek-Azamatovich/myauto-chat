// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

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
} from "lucide-react";
type SessionUser = {
  id: string;
  phone?: string;
  email?: string;
};

// Translation and formatting helpers for myAuto Pro
const translateCategory = (category: string) => {
  const map: Record<string, string> = {
    'auto_service': 'Автосервис',
    'detailing': 'Детейлинг',
    'car_wash': 'Автомойка',
    'dismantling': 'Авторазбор',
    'shop': 'Автомагазин',
    'painter': 'Автомаляр',
    'tire': 'Шиномонтаж',
    'oil': 'Замена масла'
  };
  return map[category] || category || '—';
};

const translateModerationStatus = (status: string) => {
  const map: Record<string, string> = {
    'waiting': 'В ожидании',
    'in_review': 'На модерации',
    'approved': 'Одобрен',
    'rejected': 'Отклонен',
    'pending_details': 'Ожидает заполнения'
  };
  return map[status] || status || '—';
};

const getTabTitle = (tab: string) => {
  const map: Record<string, string> = {
    'dashboard': 'Панель управления',
    'moderation': 'Модерация партнеров',
    'clients': 'Клиенты и Гаражи',
    'partners': 'Каталог СТО и Магазинов',
    'orders': 'Заказы авторынка',
    'sos': 'Экстренные вызовы SOS',
    'audit': 'Логи аудита'
  };
  return map[tab] || tab;
};

const formatWorkingHours = (workingHours: any) => {
  if (!workingHours) return <span className="text-zinc-500">Не указано</span>;
  let parsed = workingHours;
  if (typeof workingHours === 'string') {
    try {
      parsed = JSON.parse(workingHours);
    } catch {
      return <span className="text-zinc-400 font-mono">{workingHours}</span>;
    }
  }
  
  if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
    const keys = Object.keys(parsed);
    if (keys.length === 0) return <span className="text-zinc-500">Не указано</span>;
    return (
      <div className="grid grid-cols-1 gap-1.5 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/60 max-w-sm">
        {keys.map((day) => (
          <div key={day} className="flex justify-between items-center text-xs">
            <span className="font-medium text-zinc-300">{day}</span>
            <span className="text-zinc-400 font-mono">{String(parsed[day])}</span>
          </div>
        ))}
      </div>
    );
  }
  
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return <span className="text-zinc-500">Не указано</span>;
  }
  
  return (
    <div className="grid grid-cols-1 gap-1.5 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/60 max-w-sm">
      {parsed.map((day: any, idx: number) => (
        <div key={idx} className="flex justify-between items-center text-xs">
          <span className="font-medium text-zinc-300">{day.name || day.day}</span>
          <span className={day.isOff ? "text-red-400 font-semibold" : "text-zinc-400 font-mono"}>
            {day.isOff ? "Выходной" : `${day.open} – ${day.close}`}
          </span>
        </div>
      ))}
    </div>
  );
};

const formatServicesPrices = (servicesPrices: any) => {
  if (!servicesPrices) return <span className="text-zinc-500">Не указано</span>;
  let parsed = servicesPrices;
  if (typeof servicesPrices === 'string') {
    try {
      parsed = JSON.parse(servicesPrices);
    } catch {
      return <span className="text-zinc-400 font-mono">{servicesPrices}</span>;
    }
  }
  
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return <span className="text-zinc-500">Прайс-лист пуст</span>;
  }
  
  return (
    <div className="border border-zinc-900/60 rounded-xl overflow-hidden bg-zinc-950/40 max-w-md">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-zinc-900/30 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-900/60">
          <tr>
            <th className="px-4 py-2 font-medium">Название услуги</th>
            <th className="px-4 py-2 text-right font-medium">Стоимость</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900/40 text-zinc-300">
          {parsed.map((service: any, idx: number) => (
            <tr key={idx} className="hover:bg-zinc-900/20 transition-premium">
              <td className="px-4 py-2.5 font-medium">{service.name}</td>
              <td className="px-4 py-2.5 text-right font-mono text-emerald-400 font-semibold">
                {Number(service.price).toLocaleString("ru-RU")} ₸
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const renderGallery = (photos: any) => {
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return <p className="text-xs text-zinc-500">Фотографии не загружены</p>;
  }
  const webPhotos = photos.filter((url: string) => url.startsWith("http"));
  if (webPhotos.length === 0) {
    return <p className="text-xs text-zinc-500">Фотографии сохранены на устройстве партнера и загружаются...</p>;
  }
  return (
    <div className="grid grid-cols-3 gap-3 mt-2">
      {webPhotos.map((url: string, idx: number) => (
        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 hover:border-emerald-500 transition-premium hover:scale-105">
          <img src={url} alt={`Фото ${idx + 1}`} className="w-full h-24 object-cover" />
        </a>
      ))}
    </div>
  );
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
          .select("*, user_vehicles(*, car_brands(*)), super_chat_archives(*)")
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
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);
    try {
      // Clean phone number format
      const formattedPhone = phoneNumber.trim();
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;
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
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber.trim(),
        token: otpToken.trim(),
        type: "sms",
      });
      if (error) throw error;
      if (data?.user) {
        checkSuperAdminStatus(data.user.id);
      }
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

      // Update local state
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

  // 5. Render Loading
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

  // 6. Render Access Denied
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

  // 7. Render Login Form
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
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3.5 px-4 text-center text-lg font-bold letter-spacing-2 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
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

  // 8. Main Dashboard Application layout
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex flex-col">
        <div className="p-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-emerald-500/10">
              my
            </div>
            <div>
              <h2 className="text-sm font-bold leading-none tracking-tight">myAuto</h2>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-1 block">Super Admin Console</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-premium ${
              activeTab === "dashboard" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <Activity className="h-4 w-4" />
            Дашборд
          </button>
          <button
            onClick={() => setActiveTab("moderation")}
            className={`flex items-center justify-between w-full rounded-xl px-4 py-3 text-sm font-semibold transition-premium ${
              activeTab === "moderation" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4" />
              Модерация СТО
            </div>
            {stats.pending > 0 && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-500 border border-amber-500/20 font-bold">
                {stats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-premium ${
              activeTab === "clients" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <Users className="h-4 w-4" />
            Клиенты & Гараж
          </button>
          <button
            onClick={() => setActiveTab("partners")}
            className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-premium ${
              activeTab === "partners" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <Wrench className="h-4 w-4" />
            СТО & Магазины
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-premium ${
              activeTab === "orders" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            Заказы рынка
          </button>
          <button
            onClick={() => setActiveTab("sos")}
            className={`flex items-center justify-between w-full rounded-xl px-4 py-3 text-sm font-semibold transition-premium ${
              activeTab === "sos" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4" />
              Дорожная помощь (SOS)
            </div>
            {stats.sos > 0 && (
              <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs text-red-500 border border-red-500/20 font-bold">
                {stats.sos}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-premium ${
              activeTab === "audit" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            Логи аудита
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-900 mt-auto bg-zinc-950/40">
          <div className="flex items-center justify-between">
            <div className="truncate max-w-[150px]">
              <p className="text-xs font-bold leading-none text-zinc-200">Суперадмин</p>
              <span className="text-[10px] text-zinc-500 font-mono mt-1 block">телефон: 87772373000</span>
            </div>
            <button
              onClick={handleSignOut}
              className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-premium"
              title="Выйти"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen bg-zinc-950">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-[17px] font-medium text-zinc-100">{getTabTitle(activeTab)}</h1>
            {dataLoading && <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchTabRecords}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold transition-premium text-zinc-300 border border-white/5"
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
                <div className="rounded-[26px] border border-white/5 bg-zinc-900/20 p-6 transition-premium hover-scale">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-zinc-400">Клиенты</span>
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-zinc-100">{stats.clients}</h3>
                  <p className="text-xs text-zinc-500 mt-2">Зарегистрированных водителей</p>
                </div>

                <div className="rounded-[26px] border border-white/5 bg-zinc-900/20 p-6 transition-premium hover-scale">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-zinc-400">СТО и Партнеры</span>
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Wrench className="h-4 w-4 text-emerald-500" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-zinc-100">{stats.partners}</h3>
                  <p className="text-xs text-zinc-500 mt-2">Одобренных сервисов и магазинов</p>
                </div>

                <div className="rounded-[26px] border border-white/5 bg-zinc-900/20 p-6 transition-premium hover-scale">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-zinc-400">На модерации</span>
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <ShieldCheck className="h-4 w-4 text-amber-500" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-amber-500">{stats.pending}</h3>
                  <p className="text-xs text-zinc-500 mt-2">СТО ждут проверки анкет</p>
                </div>

                <div className="rounded-[26px] border border-white/5 bg-zinc-900/20 p-6 transition-premium hover-scale">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-zinc-400">Активные SOS</span>
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-red-500">{stats.sos}</h3>
                  <p className="text-xs text-zinc-500 mt-2">Вызовов помощи прямо сейчас</p>
                </div>
              </div>

              {/* Notification Banner */}
              {stats.pending > 0 && (
                <div className="rounded-[26px] border border-amber-500/20 bg-amber-500/5 p-6 flex items-center justify-between">
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
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-semibold transition-premium"
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
              <div className="border border-zinc-900 rounded-[26px] bg-zinc-900/10 overflow-hidden">
                <div className="p-6 border-b border-zinc-900">
                  <h3 className="text-[17px] font-medium text-zinc-200 ml-4">Очередь модерации партнеров</h3>
                </div>
                <div className="divide-y divide-zinc-900/40">
                  {partners.filter(p => p.moderation_status === "in_review" || p.moderation_status === "waiting").length === 0 ? (
                    <div className="p-8 text-center text-sm text-zinc-500">
                      Нет партнеров в очереди на модерацию.
                    </div>
                  ) : (
                    partners.filter(p => p.moderation_status === "in_review" || p.moderation_status === "waiting").map((partner) => {
                      const name = partner.business_name || partner.name || partner.service_data?.name || "Без названия";
                      const spec = partner.specialization || partner.service_data?.partnerType || partner.role || "—";
                      const city = partner.city || partner.service_data?.city || "—";
                      const phone = partner.phone || partner.service_data?.phone || "—";
                      
                      return (
                        <div key={partner.id} className="p-6 flex items-center justify-between hover:bg-zinc-900/20 transition-premium border-b border-zinc-900/40">
                          <div className="flex items-center gap-4">
                            {partner.avatar_url ? (
                              <img src={partner.avatar_url} alt={name} className="h-12 w-12 rounded-xl object-cover border border-zinc-800 shadow-sm" />
                            ) : (
                              <div className="h-12 w-12 rounded-xl bg-zinc-900/60 flex items-center justify-center font-bold text-zinc-400 border border-zinc-800 text-sm">
                                {name?.[0] || "?"}
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-[17px] text-zinc-100">{name}</h4>
                              <p className="text-xs text-zinc-400 mt-1 font-normal">
                                Категория: <span className="font-semibold text-emerald-400">{translateCategory(spec)}</span> • Город: {city} • Тел: {phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSelectedPartner(partner)}
                              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold border border-zinc-800 transition-premium text-zinc-300"
                            >
                              Анкета
                            </button>
                            <button
                              onClick={() => handleUpdateModerationStatus(partner.id, "approved")}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold transition-premium"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Одобрить
                            </button>
                          </div>
                        </div>
                      );
                    })
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

              <div className="border border-zinc-900 rounded-[26px] bg-zinc-900/10 overflow-hidden">
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
                  <tbody className="divide-y divide-zinc-900/40">
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
                        <tr key={client.id} className="hover:bg-zinc-900/10 transition-premium border-b border-zinc-900/20">
                          <td className="px-6 py-4 font-semibold text-zinc-100">
                            {client.first_name || client.last_name ? `${client.first_name || ''} ${client.last_name || ''}`.trim() : 'Без имени'}
                          </td>
                          <td className="px-6 py-4 font-mono text-zinc-300">{client.phone_number}</td>
                          <td className="px-6 py-4 text-zinc-300">{client.city || "—"}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 border border-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                              <Car className="h-3 w-3 text-emerald-400" />
                              {client.user_vehicles?.length || 0} авто
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedClient(client)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold transition-premium border border-zinc-800 text-zinc-300"
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
                  className="rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none text-zinc-300"
                >
                  <option value="all">Все статусы</option>
                  <option value="approved">Одобренные</option>
                  <option value="in_review">На модерации</option>
                  <option value="waiting">В ожидании</option>
                  <option value="rejected">Отклоненные</option>
                </select>
              </div>

              <div className="border border-zinc-900 rounded-[26px] bg-zinc-900/10 overflow-hidden">
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
                  <tbody className="divide-y divide-zinc-900/40">
                    {partners
                      .filter((p) => {
                        const q = searchQuery.toLowerCase();
                        const name = p.business_name || p.name || p.service_data?.name || "";
                        const spec = p.specialization || p.service_data?.partnerType || p.role || "";
                        const matchQuery = name.toLowerCase().includes(q) || spec.toLowerCase().includes(q);
                        const matchStatus = statusFilter === "all" || p.moderation_status === statusFilter;
                        return matchQuery && matchStatus;
                      })
                      .map((partner) => {
                        const name = partner.business_name || partner.name || partner.service_data?.name || "Без названия";
                        const spec = partner.specialization || partner.service_data?.partnerType || partner.role || "—";
                        const city = partner.city || partner.service_data?.city || "—";
                        const rating = partner.rating !== undefined && partner.rating !== null ? partner.rating : null;
                        
                        return (
                          <tr key={partner.id} className="hover:bg-zinc-900/20 transition-premium border-b border-zinc-900/20">
                            <td className="px-6 py-4 font-semibold text-zinc-100 flex items-center gap-3">
                              {partner.avatar_url ? (
                                <img src={partner.avatar_url} alt={name} className="h-8 w-8 rounded-lg object-cover border border-zinc-800 shadow-sm" />
                              ) : (
                                <div className="h-8 w-8 rounded-lg bg-zinc-900/60 flex items-center justify-center font-bold text-zinc-400 border border-zinc-800 text-[10px]">
                                  {name?.[0] || "?"}
                                </div>
                              )}
                              <span>{name}</span>
                            </td>
                            <td className="px-6 py-4 font-medium text-emerald-400">{translateCategory(spec)}</td>
                            <td className="px-6 py-4 text-zinc-300">{city}</td>
                            <td className="px-6 py-4 font-semibold text-amber-400">
                              {rating !== null ? `⭐ ${rating.toFixed(1)}` : "⭐ 0.0"}
                            </td>
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
                                {translateModerationStatus(partner.moderation_status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedPartner(partner)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold transition-premium border border-zinc-800 text-zinc-300"
                              >
                                Карточка
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS VIEW */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="border border-zinc-900 rounded-[26px] bg-zinc-900/10 overflow-hidden">
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
                  <tbody className="divide-y divide-zinc-900/40">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-900/10 transition border-b border-zinc-900/20">
                        <td className="px-6 py-4 font-semibold text-zinc-100 max-w-[200px] truncate">
                          {order.description || "—"}
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-300">
                          {order.profiles?.first_name || 'Водитель'} ({order.profiles?.phone_number || '—'})
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-300">
                          {order.car_make} {order.car_model} ({order.car_year})
                        </td>
                        <td className="px-6 py-4 font-medium text-emerald-400 text-xs">{translateCategory(order.category)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                              order.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : order.status === "cancelled"
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            }`}
                          >
                            {order.status === 'pending' ? 'Новый' : order.status === 'in_progress' ? 'В работе' : order.status === 'completed' ? 'Завершен' : order.status === 'cancelled' ? 'Отменен' : order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-zinc-200">
                          {order.pro_profiles?.business_name || "—"}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-xs text-zinc-400">
                          {order.order_offers?.length || 0} офферов
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
              <div className="border border-zinc-900 rounded-[26px] bg-zinc-900/10 overflow-hidden">
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
                  <tbody className="divide-y divide-zinc-900/40">
                    {helpRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500">
                          Нет активных вызовов SOS.
                        </td>
                      </tr>
                    ) : (
                      helpRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-zinc-900/10 transition border-b border-zinc-900/20">
                          <td className="px-6 py-4 font-semibold text-zinc-100 max-w-[250px] truncate">
                            {req.message}
                          </td>
                          <td className="px-6 py-4 text-xs text-zinc-300">
                            {req.profiles?.first_name} {req.profiles?.last_name} ({req.profiles?.phone_number})
                          </td>
                          <td className="px-6 py-4 text-xs text-zinc-300">
                            📍 {req.address || `(${req.latitude.toFixed(4)}, ${req.longitude.toFixed(4)})`}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                                req.status === "helped"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : req.status === "cancelled"
                                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              }`}
                            >
                              {req.status === 'active' ? 'Активный' : req.status === 'helped' ? 'Помогли' : req.status === 'cancelled' ? 'Отменен' : req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-zinc-400">
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
              <div className="border border-zinc-900 rounded-[26px] bg-zinc-900/10 overflow-hidden">
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
                  <tbody className="divide-y divide-zinc-900/40">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500">
                          Журнал аудита пуст.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-900/10 transition text-xs border-b border-zinc-900/20">
                          <td className="px-6 py-4 truncate max-w-[150px] font-mono text-zinc-400">{log.admin_id}</td>
                          <td className="px-6 py-4 font-semibold text-zinc-300">{log.action}</td>
                          <td className="px-6 py-4 truncate max-w-[150px] font-mono text-zinc-400">{log.target_id || "—"}</td>
                          <td className="px-6 py-4 font-mono text-[10px] text-zinc-400 max-w-[300px] truncate">
                            {JSON.stringify(log.details)}
                          </td>
                          <td className="px-6 py-4 text-zinc-400 font-mono">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 transition-premium">
          <div className="max-w-2xl w-full rounded-[26px] border border-zinc-800 bg-zinc-900 p-8 shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <h2 className="text-lg font-bold">Анкета партнера</h2>
              <button
                onClick={() => {
                  setSelectedPartner(null);
                  setShowRejectionInput(false);
                }}
                className="h-8 w-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-premium"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Fallbacks */}
            {(() => {
              const name = selectedPartner.business_name || selectedPartner.name || selectedPartner.service_data?.name || "Без названия";
              const spec = selectedPartner.specialization || selectedPartner.service_data?.partnerType || selectedPartner.role || "—";
              const city = selectedPartner.city || selectedPartner.service_data?.city || "—";
              const address = selectedPartner.address || selectedPartner.service_data?.address || "—";
              const phone = selectedPartner.phone || selectedPartner.service_data?.phone || "—";
              
              let coordsStr = "";
              if (selectedPartner.coordinates) {
                coordsStr = typeof selectedPartner.coordinates === 'string' ? selectedPartner.coordinates : JSON.stringify(selectedPartner.coordinates);
              } else if (selectedPartner.service_data?.longitude) {
                coordsStr = `(${selectedPartner.service_data.longitude}, ${selectedPartner.service_data.latitude})`;
              } else {
                coordsStr = "—";
              }

              return (
                <div className="space-y-6 text-[17px] text-zinc-300 font-normal">
                  <div className="flex items-center gap-5 bg-zinc-950/20 p-4 rounded-[26px] border border-white/5">
                    {selectedPartner.avatar_url ? (
                      <img src={selectedPartner.avatar_url} alt={name} className="h-16 w-16 rounded-[18px] object-cover border border-zinc-800 shadow-sm" />
                    ) : (
                      <div className="h-16 w-16 rounded-[18px] bg-zinc-900 flex items-center justify-center font-bold text-zinc-400 border border-zinc-800 text-lg">
                        {name?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-zinc-100">{name}</h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        Статус: <span className="font-semibold text-emerald-400">{translateModerationStatus(selectedPartner.moderation_status)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 bg-zinc-900/10 p-5 rounded-[26px] border border-white/5">
                    <div>
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Роль на платформе</label>
                      <p className="font-semibold text-zinc-200 capitalize">
                        {selectedPartner.role === 'admin' ? 'Администратор СТО/Магазина' : selectedPartner.role === 'staff' ? 'Сотрудник' : selectedPartner.role}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Основная специализация</label>
                      <p className="font-semibold text-emerald-400">
                        {translateCategory(spec)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 bg-zinc-900/10 p-5 rounded-[26px] border border-white/5">
                    <div>
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Город и Адрес</label>
                      <p className="font-semibold text-zinc-200">
                        {city}, {address}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Телефон СТО</label>
                        <p className="font-semibold text-zinc-200">{phone}</p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Координаты на карте</label>
                        <p className="font-semibold text-zinc-200 flex items-center gap-1.5 font-mono text-xs mt-1">
                          <MapPin className="h-4 w-4 text-zinc-500" />
                          {coordsStr}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/10 p-5 rounded-[26px] border border-white/5">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-3">Фотогалерея сервиса</label>
                    {renderGallery(selectedPartner.gallery_photos)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900/10 p-5 rounded-[26px] border border-white/5">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-3">Рабочее время</label>
                      {formatWorkingHours(selectedPartner.working_hours)}
                    </div>

                    <div className="bg-zinc-900/10 p-5 rounded-[26px] border border-white/5">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-3">Услуги и Прайс-лист</label>
                      {formatServicesPrices(selectedPartner.services_prices)}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            {selectedPartner.moderation_status !== "approved" && (
              <div className="border-t border-zinc-800 pt-6 mt-8 space-y-4">
                {!showRejectionInput ? (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowRejectionInput(true)}
                      className="px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-semibold border border-red-500/20 transition-premium"
                    >
                      Отклонить
                    </button>
                    <button
                      onClick={() => handleUpdateModerationStatus(selectedPartner.id, "approved")}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold transition-premium"
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
                        className="px-4 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-xs font-semibold transition-premium text-zinc-400"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={() => handleUpdateModerationStatus(selectedPartner.id, "rejected")}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold transition-premium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 transition-premium">
          <div className="max-w-2xl w-full rounded-[26px] border border-zinc-800 bg-zinc-900 p-8 shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <h2 className="text-lg font-bold">Карточка клиента: {selectedClient.first_name || ''} {selectedClient.last_name || ''}</h2>
              <button
                onClick={() => setSelectedClient(null)}
                className="h-8 w-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-premium"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 text-[17px] text-zinc-300 font-normal">
              <div className="grid grid-cols-2 gap-4 bg-zinc-900/10 p-5 rounded-[26px] border border-white/5">
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Телефон</label>
                  <p className="font-semibold text-zinc-200">{selectedClient.phone_number}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Город</label>
                  <p className="font-semibold text-zinc-200">{selectedClient.city || "—"}</p>
                </div>
              </div>

              <div className="bg-zinc-900/10 p-5 rounded-[26px] border border-white/5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 block">Гараж автомобиля</label>
                {selectedClient.user_vehicles?.length === 0 ? (
                  <p className="text-xs text-zinc-500">В гараже нет зарегистрированных автомобилей.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.user_vehicles?.map((veh: any) => (
                      <div key={veh.id} className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/40 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-zinc-200">
                            {veh.car_brands?.brand_name ? `${veh.car_brands.brand_name} ` : ''}
                            {veh.model} ({veh.year} г.)
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">VIN: {veh.vin || "—"}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block rounded bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 font-bold font-mono text-xs text-zinc-300">
                            {veh.license_plate}
                          </span>
                          <p className="text-[10px] text-zinc-500 mt-1">Пробег: {veh.mileage ? `${veh.mileage.toLocaleString('ru-RU')} км` : '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-zinc-900/10 p-5 rounded-[26px] border border-white/5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 block">Сессии AI Суперчата</label>
                {selectedClient.super_chat_archives?.length === 0 ? (
                  <p className="text-xs text-zinc-500">Нет сохраненных сессий.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.super_chat_archives?.map((chat: any) => (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedSuperChat(chat)}
                        className="p-3 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:bg-zinc-950/60 cursor-pointer flex items-center justify-between transition-premium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 transition-premium">
          <div className="max-w-xl w-full rounded-[26px] border border-zinc-800 bg-zinc-900 p-8 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <h2 className="text-md font-bold truncate">Сессия Суперчата: {selectedSuperChat.title}</h2>
              <button
                onClick={() => setSelectedSuperChat(null)}
                className="h-8 w-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-premium"
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
