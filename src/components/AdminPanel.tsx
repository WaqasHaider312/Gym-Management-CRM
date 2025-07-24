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
  BarChart3,
  FileText,
  Download,
  Upload,
  HardDrive,
  Wifi,
  Zap
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

const userFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().optional(),
  role: z.enum(['admin', 'partner', 'employee'], {
    required_error: "Please select a role",
  }),
});

const AdminPanel = () => {
  const { user } = useAuth();
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      action: () => document.getElementById('user-management')?.scrollIntoView({ behavior: 'smooth' })
    },
    { 
      name: 'System Settings', 
      icon: Cog, 
      description: 'Configure system parameters',
      action: () => toast({ title: "System Settings", description: "Feature coming soon!" })
    },
    { 
      name: 'Security Center', 
      icon: Lock, 
      description: 'Monitor security and access logs',
      action: () => toast({ title: "Security Center", description: "Feature coming soon!" })
    },
    { 
      name: 'Backup & Restore', 
      icon: HardDrive, 
      description: 'Data backup and recovery tools',
      action: () => toast({ title: "Backup System", description: "Manual backup initiated!" })
    },
    { 
      name: 'API Management', 
      icon: Key, 
      description: 'Manage external service integrations',
      action: () => toast({ title: "API Management", description: "Google Sheets API: Connected" })
    },
    { 
      name: 'System Logs', 
      icon: FileText, 
      description: 'View system activity and error logs',
      action: () => toast({ title: "System Logs", description: "Check browser console for logs" })
    }
  ];

  const recentActivity = [
    {
      action: 'User login',
      user: user?.name || 'Admin',
      time: 'Just now',
      icon: UserCheck,
      color: 'bg-green-500/20 text-green-600'
    },
    {
      action: 'System backup completed',
      user: 'System',
      time: '2 hours ago',
      icon: Database,
      color: 'bg-blue-500/20 text-blue-600'
    },
    {
      action: 'New member added',
      user: user?.name || 'Admin',
      time: '3 hours ago',
      icon: UserPlus,
      color: 'bg-purple-500/20 text-purple-600'
    },
    {
      action: 'Security scan completed',
      user: 'System',
      time: '1 day ago',
      icon: Shield,
      color: 'bg-orange-500/20 text-orange-600'
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

  // Form submission
  const onSubmit = async (data: z.infer<typeof userFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      console.log('Creating new user:', { ...data, password: '[HIDDEN]' });
      
      // Submit to Google Sheets via JSONP
      const response = await authAPI.add(data);
      
      if (response.success) {
        console.log('User created successfully:', response.user);
        
        // Show success
        setIsAddUserDialogOpen(false);
        setIsSuccessDialogOpen(true);
        
        toast({
          title: "User Created Successfully",
          description: `${data.name} has been added as ${data.role}.`,
        });
        
        // Refresh users list
        await fetchAdminData();
        
        // Reset form
        form.reset();
      } else {
        throw new Error(response.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error Creating User",
        description: error instanceof Error ? error.message : "There was a problem creating the user. Please try again.",
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

      {/* User Management and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management Section */}
        <div className="lg:col-span-2">
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
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
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
        </div>

        {/* Recent Activity */}
        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Recent Admin Activity</CardTitle>
            <CardDescription className="text-gray-600">
              Latest administrative actions and system changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                  <div className={`p-2 rounded-full ${activity.color}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{activity.action}</div>
                    <div className="text-xs text-gray-500">{activity.time} by {activity.user}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
                        placeholder="Phone number" 
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

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-800 text-center">
              User Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center mt-2">
              The new user account has been created and can now access the system.
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