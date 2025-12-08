import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ChatProvider } from "@/contexts/ChatContext";
import { ChatWidget } from "@/components/chat/ChatWidget";
import Index from "./pages/Index";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailsPage from "./pages/ServiceDetailsPage";
import PetShopPage from "./pages/PetShopPage";
import BlogPage from "./pages/BlogPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AppointmentPage from "./pages/AppointmentPage";
import AppointmentConfirmationPage from "./pages/AppointmentConfirmationPage";
import PriceListPage from "./pages/PriceListPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChatProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:slug" element={<ServiceDetailsPage />} />
              <Route path="/pet-shop" element={<PetShopPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/zakazivanje-termina" element={<AppointmentPage />} />
              <Route path="/potvrda-zakazivanja" element={<AppointmentConfirmationPage />} />
              <Route path="/cjenovnik-usluga" element={<PriceListPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <ChatWidget />
        </ChatProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
