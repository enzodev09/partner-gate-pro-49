import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInfluencers from "./pages/AdminInfluencers";
import AdminFinancial from "./pages/AdminFinancial";
import WithdrawStart from "./pages/withdraw/Start";
import WithdrawMethod from "./pages/withdraw/Method";
import WithdrawPix from "./pages/withdraw/Pix";
import WithdrawConfirmed from "./pages/withdraw/Confirmed";
import { WithdrawProvider } from "./features/withdraw/WithdrawContext";
// DebugSupabase removido

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WithdrawProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<InfluencerDashboard />} />
            <Route path="/dashboard/withdraw" element={<WithdrawStart />} />
            <Route path="/dashboard/withdraw/method" element={<WithdrawMethod />} />
            <Route path="/dashboard/withdraw/pix" element={<WithdrawPix />} />
            <Route path="/dashboard/withdraw/confirmed" element={<WithdrawConfirmed />} />
            {/** rota de debug removida **/}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/financial" element={<AdminFinancial />} />
            <Route path="/admin/influencers" element={<AdminInfluencers />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </WithdrawProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
