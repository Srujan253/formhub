import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import FormBuilder from './pages/FormBuilder';
import FormViewer from './pages/FormViewer';
import PublicFormView from './pages/PublicFormView';
import ResponsesDashboard from './pages/ResponsesDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith('/s/');

  return (
    <div className="min-h-screen">
      {!isPublicRoute && <Navigation />}
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<FormBuilder />} />
            <Route path="/edit/:id" element={<FormBuilder />} />
            <Route path="/form/:id" element={<FormViewer />} />
            <Route path="/s/:token" element={<PublicFormView />} />
            <Route path="/responses/:formId" element={<ResponsesDashboard />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
