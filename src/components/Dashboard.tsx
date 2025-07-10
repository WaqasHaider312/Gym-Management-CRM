
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
  Activity
} from 'lucide-react';
import { useAuth } from './AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const dashboardCards = [
    {
      title: 'Total Active Members',
      value: '284',
      change: '+12 this month',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Monthly Revenue',
      value: '₹2,45,000',
      change: '+18% from last month',
      icon: IndianRupee,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Expenses',
      value: '₹45,000',
      change: '+5% from last month',
      icon: Receipt,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Expiring Soon',
      value: '23',
      change: 'Within 7 days',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    }
  ];

  const quickActions = [
    { name: 'Add Member', icon: UserPlus, path: '/members/add' },
    { name: 'Add Expense', icon: Plus, path: '/expenses/add' },
    { name: 'Send Reminders', icon: Bell, path: '/notifications' }
  ];

  const recentActivity = [
    { user: 'Ali Ahmed', action: 'added a transaction', amount: '₹3,000', time: '2 hours ago', type: 'transaction' },
    { user: 'Ammar Khan', action: 'edited member profile', member: 'John Doe', time: '4 hours ago', type: 'member' },
    { user: 'Sarah Wilson', action: 'renewed membership', amount: '₹5,000', time: '6 hours ago', type: 'renewal' },
    { user: 'Mike Johnson', action: 'added expense', amount: '₹2,500', time: '1 day ago', type: 'expense' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-blue-200">
            Here's what's happening at RangeFitGym today
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Badge className="bg-white/20 text-white px-3 py-1">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Badge>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {card.value}
              </div>
              <p className="text-xs text-blue-200">
                {card.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-blue-200">
            Frequently used actions for gym management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
              >
                <div className="flex flex-col items-center space-y-2">
                  <action.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{action.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-blue-200">
            Latest actions performed by team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-blue-200"> {activity.action}</span>
                    {activity.amount && (
                      <span className="font-medium text-green-400"> {activity.amount}</span>
                    )}
                    {activity.member && (
                      <span className="font-medium text-blue-400"> for {activity.member}</span>
                    )}
                  </p>
                  <p className="text-blue-300 text-xs">{activity.time}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`
                    text-xs border-white/20 
                    ${activity.type === 'transaction' ? 'bg-green-500/20 text-green-300' : ''}
                    ${activity.type === 'member' ? 'bg-blue-500/20 text-blue-300' : ''}
                    ${activity.type === 'renewal' ? 'bg-purple-500/20 text-purple-300' : ''}
                    ${activity.type === 'expense' ? 'bg-orange-500/20 text-orange-300' : ''}
                  `}
                >
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
