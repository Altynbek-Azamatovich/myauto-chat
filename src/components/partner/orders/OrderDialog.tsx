import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { getSafeErrorMessage } from "@/lib/errorHandler";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: any;
  onSuccess: () => void;
}

export function OrderDialog({ open, onOpenChange, order, onSuccess }: OrderDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    client_id: "",
    status: "pending",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      loadClients();
      loadServices();
      if (order) {
        setFormData({
          client_id: order.client_id,
          status: order.status,
          notes: order.notes || "",
        });
        loadOrderServices();
      }
    }
  }, [open, order]);

  const loadClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("full_name");
    setClients(data || []);
  };

  const loadServices = async () => {
    const { data } = await supabase.from("services").select("*").eq("is_active", true).order("name");
    setServices(data || []);
  };

  const loadOrderServices = async () => {
    if (!order) return;
    const { data } = await supabase
      .from("order_services")
      .select("*, services(*)")
      .eq("order_id", order.id);
    setSelectedServices(data || []);
  };

  const handleAddService = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service && !selectedServices.find((s) => s.service_id === serviceId)) {
      setSelectedServices([...selectedServices, { service_id: serviceId, quantity: 1, price: service.price, services: service }]);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter((s) => s.service_id !== serviceId));
  };

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    setSelectedServices(
      selectedServices.map((s) =>
        s.service_id === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s
      )
    );
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, s) => sum + Number(s.price) * s.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || selectedServices.length === 0) {
      toast.error(t("orders.validation.required"));
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const orderData = {
        partner_id: session.user.id,
        client_id: formData.client_id,
        status: formData.status,
        notes: formData.notes,
        total_price: calculateTotal(),
      };

      if (order) {
        await supabase.from("orders").update(orderData).eq("id", order.id);
        await supabase.from("order_services").delete().eq("order_id", order.id);
      } else {
        const { data: newOrder } = await supabase.from("orders").insert(orderData).select().single();
        if (!newOrder) throw new Error("Failed to create order");
        
        await supabase.from("order_services").insert(
          selectedServices.map((s) => ({
            order_id: newOrder.id,
            service_id: s.service_id,
            quantity: s.quantity,
            price: s.price,
          }))
        );
      }

      if (order) {
        await supabase.from("order_services").insert(
          selectedServices.map((s) => ({
            order_id: order.id,
            service_id: s.service_id,
            quantity: s.quantity,
            price: s.price,
          }))
        );
      }

      toast.success(order ? t("orders.updated") : t("orders.created"));
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(getSafeErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? t("orders.edit") : t("orders.create")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("orders.client")}</Label>
            <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("orders.selectClient")} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name} - {client.car_model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("orders.status.title")}</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t("orders.status.pending")}</SelectItem>
                <SelectItem value="inProgress">{t("orders.status.inProgress")}</SelectItem>
                <SelectItem value="completed">{t("orders.status.completed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("orders.services")}</Label>
            <Select onValueChange={handleAddService}>
              <SelectTrigger>
                <SelectValue placeholder={t("orders.addService")} />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - ₸{Number(service.price).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-2 mt-2">
              {selectedServices.map((s) => (
                <div key={s.service_id} className="flex items-center gap-2 p-2 bg-secondary rounded">
                  <span className="flex-1">{s.services?.name}</span>
                  <Input
                    type="number"
                    min="1"
                    value={s.quantity}
                    onChange={(e) => handleQuantityChange(s.service_id, parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="w-24 text-right">₸{(Number(s.price) * s.quantity).toLocaleString()}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveService(s.service_id)}>
                    ✕
                  </Button>
                </div>
              ))}
            </div>
            {selectedServices.length > 0 && (
              <div className="text-right font-bold text-lg">
                {t("orders.total")}: ₸{calculateTotal().toLocaleString()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("orders.notes")}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("orders.notesPlaceholder")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
