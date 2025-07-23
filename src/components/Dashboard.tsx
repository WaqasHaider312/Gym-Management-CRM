
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  IndianRupee, 
  Receipt, 
  AlertTriangle, 
  UserPlus, 
  Plus,
  Bell,
  TrendingUp,
  Calendar,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'Total Active Members',
      value: '284',
      change: '+12 this month',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Monthly Revenue',
      value: 'Rs.245,000',
      change: '+18% from last month',
      icon: IndianRupee,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Expenses',
      value: 'Rs.45,000',
      change: '+5% from last month',
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Expiring Soon',
      value: '23',
      change: 'Within 7 days',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10'
    }
  ];

  const quickActions = [
    { name: 'Add Member', icon: UserPlus, path: '/members', action: () => navigate('/members') },
    { name: 'Add Expense', icon: Plus, path: '/expenses', action: () => navigate('/expenses') },
    { name: 'Send Reminders', icon: Bell, path: '/notifications', action: () => {
      toast({
        title: "Sending Reminders",
        description: "WhatsApp reminders will be sent to expiring members.",
      });
    }}
  ];

  const recentActivity = [
    { user: 'Ali Ahmed', action: 'added a transaction', amount: 'Rs.3,000', time: '2 hours ago', type: 'transaction' },
    { user: 'Ammar Khan', action: 'edited member profile', member: 'John Doe', time: '4 hours ago', type: 'member' },
    { user: 'Sarah Wilson', action: 'renewed membership', amount: 'Rs.5,000', time: '6 hours ago', type: 'renewal' },
    { user: 'Mike Johnson', action: 'added expense', amount: 'Rs.2,500', time: '1 day ago', type: 'expense' }
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
              <p className="text-xs text-gray-500">
                {card.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="glass-card border-white/40 animate-in fade-in-50 duration-300" style={{ animationDelay: '300ms' }}>
        <CardHeader className="pt-4 sm:pt-6 pb-2 px-4 sm:px-6">
          <CardTitle className="text-gray-800 flex items-center text-lg sm:text-xl">
            <Activity className="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Frequently used actions for gym management
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-14 sm:h-16 md:h-20 glass-card border-white/40 text-gray-700 hover:bg-white/80 hover:scale-105 transition-all duration-200"
                onClick={action.action}
              >
                <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                  <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm font-medium">{action.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="glass-card border-white/40 animate-in fade-in-50 duration-300" style={{ animationDelay: '400ms' }}>
        <CardHeader className="pt-4 sm:pt-6 pb-2 px-4 sm:px-6">
          <CardTitle className="text-gray-800 flex items-center text-lg sm:text-xl">
            <TrendingUp className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Latest actions performed by team members
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-2 sm:space-y-3">
            {recentActivity.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-start sm:items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 hover:shadow-sm"
                style={{ animationDelay: `${index * 100 + 500}ms` }}
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-xs sm:text-sm">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-gray-600"> {activity.action}</span>
                    {activity.amount && (
                      <span className="font-medium text-green-600"> {activity.amount}</span>
                    )}
                    {activity.member && (
                      <span className="font-medium text-blue-600"> for {activity.member}</span>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs">{activity.time}</p>
                </div>
                <div className="flex-shrink-0">
                  <Badge 
                    variant="outline" 
                    className={`
                      text-xs border-gray-200 
                      ${activity.type === 'transaction' ? 'bg-green-500/20 text-green-700' : ''}
                      ${activity.type === 'member' ? 'bg-blue-500/20 text-blue-700' : ''}
                      ${activity.type === 'renewal' ? 'bg-purple-500/20 text-purple-700' : ''}
                      ${activity.type === 'expense' ? 'bg-orange-500/20 text-orange-700' : ''}
                    `}
                  >
                    {activity.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              className="text-xs sm:text-sm bg-white/70 border-white/60 transition-all duration-200 hover:bg-white hover:shadow-sm"
            >
              View All Activity
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
