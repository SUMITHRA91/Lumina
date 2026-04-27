import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import ChatBot from "./pages/ChatBot.tsx";
import Counselor from "./pages/Counselor.tsx";
import EmergencyContacts from "./pages/EmergencyContacts.tsx";
import LivelyTherapy from "./pages/LivelyTherapy.tsx";
import Analytics from "./pages/Analytics.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Logout from "./pages/Logout.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/counselor" element={<Counselor />} />
          <Route path="/contacts" element={<EmergencyContacts />} />
          <Route path="/therapy" element={<LivelyTherapy />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
