import { LayoutDashboard, ClipboardList, Users, Wrench, TrendingUp, Settings, LogOut, Clock } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "../ui/button";
import { toast } from "sonner";
const menuItems = [{
  title: "menu.dashboard",
  url: "/partner/dashboard",
  icon: LayoutDashboard
}, {
  title: "menu.orders",
  url: "/partner/orders",
  icon: ClipboardList
}, {
  title: "menu.clients",
  url: "/partner/clients",
  icon: Users
}, {
  title: "menu.services",
  url: "/partner/services",
  icon: Wrench
}, {
  title: "menu.analytics",
  url: "/partner/analytics",
  icon: TrendingUp
}, {
  title: "menu.shifts",
  url: "/partner/shifts",
  icon: Clock
}, {
  title: "menu.settings",
  url: "/partner/settings",
  icon: Settings
}];
export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const currentPath = location.pathname;
  const handleLogout = async () => {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(t("menu.logout"));
      navigate("/welcome");
    }
  };
  return <Sidebar className="border-r border-border flex flex-col h-screen">
      <SidebarHeader className="border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center rounded-full">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">AutoService</h2>
            <p className="text-xs text-muted-foreground">{t("app.subtitle")}</p>
          </div>
        </div>
      </SidebarHeader>

      <ScrollArea className="flex-1">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("menu.dashboard")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map(item => <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-primary font-medium">
                        <item.icon className="h-5 w-5" />
                        <span>{t(item.title)}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>

      <SidebarFooter className="border-t border-border p-4 flex-shrink-0">
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          <span>{t("menu.logout")}</span>
        </Button>
      </SidebarFooter>
    </Sidebar>;
}