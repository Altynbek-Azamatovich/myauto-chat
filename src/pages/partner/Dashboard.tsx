import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/partner/DashboardLayout";
import dashboardCar from "@/assets/dashboard-car.png";
import {
  Clock,
  DollarSign,
  Users,
  Activity,
  History,
  Maximize,
  Box,
  AlertCircle,
  CheckCircle2,
  Wrench,
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
        toast({ title: t('dashboard.shiftClosed') });
      } else {
        const { data: newShift } = await supabase
          .from("shifts")
          .insert({ partner_id: partner.id, opened_at: new Date().toISOString() })
          .select()
          .single();
        setCurrentShift(newShift);
        const interval = setInterval(() => updateShiftTime(newShift), 1000);
        setShiftInterval(interval);
        toast({ title: t('dashboard.shiftOpened') });
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
      {/* Mobile View - Original Design */}
      <div className="md:hidden space-y-6 pb-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">{t('dashboard.title')}</h1>
                <p className="text-primary-foreground/80 text-sm">
                  {t('dashboard.subtitle')}
                </p>
              </div>
              <Button
                onClick={handleShiftToggle}
                size="sm"
                variant={currentShift ? "secondary" : "outline"}
                className={currentShift ? "bg-background text-foreground hover:bg-background/90" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}
              >
                <Activity className="mr-2 h-4 w-4" />
                {currentShift ? t('common.close') : t('common.open')}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-primary-foreground/70 text-xs mb-1 truncate">{t('dashboard.activeOrders')}</p>
                    <p className="text-2xl font-bold">{stats.activeOrders}</p>
                  </div>
                  <Activity className="h-6 w-6 text-primary-foreground/50 flex-shrink-0" />
                </div>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-primary-foreground/70 text-xs mb-1 truncate">{t('dashboard.totalClients')}</p>
                    <p className="text-2xl font-bold">{stats.totalClients}</p>
                  </div>
                  <Users className="h-6 w-6 text-primary-foreground/50 flex-shrink-0" />
                </div>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-primary-foreground/70 text-xs mb-1 truncate">{t('dashboard.dailyRevenue')}</p>
                    <p className="text-xl font-bold">{stats.dailyRevenue.toLocaleString()} ₸</p>
                  </div>
                  <DollarSign className="h-6 w-6 text-primary-foreground/50 flex-shrink-0" />
                </div>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-primary-foreground/70 text-xs mb-1 truncate">{t('dashboard.shiftTime')}</p>
                    <p className="text-xl font-bold font-mono">{stats.shiftTime}</p>
                  </div>
                  <Clock className="h-6 w-6 text-primary-foreground/50 flex-shrink-0" />
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent Orders Mobile */}
        <div>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t('dashboard.recentOrders')}
          </h2>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground mb-4">{t('dashboard.noOrders')}</p>
                <Button onClick={() => navigate("/partner/orders")}>
                  {t('dashboard.createOrder')}
                </Button>
              </Card>
            ) : (
              recentOrders.map((order) => (
                <Card key={order.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/partner/orders")}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{order.client_name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{order.car_model}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {new Date(order.opened_at).toLocaleDateString('ru-RU')}
                    </span>
                    <span className="font-semibold">{order.total_price.toLocaleString()} ₸</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Desktop/Tablet View - Tech Design */}
      <div className="hidden md:block">
        <div className="relative h-[calc(100vh-180px)] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
          {/* Background Grid Effect */}
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:50px_50px]" />
          
          {/* Central Car Image */}
          <div className="relative z-10 flex items-center justify-center">
            <img 
              src={dashboardCar} 
              alt="Dashboard Vehicle" 
              className="w-[500px] xl:w-[600px] h-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Top Left - Shift Control */}
          <Card className="absolute top-4 left-4 p-4 w-64 backdrop-blur-xl bg-card/95 border shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2.5 h-2.5 rounded-full ${currentShift ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
              <div>
                <h3 className="font-bold text-sm">{t('dashboard.shiftTime')}</h3>
                <p className="text-2xl font-mono font-bold text-primary">{stats.shiftTime}</p>
              </div>
            </div>
            <Button
              onClick={handleShiftToggle}
              className="w-full"
              size="default"
              variant={currentShift ? "destructive" : "default"}
            >
              <Activity className="mr-2 h-4 w-4" />
              {currentShift ? t('dashboard.closeShift') : t('dashboard.openShift')}
            </Button>
          </Card>

          {/* Top Right - Stats */}
          <div className="absolute top-4 right-4 space-y-3 w-64">
            <Card className="p-3 backdrop-blur-xl bg-card/95 border shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('dashboard.activeOrders')}</p>
                  <p className="text-2xl font-bold text-primary">{stats.activeOrders}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-3 backdrop-blur-xl bg-card/95 border shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('dashboard.totalClients')}</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.totalClients}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card className="p-3 backdrop-blur-xl bg-card/95 border shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('dashboard.dailyRevenue')}</p>
                  <p className="text-xl font-bold text-green-500">{stats.dailyRevenue.toLocaleString()} ₸</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom Left - Recent Issues */}
          <Card className="absolute bottom-4 left-4 p-4 w-72 backdrop-blur-xl bg-card/95 border shadow-xl max-h-[240px] overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm">{t('dashboard.recentIssues')}</h3>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
              {[
                { issue: "Замена масла", status: "fixed", date: "2024-01-15" },
                { issue: "Проверка тормозов", status: "fixed", date: "2024-01-10" },
                { issue: "Диагностика двигателя", status: "pending", date: "2024-01-05" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  {item.status === "fixed" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Wrench className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs truncate">{item.issue}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(item.date).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <Badge variant={item.status === "fixed" ? "default" : "secondary"} className="text-[10px] h-5">
                    {item.status === "fixed" ? t('dashboard.issueFixed') : t('dashboard.issuePending')}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Bottom Right - Actions */}
          <div className="absolute bottom-4 right-4 flex gap-3">
            <Button
              onClick={() => navigate("/partner/orders")}
              size="lg"
              className="h-28 w-28 flex-col gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all backdrop-blur-xl bg-primary"
            >
              <History className="h-8 w-8" />
              <span className="font-semibold text-xs text-center leading-tight">{t('dashboard.viewHistory')}</span>
            </Button>

            <Button
              onClick={() => navigate("/showroom-3d")}
              size="lg"
              variant="secondary"
              className="h-28 w-28 flex-col gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all backdrop-blur-xl"
            >
              <Maximize className="h-8 w-8" />
              <span className="font-semibold text-xs text-center leading-tight">{t('dashboard.view360')}</span>
            </Button>

            <Button
              onClick={() => navigate("/showroom-3d")}
              size="lg"
              variant="outline"
              className="h-28 w-28 flex-col gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all backdrop-blur-xl"
            >
              <Box className="h-8 w-8" />
              <span className="font-semibold text-xs text-center leading-tight">{t('dashboard.view3D')}</span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
