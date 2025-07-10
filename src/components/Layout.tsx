
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Dumbbell, 
  Users, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  Menu, 
  X, 
  User, 
  LogOut,
  Bell,
  Home,
  MessageCircle
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: Home, roles: ['admin', 'partner', 'employee'] },
    { name: 'Members', path: '/members', icon: Users, roles: ['admin', 'partner', 'employee'] },
    { name: 'Transactions', path: '/transactions', icon: CreditCard, roles: ['admin', 'partner', 'employee'] },
    { name: 'Expenses', path: '/expenses', icon: Receipt, roles: ['admin', 'partner', 'employee'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'partner'] },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp, roles: ['admin', 'partner'] },
    { name: 'Admin Panel', path: '/admin', icon: Settings, roles: ['admin'] },
  ];

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'partner': return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
      case 'employee': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#f0f4ff] to-[#ffffff]">
      {/* Premium Top Navigation */}
      <nav className="glass-header sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl text-gray-700 hover:bg-white/50 lg:hidden transition-all duration-200"
                variant="ghost"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              
              <div className="flex items-center ml-4 lg:ml-0">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                  <Dumbbell className="h-8 w-8 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    RangeFitGym
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Premium CRM</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-700 hover:bg-white/50 p-2 rounded-xl relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>

              <Button variant="ghost" className="text-gray-700 hover:bg-white/50 p-2 rounded-xl">
                <MessageCircle className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 text-gray-700 hover:bg-white/50 rounded-xl px-4">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold">{user?.name}</p>
                      <Badge className={`${getRoleBadgeColor(user?.role || '')} text-xs`}>
                        {user?.role}
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card border-white/40">
                  <DropdownMenuItem className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>{user?.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Premium Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 glass-sidebar transition-transform duration-300 ease-in-out`}>
          <div className="flex flex-col h-full pt-6 pb-4 overflow-y-auto">
            <nav className="mt-6 flex-1 px-4 space-y-2">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white/80 text-blue-700 shadow-lg shadow-blue-500/20 border border-blue-200/50'
                        : 'text-gray-700 hover:bg-white/50 hover:text-blue-600'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
