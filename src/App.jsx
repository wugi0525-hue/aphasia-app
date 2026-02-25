import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Therapy from './pages/Therapy';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Report from './pages/Report';
import GlobalLayout from './components/GlobalLayout';
import Vault from './pages/Vault';
import SplashA from './pages/SplashA';
import SplashB from './pages/SplashB';

import { AuthProvider } from './services/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/splash-a" element={<SplashA />} />
          <Route path="/splash-b" element={<SplashB />} />

          <Route element={<GlobalLayout />}>
            <Route path="/therapy" element={<Therapy />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/report" element={<Report />} />
            <Route path="/vault" element={<Vault />} />
          </Route>

          {/* Default route redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

