import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SymptomAnalyzer from './pages/SymptomAnalyzer';
import MentalHealth from './pages/MentalHealth';
import Emergency from './pages/Emergency';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Chatbot from './pages/Chatbot';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/symptoms" element={
            <ProtectedRoute>
              <SymptomAnalyzer />
            </ProtectedRoute>
          } />
          <Route path="/chatbot" element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          } />
          <Route path="/mental-health" element={
            <ProtectedRoute>
              <MentalHealth />
            </ProtectedRoute>
          } />
          <Route path="/emergency" element={
            <ProtectedRoute>
              <Emergency />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
