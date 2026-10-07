import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { EmergencyAlertModal } from './components/EmergencyAlertModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { CreateRequestPage } from './pages/CreateRequestPage';
import { RequestListPage } from './pages/RequestListPage';
import { RequestDetailPage } from './pages/RequestDetailPage';
import { DonorDirectoryPage } from './pages/DonorDirectoryPage';
import { DonationHistoryPage } from './pages/DonationHistoryPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blood-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <LocationProvider>
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blood-600 selection:text-white">
              {/* Global Floating Notifications & Install Banners */}
              <EmergencyAlertModal />
              <PwaInstallPrompt />

              {/* Main Desktop/Tablet Header */}
              <Navbar />

              {/* Page Content Container */}
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/requests" element={<RequestListPage />} />
                  <Route path="/requests/create" element={<CreateRequestPage />} />
                  <Route path="/requests/:id" element={<RequestDetailPage />} />
                  <Route path="/donors" element={<DonorDirectoryPage />} />

                  {/* Donor Hub */}
                  <Route
                    path="/donor/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['donor', 'admin']}>
                        <DonorDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Donation History */}
                  <Route
                    path="/donations/history"
                    element={
                      <ProtectedRoute allowedRoles={['donor', 'admin']}>
                        <DonationHistoryPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Center */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Footer */}
              <footer className="hidden md:block border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-300">Life<span className="text-blood-500">Link</span></span>
                    <span>• Emergency Blood Donor Coordination</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>MongoDB Geospatial Engine</span>
                    <span>•</span>
                    <span>Socket.IO Real-Time Dispatch</span>
                    <span>•</span>
                    <span>PWA Ready</span>
                  </div>
                </div>
              </footer>

              {/* Native-style Mobile Bottom Navigation (< 768px) */}
              <BottomNav />
            </div>
          </SocketProvider>
        </AuthProvider>
      </LocationProvider>
    </Router>
  );
}
