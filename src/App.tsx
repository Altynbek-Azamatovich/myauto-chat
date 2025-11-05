import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/phone-auth" element={<PhoneAuth />} />
            <Route path="/otp-verify" element={<OTPVerify />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/photo-diagnostic" element={<PhotoDiagnostic />} />
            <Route path="/super-chat" element={<SuperChat />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNavigation />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
