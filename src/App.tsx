import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MaintenancePage from "./pages/MaintenancePage";
import ProfessionalHomePage from "./pages/professional/ProfessionalHomePage";
import RegisterConsultationPage from "./pages/professional/RegisterConsultationPage";
import SchedulingPage from "./pages/professional/SchedulingPage";
import PrivatePatientsPage from "./pages/professional/PrivatePatientsPage";
import MedicalRecordsPage from "./pages/professional/MedicalRecordsPage";
import DocumentsPage from "./pages/professional/DocumentsPage";
import ProfessionalReportsPage from "./pages/professional/ProfessionalReportsPage";
import ProfessionalProfilePage from "./pages/professional/ProfessionalProfilePage";
import AdminHomePage from "./pages/admin/AdminHomePage";
import ManageUsersPage from "./pages/admin/ManageUsersPage";
import SubscriptionExpiredPage from "./pages/SubscriptionExpiredPage";

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user, isAuthenticated, hasActiveSubscription } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role === 'professional' && !hasActiveSubscription) {
    return <Navigate to="/subscription-expired" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'professional') {
      return <Navigate to="/professional" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">LUME</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/manutencao" element={<MaintenancePage />} />
      <Route path="/" element={<LoginPage />} />
      <Route path="/subscription-expired" element={<SubscriptionExpiredPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["professional"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/professional" element={<ProfessionalHomePage />} />
        <Route path="/professional/scheduling" element={<SchedulingPage />} />
        <Route path="/professional/private-patients" element={<PrivatePatientsPage />} />
        <Route path="/professional/medical-records" element={<MedicalRecordsPage />} />
        <Route path="/professional/documents" element={<DocumentsPage />} />
        <Route path="/professional/reports" element={<ProfessionalReportsPage />} />
        <Route path="/professional/profile" element={<ProfessionalProfilePage />} />
        <Route
          path="/professional/register-consultation"
          element={<RegisterConsultationPage />}
        />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/admin/professionals" element={<ManageUsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
