import { BrowserRouter, Route, Routes } from "react-router";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { CompleteProfilePage } from "./pages/CompleteProfilePage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ChatsPage } from "./pages/ChatsPage";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider } from "./contexts/auth-context";
import { AppLayout } from "./components/app-layout";
import { Toaster } from "@/components/ui/sonner";

export function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/complete-profile" element={<CompleteProfilePage />} />

            {/* Protected Routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/chats/:id" element={<ChatsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <Toaster />
    </>
  );
}

export default App;
