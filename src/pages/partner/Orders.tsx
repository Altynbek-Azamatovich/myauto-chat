import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/partner/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OrderDialog } from "@/components/partner/orders/OrderDialog";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get partner_id from service_partners table
      const { data: partnerData } = await supabase
        .from("service_partners")
        .select("id")
        .eq("owner_id", session.user.id)
        .single();

      if (!partnerData) {
        toast.error("Partner profile not found");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          clients (full_name, car_model, car_number)
        `)
        .eq("partner_id", partnerData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.order_number?.toString().includes(searchLower) ||
      order.clients?.full_name?.toLowerCase().includes(searchLower) ||
      order.clients?.car_model?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "inProgress": return "bg-warning/20 text-warning border-warning/30";
      case "pending": return "bg-info/20 text-info border-info/30";
      case "completed": return "bg-success/20 text-success border-success/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleEdit = (order: any) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
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
            <h1 className="text-3xl font-bold text-foreground">{t("orders.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("orders.subtitle")}</p>
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("orders.new")}
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("orders.search")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("orders.search")}</p>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border cursor-pointer"
                    onClick={() => handleEdit(order)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-foreground">
                          {t("orders.orderNumber")} #{order.order_number}
                        </p>
                        <Badge className={getStatusColor(order.status)}>
                          {t(`orders.status.${order.status}`)}
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
      </div>

      <OrderDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        order={selectedOrder}
        onSuccess={loadOrders}
      />
    </DashboardLayout>
  );
}
