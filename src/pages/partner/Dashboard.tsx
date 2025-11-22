import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/partner/DashboardLayout";
import {
  Clock,
  DollarSign,
  Users,
  Car,
  Calendar,
  TrendingUp,
  Plus,
  FileText,
  Wrench,
  Package,
  BarChart3,
  ArrowRight,
  Activity,
} from "lucide-react";

interface DashboardStats {
  activeOrders: number;
  totalClients: number;
  dailyRevenue: number;
  shiftTime: string;
  completedToday: number;
  pendingOrders: number;
  inProgressOrders: number;
}

interface RecentOrder {
  id: string;
  client_name: string;
  car_model: string;
  status: string;
  total_price: number;
  opened_at: string;
}

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    totalClients: 0,
    dailyRevenue: 0,
    shiftTime: "00:00:00",
    completedToday: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [shiftInterval, setShiftInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadDashboardData();

    return () => {
      if (shiftInterval) {
        clearInterval(shiftInterval);
      }
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/welcome");
        return;
      }

      const { data: partner } = await supabase
        .from("service_partners")
        .select("id")
        .eq("owner_id", session.user.id)
        .single();

      if (!partner) return;

      const { data: shift } = await supabase
        .from("shifts")
        .select("*")
        .eq("partner_id", partner.id)
        .is("closed_at", null)
        .order("opened_at", { ascending: false })
        .limit(1)
        .single();

      setCurrentShift(shift);

      if (shift) {
        updateShiftTime(shift);
        const interval = setInterval(() => updateShiftTime(shift), 1000);
        setShiftInterval(interval);
      }

      const { data: orders } = await supabase
        .from("orders")
        .select(`
          *,
          clients:client_id (full_name, car_model)
        `)
        .eq("partner_id", partner.id);

      const activeOrders = orders?.filter(o => o.status !== "completed" && o.status !== "cancelled") || [];
      const pendingOrders = orders?.filter(o => o.status === "pending") || [];
      const inProgressOrders = orders?.filter(o => o.status === "in_progress") || [];
      
      const today = new Date().toISOString().split("T")[0];
      const completedToday = orders?.filter(
        o => o.status === "completed" && o.closed_at?.startsWith(today)
      ).length || 0;

      const dailyRevenue = orders
        ?.filter(o => o.closed_at?.startsWith(today) && o.status === "completed")
        .reduce((sum, order) => sum + Number(order.total_price || 0), 0) || 0;

      const { count: clientCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("partner_id", partner.id);

      const recentOrdersData = orders
        ?.slice(0, 5)
        .map(order => ({
          id: order.id,
          client_name: (order.clients as any)?.full_name || "Unknown",
          car_model: (order.clients as any)?.car_model || "N/A",
          status: order.status,
          total_price: Number(order.total_price || 0),
          opened_at: order.opened_at || order.created_at || "",
        })) || [];

      setStats({
        activeOrders: activeOrders.length,
        totalClients: clientCount || 0,
        dailyRevenue,
        shiftTime: "00:00:00",
        completedToday,
        pendingOrders: pendingOrders.length,
        inProgressOrders: inProgressOrders.length,
      });

      setRecentOrders(recentOrdersData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateShiftTime = (shift: any) => {
    if (!shift) return;
    const openedAt = new Date(shift.opened_at);
    const now = new Date();
    const diff = now.getTime() - openedAt.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    setStats(prev => ({ ...prev, shiftTime: timeStr }));
  };

  const handleShiftToggle = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: partner } = await supabase
        .from("service_partners")
        .select("id")
        .eq("owner_id", session.user.id)
        .single();

      if (!partner) return;

      if (currentShift) {
        await supabase
          .from("shifts")
          .update({ closed_at: new Date().toISOString() })
          .eq("id", currentShift.id);
        setCurrentShift(null);
        if (shiftInterval) {
          clearInterval(shiftInterval);
          setShiftInterval(null);
        }
        toast({ title: "Смена закрыта" });
      } else {
        const { data: newShift } = await supabase
          .from("shifts")
          .insert({ partner_id: partner.id, opened_at: new Date().toISOString() })
          .select()
          .single();
        setCurrentShift(newShift);
        const interval = setInterval(() => updateShiftTime(newShift), 1000);
        setShiftInterval(interval);
        toast({ title: "Смена открыта" });
      }
      loadDashboardData();
    } catch (error) {
      console.error("Error toggling shift:", error);
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Ожидает",
      in_progress: "В работе",
      completed: "Завершен",
      cancelled: "Отменен",
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Загрузка данных...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">myAuto PRO</h1>
                <p className="text-primary-foreground/80 text-lg">
                  Управление автосервисом следующего поколения
                </p>
              </div>
              <Button
                onClick={handleShiftToggle}
                size="lg"
                variant={currentShift ? "secondary" : "outline"}
                className={currentShift ? "bg-background text-foreground hover:bg-background/90" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}
              >
                <Activity className="mr-2 h-5 w-5" />
                {currentShift ? "Закрыть смену" : "Открыть смену"}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-primary-foreground/70 text-sm mb-1">Активных заказов</p>
                    <p className="text-3xl font-bold">{stats.activeOrders}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary-foreground/50" />
                </div>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-primary-foreground/70 text-sm mb-1">Клиентов</p>
                    <p className="text-3xl font-bold">{stats.totalClients}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary-foreground/50" />
                </div>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-primary-foreground/70 text-sm mb-1">Выручка сегодня</p>
                    <p className="text-3xl font-bold">{stats.dailyRevenue.toLocaleString()} ₸</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary-foreground/50" />
                </div>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-primary-foreground/70 text-sm mb-1">Время смены</p>
                    <p className="text-3xl font-bold font-mono">{stats.shiftTime}</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary-foreground/50" />
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Быстрые действия
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card 
              className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group"
              onClick={() => navigate("/partner/orders")}
            >
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Новый заказ</h3>
                <p className="text-sm text-muted-foreground">Создать заказ-наряд</p>
              </div>
            </Card>

            <Card 
              className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group"
              onClick={() => navigate("/partner/clients")}
            >
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto group-hover:bg-blue-500/20 transition-colors">
                  <Users className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg">Клиенты</h3>
                <p className="text-sm text-muted-foreground">База клиентов</p>
              </div>
            </Card>

            <Card 
              className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group"
              onClick={() => navigate("/partner/services")}
            >
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto group-hover:bg-green-500/20 transition-colors">
                  <Wrench className="h-7 w-7 text-green-500" />
                </div>
                <h3 className="font-semibold text-lg">Услуги</h3>
                <p className="text-sm text-muted-foreground">Прайс-лист</p>
              </div>
            </Card>

            <Card 
              className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group"
              onClick={() => navigate("/partner/analytics")}
            >
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto group-hover:bg-purple-500/20 transition-colors">
                  <BarChart3 className="h-7 w-7 text-purple-500" />
                </div>
                <h3 className="font-semibold text-lg">Аналитика</h3>
                <p className="text-sm text-muted-foreground">Отчёты и статистика</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Ожидают</h3>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.pendingOrders}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Новые заказы</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">В работе</h3>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.inProgressOrders}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Активные работы</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Завершено</h3>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.completedToday}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Сегодня</p>
          </Card>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Последние заказы
            </h2>
            <Button variant="ghost" onClick={() => navigate("/partner/orders")}>
              Все заказы
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Нет заказов</h3>
                    <p className="text-muted-foreground mb-4">Создайте первый заказ-наряд</p>
                    <Button onClick={() => navigate("/partner/orders")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Создать заказ
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              recentOrders.map((order) => (
                <Card 
                  key={order.id} 
                  className="p-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate("/partner/orders")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{order.client_name}</h3>
                        <p className="text-sm text-muted-foreground">{order.car_model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{order.total_price.toLocaleString()} ₸</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.opened_at).toLocaleString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
