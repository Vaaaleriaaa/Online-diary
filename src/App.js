import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminRoutes from './routes/AdminRoutes';
import StudentRoutes from './routes/StudentRoutes';
import TeacherRoutes from './routes/TeacherRoutes';
import PlayGround from './pages/PlayGround';
import Profile from './pages/Profile';

const RoleRedirect = () => {
  const { user, loading } = useAuth();
    
  if (loading) return <div>Загрузка...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
    
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/schedule" replace />;
    case 'teacher':
      return <Navigate to="/teacher/schedule" replace />;
    case 'student':
      return <Navigate to="/student/schedule" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) return <div>Загрузка...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/schedule" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/schedule" element={<RoleRedirect />} />

          {/* Админ маршруты */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRoutes />
            </ProtectedRoute>
          } />

          {/* Ученик маршруты */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentRoutes />
            </ProtectedRoute>
          } />

          {/* Учитель маршруты */}
          <Route path="/teacher/*" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherRoutes />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/schedule" replace />} />
          <Route path="*" element={<Navigate to="/schedule" replace />} />
          <Route path='/play-ground' element={<PlayGround />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;