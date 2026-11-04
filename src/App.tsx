import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { ChatPage } from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useApp();

  return (
    <Routes>
      {/* 
        Root Route:
        - When authenticated: Immediately redirect to /chat. The landing page is never shown.
        - When unauthenticated / logged out: Show LandingPage for signin/signup only.
      */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/chat" replace /> : <LandingPage />}
      />

      {/* Authenticated Application Layout (protected routes) */}
      <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/" replace />}>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback route */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/chat' : '/'} replace />}
      />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
