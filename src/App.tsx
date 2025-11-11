import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Welcome from "./pages/Welcome";
import PhoneAuth from "./pages/PhoneAuth";
import ForgotPassword from "./pages/ForgotPassword";
import ProfileSetup from "./pages/ProfileSetup";
import ServiceHistory from "./pages/ServiceHistory";
import MyVehicles from "./pages/MyVehicles";
import ServiceBooking from "./pages/ServiceBooking";
import ProfileSettings from "./pages/ProfileSettings";
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

const AppContent = () => {
  const location = useLocation();
  const hideNavigation = ['/welcome', '/phone-auth', '/forgot-password', '/profile-setup', '/about-app', '/notification-settings', '/my-vehicles', '/service-history', '/profile-settings', '/notifications', '/service-cart', '/service-booking'].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/phone-auth" element={<PhoneAuth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/my-vehicles" element={<MyVehicles />} />
        <Route path="/service-history" element={<ServiceHistory />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/photo-diagnostic" element={<PhotoDiagnostic />} />
        <Route path="/super-chat" element={<SuperChat />} />
        <Route path="/about-app" element={<AboutApp />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/service-cart" element={<ServiceCart />} />
        <Route path="/service-booking" element={<ServiceBooking />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideNavigation && <BottomNavigation />}
    </>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
