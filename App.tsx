import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Matches from './pages/Matches';
import Profile from './pages/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useApp();

  if (loading) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
        </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
    const { currentUser } = useApp();
    
    return (
        <Routes>
            <Route path="/login" element={!currentUser ? <Auth /> : <Navigate to="/feed" replace />} />
            
            <Route path="/feed" element={
                <ProtectedRoute>
                    <Feed />
                </ProtectedRoute>
            } />
            
            <Route path="/matches" element={
                <ProtectedRoute>
                    <Matches />
                </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/feed" replace />} />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;