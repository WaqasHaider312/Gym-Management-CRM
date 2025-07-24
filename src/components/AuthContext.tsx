import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/googleSheetsAPI'; // Keep this import

interface User {
  id: string;
  username: string;
  role: 'admin' | 'partner' | 'employee';
  name: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('gym_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('gym_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean): Promise<boolean> => {
    try {
      const result = await authAPI.login(username, password);
      
      if (result.success && result.user) {
        const userData: User = {
          id: result.user.id,
          username: result.user.username,
          role: result.user.role,
          name: result.user.name,
          phone: result.user.phone
        };
        
        setUser(userData);
        
        if (rememberMe) {
          localStorage.setItem('gym_user', JSON.stringify(userData));
        }
        
        return true;
      } else {
        console.error('Login failed:', result.error);
        return false; // No fallback - must use real Google Sheets
      }
    } catch (error) {
      console.error('Login error:', error);
      return false; // Force real authentication only
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gym_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};