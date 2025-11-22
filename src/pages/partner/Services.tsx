import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/partner/DashboardLayout";
import { PageHeader } from "@/components/partner/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ServiceDialog } from "@/components/partner/services/ServiceDialog";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function Services() {
  const { t } = useTranslation();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
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
        .from("services")
        .select("*")
        .eq("partner_id", partnerData.id)
        .order("category, name");

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, any[]>);

  const handleEdit = (service: any) => {
    setSelectedService(service);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedService(null);
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
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title={t("services.title")}
          subtitle={t("services.subtitle")}
          action={
            <Button className="gap-2" onClick={() => setDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("services.create")}</span>
              <span className="sm:hidden">Добавить</span>
            </Button>
          }
        />

        <div className="grid gap-4">
          {Object.keys(groupedServices).map((category) => (
            <Card key={category} className="bg-card border-border">
              <CardHeader>
                <CardTitle>
                  {t(`services.categories.${category}`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {groupedServices[category].map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => handleEdit(service)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{service.name}</p>
                          {!service.is_active && (
                            <Badge variant="outline" className="text-xs">{t("services.inactive")}</Badge>
                          )}
                        </div>
                        {service.duration_minutes && (
                          <p className="text-sm text-muted-foreground">
                            {t("services.duration")}: {service.duration_minutes} {t("services.minutes")}
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-bold text-primary">₸{Number(service.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        service={selectedService}
        onSuccess={loadServices}
      />
    </DashboardLayout>
  );
}
