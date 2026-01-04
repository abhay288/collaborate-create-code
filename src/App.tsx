import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load pages for better performance
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Profile = lazy(() => import("./pages/Profile"));
const Quiz = lazy(() => import("./pages/Quiz"));
const QuizResults = lazy(() => import("./pages/QuizResults"));
const MyResults = lazy(() => import("./pages/MyResults"));
const RecommendedColleges = lazy(() => import("./pages/RecommendedColleges"));
const RecommendedCourses = lazy(() => import("./pages/RecommendedCourses"));
const Careers = lazy(() => import("./pages/Careers"));
const Colleges = lazy(() => import("./pages/Colleges"));
const Scholarships = lazy(() => import("./pages/Scholarships"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Public static pages
const About = lazy(() => import("./pages/static/About"));
const Features = lazy(() => import("./pages/static/Features"));
const Contact = lazy(() => import("./pages/static/Contact"));
const HelpCenter = lazy(() => import("./pages/static/HelpCenter"));
const PrivacyPolicy = lazy(() => import("./pages/static/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/static/TermsOfService"));

// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageColleges = lazy(() => import("./pages/admin/ManageColleges"));
const ManageScholarships = lazy(() => import("./pages/admin/ManageScholarships"));
const ManageCareers = lazy(() => import("./pages/admin/ManageCareers"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const ManageVerifiedScholarships = lazy(() => import("./pages/admin/ManageVerifiedScholarships"));
const ManageVerifiedJobs = lazy(() => import("./pages/admin/ManageVerifiedJobs"));
const ManageQuizQuestions = lazy(() => import("./pages/admin/ManageQuizQuestions"));
const ManageFAQs = lazy(() => import("./pages/admin/ManageFAQs"));
const ManageNGOs = lazy(() => import("./pages/admin/ManageNGOs"));
const FeedbackAnalytics = lazy(() => import("./pages/admin/FeedbackAnalytics"));

// Public pages
const NGOs = lazy(() => import("./pages/NGOs"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Public static pages */}
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
              <Route path="/quiz/results" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
              <Route path="/my-result" element={<ProtectedRoute><MyResults /></ProtectedRoute>} />
              <Route path="/recommended-colleges" element={<ProtectedRoute><RecommendedColleges /></ProtectedRoute>} />
              <Route path="/recommended-courses" element={<ProtectedRoute><RecommendedCourses /></ProtectedRoute>} />
              <Route path="/careers" element={<ProtectedRoute><Careers /></ProtectedRoute>} />
              <Route path="/colleges" element={<ProtectedRoute><Colleges /></ProtectedRoute>} />
              <Route path="/scholarships" element={<ProtectedRoute><Scholarships /></ProtectedRoute>} />
              <Route path="/ngos" element={<NGOs />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/colleges" element={<AdminRoute><ManageColleges /></AdminRoute>} />
              <Route path="/admin/scholarships" element={<AdminRoute><ManageScholarships /></AdminRoute>} />
              <Route path="/admin/careers" element={<AdminRoute><ManageCareers /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
              <Route path="/admin/verified-scholarships" element={<AdminRoute><ManageVerifiedScholarships /></AdminRoute>} />
              <Route path="/admin/verified-jobs" element={<AdminRoute><ManageVerifiedJobs /></AdminRoute>} />
              <Route path="/admin/quiz-questions" element={<AdminRoute><ManageQuizQuestions /></AdminRoute>} />
              <Route path="/admin/faqs" element={<AdminRoute><ManageFAQs /></AdminRoute>} />
              <Route path="/admin/ngos" element={<AdminRoute><ManageNGOs /></AdminRoute>} />
              <Route path="/admin/feedback-analytics" element={<AdminRoute><FeedbackAnalytics /></AdminRoute>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
