import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddQuestion from "./pages/host/AddQuestion";
import ViewQuestions from "./pages/host/ViewQuestions";
import HostGame from "./pages/host/HostGame";
import BoardPage from "./pages/board/BoardPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import CreateAccount from "./pages/CreateAccount";
import UpdatePassword from "./pages/UpdatePassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/host"
              element={
                <ProtectedRoute>
                  <ViewQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host/add-question"
              element={
                <ProtectedRoute>
                  <AddQuestion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host/game"
              element={
                <ProtectedRoute>
                  <HostGame />
                </ProtectedRoute>
              }
            />
            <Route path="/board" element={<BoardPage />} />
            <Route
              path="/create-account"
              element={
                <ProtectedRoute>
                  <CreateAccount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update-password"
              element={
                <ProtectedRoute>
                  <UpdatePassword />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
