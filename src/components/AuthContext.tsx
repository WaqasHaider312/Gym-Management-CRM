
import React, { createContext, useContext, useState, useEffect } from 'react';

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

// Mock users for demonstration
const mockUsers: User[] = [
  { id: '1', username: 'admin', role: 'admin', name: 'Gym Admin', phone: '+91 9876543210' },
  { id: '2', username: 'partner', role: 'partner', name: 'Business Partner', phone: '+91 9876543211' },
  { id: '3', username: 'employee', role: 'employee', name: 'Gym Employee', phone: '+91 9876543212' }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('gym_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    // Mock authentication logic
    const foundUser = mockUsers.find(u => u.username === username);
    if (foundUser && password === 'password123') {
      setUser(foundUser);
      if (rememberMe) {
        localStorage.setItem('gym_user', JSON.stringify(foundUser));
      }
      return true;
    }
    return false;
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
