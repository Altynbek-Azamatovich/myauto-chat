import { useState } from "react";
import { Menu, User, RotateCcw, AlertTriangle, Clock, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import carMainImage from "@/assets/car-main.png";
import logoImage from "@/assets/logo.png";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-8 pb-4">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-muted">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <div className="py-6">
              <h3 className="text-lg font-semibold mb-4">Настройки</h3>
              <div className="space-y-4">
                <Button variant="ghost" className="w-full justify-start">
                  <span>Тема приложения</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span>Настройки уведомлений</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span>Язык</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span>О приложении</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span>Поддержка</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <img src={logoImage} alt="myAuto" className="h-12 w-auto" />

        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-muted">
              <User className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <div className="py-6">
              <h3 className="text-lg font-semibold mb-4">Профиль</h3>
              <div className="space-y-4">
                <Button variant="ghost" className="w-full justify-start">
                  <span>Мои автомобили</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span>История сервиса</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span>Настройки профиля</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span>Выйти</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Car Display */}
      <div className="px-4 py-2">
        <div className="relative">
          <img 
            src={carMainImage} 
            alt="Toyota Camry 2019" 
            className="w-full h-64 object-cover rounded-lg"
          />
          {/* Interactive points */}
          <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </div>
          <div className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </div>
          <div className="absolute bottom-1/4 right-1/4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </div>
          
          {/* 360 button */}
          <div className="absolute bottom-4 right-4">
            <Button size="sm" className="rounded-full bg-white/90 text-foreground hover:bg-white">
              <RotateCcw className="h-4 w-4 mr-1" />
              360°
            </Button>
          </div>
        </div>
      </div>

      {/* Car Info Cards */}
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card rounded-2xl">
            <div className="flex items-start space-x-2">
              <div className="text-muted-foreground">
                <span className="text-2xl">ⓘ</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Toyota Camry 2019</h3>
                <p className="text-sm text-muted-foreground">284 AVB 01</p>
                <div className="mt-2">
                  <p className="text-sm">Пробег</p>
                  <p className="font-semibold">143.450 км</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card rounded-2xl">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">29.07.2025</p>
                  <p className="text-xs text-muted-foreground">Замена масла</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">22.09.2025</p>
                  <p className="text-xs text-muted-foreground">Страховка истекает</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Technical Condition */}
        <Card className="p-4 bg-card rounded-2xl">
          <div className="flex items-center space-x-3">
            <HeartPulse className="h-6 w-6 text-app-green" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Техническое состояние</span>
                <span className="text-2xl font-bold text-app-green">85%</span>
              </div>
              <Progress value={85} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 pb-20">
          <Card className="p-4 bg-card rounded-2xl">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">⚡</div>
              <div>
                <p className="text-xs text-muted-foreground">Средний расход</p>
                <p className="font-semibold">4.5 км/час</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card rounded-2xl">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">📋</div>
              <div>
                <p className="text-xs text-muted-foreground">Следующее ТО</p>
                <p className="font-semibold">16.05.2025</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;