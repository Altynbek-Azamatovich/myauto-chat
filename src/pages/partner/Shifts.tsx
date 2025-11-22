import { DashboardLayout } from "@/components/partner/DashboardLayout";
import { PageHeader } from "@/components/partner/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Shifts() {
  const { t } = useTranslation();
  const mockShifts = [
    { id: 1, date: "2024-01-15", start: "09:00", end: "18:00", employee: "Сергей Иванов", orders: 8, revenue: 42000 },
    { id: 2, date: "2024-01-14", start: "09:00", end: "18:00", employee: "Дмитрий Смирнов", orders: 6, revenue: 35000 },
    { id: 3, date: "2024-01-13", start: "09:00", end: "17:30", employee: "Андрей Кузнецов", orders: 7, revenue: 38500 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title={t("shifts.title")}
          subtitle={t("shifts.subtitle")}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{t("shifts.perMonth")}</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">{t("shifts.avgDuration")}: 8.5ч</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{t("shifts.ordersProcessed")}</CardTitle>
              <Clock className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">248</div>
              <p className="text-xs text-muted-foreground">{t("shifts.avgPerShift")}: 5.9</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{t("shifts.totalRevenue")}</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">₸842,300</div>
              <p className="text-xs text-muted-foreground">{t("shifts.avgPerShift")}: ₸20,055</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">{t("shifts.history")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Badge className="bg-success/20 text-success border-success/30 text-xs">
                        {t("shifts.completed")}
                      </Badge>
                      <p className="text-sm md:text-base font-semibold text-foreground truncate">{shift.employee}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {shift.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {shift.start} - {shift.end}
                      </span>
                      <span>{shift.orders} {t("analytics.orders")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base md:text-xl font-bold text-primary">₸{shift.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
