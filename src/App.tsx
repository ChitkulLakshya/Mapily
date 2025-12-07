import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MobileView from "./pages/MobileView";
import Places from "./pages/Places";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

// Query client for react-query
const queryClient = new QueryClient();

// Device detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Wrapper to extract category param from URL
import { useParams } from "react-router-dom";
const PlacesWrapper = () => {
  const { category } = useParams<{ category?: string }>();
  // We're not passing category to Places component as it doesn't accept it
  return <Places />;
};

// Mobile redirect component
const MobileRedirect = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect on initial load and if not already on mobile view
    if (isMobile && location.pathname !== '/mobileview' && !location.pathname.startsWith('/mobileview')) {
      // Store the original path to redirect back after mobile view
      if (location.pathname !== '/') {
        sessionStorage.setItem('mobileRedirectPath', location.pathname);
      }
      navigate('/mobileview', { replace: true });
    } else if (!isMobile && location.pathname === '/mobileview') {
      // Redirect back to home if on desktop and viewing mobile page
      const savedPath = sessionStorage.getItem('mobileRedirectPath') || '/';
      sessionStorage.removeItem('mobileRedirectPath');
      navigate(savedPath, { replace: true });
    }
  }, [isMobile, location.pathname, navigate]);

  return null;
};

// Protected route wrapper for desktop
const DesktopRoute = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const location = useLocation();

  if (isMobile && location.pathname !== '/mobileview') {
    return <Navigate to="/mobileview" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MobileRedirect />
        <Navbar />
        <Routes>
          {/* Mobile view */}
          <Route path="/mobileview" element={<MobileView />} />

          {/* Home page - desktop only */}
          <Route path="/" element={
            <DesktopRoute>
              <Home />
            </DesktopRoute>
          } />

          {/* Places pages - desktop only */}
          <Route path="/places" element={
            <DesktopRoute>
              <Places />
            </DesktopRoute>
          } />
          <Route path="/places/:category" element={
            <DesktopRoute>
              <PlacesWrapper />
            </DesktopRoute>
          } />

          {/* About page - desktop only */}
          <Route path="/about" element={
            <DesktopRoute>
              <About />
            </DesktopRoute>
          } />

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
