import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, debugAPI } from '@/services/googleSheetsAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  IndianRupee, 
  Receipt, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  UserPlus,
  CreditCard,
  FileText
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from Google Sheets
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const result = await dashboardAPI.getStats();
        if (result.success) {
          setStats(result.stats);
        } else {
          console.error('Failed to fetch dashboard stats:', result.error);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const dashboardCards = [
    {
      title: 'Total Active Members',
      value: isLoading ? 'Loading...' : stats.activeMembers.toString(),
      change: isLoading ? '' : `${stats.totalMembers} total members`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      trend: 'up'
    },
    {
      title: 'Monthly Revenue',
      value: isLoading ? 'Loading...' : `Rs.${stats.totalRevenue.toLocaleString()}`,
      change: isLoading ? '' : (stats.netProfit >= 0 ? 'Profitable' : 'Needs attention'),
      icon: IndianRupee,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
      trend: stats.netProfit >= 0 ? 'up' : 'down'
    },
    {
      title: 'Total Expenses',
      value: isLoading ? 'Loading...' : `Rs.${stats.totalExpenses.toLocaleString()}`,
      change: 'This month',
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
      trend: 'neutral'
    },
    {
      title: 'Net Profit',
      value: isLoading ? 'Loading...' : `Rs.${stats.netProfit.toLocaleString()}`,
      change: 'Revenue - Expenses',
      icon: stats.netProfit >= 0 ? TrendingUp : TrendingDown,
      color: stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.netProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      trend: stats.netProfit >= 0 ? 'up' : 'down'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Member',
      description: 'Register a new gym member',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => navigate('/members')
    },
    {
      title: 'Record Payment',
      description: 'Add membership payment',
      icon: CreditCard,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => navigate('/transactions')
    },
    {
      title: 'Add Expense',
      description: 'Record gym expenses',
      icon: FileText,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => navigate('/expenses')
    }
  ];

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">

      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="animate-in slide-in-from-left-5 duration-300">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Here's what's happening at RangeFitGym today
          </p>
        </div>
        <div className="flex justify-start sm:justify-end animate-in slide-in-from-right-5 duration-300">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <span className="xs:hidden">
              {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </Badge>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {dashboardCards.map((card, index) => (
          <Card 
            key={index} 
            className="glass-card border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-1.5 sm:p-2 rounded-lg`}>
                <card.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3 sm:pb-4 px-3 sm:px-4">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-0.5 sm:mb-1">
                {card.value}
              </div>
              <p className="text-xs text-gray-500 flex items-center">
                {card.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500 mr-1" />}
                {card.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500 mr-1" />}
                {card.trend === 'neutral' && <Activity className="w-3 h-3 text-gray-400 mr-1" />}
                {card.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {quickActions.map((action, index) => (
          <Card 
            key={index}
            className="glass-card border-white/40 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            onClick={action.onClick}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Section */}
      <Card className="glass-card border-white/40">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Business Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Active Members</h4>
              <p className="text-2xl font-bold text-blue-600">
                {isLoading ? 'Loading...' : stats.activeMembers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isLoading ? '' : `Out of ${stats.totalMembers} total`}
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Monthly Revenue</h4>
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? 'Loading...' : `Rs.${stats.totalRevenue.toLocaleString()}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            
            <div className={`text-center p-4 rounded-lg ${stats.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Net Profit</h4>
              <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {isLoading ? 'Loading...' : `Rs.${stats.netProfit.toLocaleString()}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.netProfit >= 0 ? 'Profitable' : 'Review expenses'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card className="glass-card border-white/40">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {stats.totalMembers} members registered in the system
                </p>
                <p className="text-xs text-gray-500">
                  {stats.activeMembers} currently active
                </p>
              </div>
            </div>
            
            {stats.totalRevenue > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Revenue: Rs.{stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    From membership payments
                  </p>
                </div>
              </div>
            )}
            
            {stats.totalExpenses > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Expenses: Rs.{stats.totalExpenses.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Monthly operational costs
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;