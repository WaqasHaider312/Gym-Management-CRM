import React, { useState, useEffect, createContext, useContext } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  TrendingUp, 
  IndianRupee, 
  Download,
  User,
  Calendar,
  ArrowUpRight,
  Check,
  Loader2,
  Send,
  RefreshCw,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  Bell,
  X,
  Users,
  CheckIcon,
  ChevronsUpDown,
  Undo
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { whatsappService } from '@/services/whatsappService';
import { transactionsAPI, membersAPI, activityLogsAPI } from '@/services/googleSheetsAPI';

// ============ INTERFACES ============
interface Transaction {
  id: string;
  transactionId: string;
  memberName: string;
  memberPhone?: string;
  amount: number;
  type: 'membership' | 'admission' | 'personal_training' | 'supplement' | 'other';
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_wallet';
  date: string;
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
  isDeleted?: boolean;
  deletedBy?: string;
  deletedAt?: string;
  createdAt?: string;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  cnic?: string;
  address?: string;
  membershipType: string;
  feeType: string;
  joiningDate: string;
  expiryDate: string;
  fee: number;
  status: 'active' | 'inactive' | 'expired';
}

interface Notification {
  id: string;
  type: 'transaction_deleted' | 'transaction_added' | 'transaction_updated';
  title: string;
  message: string;
  transactionData?: Transaction;
  deletedBy: string;
  timestamp: string;
  isRead: boolean;
}

// ============ NOTIFICATION CONTEXT ============
const NotificationContext = createContext<{
  notifications: Notification[];
  unreadCount: number;
  addNotification: (type: string, title: string, message: string, data?: any) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  isAdmin: boolean;
}>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  clearAll: () => {},
  isAdmin: false,
});

// ============ NOTIFICATION PROVIDER ============
const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Check if current user is admin
  const getCurrentUser = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : { role: 'staff' };
    } catch {
      return { role: 'staff' };
    }
  };

  const isAdmin = getCurrentUser().role === 'admin';

  const addNotification = (type: string, title: string, message: string, data?: any) => {
    if (!isAdmin) return; // Only show notifications to admin

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: type as any,
      title,
      message,
      transactionData: data,
      deletedBy: getCurrentUser().name || 'Unknown User',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast notification
    toast({
      title: title,
      description: message,
      duration: 5000,
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      addNotification, 
      markAsRead, 
      clearAll, 
      isAdmin 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// ============ NOTIFICATION BELL COMPONENT ============
const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, clearAll, isAdmin } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);

  if (!isAdmin) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-white/60 hover:bg-white">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white/95 backdrop-blur-md" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">Notifications</h4>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50/50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h5 className="text-sm font-medium text-gray-800">{notification.title}</h5>
                  <span className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{notification.message}</p>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// ============ FORM SCHEMAS ============
const transactionFormSchema = z.object({
  memberName: z.string().min(1, { message: "Please select a member" }),
  memberPhone: z.string().min(11, { message: "Please enter a valid phone number" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  type: z.string({
    required_error: "Please select a transaction type",
  }),
  paymentMethod: z.string({
    required_error: "Please select a payment method",
  }),
  date: z.string().min(1, { message: "Date is required" }),
  notes: z.string().optional(),
  sendReceipt: z.boolean().default(false),
});

// ============ ENHANCED TRANSACTIONS API ============
const enhancedTransactionsAPI = {
  ...transactionsAPI,
  
  // Update existing transaction
  update: async (transactionId: string, transactionData: any) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const params = new URLSearchParams();
      params.append('action', 'updateTransaction');
      params.append('transactionId', transactionId);
      params.append('memberName', transactionData.memberName || '');
      params.append('memberPhone', transactionData.memberPhone || '');
      params.append('amount', transactionData.amount || '0');
      params.append('type', transactionData.type || 'membership');
      params.append('paymentMethod', transactionData.paymentMethod || 'cash');
      params.append('date', transactionData.date || new Date().toISOString().split('T')[0]);
      params.append('status', transactionData.status || 'completed');
      params.append('notes', transactionData.notes || '');
      params.append('userId', user.id);
      params.append('userName', user.name);

      const url = `https://script.google.com/macros/s/AKfycby8w7Jaxv2xibK19OQUkfUlg0DfkxAsrwmJ1JndwyDqaaRzot_I_5G6Ds7ObaBnazo/exec?${params.toString()}`;
      
      return new Promise((resolve, reject) => {
        const callbackName = 'callback_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        window[callbackName] = (data: any) => {
          delete window[callbackName];
          document.head.removeChild(script);
          resolve(data);
        };
        
        const script = document.createElement('script');
        script.src = url + '&callback=' + callbackName;
        script.onerror = () => {
          delete window[callbackName];
          document.head.removeChild(script);
          reject(new Error('Script loading failed'));
        };
        
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Failed to update transaction:', error);
      return { success: false, error: 'Failed to update transaction' };
    }
  },

  // Soft delete transaction
  softDelete: async (transactionId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const params = new URLSearchParams();
      params.append('action', 'softDeleteTransaction');
      params.append('transactionId', transactionId);
      params.append('userId', user.id);
      params.append('userName', user.name);

      const url = `https://script.google.com/macros/s/AKfycby8w7Jaxv2xibK19OQUkfUlg0DfkxAsrwmJ1JndwyDqaaRzot_I_5G6Ds7ObaBnazo/exec?${params.toString()}`;
      
      return new Promise((resolve, reject) => {
        const callbackName = 'callback_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        window[callbackName] = (data: any) => {
          delete window[callbackName];
          document.head.removeChild(script);
          resolve(data);
        };
        
        const script = document.createElement('script');
        script.src = url + '&callback=' + callbackName;
        script.onerror = () => {
          delete window[callbackName];
          document.head.removeChild(script);
          reject(new Error('Script loading failed'));
        };
        
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      return { success: false, error: 'Failed to delete transaction' };
    }
  },

  // Restore deleted transaction
  restore: async (transactionId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const params = new URLSearchParams();
      params.append('action', 'restoreTransaction');
      params.append('transactionId', transactionId);
      params.append('userId', user.id);
      params.append('userName', user.name);

      const url = `https://script.google.com/macros/s/AKfycby8w7Jaxv2xibK19OQUkfUlg0DfkxAsrwmJ1JndwyDqaaRzot_I_5G6Ds7ObaBnazo/exec?${params.toString()}`;
      
      return new Promise((resolve, reject) => {
        const callbackName = 'callback_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        window[callbackName] = (data: any) => {
          delete window[callbackName];
          document.head.removeChild(script);
          resolve(data);
        };
        
        const script = document.createElement('script');
        script.src = url + '&callback=' + callbackName;
        script.onerror = () => {
          delete window[callbackName];
          document.head.removeChild(script);
          reject(new Error('Script loading failed'));
        };
        
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Failed to restore transaction:', error);
      return { success: false, error: 'Failed to restore transaction' };
    }
  }
};

/// ============ BULLETPROOF MEMBER SELECTOR COMPONENT ============
const MemberSelector: React.FC<{
  value: string;
  onChange: (memberName: string, memberPhone: string) => void;
  members: Member[];
}> = ({ value, onChange, members = [] }) => {
  const [open, setOpen] = useState(false);

  // MULTIPLE SAFETY CHECKS
  console.log('MemberSelector Debug:', {
    membersReceived: members,
    membersType: typeof members,
    isArray: Array.isArray(members),
    membersLength: members?.length || 0,
    firstMember: members?.[0] || null
  });

  // Early return for invalid data
  if (!members) {
    console.log('Members is null/undefined');
    return <div>Loading members...</div>;
  }

  if (!Array.isArray(members)) {
    console.log('Members is not an array:', typeof members);
    return <div>Loading members...</div>;
  }

  // Filter out any invalid member objects
  const validMembers = members.filter(member => {
    if (!member) return false;
    if (typeof member !== 'object') return false;
    if (!member.name) return false;
    return true;
  });

  console.log('Valid members after filtering:', validMembers);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
        >
          {value ? (
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4 text-gray-500" />
              {validMembers.find((member) => member?.name === value)?.name || value}
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <User className="mr-2 h-4 w-4" />
              Select member...
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white/95 backdrop-blur-md">
        <Command>
          <CommandInput placeholder="Search members..." />
          <CommandEmpty>No member found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {validMembers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No valid members available</p>
              </div>
            ) : (
              validMembers.map((member, index) => {
                // Extra safety check for each member
                if (!member || !member.name) {
                  console.log('Skipping invalid member at index:', index, member);
                  return null;
                }

                return (
                  <CommandItem
                    key={member.id || member.name || `member-${index}`}
                    onSelect={() => {
                      if (member.name && member.phone) {
                        onChange(member.name, member.phone);
                        setOpen(false);
                      } else {
                        console.log('Member missing name or phone:', member);
                      }
                    }}
                    className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center w-full">
                      <CheckIcon
                        className={`mr-2 h-4 w-4 ${
                          value === member.name ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{member.name || 'Unknown'}</span>
                        <span className="text-sm text-gray-500">
                          {member.phone || 'No phone'} • {member.membershipType || 'No type'}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                );
              })
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ============ TRANSACTION DETAILS MODAL ============
const TransactionDetailsModal: React.FC<{
  transaction: Transaction | null;
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}> = ({ transaction, member, isOpen, onClose, onEdit, onDelete }) => {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/40 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-600" />
            Transaction Details
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Complete information for transaction {transaction.transactionId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-white/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Transaction ID</p>
                  <p className="font-mono text-sm">{transaction.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-lg font-bold text-gray-800">Rs.{transaction.amount?.toLocaleString('en-US')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <div className="mt-1">
                    {getTypeBadge(transaction.type)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(transaction.status, transaction.isDeleted)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Info */}
            <Card className="glass-card border-white/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Member Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{transaction.memberName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p>{transaction.memberPhone || 'N/A'}</p>
                </div>
                {member && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">Membership Type</p>
                      <p>{member.membershipType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <Badge className={
                        member.status === 'active' ? 'bg-green-100 text-green-800' :
                        member.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment & Date Info */}
          <Card className="glass-card border-white/40">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="font-medium">{getPaymentMethodDisplay(transaction.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="font-medium">
                    {transaction.createdAt ? 
                      new Date(transaction.createdAt).toLocaleDateString('en-US') : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {transaction.notes && (
            <Card className="glass-card border-white/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{transaction.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Deletion Info */}
          {transaction.isDeleted && (
            <Card className="glass-card border-red-200 bg-red-50/50">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">This transaction has been deleted</span>
                </div>
                {transaction.deletedBy && (
                  <p className="text-sm text-red-600 mt-1">
                    Deleted by: {transaction.deletedBy} on {transaction.deletedAt ? new Date(transaction.deletedAt).toLocaleDateString() : 'Unknown date'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="mt-6">
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {!transaction.isDeleted && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => onEdit(transaction)}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => onDelete(transaction)}
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============ UTILITY FUNCTIONS ============
const getTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    'membership': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    'admission': 'bg-purple-500/20 text-purple-700 border-purple-500/30',
    'personal_training': 'bg-amber-500/20 text-amber-700 border-amber-500/30',
    'supplement': 'bg-green-500/20 text-green-700 border-green-500/30',
    'other': 'bg-gray-500/20 text-gray-700 border-gray-500/30'
  };
  
  const displayType = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  return (
    <Badge className={`${colors[type] || colors['other']} transition-colors duration-150`}>
      {displayType}
    </Badge>
  );
};

const getStatusBadge = (status: string, isDeleted?: boolean) => {
  if (isDeleted) {
    return (
      <Badge className="bg-red-500/20 text-red-700 border-red-500/30">
        Deleted
      </Badge>
    );
  }

  const colors: Record<string, string> = {
    'completed': 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
    'pending': 'bg-amber-500/20 text-amber-700 border-amber-500/30',
    'failed': 'bg-red-500/20 text-red-700 border-red-500/30'
  };
  
  return (
    <Badge className={`${colors[status] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'} transition-colors duration-150`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const getPaymentMethodDisplay = (method: string) => {
  const methods: Record<string, string> = {
    'cash': 'Cash',
    'card': 'Card Payment',
    'bank_transfer': 'Bank Transfer',
    'mobile_wallet': 'Mobile Wallet'
  };
  
  return methods[method] || method;
};

// ============ MAIN TRANSACTIONS COMPONENT ============
const TransactionsComponent = () => {
  // State management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  // Emergency fallback - ensure members is always an array
const safeMembers = Array.isArray(members) ? members : [];
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  
  // Dialog states
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form and action states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReceiptToggled, setIsReceiptToggled] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  // Get notification context
  const { addNotification, isAdmin } = useContext(NotificationContext);

  // React Hook Form setup
  const form = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      memberName: "",
      memberPhone: "",
      amount: "",
      type: "",
      paymentMethod: "",
      date: new Date().toISOString().split('T')[0],
      notes: "",
      sendReceipt: true,
    },
  });

  // Fetch data functions
  const fetchMembers = async () => {
  try {
    console.log('Fetching members...');
    const response = await membersAPI.getAll();
    console.log('Members API response:', response); // Add this
    
    if (response.success) {
      console.log('Members data received:', response.members); // Add this
      console.log('First member structure:', response.members?.[0]); // Add this
      setMembers(response.members || []);
    } else {
      console.error('Failed to fetch members:', response.error);
    }
  } catch (error) {
    console.error('Error fetching members:', error);
  }
};

  const fetchTransactions = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log('Fetching transactions from Google Sheets...');
      const response = await transactionsAPI.getAll();
      
      if (response.success) {
        console.log('Transactions fetched successfully:', response.transactions);
        setTransactions(response.transactions || []);
      } else {
        console.error('Failed to fetch transactions:', response.error);
        setError(response.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Network error: Unable to fetch transactions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchMembers();
    fetchTransactions();
  }, []);

  // Handle member selection in form
  const handleMemberSelect = (memberName: string, memberPhone: string) => {
    form.setValue('memberName', memberName);
    form.setValue('memberPhone', memberPhone);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesDeleted = showDeleted ? true : !transaction.isDeleted;
    
    return matchesSearch && matchesType && matchesStatus && matchesDeleted;
  });

  // Calculate statistics
  const activeTransactions = transactions.filter(t => !t.isDeleted);
  const totalTransactions = activeTransactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  const thisMonthTransactions = activeTransactions.filter(t => {
    const transactionDate = new Date(t.date);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  }).reduce((sum, t) => sum + (t.amount || 0), 0);

  // Submit new transaction
  const onSubmit = async (data: z.infer<typeof transactionFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting transaction data:', data);
      
      const transactionData = {
        memberName: data.memberName,
        memberPhone: data.memberPhone,
        amount: parseFloat(data.amount),
        type: data.type,
        paymentMethod: data.paymentMethod,
        date: data.date,
        notes: data.notes || '',
        status: 'completed'
      };

      const response = await transactionsAPI.add(transactionData);
      
      if (response.success) {
        console.log('Transaction added successfully:', response.transaction);
        
        // Send WhatsApp receipt if toggled
        if (data.sendReceipt) {
          try {
            await whatsappService.sendMemberReceipt(
              data.memberName,
              data.memberPhone,
              data.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              parseFloat(data.amount),
              new Date().toLocaleDateString('en-US')
            );
            console.log('WhatsApp receipt sent');
          } catch (error) {
            console.error('Failed to send WhatsApp receipt:', error);
          }
        }
        
        // Log activity
        await activityLogsAPI.log(
          'add_transaction',
          `Added transaction ${response.transaction?.transactionId} for ${data.memberName} - Rs.${data.amount}`,
          'transaction'
        );
        
        setIsAddTransactionDialogOpen(false);
        setIsSuccessDialogOpen(true);
        
        toast({
          title: "Transaction Added Successfully",
          description: `Rs. ${data.amount} transaction for ${data.memberName} has been recorded.`,
        });
        
        await fetchTransactions();
        form.reset();
      } else {
        throw new Error(response.error || 'Failed to add transaction');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error Adding Transaction",
        description: error instanceof Error ? error.message : "There was a problem adding the transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update transaction
  const onUpdate = async (data: z.infer<typeof transactionFormSchema>) => {
    if (!selectedTransaction) return;
    
    setIsSubmitting(true);
    
    try {
      const transactionData = {
        memberName: data.memberName,
        memberPhone: data.memberPhone,
        amount: parseFloat(data.amount),
        type: data.type,
        paymentMethod: data.paymentMethod,
        date: data.date,
        notes: data.notes || '',
        status: 'completed'
      };

      const response = await enhancedTransactionsAPI.update(selectedTransaction.id, transactionData);
      
      if (response.success) {
        // Log activity
        await activityLogsAPI.log(
          'update_transaction',
          `Updated transaction ${selectedTransaction.transactionId} for ${data.memberName}`,
          'transaction'
        );
        
        setIsEditTransactionDialogOpen(false);
        setSelectedTransaction(null);
        
        toast({
          title: "Transaction Updated Successfully",
          description: `Transaction ${selectedTransaction.transactionId} has been updated.`,
        });
        
        await fetchTransactions();
        form.reset();
      } else {
        throw new Error(response.error || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error Updating Transaction",
        description: error instanceof Error ? error.message : "There was a problem updating the transaction.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete transaction
  const handleDelete = async (transaction: Transaction) => {
    try {
      const response = await enhancedTransactionsAPI.softDelete(transaction.id);
      
      if (response.success) {
        // Log activity
        await activityLogsAPI.log(
          'delete_transaction',
          `Deleted transaction ${transaction.transactionId} for ${transaction.memberName} - Rs.${transaction.amount}`,
          'transaction'
        );
        
        // Add notification for admin
        addNotification(
          'transaction_deleted',
          'Transaction Deleted',
          `${getCurrentUser().name || 'User'} deleted transaction ${transaction.transactionId} (Rs.${transaction.amount?.toLocaleString()}) for ${transaction.memberName}`,
          transaction
        );
        
        toast({
          title: "Transaction Deleted",
          description: `Transaction ${transaction.transactionId} has been deleted.`,
        });
        
        await fetchTransactions();
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
      } else {
        throw new Error(response.error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error Deleting Transaction",
        description: error instanceof Error ? error.message : "There was a problem deleting the transaction.",
        variant: "destructive",
      });
    }
  };

  // Restore transaction
  const handleRestore = async (transaction: Transaction) => {
    try {
      const response = await enhancedTransactionsAPI.restore(transaction.id);
      
      if (response.success) {
        // Log activity
        await activityLogsAPI.log(
          'restore_transaction',
          `Restored transaction ${transaction.transactionId} for ${transaction.memberName}`,
          'transaction'
        );
        
        toast({
          title: "Transaction Restored",
          description: `Transaction ${transaction.transactionId} has been restored.`,
        });
        
        await fetchTransactions();
      } else {
        throw new Error(response.error || 'Failed to restore transaction');
      }
    } catch (error) {
      console.error('Error restoring transaction:', error);
      toast({
        title: "Error Restoring Transaction",
        description: error instanceof Error ? error.message : "There was a problem restoring the transaction.",
        variant: "destructive",
      });
    }
  };

  // Get current user
  const getCurrentUser = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : { name: 'Unknown User' };
    } catch {
      return { name: 'Unknown User' };
    }
  };

  // Handle transaction details view
  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    form.setValue('memberName', transaction.memberName);
    form.setValue('memberPhone', transaction.memberPhone || '');
    form.setValue('amount', transaction.amount.toString());
    form.setValue('type', transaction.type);
    form.setValue('paymentMethod', transaction.paymentMethod);
    form.setValue('date', transaction.date);
    form.setValue('notes', transaction.notes || '');
    form.setValue('sendReceipt', false);
    setIsDetailsModalOpen(false);
    setIsEditTransactionDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDetailsModalOpen(false);
    setDeleteDialogOpen(true);
  };

  // Get selected member details
  const getSelectedMemberDetails = (memberName: string): Member | null => {
    return members.find(member => member.name === memberName) || null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading transactions and members...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to Load Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchTransactions()} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 flex items-center">
            <CreditCard className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
            Transactions
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Track and manage all financial transactions
          </p>
        </div>
        <div className="flex gap-2">
          <NotificationBell />
          <Button 
            onClick={() => fetchTransactions(true)} 
            variant="outline"
            disabled={isRefreshing}
            className="bg-white/60 hover:bg-white"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button 
            onClick={() => setIsAddTransactionDialogOpen(true)} 
            className="w-full sm:w-auto premium-button transition-transform duration-200 hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Rs.{totalTransactions.toLocaleString('en-US')}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Month</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Rs.{thisMonthTransactions.toLocaleString('en-US')}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Entries</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{activeTransactions.length}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/40">
        <CardContent className="pt-4 sm:pt-6">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5 lg:gap-4">
            <div className="col-span-1 lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by member name or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 border-white/60 text-gray-800 placeholder:text-gray-500 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full bg-white/70 border-white/60 text-gray-800 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="membership">Membership</SelectItem>
                  <SelectItem value="admission">Admission</SelectItem>
                  <SelectItem value="personal_training">Personal Training</SelectItem>
                  <SelectItem value="supplement">Supplement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-white/70 border-white/60 text-gray-800 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              {isAdmin && (
                <Button
                  variant={showDeleted ? "default" : "outline"}
                  onClick={() => setShowDeleted(!showDeleted)}
                  className={`${showDeleted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/70 border-white/60 transition-colors hover:bg-white/90'}`}
                >
                  {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
                </Button>
              )}
              <Button
                variant="outline"
                className="bg-white/70 border-white/60 transition-colors hover:bg-white/90"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Transaction Views */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-[400px] mb-4">
          <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
            List View
          </TabsTrigger>
          <TabsTrigger value="cards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
            Card View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-0 animate-in fade-in-50 slide-in-from-left-3 duration-300">
          {/* Desktop Table View */}
          <Card className="glass-card border-white/40 hidden md:block">
            <CardContent className="p-0 overflow-x-auto">
              {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">
                    {transactions.length === 0 ? 'No transactions yet' : 'No transactions found'}
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {transactions.length === 0 
                      ? 'Add your first transaction to get started' 
                      : 'Try adjusting your search or filters'
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-600">Transaction ID</TableHead>
                      <TableHead className="text-gray-600">Member</TableHead>
                      <TableHead className="text-gray-600">Type</TableHead>
                      <TableHead className="text-gray-600">Amount</TableHead>
                      <TableHead className="text-gray-600">Payment Method</TableHead>
                      <TableHead className="text-gray-600">Date</TableHead>
                      <TableHead className="text-gray-600">Status</TableHead>
                      <TableHead className="text-gray-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow 
                        key={transaction.id} 
                        className={`border-gray-100 hover:bg-white/50 transition-colors duration-150 ${
                          transaction.isDeleted ? 'opacity-60 bg-red-50/30' : ''
                        }`}
                      >
                        <TableCell className={`text-gray-700 font-medium ${transaction.isDeleted ? 'line-through' : ''}`}>
                          {transaction.transactionId}
                        </TableCell>
                        <TableCell className={`text-gray-800 ${transaction.isDeleted ? 'line-through' : ''}`}>
                          {transaction.memberName}
                        </TableCell>
                        <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                        <TableCell className={`text-gray-800 font-semibold ${transaction.isDeleted ? 'line-through' : ''}`}>
                          Rs.{transaction.amount ? transaction.amount.toLocaleString('en-US') : '0'}
                        </TableCell>
                        <TableCell className={`text-gray-700 ${transaction.isDeleted ? 'line-through' : ''}`}>
                          {getPaymentMethodDisplay(transaction.paymentMethod)}
                        </TableCell>
                        <TableCell className={`text-gray-600 ${transaction.isDeleted ? 'line-through' : ''}`}>
                          {transaction.date ? new Date(transaction.date).toLocaleDateString('en-US') : 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status, transaction.isDeleted)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(transaction)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!transaction.isDeleted ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditTransaction(transaction)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteConfirmation(transaction)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : isAdmin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRestore(transaction)}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Undo className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Mobile Cards View */}
          <div className="space-y-4 md:hidden">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 bg-white/50 rounded-lg">
                <CreditCard className="h-10 w-10 text-gray-400 mb-3" />
                <h3 className="text-base font-medium text-gray-700">
                  {transactions.length === 0 ? 'No transactions yet 📭' : 'No transactions found 📭'}
                </h3>
                <p className="text-gray-500 mt-1 text-sm">
                  {transactions.length === 0 
                    ? 'Add your first transaction to get started' 
                    : 'Try adjusting your search or filters'
                  }
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card 
                  key={transaction.id} 
                  className={`glass-card border-white/40 hover:shadow-md transition-all duration-200 ${
                    transaction.isDeleted ? 'opacity-60 border-red-200 bg-red-50/30' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-xs text-gray-500 ${transaction.isDeleted ? 'line-through' : ''}`}>
                          {transaction.transactionId}
                        </p>
                        <h3 className={`font-semibold text-gray-800 text-lg ${transaction.isDeleted ? 'line-through' : ''}`}>
                          {transaction.memberName}
                        </h3>
                      </div>
                      <div>
                        {getStatusBadge(transaction.status, transaction.isDeleted)}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div>{getTypeBadge(transaction.type)}</div>
                      <div className={`text-lg font-bold text-gray-800 ${transaction.isDeleted ? 'line-through' : ''}`}>
                        Rs.{transaction.amount ? transaction.amount.toLocaleString('en-US') : '0'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-white/40 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Payment Method</p>
                        <p className={`text-sm font-medium text-gray-700 ${transaction.isDeleted ? 'line-through' : ''}`}>
                          {getPaymentMethodDisplay(transaction.paymentMethod)}
                        </p>
                      </div>
                      <div className="bg-white/40 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Date</p>
                        <p className={`text-sm font-medium text-gray-700 ${transaction.isDeleted ? 'line-through' : ''}`}>
                          {transaction.date ? new Date(transaction.date).toLocaleDateString('en-US') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs bg-white/60 hover:bg-white transition-colors duration-150"
                        onClick={() => handleViewDetails(transaction)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      {!transaction.isDeleted ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 text-xs bg-white/60 hover:bg-white transition-colors duration-150"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="flex-1 text-xs"
                            onClick={() => handleDeleteConfirmation(transaction)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </>
                      ) : isAdmin && (
                        <Button 
                          size="sm" 
                          className="flex-1 text-xs bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleRestore(transaction)}
                        >
                          <Undo className="mr-1 h-3 w-3" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="cards" className="animate-in fade-in-50 slide-in-from-right-3 duration-300">
          {/* Card View */}
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white/50 rounded-lg">
              <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                {transactions.length === 0 ? 'No transactions yet 📭' : 'No transactions found 📭'}
              </h3>
              <p className="text-gray-500 mt-1">
                {transactions.length === 0 
                  ? 'Add your first transaction to get started' 
                  : 'Try adjusting your search or filters'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTransactions.map((transaction) => (
                <Card 
                  key={transaction.id} 
                  className={`glass-card border-white/40 hover:shadow-xl transition-all duration-200 ${
                    transaction.isDeleted ? 'opacity-60 border-red-200 bg-red-50/30' : ''
                  }`}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className={`text-xs text-gray-500 ${transaction.isDeleted ? 'line-through' : ''}`}>
                          {transaction.transactionId}
                        </p>
                        <h3 className={`font-semibold text-gray-800 ${transaction.isDeleted ? 'line-through' : ''}`}>
                          {transaction.memberName}
                        </h3>
                      </div>
                      <div>
                        {getStatusBadge(transaction.status, transaction.isDeleted)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div>{getTypeBadge(transaction.type)}</div>
                      <div className={`text-xl font-bold text-gray-800 ${transaction.isDeleted ? 'line-through' : ''}`}>
                        Rs.{transaction.amount ? transaction.amount.toLocaleString('en-US') : '0'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-xs">
                        <p className="text-gray-500">Payment Method</p>
                        <p className={`text-gray-800 font-medium ${transaction.isDeleted ? 'line-through' : ''}`}>
                          {getPaymentMethodDisplay(transaction.paymentMethod)}
                        </p>
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-500">Date</p>
                        <p className={`text-gray-800 font-medium ${transaction.isDeleted ? 'line-through' : ''}`}>
                          {transaction.date ? new Date(transaction.date).toLocaleDateString('en-US') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs bg-white/60 hover:bg-white transition-colors duration-150"
                        onClick={() => handleViewDetails(transaction)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      {!transaction.isDeleted ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 text-xs bg-white/60 hover:bg-white transition-colors duration-150"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="flex-1 text-xs"
                            onClick={() => handleDeleteConfirmation(transaction)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </>
                      ) : isAdmin && (
                        <Button 
                          size="sm" 
                          className="flex-1 text-xs bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleRestore(transaction)}
                        >
                          <Undo className="mr-1 h-3 w-3" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
              Add New Transaction
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Complete the form below to record a new financial transaction.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="memberName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Select Member</FormLabel>
                      <FormControl>
                        <MemberSelector
                          value={field.value}
                          onChange={handleMemberSelect}
                          members={safeMembers}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="memberPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Member Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="03xx-xxxxxxx" 
                          className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                          {...field} 
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Amount (Rs)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            type="number" 
                            placeholder="Enter amount" 
                            className="pl-10 bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            type="date" 
                            className="pl-10 bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Transaction Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white/95 backdrop-blur-md">
                          <SelectItem value="membership">Membership</SelectItem>
                          <SelectItem value="admission">Admission</SelectItem>
                          <SelectItem value="personal_training">Personal Training</SelectItem>
                          <SelectItem value="supplement">Supplement</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white/95 backdrop-blur-md">
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card Payment</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="mobile_wallet">Mobile Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Additional notes" 
                        className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* WhatsApp Receipt Toggle */}
              <FormField
                control={form.control}
                name="sendReceipt"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200/50 p-3 shadow-sm bg-white/40">
                    <div className="space-y-0.5">
                      <FormLabel className="text-gray-700 flex items-center">
                        <Send className="mr-2 h-4 w-4 text-green-600" />
                        Send WhatsApp Receipt
                      </FormLabel>
                      <FormDescription className="text-xs text-gray-500">
                        Send a payment receipt to member via WhatsApp
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className={`transition-colors duration-200 w-11 h-6 bg-${field.value ? 'green-500' : 'gray-300'} rounded-full relative cursor-pointer`}
                        onClick={() => {
                          form.setValue('sendReceipt', !field.value);
                          setIsReceiptToggled(!isReceiptToggled);
                        }}>
                        <div className={`transition-transform duration-200 w-5 h-5 rounded-full bg-white absolute top-0.5 ${field.value ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="bg-white/70 border-white/60 transition-colors hover:bg-gray-100" 
                  onClick={() => setIsAddTransactionDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="premium-button transition-all duration-200 hover:shadow-lg disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Transaction...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Transaction
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditTransactionDialogOpen} onOpenChange={setIsEditTransactionDialogOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <Edit className="mr-2 h-5 w-5 text-blue-600" />
              Edit Transaction
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Update transaction information below.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="memberName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Select Member</FormLabel>
                      <FormControl>
                        <MemberSelector
                          value={field.value}
                          onChange={handleMemberSelect}
                          members={safeMembers}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="memberPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Member Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="03xx-xxxxxxx" 
                          className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                          {...field} 
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Amount (Rs)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            type="number" 
                            placeholder="Enter amount" 
                            className="pl-10 bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            type="date" 
                            className="pl-10 bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Transaction Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white/95 backdrop-blur-md">
                          <SelectItem value="membership">Membership</SelectItem>
                          <SelectItem value="admission">Admission</SelectItem>
                          <SelectItem value="personal_training">Personal Training</SelectItem>
                          <SelectItem value="supplement">Supplement</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white/95 backdrop-blur-md">
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card Payment</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="mobile_wallet">Mobile Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Additional notes" 
                        className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
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
                  className="bg-white/70 border-white/60 transition-colors hover:bg-gray-100" 
                  onClick={() => {
                    setIsEditTransactionDialogOpen(false);
                    setSelectedTransaction(null);
                    form.reset();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="premium-button transition-all duration-200 hover:shadow-lg disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Transaction...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Update Transaction
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        member={selectedTransaction ? getSelectedMemberDetails(selectedTransaction.memberName) : null}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTransaction(null);
        }}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteConfirmation}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-white/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Delete Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete transaction <strong>{transactionToDelete?.transactionId}</strong> for <strong>{transactionToDelete?.memberName}</strong>?
              <br /><br />
              <span className="text-sm text-gray-600">
                This will mark the transaction as deleted and notify admins. The transaction can be restored later.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white/70 border-white/60 transition-colors hover:bg-gray-100"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTransactionToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => transactionToDelete && handleDelete(transactionToDelete)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in-50 duration-300">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-800 text-center">
              Transaction Added Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center mt-2">
              The transaction has been recorded in your Google Sheets database.
              {isReceiptToggled && (
                <div className="flex items-center justify-center mt-2 text-green-600">
                  <Send className="h-4 w-4 mr-1" />
                  WhatsApp receipt has been sent
                </div>
              )}
            </DialogDescription>
            
            <div className="mt-6 w-full flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-white/70 border-white/60 transition-colors hover:bg-gray-100"
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                  setIsAddTransactionDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another
              </Button>
              <Button
                className="flex-1 premium-button transition-all duration-200"
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                }}
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

// ============ MAIN EXPORT WITH NOTIFICATION PROVIDER ============
const Transactions = () => {
  return (
    <NotificationProvider>
      <TransactionsComponent />
    </NotificationProvider>
  );
};

export default Transactions;