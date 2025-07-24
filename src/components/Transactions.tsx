
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
  AlertCircle
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { whatsappService } from '@/services/whatsappService';
import { transactionsAPI } from '@/services/googleSheetsAPI';

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
  createdAt?: string;
}

const transactionFormSchema = z.object({
  memberName: z.string().min(3, { message: "Member name must be at least 3 characters" }),
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

const Transactions = () => {
  // State management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReceiptToggled, setIsReceiptToggled] = useState(true);

  // React Hook Form setup with zod validation
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

  // Fetch transactions from Google Sheets
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

  // Load transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'membership': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      'admission': 'bg-purple-500/20 text-purple-700 border-purple-500/30',
      'personal_training': 'bg-amber-500/20 text-amber-700 border-amber-500/30',
      'supplement': 'bg-green-500/20 text-green-700 border-green-500/30',
      'other': 'bg-gray-500/20 text-gray-700 border-gray-500/30'
    };
    
    // Format the type for display (replace underscores with spaces and capitalize)
    const displayType = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    return (
      <Badge className={`${colors[type] || colors['other']} transition-colors duration-150`}>
        {displayType}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate statistics from real data
  const totalTransactions = filteredTransactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  }).reduce((sum, t) => sum + (t.amount || 0), 0);

  const onSubmit = async (data: z.infer<typeof transactionFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting transaction data:', data);
      
      // Prepare transaction data for API
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

      // Submit to Google Sheets
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
        
        // Close dialog and show success
        setIsAddTransactionDialogOpen(false);
        setIsSuccessDialogOpen(true);
        
        // Show toast notification
        toast({
          title: "Transaction Added Successfully",
          description: `Rs. ${data.amount} transaction for ${data.memberName} has been recorded.`,
        });
        
        // Refresh transactions list
        await fetchTransactions();
        
        // Reset form
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading transactions from Google Sheets...</p>
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
            <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to Load Transactions</h3>
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

      {/* Summary Cards - Using Real Data */}
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
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{transactions.length}</p>
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
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4 lg:gap-4">
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
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="w-full bg-white/70 border-white/60 transition-colors hover:bg-white/90"
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
          {/* Table View - Desktop */}
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="border-gray-100 hover:bg-white/50 transition-colors duration-150">
                        <TableCell className="text-gray-700 font-medium">{transaction.transactionId}</TableCell>
                        <TableCell className="text-gray-800">{transaction.memberName}</TableCell>
                        <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                        <TableCell className="text-gray-800 font-semibold">
                          Rs.{transaction.amount ? transaction.amount.toLocaleString('en-US') : '0'}
                        </TableCell>
                        <TableCell className="text-gray-700">{getPaymentMethodDisplay(transaction.paymentMethod)}</TableCell>
                        <TableCell className="text-gray-600">
                          {transaction.date ? new Date(transaction.date).toLocaleDateString('en-US') : 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Mobile Transaction Cards */}
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
                <Card key={transaction.id} className="glass-card border-white/40 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500">{transaction.transactionId}</p>
                        <h3 className="font-semibold text-gray-800 text-lg">{transaction.memberName}</h3>
                      </div>
                      <div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div>{getTypeBadge(transaction.type)}</div>
                      <div className="text-lg font-bold text-gray-800">
                        Rs.{transaction.amount ? transaction.amount.toLocaleString('en-US') : '0'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-white/40 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Payment Method</p>
                        <p className="text-sm font-medium text-gray-700">{getPaymentMethodDisplay(transaction.paymentMethod)}</p>
                      </div>
                      <div className="bg-white/40 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-medium text-gray-700">
                          {transaction.date ? new Date(transaction.date).toLocaleDateString('en-US') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs bg-white/60 hover:bg-white transition-colors duration-150"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Receipt
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-150"
                      >
                        Details
                      </Button>
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
                <Card key={transaction.id} className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500">{transaction.transactionId}</p>
                        <h3 className="font-semibold text-gray-800">{transaction.memberName}</h3>
                      </div>
                      <div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div>{getTypeBadge(transaction.type)}</div>
                      <div className="text-xl font-bold text-gray-800">
                        Rs.{transaction.amount ? transaction.amount.toLocaleString('en-US') : '0'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-xs">
                        <p className="text-gray-500">Payment Method</p>
                        <p className="text-gray-800 font-medium">{getPaymentMethodDisplay(transaction.paymentMethod)}</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-500">Date</p>
                        <p className="text-gray-800 font-medium">
                          {transaction.date ? new Date(transaction.date).toLocaleDateString('en-US') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs bg-white/60 hover:bg-white transition-colors duration-150"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Receipt
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-150"
                      >
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        Details
                      </Button>
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
                      <FormLabel className="text-gray-700">Member Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            placeholder="Enter member name" 
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
                  name="memberPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Member Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="03xx-xxxxxxx" 
                          className="bg-white/70 border-white/60 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                          {...field} 
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
                      Adding to Google Sheets...
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

export default Transactions;