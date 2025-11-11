import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: any;
  onSuccess: () => void;
}

export function ClientDialog({ open, onOpenChange, client, onSuccess }: ClientDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    car_model: "",
    car_number: "",
    notes: "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        full_name: client.full_name || "",
        phone: client.phone || "",
        car_model: client.car_model || "",
        car_number: client.car_number || "",
        notes: client.notes || "",
      });
    } else {
      setFormData({
        full_name: "",
        phone: "",
        car_model: "",
        car_number: "",
        notes: "",
      });
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) {
      toast.error(t("clients.validation.required"));
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const clientData = {
        ...formData,
        partner_id: session.user.id,
      };

      if (client) {
        await supabase.from("clients").update(clientData).eq("id", client.id);
        toast.success(t("clients.updated"));
      } else {
        await supabase.from("clients").insert(clientData);
        toast.success(t("clients.created"));
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? t("clients.edit") : t("clients.create")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("clients.fullName")}</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder={t("clients.fullNamePlaceholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t("clients.phone")}</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (___) ___-__-__"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t("clients.carModel")}</Label>
            <Input
              value={formData.car_model}
              onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
              placeholder={t("clients.carModelPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("clients.carNumber")}</Label>
            <Input
              value={formData.car_number}
              onChange={(e) => setFormData({ ...formData, car_number: e.target.value })}
              placeholder="A 123 BC 01"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("clients.notes")}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("clients.notesPlaceholder")}
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
