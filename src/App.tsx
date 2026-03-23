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
import AdminClients from "./pages/admin/AdminClients";
import AdminClientDetail from "./pages/admin/AdminClientDetail";
import AdminPets from "./pages/admin/AdminPets";
import AdminPetDetail from "./pages/admin/AdminPetDetail";
import AdminVisits from "./pages/admin/AdminVisits";
import AdminVisitDetail from "./pages/admin/AdminVisitDetail";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminTemplates from "./pages/admin/AdminTemplates";
import AdminTemplateEditor from "./pages/admin/AdminTemplateEditor";
import AdminNewDocument from "./pages/admin/AdminNewDocument";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminReminders from "./pages/admin/AdminReminders";
import AdminBlogManager from "./pages/admin/AdminBlogManager";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMessages from "./pages/admin/AdminMessages";
import NotFound from "./pages/NotFound";
import PortalLogin from "./pages/portal/PortalLogin";
import PortalDashboard from "./pages/portal/PortalDashboard";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ChatProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
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
                <Route path="/app/clients" element={<ProtectedRoute><AdminLayout><AdminClients /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/clients/:id" element={<ProtectedRoute><AdminLayout><AdminClientDetail /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/pets" element={<ProtectedRoute><AdminLayout><AdminPets /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/pets/:id" element={<ProtectedRoute><AdminLayout><AdminPetDetail /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/visits" element={<ProtectedRoute><AdminLayout><AdminVisits /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/visits/:id" element={<ProtectedRoute><AdminLayout><AdminVisitDetail /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/documents" element={<ProtectedRoute><AdminLayout><AdminDocuments /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/documents/new" element={<ProtectedRoute><AdminLayout><AdminNewDocument /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/documents/templates" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminTemplates /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/documents/templates/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminTemplateEditor /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/pricing" element={<ProtectedRoute><AdminLayout><AdminPricing /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/inventory" element={<ProtectedRoute><AdminLayout><AdminInventory /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/reminders" element={<ProtectedRoute><AdminLayout><AdminReminders /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/podsjetnici" element={<ProtectedRoute><AdminLayout><AdminReminders /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/blog" element={<ProtectedRoute><AdminLayout><AdminBlogManager /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/gallery" element={<ProtectedRoute><AdminLayout><AdminGallery /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/messages" element={<ProtectedRoute><AdminLayout><AdminMessages /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />

                {/* Client Portal */}
                <Route path="/portal/login" element={<PortalLogin />} />
                <Route path="/portal" element={<PortalDashboard />} />

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
  </HelmetProvider>
);

export default App;
