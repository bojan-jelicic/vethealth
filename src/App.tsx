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
import FeatureRoute from "@/components/FeatureRoute";
import { FEATURES } from "@/config/features";
import AdminLayout from "@/components/admin/AdminLayout";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailsPage from "./pages/ServiceDetailsPage";
import PetShopPage from "./pages/PetShopPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
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
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import NotFound from "./pages/NotFound";
import PortalLogin from "./pages/portal/PortalLogin";
import PortalDashboard from "./pages/portal/PortalDashboard";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ChatProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:slug" element={<ServiceDetailsPage />} />
                <Route path="/pet-shop" element={<FeatureRoute flag="publicPetShop"><PetShopPage /></FeatureRoute>} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/zakazivanje-termina" element={<FeatureRoute flag="publicAppointments"><AppointmentPage /></FeatureRoute>} />
                <Route path="/potvrda-zakazivanja" element={<FeatureRoute flag="publicAppointments"><AppointmentConfirmationPage /></FeatureRoute>} />
                <Route path="/cjenovnik-usluga" element={<PriceListPage />} />

                {/* App Routes */}
                <Route path="/app/login" element={<AppLoginPage />} />
                <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="/app/dashboard" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/clients" element={<ProtectedRoute><FeatureRoute flag="adminCRM" redirectTo="/app/dashboard"><AdminLayout><AdminClients /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/clients/:id" element={<ProtectedRoute><FeatureRoute flag="adminCRM" redirectTo="/app/dashboard"><AdminLayout><AdminClientDetail /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/pets" element={<ProtectedRoute><FeatureRoute flag="adminCRM" redirectTo="/app/dashboard"><AdminLayout><AdminPets /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/pets/:id" element={<ProtectedRoute><FeatureRoute flag="adminCRM" redirectTo="/app/dashboard"><AdminLayout><AdminPetDetail /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/visits" element={<ProtectedRoute><FeatureRoute flag="adminCRM" redirectTo="/app/dashboard"><AdminLayout><AdminVisits /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/visits/:id" element={<ProtectedRoute><FeatureRoute flag="adminCRM" redirectTo="/app/dashboard"><AdminLayout><AdminVisitDetail /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/documents" element={<ProtectedRoute><FeatureRoute flag="adminCRM" redirectTo="/app/dashboard"><AdminLayout><AdminDocuments /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/documents/new" element={<ProtectedRoute><FeatureRoute flag="adminCRM" redirectTo="/app/dashboard"><AdminLayout><AdminNewDocument /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/documents/templates" element={<ProtectedRoute allowedRoles={['admin']}><FeatureRoute flag="adminTemplates" redirectTo="/app/dashboard"><AdminLayout><AdminTemplates /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/documents/templates/:id" element={<ProtectedRoute allowedRoles={['admin']}><FeatureRoute flag="adminTemplates" redirectTo="/app/dashboard"><AdminLayout><AdminTemplateEditor /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/pricing" element={<ProtectedRoute><AdminLayout><AdminPricing /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/inventory" element={<ProtectedRoute><FeatureRoute flag="adminInventory" redirectTo="/app/dashboard"><AdminLayout><AdminInventory /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/reminders" element={<ProtectedRoute><FeatureRoute flag="adminReminders" redirectTo="/app/dashboard"><AdminLayout><AdminReminders /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/podsjetnici" element={<ProtectedRoute><FeatureRoute flag="adminReminders" redirectTo="/app/dashboard"><AdminLayout><AdminReminders /></AdminLayout></FeatureRoute></ProtectedRoute>} />
                <Route path="/app/blog" element={<ProtectedRoute><AdminLayout><AdminBlogManager /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/gallery" element={<ProtectedRoute><AdminLayout><AdminGallery /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/messages" element={<ProtectedRoute><AdminLayout><AdminMessages /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
                <Route path="/app/audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminAuditLogs /></AdminLayout></ProtectedRoute>} />

                {/* Client Portal */}
                <Route path="/portal/login" element={<PortalLogin />} />
                <Route path="/portal" element={<PortalDashboard />} />

                {/* Legacy redirects */}
                <Route path="/auth" element={<Navigate to="/app/login" replace />} />
                <Route path="/admin/*" element={<Navigate to="/app/dashboard" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            {FEATURES.publicChat && <ChatWidget />}
          </ChatProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </HelmetProvider>
);

export default App;
