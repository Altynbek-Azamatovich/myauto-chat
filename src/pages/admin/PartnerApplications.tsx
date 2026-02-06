import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface PartnerApplication {
  id: string;
  phone_number: string;
  full_name: string;
  business_name: string | null;
  business_description: string | null;
  city: string | null;
  status: string;
  created_at: string;
  notes: string | null;
  partner_login: string | null;
}

const PartnerApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/phone-auth");
        return;
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast.error("Доступ запрещен");
        navigate("/");
        return;
      }

      await fetchApplications();
    } catch (error) {
      console.error("Error checking admin:", error);
      navigate("/");
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("partner_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Ошибка загрузки заявок");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp || !password) {
      toast.error("Введите пароль для партнера");
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-partner-account", {
        body: {
          applicationId: selectedApp.id,
          password: password,
        },
      });

      if (error) throw error;

      toast.success("Партнерский аккаунт успешно создан!");
      setShowApproveDialog(false);
      setPassword("");
      setSelectedApp(null);
      await fetchApplications();
    } catch (error: any) {
      console.error("Error approving application:", error);
      toast.error(error.message || "Ошибка при создании аккаунта");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("partner_applications")
        .update({
          status: "rejected",
          notes: (selectedApp.notes || "") + `\nОтклонено: ${rejectNotes}`,
        })
        .eq("id", selectedApp.id);

      if (error) throw error;

      toast.success("Заявка отклонена");
      setShowRejectDialog(false);
      setRejectNotes("");
      setSelectedApp(null);
      await fetchApplications();
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("Ошибка при отклонении заявки");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "default",
      approved: "secondary",
      rejected: "destructive",
    };

    const labels: Record<string, string> = {
      pending: "На рассмотрении",
      approved: "Одобрено",
      rejected: "Отклонено",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Заявки партнеров</h1>
        </div>

        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {app.full_name}
                    </CardTitle>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>📱 {app.phone_number}</p>
                      {app.business_name && <p>🏢 {app.business_name}</p>}
                      {app.city && <p>📍 {app.city}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(app.status)}
                    <p className="text-xs text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.business_description && (
                  <div>
                    <Label className="text-sm font-medium">Описание бизнеса:</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {app.business_description}
                    </p>
                  </div>
                )}
                {app.notes && (
                  <div>
                    <Label className="text-sm font-medium">Заметки:</Label>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                      {app.notes}
                    </p>
                  </div>
                )}
                {app.partner_login && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <Label className="text-sm font-medium">Данные для входа:</Label>
                    <p className="text-sm mt-1">
                      Логин: <span className="font-mono">{app.partner_login}</span>
                    </p>
                  </div>
                )}
                {app.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => {
                        setSelectedApp(app);
                        setShowApproveDialog(true);
                      }}
                      className="flex-1"
                      size="sm"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Одобрить
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedApp(app);
                        setShowRejectDialog(true);
                      }}
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отклонить
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {applications.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Нет заявок для отображения
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Одобрить заявку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Будет создан аккаунт партнера для: <strong>{selectedApp?.full_name}</strong>
              </p>
              <Label htmlFor="password">Установите пароль для партнера</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Минимум 6 символов. Партнер сможет войти с номером телефона и этим паролем.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setPassword("");
              }}
              disabled={isProcessing}
            >
              Отмена
            </Button>
            <Button
              onClick={handleApprove}
              disabled={!password || password.length < 6 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                "Создать аккаунт"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить заявку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejectNotes">Причина отклонения (необязательно)</Label>
              <Textarea
                id="rejectNotes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Укажите причину отклонения"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectNotes("");
              }}
              disabled={isProcessing}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Отклонение...
                </>
              ) : (
                "Отклонить"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerApplications;