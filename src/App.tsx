import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Lazy-loaded routes — only downloaded when first visited
const IndexV1 = lazy(() => import("./components/v1/IndexV1"));
const AddQuestion = lazy(() => import("./pages/host/AddQuestion"));
const ViewQuestions = lazy(() => import("./pages/host/ViewQuestions"));
const HostGame = lazy(() => import("./pages/host/HostGame"));
const BoardPage = lazy(() => import("./pages/board/BoardPage"));
const CreateAccount = lazy(() => import("./pages/CreateAccount"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));

const queryClient = new QueryClient();

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg flex items-center justify-center">
      <p className="game-board-font text-primary-foreground text-2xl">
        Loading...
      </p>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route
              path="/v1"
              element={
                <ProtectedRoute>
                  <IndexV1 />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/host"
              element={
                <ProtectedRoute>
                  <HostGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host/view-questions"
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
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
