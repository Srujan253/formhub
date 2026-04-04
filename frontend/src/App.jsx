import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import FormBuilder from './pages/FormBuilder';
import FormViewer from './pages/FormViewer';
import PublicFormView from './pages/PublicFormView';
import ResponsesDashboard from './pages/ResponsesDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PendingReview from './pages/PendingReview';
import NotFoundPage from './pages/NotFoundPage';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith('/s/') || location.pathname === '/404' || location.pathname === '/pending';

  return (
    <div className="min-h-screen">
      {!isPublicRoute && <Navigation />}
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pending" element={<PendingReview />} />
            <Route path="/404" element={<NotFoundPage />} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdminPanel /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><FormBuilder /></ProtectedRoute>} />
            <Route path="/edit/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><FormBuilder /></ProtectedRoute>} />
            <Route path="/form/:id" element={<ProtectedRoute><FormViewer /></ProtectedRoute>} />
            <Route path="/s/:token" element={<PublicFormView />} />
            <Route path="/responses/:formId" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}><ResponsesDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('appName') + " — " + t('appSubtitle', 'Modern Form Builder');
  }, [t, i18n.language]);

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
