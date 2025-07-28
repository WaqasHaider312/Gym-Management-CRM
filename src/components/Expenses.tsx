import React, { useState, useEffect, useContext } from 'react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Receipt, 
  Search, 
  Plus, 
  IndianRupee,
  Calendar,
  TrendingDown,
  Lightbulb,
  Wrench,
  ShoppingCart,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Undo,
  FileText,
  User,
  Clock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { expensesAPI, activityLogsAPI } from '@/services/googleSheetsAPI';
import { useAuth } from './AuthContext';

// ============ INTERFACES ============
interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  addedBy: string;
  notes?: string;
  receipt?: string;
  isDeleted?: boolean;
  deletedBy?: string;
  deletedAt?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  createdAt?: string;
}

interface NotificationContextType {
  addNotification: (type: string, title: string, message: string, data?: any) => void;
  isAdmin: boolean;
}

// ============ NOTIFICATION CONTEXT ============
// Note: This should be imported from your main notification context
// For now, creating a minimal context - replace with your actual NotificationContext
const NotificationContext = React.createContext<NotificationContextType>({
  addNotification: () => {},
  isAdmin: false,
});

// ============ FORM SCHEMAS ============
const expenseFormSchema = z.object({
  description: z.string().min(3, { message: "Description must be at least 3 characters" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  category: z.string({
    required_error: "Please select a category",
  }),
  date: z.string().min(1, { message: "Date is required" }),
  notes: z.string().optional(),
});

// ============ ENHANCED EXPENSES API ============
const enhancedExpensesAPI = {
  ...expensesAPI,
  
  // Update existing expense
  update: async (expenseId: string, expenseData: any) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const params = new URLSearchParams();
      params.append('action', 'updateExpense');
      params.append('expenseId', expenseId);
      params.append('description', expenseData.description || '');
      params.append('amount', expenseData.amount || '0');
      params.append('category', expenseData.category || 'Other');
      params.append('date', expenseData.date || new Date().toISOString().split('T')[0]);
      params.append('notes', expenseData.notes || '');
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
      console.error('Failed to update expense:', error);
      return { success: false, error: 'Failed to update expense' };
    }
  },

  // Soft delete expense
  softDelete: async (expenseId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const params = new URLSearchParams();
      params.append('action', 'softDeleteExpense');
      params.append('expenseId', expenseId);
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
      console.error('Failed to delete expense:', error);
      return { success: false, error: 'Failed to delete expense' };
    }
  },

  // Restore deleted expense
  restore: async (expenseId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const params = new URLSearchParams();
      params.append('action', 'restoreExpense');
      params.append('expenseId', expenseId);
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
      console.error('Failed to restore expense:', error);
      return { success: false, error: 'Failed to restore expense' };
    }
  }
};

// ============ EXPENSE DETAILS MODAL ============
const ExpenseDetailsModal: React.FC<{
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  canEdit: boolean;
  canDelete: boolean;
}> = ({ expense, isOpen, onClose, onEdit, onDelete, canEdit, canDelete }) => {
  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/40 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <Receipt className="mr-2 h-5 w-5 text-orange-600" />
            Expense Details
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Complete information for expense: {expense.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Expense Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-white/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Expense Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="font-medium text-gray-800">{expense.description}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-lg font-bold text-gray-800">Rs.{expense.amount?.toLocaleString('en-US')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <div className="mt-1">
                    {getCategoryBadge(expense.category)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium text-gray-700">
                    {new Date(expense.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Audit Info */}
            <Card className="glass-card border-white/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Audit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Added By</p>
                  <p className="font-medium">{expense.addedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p>{expense.createdAt ? new Date(expense.createdAt).toLocaleDateString('en-US') : 'N/A'}</p>
                </div>
                {expense.lastEditedBy && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">Last Edited By</p>
                      <p className="font-medium">{expense.lastEditedBy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Edited</p>
                      <p>{expense.lastEditedAt ? new Date(expense.lastEditedAt).toLocaleDateString('en-US') : 'N/A'}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {expense.notes && (
            <Card className="glass-card border-white/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{expense.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Deletion Info */}
          {expense.isDeleted && (
            <Card className="glass-card border-red-200 bg-red-50/50">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">This expense has been deleted</span>
                </div>
                {expense.deletedBy && (
                  <p className="text-sm text-red-600 mt-1">
                    Deleted by: {expense.deletedBy} on {expense.deletedAt ? new Date(expense.deletedAt).toLocaleDateString() : 'Unknown date'}
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
            {!expense.isDeleted && (
              <>
                {canEdit && (
                  <Button 
                    variant="outline" 
                    onClick={() => onEdit(expense)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button 
                    variant="destructive" 
                    onClick={() => onDelete(expense)}
                    className="flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============ UTILITY FUNCTIONS ============
const getCategoryBadge = (category: string) => {
  const colors = {
    'Utilities': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    'Equipment': 'bg-green-500/20 text-green-700 border-green-500/30',
    'Maintenance': 'bg-orange-500/20 text-orange-700 border-orange-500/30',
    'Staff': 'bg-purple-500/20 text-purple-700 border-purple-500/30',
    'Other': 'bg-gray-500/20 text-gray-700 border-gray-500/30'
  };
  return (
    <Badge className={`${colors[category as keyof typeof colors] || colors['Other']} transition-colors duration-150`}>
      {category}
    </Badge>
  );
};

const getStatusBadge = (expense: Expense) => {
  if (expense.isDeleted) {
    return (
      <Badge className="bg-red-500/20 text-red-700 border-red-500/30">
        Deleted
      </Badge>
    );
  }
  return null;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Utilities': return Lightbulb;
    case 'Equipment': return Wrench;
    case 'Maintenance': return ShoppingCart;
    default: return Receipt;
  }
};

// ============ MAIN EXPENSES COMPONENT ============
const Expenses = () => {
  const { user } = useAuth();
  const { addNotification, isAdmin } = useContext(NotificationContext);
  
  // State management
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  
  // Dialog states
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // React Hook Form setup
  const form = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  // Permission checks
  const canEditExpense = (expense: Expense) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'partner') return true;
    return expense.addedBy === user.name;
  };

  const canDeleteExpense = (expense: Expense) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'partner') return true;
    return expense.addedBy === user.name;
  };

  // Fetch expenses from Google Sheets
  const fetchExpenses = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log('Fetching expenses from Google Sheets...');
      const response = await expensesAPI.getAll();
      
      if (response.success) {
        console.log('Expenses fetched successfully:', response.expenses);
        setExpenses(response.expenses || []);
      } else {
        console.error('Failed to fetch expenses:', response.error);
        setError(response.error || 'Failed to fetch expenses');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Network error: Unable to fetch expenses');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load expenses on component mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesDeleted = showDeleted ? true : !expense.isDeleted;
    return matchesSearch && matchesCategory && matchesDeleted;
  });

  // Calculate statistics
  const activeExpenses = expenses.filter(e => !e.isDeleted);
  const totalExpenses = activeExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const thisMonthExpenses = activeExpenses.filter(e => {
    const expenseDate = new Date(e.date);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  }).reduce((sum, e) => sum + (e.amount || 0), 0);
  const uniqueCategories = new Set(activeExpenses.map(e => e.category)).size;

  // Submit new expense
  const onSubmit = async (values: z.infer<typeof expenseFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting expense data:', values);
      
      const expenseData = {
        description: values.description,
        amount: parseFloat(values.amount),
        category: values.category,
        date: values.date,
        addedBy: user?.name || 'Admin',
        notes: values.notes || ''
      };

      const response = await expensesAPI.add(expenseData);
      
      if (response.success) {
        console.log('Expense added successfully:', response.expense);
        
        // Log activity
        await activityLogsAPI.log(
          'add_expense',
          `Added expense "${values.description}" - Rs.${values.amount}`,
          'expense'
        );
        
        // Add notification for admin
        addNotification(
          'expense_added',
          'New Expense Added',
          `${user?.name || 'User'} added expense "${values.description}" (Rs.${values.amount}) in ${values.category} category`,
          expenseData
        );
        
        setIsAddExpenseDialogOpen(false);
        setIsSuccessDialogOpen(true);
        
        toast({
          title: "Expense Added Successfully",
          description: `"${values.description}" has been recorded.`,
        });
        
        await fetchExpenses();
        form.reset();
      } else {
        throw new Error(response.error || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error Adding Expense",
        description: error instanceof Error ? error.message : "There was a problem adding the expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update expense
  const onUpdate = async (values: z.infer<typeof expenseFormSchema>) => {
    if (!selectedExpense) return;
    
    setIsSubmitting(true);
    
    try {
      const expenseData = {
        description: values.description,
        amount: parseFloat(values.amount),
        category: values.category,
        date: values.date,
        notes: values.notes || ''
      };

      const response = await enhancedExpensesAPI.update(selectedExpense.id, expenseData);
      
      if (response.success) {
        // Log activity
        await activityLogsAPI.log(
          'update_expense',
          `Updated expense "${values.description}" - changed amount to Rs.${values.amount}`,
          'expense'
        );
        
        // Add notification for admin
        addNotification(
          'expense_updated',
          'Expense Updated',
          `${user?.name || 'User'} updated expense "${selectedExpense.description}" - changed amount from Rs.${selectedExpense.amount?.toLocaleString()} to Rs.${values.amount}`,
          { original: selectedExpense, updated: expenseData }
        );
        
        setIsEditExpenseDialogOpen(false);
        setSelectedExpense(null);
        
        toast({
          title: "Expense Updated Successfully",
          description: `"${values.description}" has been updated.`,
        });
        
        await fetchExpenses();
        form.reset();
      } else {
        throw new Error(response.error || 'Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error Updating Expense",
        description: error instanceof Error ? error.message : "There was a problem updating the expense.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete expense
  const handleDelete = async (expense: Expense) => {
    try {
      const response = await enhancedExpensesAPI.softDelete(expense.id);
      
      if (response.success) {
        // Log activity
        await activityLogsAPI.log(
          'delete_expense',
          `Deleted expense "${expense.description}" - Rs.${expense.amount}`,
          'expense'
        );
        
        // Add notification for admin
        addNotification(
          'expense_deleted',
          'Expense Deleted',
          `${user?.name || 'User'} deleted expense "${expense.description}" (Rs.${expense.amount?.toLocaleString()}) from ${expense.category} category`,
          expense
        );
        
        toast({
          title: "Expense Deleted",
          description: `"${expense.description}" has been deleted.`,
        });
        
        await fetchExpenses();
        setDeleteDialogOpen(false);
        setExpenseToDelete(null);
      } else {
        throw new Error(response.error || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error Deleting Expense",
        description: error instanceof Error ? error.message : "There was a problem deleting the expense.",
        variant: "destructive",
      });
    }
  };

  // Restore expense
  const handleRestore = async (expense: Expense) => {
    try {
      const response = await enhancedExpensesAPI.restore(expense.id);
      
      if (response.success) {
        // Log activity
        await activityLogsAPI.log(
          'restore_expense',
          `Restored expense "${expense.description}"`,
          'expense'
        );
        
        toast({
          title: "Expense Restored",
          description: `"${expense.description}" has been restored.`,
        });
        
        await fetchExpenses();
      } else {
        throw new Error(response.error || 'Failed to restore expense');
      }
    } catch (error) {
      console.error('Error restoring expense:', error);
      toast({
        title: "Error Restoring Expense",
        description: error instanceof Error ? error.message : "There was a problem restoring the expense.",
        variant: "destructive",
      });
    }
  };

  // Handle expense details view
  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailsModalOpen(true);
  };

  // Handle edit expense
  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    form.setValue('description', expense.description);
    form.setValue('amount', expense.amount.toString());
    form.setValue('category', expense.category);
    form.setValue('date', expense.date);
    form.setValue('notes', expense.notes || '');
    setIsDetailsModalOpen(false);
    setIsEditExpenseDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDetailsModalOpen(false);
    setDeleteDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading expenses from Google Sheets...</p>
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
            <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to Load Expenses</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchExpenses()} className="bg-orange-600 hover:bg-orange-700">
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
            <Receipt className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 sm:w-7 text-orange-600" />
            Expenses Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Track and manage all gym operational expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => fetchExpenses(true)} 
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
            onClick={() => setIsAddExpenseDialogOpen(true)} 
            className="w-full sm:w-auto premium-button transition-transform duration-200 hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards - Using Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Rs.{totalExpenses.toLocaleString('en-US')}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Month</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Rs.{thisMonthExpenses.toLocaleString('en-US')}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Categories</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{uniqueCategories}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg">
                <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/40">
        <CardContent className="pt-4 sm:pt-6">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4 lg:gap-4">
            <div className="col-span-1 lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search expenses by description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 border-white/60 text-gray-800 placeholder:text-gray-500 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full bg-white/70 border-white/60 text-gray-800 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              {(isAdmin || user?.role === 'partner') && (
                <Button
                  variant={showDeleted ? "default" : "outline"}
                  onClick={() => setShowDeleted(!showDeleted)}
                  className={`${showDeleted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/70 border-white/60 transition-colors hover:bg-white/90'}`}
                >
                  {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Cards - Mobile */}
      <div className="block lg:hidden space-y-4 animate-in fade-in-50 duration-300">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 bg-white/50 rounded-lg">
            <Receipt className="h-10 w-10 text-gray-400 mb-3" />
            <h3 className="text-base font-medium text-gray-700">
              {expenses.length === 0 ? 'No expenses yet 📭' : 'No expenses found 📭'}
            </h3>
            <p className="text-gray-500 mt-1 text-sm">
              {expenses.length === 0 
                ? 'Add your first expense to get started' 
                : 'Try adjusting your search or filters'
              }
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <Card 
              key={expense.id} 
              className={`glass-card border-white/40 hover:shadow-md transition-all duration-200 ${
                expense.isDeleted ? 'opacity-60 border-red-200 bg-red-50/30' : ''
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-gray-800 text-lg ${expense.isDeleted ? 'line-through' : ''}`}>
                      {expense.description}
                    </h3>
                    <p className={`text-xs text-gray-500 mt-1 ${expense.isDeleted ? 'line-through' : ''}`}>
                      {expense.date ? new Date(expense.date).toLocaleDateString('en-US') : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold text-gray-800 ${expense.isDeleted ? 'line-through' : ''}`}>
                      Rs.{expense.amount ? expense.amount.toLocaleString('en-US') : '0'}
                    </p>
                    {expense.isDeleted && getStatusBadge(expense)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <div className="mt-1">{getCategoryBadge(expense.category)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Added By</p>
                    <p className={`text-sm text-gray-600 mt-1 ${expense.isDeleted ? 'line-through' : ''}`}>
                      {expense.addedBy}
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs bg-white/60 hover:bg-white transition-colors duration-150"
                    onClick={() => handleViewDetails(expense)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  {!expense.isDeleted ? (
                    <>
                      {canEditExpense(expense) && (
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="flex-1 text-xs bg-white/60 hover:bg-white transition-colors duration-150"
                          onClick={() => handleEditExpense(expense)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                      )}
                      {canDeleteExpense(expense) && (
                        <Button 
                          variant="destructive"
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => handleDeleteConfirmation(expense)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      )}
                    </>
                  ) : (isAdmin || user?.role === 'partner') && (
                    <Button 
                      size="sm" 
                      className="flex-1 text-xs bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleRestore(expense)}
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

      {/* Expenses Table - Desktop */}
      <Card className="glass-card border-white/40 hidden lg:block animate-in fade-in-50 duration-300">
        <CardHeader>
          <CardTitle className="text-gray-800">
            Expense Records ({filteredExpenses.length})
          </CardTitle>
          <CardDescription className="text-gray-600">
            Detailed view of all operational expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 bg-white/50 rounded-lg">
              <Receipt className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                {expenses.length === 0 ? 'No expenses yet 📭' : 'No expenses found 📭'}
              </h3>
              <p className="text-gray-500 mt-1">
                {expenses.length === 0 
                  ? 'Add your first expense to get started' 
                  : 'Try adjusting your search or filters'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600">Description</TableHead>
                    <TableHead className="text-gray-600">Amount</TableHead>
                    <TableHead className="text-gray-600">Category</TableHead>
                    <TableHead className="text-gray-600">Date</TableHead>
                    <TableHead className="text-gray-600">Added By</TableHead>
                    <TableHead className="text-gray-600">Status</TableHead>
                    <TableHead className="text-gray-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow 
                      key={expense.id} 
                      className={`border-gray-100 hover:bg-white/50 transition-colors duration-150 ${
                        expense.isDeleted ? 'opacity-60 bg-red-50/30' : ''
                      }`}
                    >
                      <TableCell className={`text-gray-800 font-medium ${expense.isDeleted ? 'line-through' : ''}`}>
                        {expense.description}
                      </TableCell>
                      <TableCell className={`text-gray-800 font-semibold ${expense.isDeleted ? 'line-through' : ''}`}>
                        Rs.{expense.amount ? expense.amount.toLocaleString('en-US') : '0'}
                      </TableCell>
                      <TableCell>{getCategoryBadge(expense.category)}</TableCell>
                      <TableCell className={`text-gray-600 ${expense.isDeleted ? 'line-through' : ''}`}>
                        {expense.date ? new Date(expense.date).toLocaleDateString('en-US') : 'N/A'}
                      </TableCell>
                      <TableCell className={`text-gray-600 ${expense.isDeleted ? 'line-through' : ''}`}>
                        {expense.addedBy}
                      </TableCell>
                      <TableCell>
                        {expense.isDeleted ? getStatusBadge(expense) : <Badge className="bg-green-100 text-green-800">Active</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(expense)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!expense.isDeleted ? (
                            <>
                              {canEditExpense(expense) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditExpense(expense)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDeleteExpense(expense) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteConfirmation(expense)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          ) : (isAdmin || user?.role === 'partner') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRestore(expense)}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <Receipt className="mr-2 h-5 w-5 text-orange-600" />
              Add New Expense
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Complete the form below to record a new expense.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter expense description" 
                        className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 backdrop-blur-md">
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  onClick={() => setIsAddExpenseDialogOpen(false)}
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
                      Adding to Google Sheets...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Expense
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditExpenseDialogOpen} onOpenChange={setIsEditExpenseDialogOpen}>
        <DialogContent className="glass-card border-white/40 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <Edit className="mr-2 h-5 w-5 text-orange-600" />
              Edit Expense
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Update expense information below.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter expense description" 
                        className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 backdrop-blur-md">
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    setIsEditExpenseDialogOpen(false);
                    setSelectedExpense(null);
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
                      Updating Expense...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Update Expense
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Expense Details Modal */}
      <ExpenseDetailsModal
        expense={selectedExpense}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedExpense(null);
        }}
        onEdit={handleEditExpense}
        onDelete={handleDeleteConfirmation}
        canEdit={selectedExpense ? canEditExpense(selectedExpense) : false}
        canDelete={selectedExpense ? canDeleteExpense(selectedExpense) : false}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-white/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Delete Expense
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the expense <strong>"{expenseToDelete?.description}"</strong> for <strong>Rs.{expenseToDelete?.amount?.toLocaleString()}</strong>?
              <br /><br />
              <span className="text-sm text-gray-600">
                This will mark the expense as deleted and notify admins. The expense can be restored later.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white/70 border-white/60 transition-colors hover:bg-gray-100"
              onClick={() => {
                setDeleteDialogOpen(false);
                setExpenseToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => expenseToDelete && handleDelete(expenseToDelete)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Expense
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
              Expense Added Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center mt-2">
              The expense has been recorded in your Google Sheets database.
            </DialogDescription>
            
            <div className="mt-6 w-full flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-white/70 border-white/60 transition-colors hover:bg-gray-100"
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                  setIsAddExpenseDialogOpen(true);
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

export default Expenses;