import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, membersAPI, transactionsAPI, expensesAPI, activityLogsAPI } from '@/services/googleSheetsAPI';
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
  FileText,
  RefreshCw,
  Clock,
  Phone,
  MessageSquare
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
  const [recentActivity, setRecentActivity] = useState([]);
  const [expiringMembers, setExpiringMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch all dashboard data
  const fetchDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      // Fetch dashboard stats
      const statsResult = await dashboardAPI.getStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }

      // Fetch recent activity
      const activityResult = await activityLogsAPI.getAll();
      if (activityResult.success) {
        setRecentActivity(activityResult.logs.slice(0, 5)); // Last 5 activities
      }

      // Fetch expiring memberships
      const membersResult = await membersAPI.getAll();
      if (membersResult.success) {
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        const expiring = membersResult.members.filter(member => {
          if (member.expiryDate) {
            const expiryDate = new Date(member.expiryDate);
            // Ensure valid date before comparison
            if (isNaN(expiryDate.getTime())) return false;
            return expiryDate.getTime() <= thirtyDaysFromNow.getTime() && 
                   expiryDate.getTime() >= today.getTime();
          }
          return false;
        }).slice(0, 3); // Show only 3 expiring members
        
        setExpiringMembers(expiring);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Navigate to filtered pages
  const navigateToMembers = (filter = '') => {
    navigate('/members', { state: { filter } });
  };

  const navigateToTransactions = (filter = '') => {
    navigate('/transactions', { state: { filter } });
  };

  const navigateToExpenses = () => {
    navigate('/expenses');
  };

  const dashboardCards = [
    {
      title: 'Total Active Members',
      value: isLoading ? 'Loading...' : stats.activeMembers.toString(),
      change: isLoading ? '' : `${stats.totalMembers} total members`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      trend: 'up',
      onClick: () => navigateToMembers('active')
    },
    {
      title: 'Monthly Revenue',
      value: isLoading ? 'Loading...' : `Rs.${stats.totalRevenue.toLocaleString()}`,
      change: isLoading ? '' : (stats.netProfit >= 0 ? 'Profitable' : 'Needs attention'),
      icon: IndianRupee,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
      trend: stats.netProfit >= 0 ? 'up' : 'down',
      onClick: () => navigateToTransactions('current-month')
    },
    {
      title: 'Total Expenses',
      value: isLoading ? 'Loading...' : `Rs.${stats.totalExpenses.toLocaleString()}`,
      change: 'This month',
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
      trend: 'neutral',
      onClick: navigateToExpenses
    },
    {
      title: 'Net Profit',
      value: isLoading ? 'Loading...' : `Rs.${stats.netProfit.toLocaleString()}`,
      change: 'Revenue - Expenses',
      icon: stats.netProfit >= 0 ? TrendingUp : TrendingDown,
      color: stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.netProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      trend: stats.netProfit >= 0 ? 'up' : 'down',
      onClick: () => navigate('/reports')
    }
  ];

  const quickActions = [
    {
      title: 'Add New Member',
      description: 'Register a new gym member',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => navigate('/members/add')
    },
    {
      title: 'Record Payment',
      description: 'Add membership payment',
      icon: CreditCard,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => navigate('/transactions/add')
    },
    {
      title: 'Add Expense',
      description: 'Record gym expenses',
      icon: FileText,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => navigate('/expenses/add')
    }
  ];

  // Format activity time
  const formatActivityTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    
    // Ensure we have valid dates before arithmetic
    if (isNaN(date.getTime()) || isNaN(now.getTime())) return 'Just now';
    
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'member': return Users;
      case 'payment': case 'transaction': return CreditCard;
      case 'expense': return Receipt;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      {/* Header with Refresh */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="animate-in slide-in-from-left-5 duration-300">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Here's what's happening at RangeFitGym today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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

      {/* Last Updated */}
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>

      {/* Clickable Dashboard Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {dashboardCards.map((card, index) => (
          <Card 
            key={index} 
            className="glass-card border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-in fade-in-50"
            style={{ animationDelay: `${index * 75}ms` }}
            onClick={card.onClick}
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

      {/* Business Summary */}
      <Card className="glass-card border-white/40">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Business Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="text-center p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => navigateToMembers('active')}
            >
              <h4 className="text-sm font-medium text-gray-600 mb-2">Active Members</h4>
              <p className="text-2xl font-bold text-blue-600">
                {isLoading ? 'Loading...' : stats.activeMembers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isLoading ? '' : `Out of ${stats.totalMembers} total`}
              </p>
            </div>
            
            <div 
              className="text-center p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => navigateToTransactions('current-month')}
            >
              <h4 className="text-sm font-medium text-gray-600 mb-2">Monthly Revenue</h4>
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? 'Loading...' : `Rs.${stats.totalRevenue.toLocaleString()}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            
            <div 
              className={`text-center p-4 rounded-lg cursor-pointer transition-colors ${
                stats.netProfit >= 0 
                  ? 'bg-green-50 hover:bg-green-100' 
                  : 'bg-red-50 hover:bg-red-100'
              }`}
              onClick={() => navigate('/reports')}
            >
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

      {/* Real Recent Activity */}
      <Card className="glass-card border-white/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Recent Activity
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/activity-logs')}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading activities...</div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type);
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ActivityIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {activity.details || activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {activity.userName} • {formatActivityTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">No recent activity</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expiring Memberships */}
      {expiringMembers.length > 0 && (
        <Card className="glass-card border-white/40 border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Expiring Memberships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{member.name}</p>
                      <p className="text-xs text-gray-500">
                        Expires: {new Date(member.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const cleanPhone = member.phone?.replace(/\D/g, '') || '';
                        if (cleanPhone) {
                          window.open(`https://wa.me/${cleanPhone}`, '_blank');
                        }
                      }}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/members/${member.id}/renew`)}
                    >
                      Renew
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Notifications */}
      <Card className="glass-card border-white/40 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
            WhatsApp Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Send Welcome Message</h4>
              <p className="text-xs text-gray-500 mb-3">Send to new members automatically</p>
              <Button size="sm" className="bg-green-500 hover:bg-green-600">
                Configure
              </Button>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Payment Reminders</h4>
              <p className="text-xs text-gray-500 mb-3">Automated payment due notifications</p>
              <Button size="sm" variant="outline">
                Setup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;