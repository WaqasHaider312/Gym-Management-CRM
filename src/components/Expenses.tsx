import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  Calendar,
  TrendingDown,
  Lightbulb,
  Wrench,
  ShoppingCart,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  X,
  User,
  IndianRupee
} from 'lucide-react';

// TypeScript interfaces
interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  addedBy: string;
  notes?: string;
  memberName?: string;
  memberId?: string;
  isDeleted?: boolean;
  createdAt?: string;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  status: string;
}

interface FormData {
  description: string;
  amount: string;
  category: string;
  date: string;
  notes: string;
  memberId: string;
}

interface FormErrors {
  description?: string;
  amount?: string;
  category?: string;
  date?: string;
}

interface Notification {
  title: string;
  description: string;
  type: string;
}

// API Response interfaces
interface ApiResponse<T> {
  success: boolean;
  error?: string;
  message?: string;
}

interface ExpensesResponse extends ApiResponse<Expense[]> {
  expenses?: Expense[];
}

interface MembersResponse extends ApiResponse<Member[]> {
  members?: Member[];
}

interface ExpenseResponse extends ApiResponse<Expense> {
  expense?: Expense;
}

// Mock API functions - replace with your actual implementation
const mockAPI = {
  expensesAPI: {
    getAll: async (): Promise<ExpensesResponse> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        expenses: [
          {
            id: 'EXP-001',
            description: 'Electricity Bill',
            amount: 5000,
            category: 'Utilities',
            date: '2025-07-20',
            addedBy: 'Admin',
            notes: 'Monthly electricity bill',
            memberName: 'John Doe',
            memberId: 'MEM-001',
            isDeleted: false,
            createdAt: '2025-07-20T10:00:00Z'
          },
          {
            id: 'EXP-002',
            description: 'New Dumbbells',
            amount: 15000,
            category: 'Equipment',
            date: '2025-07-22',
            addedBy: 'Admin',
            notes: 'Set of adjustable dumbbells',
            isDeleted: false,
            createdAt: '2025-07-22T14:30:00Z'
          },
          {
            id: 'EXP-003',
            description: 'Old Equipment',
            amount: 8000,
            category: 'Equipment',
            date: '2025-07-15',
            addedBy: 'Admin',
            notes: 'Deleted equipment purchase',
            isDeleted: true,
            createdAt: '2025-07-15T09:00:00Z'
          }
        ]
      };
    },
    add: async (data: any): Promise<ExpenseResponse> => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, expense: { id: 'EXP-' + Date.now(), ...data } };
    },
    update: async (id: string, data: any): Promise<ExpenseResponse> => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, expense: { id, ...data } };
    },
    delete: async (id: string): Promise<ApiResponse<void>> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    }
  },
  membersAPI: {
    getAll: async (): Promise<MembersResponse> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        members: [
          { id: 'MEM-001', name: 'John Doe', phone: '+92-300-1234567', status: 'active' },
          { id: 'MEM-002', name: 'Jane Smith', phone: '+92-301-2345678', status: 'active' },
          { id: 'MEM-003', name: 'Mike Johnson', phone: '+92-302-3456789', status: 'active' }
        ]
      };
    }
  }
};

// Mock user context
const mockUser = { id: 'user-1', name: 'Admin User' };

// Dialog component
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children, className = "" }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {children}
      </div>
    </div>
  );
};

const Expenses: React.FC = () => {
  // State management
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  
  // Dialog states
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState<boolean>(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState<boolean>(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Selected expense for operations
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<FormData>({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    memberId: ''
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [notification, setNotification] = useState<Notification | null>(null);

  // Show notification
  const showNotification = (title: string, description: string, type: string = 'success'): void => {
    setNotification({ title, description, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Form validation
  const validateForm = (data: FormData): FormErrors => {
    const errors: FormErrors = {};
    if (!data.description || data.description.length < 3) {
      errors.description = 'Description must be at least 3 characters';
    }
    if (!data.amount || parseFloat(data.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    if (!data.category) {
      errors.category = 'Please select a category';
    }
    if (!data.date) {
      errors.date = 'Date is required';
    }
    return errors;
  };

  // Fetch members
  const fetchMembers = async (): Promise<void> => {
    try {
      const response = await mockAPI.membersAPI.getAll();
      if (response.success) {
        const activeMembers = response.members?.filter((member: Member) => 
          member.status === 'active'
        ) || [];
        setMembers(activeMembers);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Fetch expenses
  const fetchExpenses = async (showRefreshLoader: boolean = false): Promise<void> => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await mockAPI.expensesAPI.getAll();
      
      if (response.success) {
        setExpenses(response.expenses || []);
      } else {
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

  // Load data on component mount
  useEffect(() => {
    fetchExpenses();
    fetchMembers();
  }, []);

  const getCategoryBadge = (category: string): JSX.Element => {
    const colors: Record<string, string> = {
      'Utilities': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Equipment': 'bg-green-100 text-green-800 border border-green-200',
      'Maintenance': 'bg-orange-100 text-orange-800 border border-orange-200',
      'Staff': 'bg-purple-100 text-purple-800 border border-purple-200',
      'Other': 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category] || colors['Other']}`}>
        {category}
      </span>
    );
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((expense: Expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesDeletedFilter = showDeleted ? expense.isDeleted : !expense.isDeleted;
    return matchesSearch && matchesCategory && matchesDeletedFilter;
  });

  // Calculate statistics from non-deleted expenses only
  const activeExpenses = expenses.filter((expense: Expense) => !expense.isDeleted);
  const totalExpenses = activeExpenses.reduce((sum: number, expense: Expense) => sum + (expense.amount || 0), 0);
  const thisMonthExpenses = activeExpenses.filter((e: Expense) => {
    const expenseDate = new Date(e.date);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  }).reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0);
  const uniqueCategories = new Set(activeExpenses.map((e: Expense) => e.category)).size;

  // Get member name by ID
  const getMemberName = (memberId: string): string => {
    const member = members.find((m: Member) => m.id === memberId);
    return member ? member.name : '';
  };

  // Reset form
  const resetForm = (): void => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      memberId: ''
    });
    setFormErrors({});
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    const errors = validateForm(formData);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setIsSubmitting(true);
    try {
      const memberName = formData.memberId ? getMemberName(formData.memberId) : '';
      
      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        addedBy: mockUser.name,
        notes: formData.notes,
        memberId: formData.memberId,
        memberName: memberName
      };

      const response = await mockAPI.expensesAPI.add(expenseData);
      
      if (response.success) {
        setIsAddExpenseDialogOpen(false);
        setIsSuccessDialogOpen(true);
        showNotification("Expense Added Successfully", `"${formData.description}" has been recorded.`);
        await fetchExpenses();
        resetForm();
      } else {
        throw new Error(response.error || 'Failed to add expense');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showNotification("Error Adding Expense", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit submission
  const handleEditSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!selectedExpense) return;
    
    const errors = validateForm(formData);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setIsSubmitting(true);
    try {
      const memberName = formData.memberId ? getMemberName(formData.memberId) : '';
      
      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        notes: formData.notes,
        memberId: formData.memberId,
        memberName: memberName
      };

      const response = await mockAPI.expensesAPI.update(selectedExpense.id, expenseData);
      
      if (response.success) {
        showNotification("Expense Updated", "Expense has been successfully updated.");
        await fetchExpenses();
        setIsEditDialogOpen(false);
        setSelectedExpense(null);
        resetForm();
      } else {
        throw new Error(response.error || 'Failed to update expense');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showNotification("Error Updating Expense", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view details
  const handleViewDetails = (expense: Expense): void => {
    setSelectedExpense(expense);
    setIsViewDetailsDialogOpen(true);
  };

  // Handle edit expense
  const handleEditExpense = (expense: Expense): void => {
    setSelectedExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      notes: expense.notes || '',
      memberId: expense.memberId || '',
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (expense: Expense): void => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete expense
  const confirmDeleteExpense = async (): Promise<void> => {
    if (!selectedExpense) return;
    
    setIsSubmitting(true);
    try {
      const response = await mockAPI.expensesAPI.delete(selectedExpense.id);
      
      if (response.success) {
        showNotification("Expense Deleted", "Expense has been moved to deleted records.");
        await fetchExpenses();
        setIsDeleteDialogOpen(false);
        setSelectedExpense(null);
      } else {
        throw new Error(response.error || 'Failed to delete expense');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showNotification("Error Deleting Expense", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate receipt
  const generateReceipt = (expense: Expense): void => {
    const receiptContent = `RANGEFITGYM - EXPENSE RECEIPT
================================
Receipt ID: ${expense.id}
Date: ${new Date(expense.date).toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

EXPENSE DETAILS:
--------------------------------
Description: ${expense.description}
Category: ${expense.category}
Amount: Rs. ${expense.amount.toLocaleString()}
${expense.memberName ? `Associated Member: ${expense.memberName}` : ''}
${expense.notes ? `Notes: ${expense.notes}` : ''}

Added By: ${expense.addedBy}
Created: ${expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : 'N/A'}

================================
Thank you for using RangeFitGym CRM`;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-receipt-${expense.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification("Receipt Downloaded", `Receipt for "${expense.description}" has been downloaded.`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to Load Expenses</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchExpenses()} 
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'error' ? 'bg-red-100 border border-red-200 text-red-800' : 'bg-green-100 border border-green-200 text-green-800'
        }`}>
          <h4 className="font-semibold">{notification.title}</h4>
          <p className="text-sm">{notification.description}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <Receipt className="mr-3 h-7 w-7 text-orange-600" />
            Expenses Management
          </h1>
          <p className="text-gray-600">Track and manage all gym operational expenses</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchExpenses(true)} 
            disabled={isRefreshing}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
          <button 
            onClick={() => {
              resetForm();
              setIsAddExpenseDialogOpen(true);
            }} 
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-800">Rs.{totalExpenses.toLocaleString('en-US')}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold text-gray-800">Rs.{thisMonthExpenses.toLocaleString('en-US')}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Categories</p>
              <p className="text-3xl font-bold text-gray-800">{uniqueCategories}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg">
              <IndianRupee className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search expenses by description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-white/70"
              />
            </div>
          </div>
          
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-white/70"
          >
            <option value="all">All Categories</option>
            <option value="Utilities">Utilities</option>
            <option value="Equipment">Equipment</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Staff">Staff</option>
            <option value="Other">Other</option>
          </select>

          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg border ${
              showDeleted 
                ? 'bg-gray-800 text-white border-gray-800' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {showDeleted ? "Show Active" : "Show Deleted"}
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Expense Records ({filteredExpenses.length})
          </h2>
          <p className="text-gray-600">Detailed view of all operational expenses</p>
        </div>
        
        <div className="p-6">
          {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
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
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 ${expense.isDeleted ? 'opacity-60 bg-red-50' : 'bg-white'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{expense.description}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(expense.date).toLocaleDateString('en-US')}
                      </p>
                      {expense.isDeleted && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
                          Deleted
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800">
                        Rs.{expense.amount.toLocaleString('en-US')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <div className="mt-1">{getCategoryBadge(expense.category)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Added By</p>
                      <p className="text-sm text-gray-600 mt-1">{expense.addedBy}</p>
                    </div>
                  </div>
                  
                  {expense.memberName && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Associated Member</p>
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {expense.memberName}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewDetails(expense)}
                      className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm py-2 px-3 rounded-lg flex items-center justify-center"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                    <button 
                      onClick={() => generateReceipt(expense)}
                      className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm py-2 px-3 rounded-lg flex items-center justify-center"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Receipt
                    </button>
                    {!expense.isDeleted && (
                      <>
                        <button 
                          onClick={() => handleEditExpense(expense)}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(expense)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Dialog */}
      <Dialog isOpen={isAddExpenseDialogOpen} onClose={() => setIsAddExpenseDialogOpen(false)}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Receipt className="mr-2 h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-800">Add New Expense</h2>
          </div>
          <p className="text-gray-600 mb-6">Complete the form below to record a new expense.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter expense description"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
              />
              {formErrors.description && <p className="text-red-600 text-sm mt-1">{formErrors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  />
                </div>
                {formErrors.amount && <p className="text-red-600 text-sm mt-1">{formErrors.amount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  />
                </div>
                {formErrors.date && <p className="text-red-600 text-sm mt-1">{formErrors.date}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
              >
                <option value="">Select category</option>
                <option value="Utilities">Utilities</option>
                <option value="Equipment">Equipment</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Staff">Staff</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.category && <p className="text-red-600 text-sm mt-1">{formErrors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Associate with Member (Optional)</label>
              <select
                value={formData.memberId}
                onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
              >
                <option value="">No Member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button 
                type="button" 
                onClick={() => setIsAddExpenseDialogOpen(false)}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Edit className="mr-2 h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-800">Edit Expense</h2>
          </div>
          <p className="text-gray-600 mb-6">Update the expense details below.</p>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter expense description"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
              />
              {formErrors.description && <p className="text-red-600 text-sm mt-1">{formErrors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  />
                </div>
                {formErrors.amount && <p className="text-red-600 text-sm mt-1">{formErrors.amount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  />
                </div>
                {formErrors.date && <p className="text-red-600 text-sm mt-1">{formErrors.date}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
              >
                <option value="">Select category</option>
                <option value="Utilities">Utilities</option>
                <option value="Equipment">Equipment</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Staff">Staff</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.category && <p className="text-red-600 text-sm mt-1">{formErrors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Associate with Member (Optional)</label>
              <select
                value={formData.memberId}
                onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
              >
                <option value="">No Member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button 
                type="button" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Expense
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog isOpen={isViewDetailsDialogOpen} onClose={() => setIsViewDetailsDialogOpen(false)}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Eye className="mr-2 h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-800">Expense Details</h2>
          </div>

          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Description</p>
                  <p className="text-gray-800 font-semibold">{selectedExpense.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Amount</p>
                  <p className="text-gray-800 font-semibold">Rs.{selectedExpense.amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Category</p>
                  <div className="mt-1">{getCategoryBadge(selectedExpense.category)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p className="text-gray-800">{new Date(selectedExpense.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Added By</p>
                  <p className="text-gray-800">{selectedExpense.addedBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  {selectedExpense.isDeleted ? (
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Deleted</span>
                  ) : (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                  )}
                </div>
              </div>

              {selectedExpense.memberName && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Associated Member</p>
                  <p className="text-gray-800 flex items-center mt-1">
                    <User className="h-4 w-4 mr-2" />
                    {selectedExpense.memberName}
                  </p>
                </div>
              )}

              {selectedExpense.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Notes</p>
                  <p className="text-gray-800">{selectedExpense.notes}</p>
                </div>
              )}

              {selectedExpense.createdAt && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Created At</p>
                  <p className="text-gray-800">{new Date(selectedExpense.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-3 pt-6">
            <button 
              onClick={() => setIsViewDetailsDialogOpen(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </button>
            {selectedExpense && (
              <button 
                onClick={() => generateReceipt(selectedExpense)}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </button>
            )}
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <div className="p-6">
          <div className="flex items-center mb-4 text-red-600">
            <Trash2 className="mr-2 h-5 w-5" />
            <h2 className="text-xl font-semibold">Delete Expense</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this expense? This action will move the expense to deleted records and exclude it from analytics.
          </p>
          
          {selectedExpense && (
            <div className="bg-gray-50 p-3 rounded-lg mb-6">
              <p className="font-medium">{selectedExpense.description}</p>
              <p className="text-sm text-gray-600">Rs.{selectedExpense.amount.toLocaleString()} - {selectedExpense.category}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
            <button 
              onClick={confirmDeleteExpense}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Expense
                </>
              )}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Success Dialog */}
      <Dialog isOpen={isSuccessDialogOpen} onClose={() => setIsSuccessDialogOpen(false)}>
        <div className="p-6 text-center">
          <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Expense Added Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            The expense has been recorded in your database.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setIsSuccessDialogOpen(false);
                resetForm();
                setIsAddExpenseDialogOpen(true);
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another
            </button>
            <button
              onClick={() => setIsSuccessDialogOpen(false)}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <Check className="mr-2 h-4 w-4" />
              Done
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Expenses;