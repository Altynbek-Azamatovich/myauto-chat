import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smartphone } from "lucide-react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { CartProvider } from "./contexts/CartContext";
import { DevModeProvider } from "./contexts/DevModeContext";
import Welcome from "./pages/Welcome";
import PhoneAuth from "./pages/PhoneAuth";
import OTPVerify from "./pages/OTPVerify";
import ProfileSetup from "./pages/ProfileSetup";
import ServiceHistory from "./pages/ServiceHistory";
import MyVehicles from "./pages/MyVehicles";
import ServiceBooking from "./pages/ServiceBooking";
import ProfileSettings from "./pages/ProfileSettings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DeleteAccountRequest from "./pages/DeleteAccountRequest";
import Home from "./pages/Home";
import Services from "./pages/Services";
import PhotoDiagnostic from "./pages/PhotoDiagnostic";
import SuperChat from "./pages/SuperChat";
import AboutApp from "./pages/AboutApp";
import NotificationSettings from "./pages/NotificationSettings";
import Notifications from "./pages/Notifications";
import ServiceCart from "./pages/ServiceCart";
import BottomNavigation from "./components/BottomNavigation";
import NotFound from "./pages/NotFound";
import RoadsideHelp from "./pages/RoadsideHelp";
import AutoForum from "./pages/AutoForum";
import AutoShops from "./pages/AutoShops";
import Detailing from "./pages/Detailing";
import PaintShop from "./pages/PaintShop";
import PartsDismantling from "./pages/PartsDismantling";
import CarWash from "./pages/CarWash";
import PartsCatalog from "./pages/PartsCatalog";
import NewsPage from "./pages/NewsPage";
import Showroom3D from "./pages/Showroom3D";
import Car360View from "./pages/Car360View";
import Car3DModel from "./pages/Car3DModel";
import TuningCategory from "./pages/TuningCategory";
import Landing from "./pages/Landing";
import LegalPrivacy from "./pages/legal/Privacy";
import LegalTerms from "./pages/legal/Terms";
import LegalOffer from "./pages/legal/Offer";
import LegalLicense from "./pages/legal/License";
import LegalPayments from "./pages/legal/Payments";
import InfoPlaceholder from "./pages/InfoPlaceholder";

// Partner Pages
import PartnerDashboard from "./pages/partner/Dashboard";
import PartnerOrders from "./pages/partner/Orders";
import PartnerClients from "./pages/partner/Clients";
import PartnerServices from "./pages/partner/Services";
import PartnerAnalytics from "./pages/partner/Analytics";
import PartnerShifts from "./pages/partner/Shifts";
import PartnerSettings from "./pages/partner/Settings";
import PendingVerification from "./pages/partner/PendingVerification";

// Admin Pages
import PartnerApplications from "./pages/admin/PartnerApplications";
import AuditLogs from "./pages/admin/AuditLogs";

const AppContent = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';
  const hideNavigation = [
    '/',
    '/welcome', 
    '/phone-auth', 
    '/otp-verify',
    '/profile-setup', 
    '/about-app',
    '/notification-settings', 
    '/my-vehicles', 
    '/service-history', 
    '/profile-settings', 
    '/notifications', 
    '/service-cart', 
    '/service-booking',
    '/car-360-view',
    '/car-3d-model',
    '/partner/pending-verification',
    '/privacy-policy',
    '/terms-of-service',
    '/delete-account-request',
    '/landing',
    '/privacy',
    '/terms',
    '/offer',
    '/license',
    '/payments'
  ].includes(location.pathname) || location.pathname.startsWith('/tuning/');
  
  const isPartnerRoute = location.pathname.startsWith('/partner');

  return (
    <>
      {!isMobile && !isPartnerRoute && !isLandingPage && (
        <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none">
          <div className="max-w-7xl mx-auto flex justify-between items-start px-4">
            <Alert className="w-64 pointer-events-auto border-primary/20 bg-primary/5 shadow-lg">
              <Smartphone className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Это приложение оптимизировано для мобильных устройств
              </AlertDescription>
            </Alert>
            <Alert className="w-64 pointer-events-auto border-primary/20 bg-primary/5 shadow-lg">
              <Smartphone className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Для лучшего опыта откройте в мобильном браузере
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
      <div className={(isPartnerRoute || isLandingPage) ? "w-full min-h-screen bg-background relative" : "w-full max-w-md mx-auto shadow-2xl min-h-screen bg-background relative"}>
      <Routes>
        {/* Landing Page — default */}
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        
        {/* Auth & Onboarding */}
        <Route path="/welcome" element={<Welcome />} />

        {/* User Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/photo-diagnostic" element={<PhotoDiagnostic />} />
        <Route path="/super-chat" element={<SuperChat />} />
        <Route path="/my-vehicles" element={<MyVehicles />} />
        <Route path="/service-history" element={<ServiceHistory />} />
        <Route path="/service-booking" element={<ServiceBooking />} />
        <Route path="/service-cart" element={<ServiceCart />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
        <Route path="/about-app" element={<AboutApp />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/delete-account-request" element={<DeleteAccountRequest />} />
        
        {/* Service Pages */}
        <Route path="/roadside-help" element={<RoadsideHelp />} />
        <Route path="/auto-forum" element={<AutoForum />} />
        <Route path="/auto-shops" element={<AutoShops />} />
        <Route path="/detailing" element={<Detailing />} />
        <Route path="/paint-shop" element={<PaintShop />} />
        <Route path="/parts-dismantling" element={<PartsDismantling />} />
        <Route path="/car-wash" element={<CarWash />} />
        <Route path="/parts-catalog" element={<PartsCatalog />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/showroom-3d" element={<Showroom3D />} />
        <Route path="/car-360-view" element={<Car360View />} />
        <Route path="/car-3d-model" element={<Car3DModel />} />
        <Route path="/tuning/:categoryId" element={<TuningCategory />} />
        
        {/* Partner Routes */}
        <Route path="/partner/pending-verification" element={<PendingVerification />} />
        <Route path="/partner/dashboard" element={<PartnerDashboard />} />
        <Route path="/partner/orders" element={<PartnerOrders />} />
        <Route path="/partner/clients" element={<PartnerClients />} />
        <Route path="/partner/services" element={<PartnerServices />} />
        <Route path="/partner/analytics" element={<PartnerAnalytics />} />
        <Route path="/partner/shifts" element={<PartnerShifts />} />
        <Route path="/partner/settings" element={<PartnerSettings />} />
        
        {/* Admin Routes */}
        <Route path="/admin/partner-applications" element={<PartnerApplications />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />

        {/* Legal Documents */}
        <Route path="/privacy" element={<LegalPrivacy />} />
        <Route path="/terms" element={<LegalTerms />} />
        <Route path="/offer" element={<LegalOffer />} />
        <Route path="/license" element={<LegalLicense />} />
        <Route path="/payments" element={<LegalPayments />} />
        <Route path="/info/:slug" element={<InfoPlaceholder />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideNavigation && !isPartnerRoute && <BottomNavigation />}
      </div>
    </>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <DevModeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <NotificationProvider>
                <CartProvider>
                  <AppContent />
                </CartProvider>
              </NotificationProvider>
            </BrowserRouter>
          </TooltipProvider>
        </DevModeProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
