import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: any;
  onSuccess: () => void;
}

export function ServiceDialog({ open, onOpenChange, service, onSuccess }: ServiceDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    duration_minutes: "",
    is_active: true,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        category: service.category || "",
        price: service.price?.toString() || "",
        duration_minutes: service.duration_minutes?.toString() || "",
        is_active: service.is_active ?? true,
      });
    } else {
      setFormData({
        name: "",
        category: "",
        price: "",
        duration_minutes: "",
        is_active: true,
      });
    }
  }, [service, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error(t("services.validation.required"));
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const serviceData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        is_active: formData.is_active,
        partner_id: session.user.id,
      };

      if (service) {
        await supabase.from("services").update(serviceData).eq("id", service.id);
        toast.success(t("services.updated"));
      } else {
        await supabase.from("services").insert(serviceData);
        toast.success(t("services.created"));
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
          <DialogTitle>{service ? t("services.edit") : t("services.create")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("services.name")}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("services.namePlaceholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t("services.category")}</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("services.categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">{t("services.categories.maintenance")}</SelectItem>
                <SelectItem value="repair">{t("services.categories.repair")}</SelectItem>
                <SelectItem value="diagnostics">{t("services.categories.diagnostics")}</SelectItem>
                <SelectItem value="bodywork">{t("services.categories.bodywork")}</SelectItem>
                <SelectItem value="tires">{t("services.categories.tires")}</SelectItem>
                <SelectItem value="other">{t("services.categories.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("services.price")}</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t("services.duration")}</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                placeholder={t("services.durationPlaceholder")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>{t("services.active")}</Label>
            <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
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
