
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  Shield,
  Database,
  Key,
  Bell,
  Cog,
  UserCheck,
  Lock,
  Server
} from 'lucide-react';

const AdminPanel = () => {
  const systemStats = [
    {
      title: 'System Status',
      value: 'Online',
      description: 'All systems operational',
      icon: Server,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
      status: 'success'
    },
    {
      title: 'Database Health',
      value: '98.5%',
      description: 'Performance optimal',
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      status: 'success'
    },
    {
      title: 'Active Sessions',
      value: '47',
      description: 'Current user sessions',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
      status: 'info'
    },
    {
      title: 'Security Level',
      value: 'High',
      description: 'All security checks passed',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
      status: 'success'
    }
  ];

  const adminTools = [
    { name: 'User Management', icon: Users, description: 'Manage staff accounts and permissions' },
    { name: 'System Settings', icon: Cog, description: 'Configure system parameters' },
    { name: 'Security Center', icon: Lock, description: 'Monitor security and access logs' },
    { name: 'Backup & Restore', icon: Database, description: 'Data backup and recovery tools' },
    { name: 'API Keys', icon: Key, description: 'Manage external service integrations' },
    { name: 'Notifications', icon: Bell, description: 'System alerts and notifications' }
  ];

  const userRoles = [
    { role: 'Admin', count: 2, permissions: 'Full Access', color: 'bg-red-500/20 text-red-700' },
    { role: 'Partner', count: 1, permissions: 'Management Access', color: 'bg-amber-500/20 text-amber-700' },
    { role: 'Employee', count: 5, permissions: 'Limited Access', color: 'bg-green-500/20 text-green-700' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <Settings className="mr-3 h-8 w-8 text-gray-600" />
            Admin Panel
          </h1>
          <p className="text-gray-600">
            System administration and management tools
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" className="glass-card border-white/40">
            System Logs
          </Button>
          <Button className="premium-button">
            Backup Now
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
          <Card key={index} className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Tools */}
      <Card className="glass-card border-white/40">
        <CardHeader>
          <CardTitle className="text-gray-800">Administration Tools</CardTitle>
          <CardDescription className="text-gray-600">
            System management and configuration options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminTools.map((tool, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 glass-card border-white/40 text-gray-700 hover:bg-white/80 hover:scale-105 transition-all duration-200 justify-start"
              >
                <div className="flex items-center space-x-3">
                  <tool.icon className="h-6 w-6" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{tool.name}</div>
                    <div className="text-xs text-gray-500">{tool.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Roles & Permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">User Roles & Permissions</CardTitle>
            <CardDescription className="text-gray-600">
              Manage user access levels and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userRoles.map((role, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-800">{role.role}</div>
                      <div className="text-sm text-gray-600">{role.permissions}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={role.color}>
                      {role.count} users
                    </Badge>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Recent Admin Activity</CardTitle>
            <CardDescription className="text-gray-600">
              Latest administrative actions and system changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">System configuration updated</div>
                  <div className="text-xs text-gray-500">2 hours ago by Admin</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <UserCheck className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">New employee account created</div>
                  <div className="text-xs text-gray-500">5 hours ago by Partner</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                <div className="p-2 bg-orange-500/20 rounded-full">
                  <Database className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">Database backup completed</div>
                  <div className="text-xs text-gray-500">1 day ago by System</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                <div className="p-2 bg-purple-500/20 rounded-full">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">Security scan completed</div>
                  <div className="text-xs text-gray-500">1 day ago by System</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
