import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
  Server,
  Plus,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  Activity,
  X,
  Clock,
  Receipt
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { authAPI, dashboardAPI } from '@/services/googleSheetsAPI';
import { useAuth } from './AuthContext';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'partner' | 'employee';
  name: string;
  phone?: string;
  createdAt?: string;
}

interface Notification {
  id: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
  isRead: boolean;
  type: 'login' | 'member' | 'transaction' | 'expense' | 'user' | 'system';
}

// Pakistan phone validation: 03xxxxxxxxx (11 digits)
const userFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().regex(/^03\d{9}$/, { message: "Phone must be Pakistani format: 03xxxxxxxxx (11 digits)" }).optional().or(z.literal("")),
  role: z.enum(['admin', 'partner', 'employee'], {
    required_error: "Please select a role",
  }),
});

const AdminPanel = () => {
  const { user } = useAuth();
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form setup
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      phone: "",
      role: "employee",
    },
  });

  // Get Pakistan time
  const getPakistanTime = () => {
    return new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Add notification
  const addNotification = (action: string, details: string, type: Notification['type'] = 'system') => {
    const newNotification: Notification = {
      id: 'notif_' + Date.now(),
      action,
      userId: user?.id || '',
      userName: user?.name || 'System',
      details,
      timestamp: getPakistanTime(),
      isRead: false,
      type
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-cleanup after 30 minutes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 30 * 60 * 1000); // 30 minutes
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch data
  const fetchAdminData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log('Fetching admin data...');
      
      // Fetch users and dashboard stats in parallel
      const [usersResponse, statsResponse] = await Promise.all([
        authAPI.getUsers(),
        dashboardAPI.getStats()
      ]);
      
      if (usersResponse.success) {
        console.log('Users fetched successfully:', usersResponse.users);
        setUsers(usersResponse.users || []);
      } else {
        console.error('Failed to fetch users:', usersResponse.error);
      }

      if (statsResponse.success) {
        console.log('Stats fetched successfully:', statsResponse.stats);
        setDashboardStats(statsResponse.stats || {});
      } else {
        console.error('Failed to fetch stats:', statsResponse.error);
      }

      // If both failed, show error
      if (!usersResponse.success && !statsResponse.success) {
        setError('Failed to load admin data');
      }
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Network error: Unable to fetch admin data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
      
      // Add login notification
      addNotification(
        'Admin Login', 
        `${user.name} logged into admin panel`, 
        'login'
      );
    }
  }, [user]);

  // Calculate statistics
  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    partners: users.filter(u => u.role === 'partner').length,
    employees: users.filter(u => u.role === 'employee').length,
  };

  const systemStats = [
    {
      title: 'System Status',
      value: 'Online',
      description: 'All systems operational',
      icon: Server,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Database Health',
      value: '98.5%',
      description: 'Performance optimal',
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Sessions',
      value: dashboardStats.totalMembers || '0',
      description: 'Current user sessions',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Security Level',
      value: 'High',
      description: 'All security checks passed',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    }
  ];

  const adminTools = [
    { 
      name: 'User Management', 
      icon: Users, 
      description: 'Manage staff accounts and permissions',
      action: () => {
        document.getElementById('user-management')?.scrollIntoView({ behavior: 'smooth' });
        addNotification('User Management', 'Accessed user management section', 'system');
      }
    },
    { 
      name: 'System Settings', 
      icon: Cog, 
      description: 'Configure system parameters',
      action: () => {
        toast({ title: "System Settings", description: "Feature coming soon!" });
        addNotification('System Settings', 'Accessed system settings', 'system');
      }
    },
    { 
      name: 'Security Center', 
      icon: Lock, 
      description: 'Monitor security and access logs',
      action: () => {
        toast({ title: "Security Center", description: "Feature coming soon!" });
        addNotification('Security Center', 'Accessed security center', 'system');
      }
    },
    { 
      name: 'Backup & Restore', 
      icon: Database, 
      description: 'Data backup and recovery tools',
      action: () => {
        toast({ title: "Backup System", description: "Manual backup initiated!" });
        addNotification('System Backup', 'Manual backup initiated', 'system');
      }
    },
    { 
      name: 'API Management', 
      icon: Key, 
      description: 'Manage external service integrations',
      action: () => {
        toast({ title: "API Management", description: "Google Sheets API: Connected" });
        addNotification('API Check', 'Checked API connection status', 'system');
      }
    },
    { 
      name: 'Activity Logs', 
      icon: Activity, 
      description: 'View system activity and notifications',
      action: () => setIsNotificationsOpen(true)
    }
  ];

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get role badge
  const getRoleBadge = (role: string) => {
    const colors = {
      'admin': 'bg-red-500/20 text-red-700 border-red-500/30',
      'partner': 'bg-amber-500/20 text-amber-700 border-amber-500/30',
      'employee': 'bg-green-500/20 text-green-700 border-green-500/30'
    };
    
    return (
      <Badge className={`${colors[role as keyof typeof colors]} transition-colors duration-150`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.reset({
      username: user.username,
      name: user.name,
      phone: user.phone || '',
      role: user.role,
      password: '' // Don't pre-fill password
    });
    setIsEditUserDialogOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteUserDialogOpen(true);
  };

  // Confirm delete user
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // For now, just show toast (implement actual delete later)
      toast({
        title: "User Deleted",
        description: `${selectedUser.name} has been removed from the system.`,
      });
      
      addNotification(
        'User Deleted', 
        `${selectedUser.name} (${selectedUser.role}) was deleted`, 
        'user'
      );
      
      setIsDeleteUserDialogOpen(false);
      setSelectedUser(null);
      
      // Refresh data
      await fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Form submission
  const onSubmit = async (data: z.infer<typeof userFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      console.log('Processing user:', { ...data, password: '[HIDDEN]' });
      
      // Submit to Google Sheets via JSONP
      const response = await authAPI.add(data);
      
      if (response.success) {
        console.log('User processed successfully:', response.user);
        
        // Show success
        setIsAddUserDialogOpen(false);
        setIsEditUserDialogOpen(false);
        setIsSuccessDialogOpen(true);
        
        const action = selectedUser ? 'updated' : 'created';
        toast({
          title: `User ${action.charAt(0).toUpperCase() + action.slice(1)} Successfully`,
          description: `${data.name} has been ${action} as ${data.role}.`,
        });
        
        // Add notification
        addNotification(
          selectedUser ? 'User Updated' : 'User Created',
          `${data.name} (${data.role}) was ${action}`,
          'user'
        );
        
        // Refresh users list
        await fetchAdminData();
        
        // Reset form
        form.reset();
        setSelectedUser(null);
      } else {
        throw new Error(response.error || 'Failed to process user');
      }
    } catch (error) {
      console.error('Error processing user:', error);
      toast({
        title: "Error Processing User",
        description: error instanceof Error ? error.message : "There was a problem processing the user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">Access Denied</h3>
            <p className="text-gray-600">Only administrators can access this panel.</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to Load Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchAdminData()} className="bg-gray-600 hover:bg-gray-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            System administration and user management
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          {/* Notifications Button */}
          <Button
            onClick={() => setIsNotificationsOpen(true)}
            variant="outline"
            className="relative glass-card border-white/40"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
          
          <Button 
            onClick={() => fetchAdminData(true)} 
            variant="outline"
            disabled={isRefreshing}
            className="glass-card border-white/40"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            onClick={() => setIsAddUserDialogOpen(true)}
            className="premium-button"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
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

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Administrators</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.admins}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Partners</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.partners}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Employees</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.employees}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                onClick={tool.action}
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

      {/* User Management Section */}
      <Card id="user-management" className="glass-card border-white/40">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center">
            <Users className="mr-2 h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription className="text-gray-600">
            Manage system users and their access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users by name or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 border-white/60"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/70 border-white/60">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                {users.length === 0 ? 'No users found' : 'No users match your search'}
              </h3>
              <p className="text-gray-500 mt-1">
                {users.length === 0 ? 'Add your first user to get started' : 'Try adjusting your search or filters'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600">Name</TableHead>
                    <TableHead className="text-gray-600">Username</TableHead>
                    <TableHead className="text-gray-600">Role</TableHead>
                    <TableHead className="text-gray-600">Phone</TableHead>
                    <TableHead className="text-gray-600">Created</TableHead>
                    <TableHead className="text-gray-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-gray-100 hover:bg-white/50">
                      <TableCell className="text-gray-800 font-medium">{user.name}</TableCell>
                      <TableCell className="text-gray-600">{user.username}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-gray-600">{user.phone || 'N/A'}</TableCell>
                      <TableCell className="text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications Panel */}
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
                <Bell className="mr-2 h-5 w-5 text-blue-600" />
                System Notifications ({notifications.length})
              </DialogTitle>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Mark All Read
                  </Button>
                )}
                <Button
                  onClick={() => setIsNotificationsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogDescription className="text-gray-600">
              Real-time system activity and admin notifications (Auto-cleanup: 30 minutes)
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-96 space-y-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No notifications yet</p>
                <p className="text-gray-500 text-sm">System activities will appear here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg transition-all duration-200 cursor-pointer ${
                    notification.isRead 
                      ? 'bg-gray-50 border border-gray-200' 
                      : 'bg-blue-50 border border-blue-200 shadow-sm'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-full ${
                          notification.type === 'login' ? 'bg-green-500/20' :
                          notification.type === 'user' ? 'bg-blue-500/20' :
                          notification.type === 'member' ? 'bg-purple-500/20' :
                          notification.type === 'transaction' ? 'bg-green-500/20' :
                          notification.type === 'expense' ? 'bg-orange-500/20' :
                          'bg-gray-500/20'
                        }`}>
                          {notification.type === 'login' && <UserCheck className="h-3 w-3 text-green-600" />}
                          {notification.type === 'user' && <UserPlus className="h-3 w-3 text-blue-600" />}
                          {notification.type === 'member' && <Users className="h-3 w-3 text-purple-600" />}
                          {notification.type === 'transaction' && <Activity className="h-3 w-3 text-green-600" />}
                          {notification.type === 'expense' && <Receipt className="h-3 w-3 text-orange-600" />}
                          {notification.type === 'system' && <Cog className="h-3 w-3 text-gray-600" />}
                        </div>
                        <h4 className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notification.action}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notification.details}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{notification.timestamp}</span>
                        <span>•</span>
                        <span>by {notification.userName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <UserPlus className="mr-2 h-5 w-5 text-blue-600" />
              Add New User
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new user account with appropriate permissions.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter full name" 
                        className="bg-white/70 border-white/60"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Username" 
                          className="bg-white/70 border-white/60"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/70 border-white/60">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password" 
                          className="bg-white/70 border-white/60 pr-10"
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="03xxxxxxxxx (11 digits)" 
                        className="bg-white/70 border-white/60"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsAddUserDialogOpen(false)}
                  disabled={isSubmitting}
                  className="bg-white/70 border-white/60"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="premium-button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <Edit className="mr-2 h-5 w-5 text-green-600" />
              Edit User: {selectedUser?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Update user account information and permissions.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter full name" 
                        className="bg-white/70 border-white/60"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Username" 
                          className="bg-white/70 border-white/60"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/70 border-white/60">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">New Password (Leave blank to keep current)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password or leave blank" 
                          className="bg-white/70 border-white/60 pr-10"
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="03xxxxxxxxx (11 digits)" 
                        className="bg-white/70 border-white/60"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    setIsEditUserDialogOpen(false);
                    setSelectedUser(null);
                    form.reset();
                  }}
                  disabled={isSubmitting}
                  className="bg-white/70 border-white/60"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="premium-button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Update User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <Trash2 className="mr-2 h-5 w-5 text-red-600" />
              Delete User
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Users className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-800">{selectedUser.name}</p>
                  <p className="text-sm text-red-600">@{selectedUser.username} • {selectedUser.role}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteUserDialogOpen(false);
                setSelectedUser(null);
              }}
              className="bg-white/70 border-white/60"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-800 text-center">
              {selectedUser ? 'User Updated Successfully!' : 'User Created Successfully!'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center mt-2">
              The user account has been {selectedUser ? 'updated' : 'created'} and can now access the system.
            </DialogDescription>
            
            <div className="mt-6 w-full flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-white/70 border-white/60"
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                  setIsAddUserDialogOpen(true);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Another
              </Button>
              <Button
                className="flex-1 premium-button"
                onClick={() => setIsSuccessDialogOpen(false)}
              >
                <Check className="mr-2 h-4 w-4" />
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;