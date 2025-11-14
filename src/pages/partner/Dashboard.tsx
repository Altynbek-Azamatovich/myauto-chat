import { DashboardLayout } from "@/components/partner/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, TrendingUp, DollarSign, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [shiftOpen, setShiftOpen] = useState(false);
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalClients: 0,
    dailyRevenue: 0,
    shiftTime: "00:00",
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      if (currentShift) {
        updateShiftTime();
      }
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [currentShift]);

  const updateShiftTime = () => {
    if (!currentShift) return;
    const opened = new Date(currentShift.opened_at);
    const now = new Date();
    const diff = now.getTime() - opened.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    setStats(prev => ({
      ...prev,
      shiftTime: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    }));
  };

  const loadDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load current shift
      const { data: shift } = await supabase
        .from("shifts")
        .select("*")
        .eq("partner_id", session.user.id)
        .is("closed_at", null)
        .single();

      setCurrentShift(shift);
      setShiftOpen(!!shift);

      // Load active orders count
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("partner_id", session.user.id)
        .in("status", ["pending", "inProgress"]);

      // Load total clients count
      const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("partner_id", session.user.id);

      // Load daily revenue
      const today = new Date().toISOString().split("T")[0];
      const { data: todayOrders } = await supabase
        .from("orders")
        .select("total_price")
        .eq("partner_id", session.user.id)
        .gte("created_at", today);

      const dailyRevenue = todayOrders?.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0) || 0;

      // Calculate shift time
      let shiftTime = "00:00";
      if (shift) {
        const opened = new Date(shift.opened_at);
        const now = new Date();
        const diff = now.getTime() - opened.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        shiftTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      }

      setStats({
        activeOrders: ordersCount || 0,
        totalClients: clientsCount || 0,
        dailyRevenue,
        shiftTime,
      });

      // Load recent orders
      const { data: orders } = await supabase
        .from("orders")
        .select(`
          *,
          clients (full_name, car_model)
        `)
        .eq("partner_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentOrders(orders || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShiftToggle = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (shiftOpen && currentShift) {
        await supabase
          .from("shifts")
          .update({
            closed_at: new Date().toISOString(),
          })
          .eq("id", currentShift.id);

        toast.success(t("dashboard.shift.closed"));
        setShiftOpen(false);
        setCurrentShift(null);
      } else {
        const { data: newShift, error } = await supabase
          .from("shifts")
          .insert({
            partner_id: session.user.id,
            opened_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        toast.success(t("dashboard.shift.opened"));
        setShiftOpen(true);
        setCurrentShift(newShift);
      }

      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "inProgress": return "bg-warning/20 text-warning border-warning/30";
      case "pending": return "bg-info/20 text-info border-info/30";
      case "completed": return "bg-success/20 text-success border-success/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    return t(`orders.status.${status}`) || status;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">{t("common.loading")}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
          </div>
          <Button
            onClick={handleShiftToggle}
            variant={shiftOpen ? "destructive" : "default"}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            {shiftOpen ? t("dashboard.shift.close") : t("dashboard.shift.open")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("dashboard.stats.activeOrders")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.activeOrders}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("dashboard.stats.clients")}
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("dashboard.stats.dailyRevenue")}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₸{stats.dailyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Сегодня</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("dashboard.stats.shiftTime")}
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.shiftTime}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("dashboard.recentOrders")}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>
              {t("dashboard.viewAll")}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("orders.search")}</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border cursor-pointer"
                    onClick={() => navigate("/orders")}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-foreground">
                          {t("orders.orderNumber")} #{order.order_number}
                        </p>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.clients?.full_name} • {order.clients?.car_model}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-primary">₸{Number(order.total_price).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer" onClick={() => navigate("/orders")}>
            <CardContent className="pt-6 text-center">
              <Plus className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">{t("dashboard.newOrder")}</h3>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer" onClick={() => navigate("/clients")}>
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">{t("dashboard.addClient")}</h3>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer" onClick={() => navigate("/analytics")}>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">{t("dashboard.viewAnalytics")}</h3>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
