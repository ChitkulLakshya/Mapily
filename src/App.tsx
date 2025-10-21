import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Places from "./pages/Places";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

// Query client for react-query
const queryClient = new QueryClient();

// Wrapper to extract category param from URL
import { useParams } from "react-router-dom";
const PlacesWrapper = () => {
  const { category } = useParams<{ category: string }>();
  return <Places category={category} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Home />} />

          {/* Places pages */}
          <Route path="/places" element={<Places />} />
          <Route path="/places/:category" element={<PlacesWrapper />} />

          {/* About page */}
          <Route path="/about" element={<About />} />

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
