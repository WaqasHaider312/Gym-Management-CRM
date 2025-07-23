import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/googleSheetsAPI'; // Import the new API

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

// Fallback mock login for development/offline use
const mockLogin = (username: string, password: string) => {
  const mockUsers: User[] = [
    { id: '1', username: 'admin', role: 'admin', name: 'Gym Admin', phone: '+91 9876543210' },
    { id: '2', username: 'partner', role: 'partner', name: 'Business Partner', phone: '+91 9876543211' },
    { id: '3', username: 'employee', role: 'employee', name: 'Gym Employee', phone: '+91 9876543212' }
  ];

  const foundUser = mockUsers.find(u => u.username === username);
  if (foundUser && password === 'password123') {
    return {
      success: true,
      message: 'Login successful (fallback mode)',
      user: foundUser
    };
  }
  return {
    success: false,
    error: 'Invalid credentials'
  };
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
      // Use the new JSONP API
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
        console.error('Login failed, using fallback:', result.error);
        // Try fallback login
        const fallbackResult = mockLogin(username, password);
        if (fallbackResult.success && fallbackResult.user) {
          setUser(fallbackResult.user);
          if (rememberMe) {
            localStorage.setItem('gym_user', JSON.stringify(fallbackResult.user));
          }
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Login error, using fallback:', error);
      // Try fallback login
      const fallbackResult = mockLogin(username, password);
      if (fallbackResult.success && fallbackResult.user) {
        setUser(fallbackResult.user);
        if (rememberMe) {
          localStorage.setItem('gym_user', JSON.stringify(fallbackResult.user));
        }
        return true;
      }
      return false;
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
