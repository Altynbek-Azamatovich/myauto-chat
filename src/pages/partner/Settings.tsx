import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/partner/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { getSafeErrorMessage } from "@/lib/errorHandler";

export default function Settings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_name: "",
    phone: "",
    service_address: "",
    workplaces_count: 1,
    working_hours_from: "09:00",
    working_hours_to: "18:00",
    notifications_new_orders: true,
    notifications_completed_orders: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          service_name: data.service_name || "",
          phone: data.phone || "",
          service_address: data.service_address || "",
          workplaces_count: data.workplaces_count || 1,
          working_hours_from: data.working_hours_from || "09:00",
          working_hours_to: data.working_hours_to || "18:00",
          notifications_new_orders: data.notifications_new_orders ?? true,
          notifications_completed_orders: data.notifications_completed_orders ?? true,
        });
      }
    } catch (error: any) {
      toast.error(getSafeErrorMessage(error));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("user_id", session.user.id);

      if (error) throw error;
      toast.success(t("settings.save"));
    } catch (error: any) {
      toast.error(getSafeErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("settings.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Информация о сервисе</CardTitle>
              <CardDescription>Основные данные вашего автосервиса</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("settings.serviceName")}</Label>
                <Input
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  placeholder={t("settings.serviceNamePlaceholder")}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("settings.phone")}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t("settings.phonePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.workplaces")}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.workplaces_count}
                    onChange={(e) => setFormData({ ...formData, workplaces_count: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("settings.address")}</Label>
                <Input
                  value={formData.service_address}
                  onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
                  placeholder={t("settings.addressPlaceholder")}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Рабочее время</CardTitle>
              <CardDescription>Режим работы сервиса</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("settings.from")}</Label>
                  <Input
                    type="time"
                    value={formData.working_hours_from}
                    onChange={(e) => setFormData({ ...formData, working_hours_from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.to")}</Label>
                  <Input
                    type="time"
                    value={formData.working_hours_to}
                    onChange={(e) => setFormData({ ...formData, working_hours_to: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("settings.notifications")}</CardTitle>
              <CardDescription>Настройка уведомлений о событиях</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("settings.newOrders")}</p>
                  <p className="text-sm text-muted-foreground">Получать уведомления о новых заказах</p>
                </div>
                <Switch
                  checked={formData.notifications_new_orders}
                  onCheckedChange={(checked) => setFormData({ ...formData, notifications_new_orders: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("settings.completedOrders")}</p>
                  <p className="text-sm text-muted-foreground">Уведомление о завершённых заказах</p>
                </div>
                <Switch
                  checked={formData.notifications_completed_orders}
                  onCheckedChange={(checked) => setFormData({ ...formData, notifications_completed_orders: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
