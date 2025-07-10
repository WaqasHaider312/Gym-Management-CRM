
import React from 'react';
import { useAuth } from '../components/AuthContext';
import LoginPage from '../components/LoginPage';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Members from '../components/Members';
import Transactions from '../components/Transactions';

const Index = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (location.pathname) {
      case '/':
        return <Dashboard />;
      case '/members':
        return <Members />;
      case '/transactions':
        return <Transactions />;
      case '/expenses':
        return <div className="text-white">Expenses page coming soon...</div>;
      case '/reports':
        return <div className="text-white">Reports page coming soon...</div>;
      case '/analytics':
        return <div className="text-white">Analytics page coming soon...</div>;
      case '/admin':
        return <div className="text-white">Admin panel coming soon...</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

export default Index;
