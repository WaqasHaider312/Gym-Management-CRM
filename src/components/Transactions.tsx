
import React, { useState } from 'react';
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
  CreditCard, 
  Search, 
  Plus, 
  IndianRupee,
  Calendar,
  Filter,
  MessageCircle,
  User
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { whatsappService } from '@/services/whatsappService';
import { toast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  amount: number;
  feeType: string;
  paymentMethod: string;
  date: string;
  addedBy: string;
  notes?: string;
}

const Transactions = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Mock data - same as before
  const transactions: Transaction[] = [
    {
      id: '1',
      memberId: 'M001',
      memberName: 'John Doe',
      memberPhone: '+919876543210',
      amount: 3000,
      feeType: 'Strength',
      paymentMethod: 'Cash',
      date: '2024-07-08',
      addedBy: 'Admin',
      notes: 'Monthly membership fee'
    },
    {
      id: '2',
      memberId: 'M002', 
      memberName: 'Sarah Wilson',
      memberPhone: '+919876543211',
      amount: 5000,
      feeType: 'Cardio + Strength',
      paymentMethod: 'Online',
      date: '2024-07-07',
      addedBy: 'Partner',
      notes: 'Admission fee for new member'
    },
    {
      id: '3',
      memberId: 'M003',
      memberName: 'Mike Johnson',
      memberPhone: '+919876543212',
      amount: 2500,
      feeType: 'Cardio',
      paymentMethod: 'Cash',
      date: '2024-07-06',
      addedBy: 'Employee',
      notes: 'Monthly fee payment'
    },
    {
      id: '4',
      memberId: 'M004',
      memberName: 'Emma Brown',
      memberPhone: '+919876543213',
      amount: 8000,
      feeType: 'Personal training',
      paymentMethod: 'Online',
      date: '2024-07-05',
      addedBy: 'Admin',
      notes: 'Personal training package'
    }
  ];

  const getFeeTypeBadge = (feeType: string) => {
    const colors = {
      'Strength': 'bg-red-500/20 text-red-700 border-red-500/30',
      'Cardio': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      'Cardio + Strength': 'bg-purple-500/20 text-purple-700 border-purple-500/30',
      'Personal training': 'bg-green-500/20 text-green-700 border-green-500/30'
    };
    return (
      <Badge className={colors[feeType as keyof typeof colors] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'}>
        {feeType}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    return method === 'Online' ? 
      <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Online</Badge> :
      <Badge className="bg-orange-500/20 text-orange-700 border-orange-500/30">Cash</Badge>;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFeeType = feeTypeFilter === 'all' || transaction.feeType === feeTypeFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || transaction.paymentMethod === paymentMethodFilter;
    
    // If user is employee, only show their own transactions
    if (user?.role === 'employee') {
      return matchesSearch && matchesFeeType && matchesPaymentMethod && transaction.addedBy === user.name;
    }
    
    return matchesSearch && matchesFeeType && matchesPaymentMethod;
  });

  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  const handleAddTransaction = async () => {
    // Demo: Simulate adding a transaction and sending WhatsApp
    const newTransaction = {
      id: 'T' + Date.now(),
      memberName: 'Demo Member',
      memberPhone: '+919999999999',
      amount: 3000,
      feeType: 'Monthly Fee',
      paymentMethod: 'Cash',
      date: new Date().toISOString().split('T')[0],
      addedBy: user?.name || 'Admin'
    };

    try {
      // In a real app, you would save to database first
      await whatsappService.sendPaymentConfirmation(newTransaction);
      
      toast({
        title: "Transaction Added!",
        description: "Payment confirmation sent via WhatsApp",
      });
    } catch (error) {
      toast({
        title: "Transaction Added",
        description: "But WhatsApp notification failed to send",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 flex items-center">
            <CreditCard className="mr-3 h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            Transactions
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage member payments with automated WhatsApp confirmations
          </p>
        </div>
        <Button onClick={handleAddTransaction} className="w-full sm:w-auto premium-button">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="glass-card border-white/40">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{filteredTransactions.length}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Amount</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
                <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">WhatsApp Sent</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{filteredTransactions.length}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/40">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by member name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 border-white/60 text-gray-800 placeholder:text-gray-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:flex lg:space-x-4">
              <Select value={feeTypeFilter} onValueChange={setFeeTypeFilter}>
                <SelectTrigger className="w-full lg:w-[180px] bg-white/70 border-white/60 text-gray-800">
                  <SelectValue placeholder="Filter by fee type" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md">
                  <SelectItem value="all">All Fee Types</SelectItem>
                  <SelectItem value="Strength">Strength</SelectItem>
                  <SelectItem value="Cardio">Cardio</SelectItem>
                  <SelectItem value="Cardio + Strength">Cardio + Strength</SelectItem>
                  <SelectItem value="Personal training">Personal Training</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="w-full lg:w-[180px] bg-white/70 border-white/60 text-gray-800">
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md">
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Cards - Mobile */}
      <div className="block lg:hidden space-y-4">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id} className="glass-card border-white/40">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{transaction.memberName}</h3>
                  <p className="text-sm text-gray-600">ID: {transaction.memberId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">₹{transaction.amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Fee Type</p>
                  <div className="mt-1">{getFeeTypeBadge(transaction.feeType)}</div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <div className="mt-1">{getPaymentMethodBadge(transaction.paymentMethod)}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  <span>Added by {transaction.addedBy}</span>
                </div>
                {transaction.notes && (
                  <span className="truncate max-w-32">{transaction.notes}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transactions Table - Desktop */}
      <Card className="glass-card border-white/40 hidden lg:block">
        <CardHeader>
          <CardTitle className="text-gray-800">
            Transaction History ({filteredTransactions.length})
          </CardTitle>
          <CardDescription className="text-gray-600">
            {user?.role === 'employee' ? 
              'Your transaction records with WhatsApp confirmations' : 
              'All member transactions with automated notifications'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-gray-600">Member</TableHead>
                  <TableHead className="text-gray-600">Amount</TableHead>
                  <TableHead className="text-gray-600">Fee Type</TableHead>
                  <TableHead className="text-gray-600">Payment Method</TableHead>
                  <TableHead className="text-gray-600">Date</TableHead>
                  <TableHead className="text-gray-600">Added By</TableHead>
                  <TableHead className="text-gray-600">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-gray-700">
                      <div>
                        <div className="font-medium">{transaction.memberName}</div>
                        <div className="text-sm text-gray-500">ID: {transaction.memberId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-800 font-semibold">
                      ₹{transaction.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>{getFeeTypeBadge(transaction.feeType)}</TableCell>
                    <TableCell>{getPaymentMethodBadge(transaction.paymentMethod)}</TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="text-gray-600">{transaction.addedBy}</TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {transaction.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
