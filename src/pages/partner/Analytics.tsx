import { DashboardLayout } from "@/components/partner/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Wrench } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Analytics() {
  const { t } = useLanguage();
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Аналитика</h1>
          <p className="text-muted-foreground mt-1">Статистика и отчёты за период</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Выручка за месяц</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₸842,300</div>
              <p className="text-xs text-muted-foreground">+18.2% от прошлого месяца</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Завершено заказов</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+12 за последнюю неделю</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Новые клиенты</CardTitle>
              <Users className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">+8.5% от прошлого месяца</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
              <Wrench className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₸5,400</div>
              <p className="text-xs text-muted-foreground">+3.1% от прошлого месяца</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Топ-5 услуг</CardTitle>
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
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.count} заказов</p>
                    </div>
                    <p className="font-semibold text-primary">₸{service.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t('masterWorkload')}</CardTitle>
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
                      <p className="font-medium">{master.name}</p>
                      <p className="text-sm text-muted-foreground">{master.orders} заказов</p>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-orange-600"
                        style={{ width: `${master.efficiency}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      Эффективность: {master.efficiency}%
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
