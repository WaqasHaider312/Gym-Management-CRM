
import React from 'react';
import { useAuth } from '../components/AuthContext';
import LoginPage from '../components/LoginPage';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Members from '../components/Members';
import Transactions from '../components/Transactions';
import Expenses from '../components/Expenses';
import Reports from '../components/Reports';
import Analytics from '../components/Analytics';
import AdminPanel from '../components/AdminPanel';
import WhatsAppNotifications from '../components/WhatsAppNotifications';

const Index = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#f0f4ff] to-[#ffffff] flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-700 text-lg font-medium">Loading your premium dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (location.pathname) {
      case '/':
        return (
          <div className="space-y-8">
            <Dashboard />
            <WhatsAppNotifications />
          </div>
        );
      case '/members':
        return <Members />;
      case '/transactions':
        return <Transactions />;
      case '/expenses':
        return <Expenses />;
      case '/reports':
        return <Reports />;
      case '/analytics':
        return <Analytics />;
      case '/admin':
        return <AdminPanel />;
      case '/whatsapp':
        return <WhatsAppNotifications />;
      default:
        return (
          <div className="space-y-8">
            <Dashboard />
            <WhatsAppNotifications />
          </div>
        );
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

export default Index;
