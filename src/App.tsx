import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TodayAttendance } from './pages/TodayAttendance';
import { Subjects } from './pages/Subjects';
import { SubjectDetails } from './pages/SubjectDetails';
import { Timetable } from './pages/Timetable';
import { Calendar } from './pages/Calendar';
import { WhatIfCalculator } from './pages/WhatIfCalculator';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full border-2 border-primary-container border-t-transparent animate-spin" />
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Loading Attendly...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="today" element={<TodayAttendance />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="subjects/:id" element={<SubjectDetails />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="what-if" element={<WhatIfCalculator />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all fallback */}
      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
};
