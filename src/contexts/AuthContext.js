import { createContext, useContext } from 'react';

// Создаем контекст
const AuthContext = createContext(null);

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Экспортируем контекст для провайдера
export default AuthContext;