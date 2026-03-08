import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { ChatProvider } from "@/contexts/ChatContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatWidget } from "@/components/chat/ChatWidget";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
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
import AppLoginPage from "./pages/AppLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminServices from "./pages/admin/AdminServices";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminVeterinarians from "./pages/admin/AdminVeterinarians";
import AdminMessages from "./pages/admin/AdminMessages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
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

                {/* App Routes */}
                <Route path="/app/login" element={<AppLoginPage />} />
                <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="/app/dashboard" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/appointments" element={<ProtectedRoute><AdminLayout><AdminAppointments /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/services" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminServices /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/categories" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminCategories /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/veterinarians" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminVeterinarians /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/messages" element={<ProtectedRoute><AdminLayout><AdminMessages /></AdminLayout></ProtectedRoute>} />

                {/* Legacy redirects */}
                <Route path="/auth" element={<Navigate to="/app/login" replace />} />
                <Route path="/admin/*" element={<Navigate to="/app/dashboard" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <ChatWidget />
          </ChatProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
