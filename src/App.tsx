import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Welcome from "./pages/Welcome";
import PhoneAuth from "./pages/PhoneAuth";
import OTPVerify from "./pages/OTPVerify";
import ProfileSetup from "./pages/ProfileSetup";
import Home from "./pages/Home";
import Services from "./pages/Services";
import PhotoDiagnostic from "./pages/PhotoDiagnostic";
import SuperChat from "./pages/SuperChat";
import BottomNavigation from "./components/BottomNavigation";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  const location = useLocation();
  const hideNavigation = ['/welcome', '/phone-auth', '/otp-verify', '/profile-setup'].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/phone-auth" element={<PhoneAuth />} />
        <Route path="/otp-verify" element={<OTPVerify />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/photo-diagnostic" element={<PhotoDiagnostic />} />
        <Route path="/super-chat" element={<SuperChat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideNavigation && <BottomNavigation />}
    </>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
