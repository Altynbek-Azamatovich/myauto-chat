import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/partner/DashboardLayout";
import { PageHeader } from "@/components/partner/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Phone, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ClientDialog } from "@/components/partner/clients/ClientDialog";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getSafeErrorMessage } from "@/lib/errorHandler";

export default function Clients() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
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
        .from("clients")
        .select("*, orders(id)")
        .eq("partner_id", partnerData.id)
        .order("full_name");

      if (error) throw error;
      setClients(data || []);
      
      // TODO: Audit logging for bulk client data access (requires audit_logs table)
      // if (data && data.length > 50) {
      //   console.log("Bulk client access detected:", data.length, "records");
      // }
    } catch (error: any) {
      toast.error(getSafeErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.full_name?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(searchLower) ||
      client.car_model?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (client: any) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedClient(null);
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
          title={t("clients.title")}
          subtitle={t("clients.subtitle")}
          action={
            <Button className="gap-2" onClick={() => setDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("clients.create")}</span>
              <span className="sm:hidden">Добавить</span>
            </Button>
          }
        />

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("clients.search")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredClients.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("clients.search")}</p>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border cursor-pointer"
                    onClick={() => handleEdit(client)}
                  >
                    <div className="space-y-2">
                      <p className="font-semibold text-foreground">{client.full_name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </span>
                        {client.car_model && (
                          <span className="flex items-center gap-1">
                            <Car className="h-3 w-3" />
                            {client.car_model}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {client.orders?.length || 0} {t("clients.visits")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ClientDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        client={selectedClient}
        onSuccess={loadClients}
      />
    </DashboardLayout>
  );
}
