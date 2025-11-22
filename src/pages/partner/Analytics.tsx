import { DashboardLayout } from "@/components/partner/DashboardLayout";
import { PageHeader } from "@/components/partner/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Analytics() {
  const { t } = useTranslation();
  
  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title={t("analytics.title")}
          subtitle={t("analytics.subtitle")}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{t("analytics.revenue")}</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">₸842,300</div>
              <p className="text-xs text-muted-foreground">+18.2% {t("analytics.fromPrevMonth")}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{t("analytics.completed")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+12 {t("analytics.lastWeek")}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{t("analytics.newClients")}</CardTitle>
              <Users className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">+8.5% {t("analytics.fromPrevMonth")}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{t("analytics.avgCheck")}</CardTitle>
              <Wrench className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">₸5,400</div>
              <p className="text-xs text-muted-foreground">+3.1% {t("analytics.fromPrevMonth")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">{t("analytics.topServices")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Замена масла", count: 45, revenue: 112500 },
                  { name: "ТО-1", count: 28, revenue: 238000 },
                  { name: "Диагностика", count: 38, revenue: 114000 },
                  { name: "Шиномонтаж", count: 52, revenue: 78000 },
                  { name: "Замена колодок", count: 19, revenue: 57000 },
                ].map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="text-sm md:text-base font-medium">{service.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{service.count} {t("analytics.orders")}</p>
                    </div>
                    <p className="text-sm md:text-base font-semibold text-primary">₸{service.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">{t("analytics.masterWorkload")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Сергей Иванов", orders: 24, efficiency: 92 },
                  { name: "Дмитрий Смирнов", orders: 19, efficiency: 88 },
                  { name: "Андрей Кузнецов", orders: 21, efficiency: 85 },
                ].map((master, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm md:text-base font-medium">{master.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{master.orders} {t("analytics.orders")}</p>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-orange-600"
                        style={{ width: `${master.efficiency}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {t("analytics.efficiency")}: {master.efficiency}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
