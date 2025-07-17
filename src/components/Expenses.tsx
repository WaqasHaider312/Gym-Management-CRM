
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
  Receipt, 
  Search, 
  Plus, 
  IndianRupee,
  Calendar,
  TrendingDown,
  Lightbulb,
  Wrench,
  ShoppingCart,
  User
} from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  addedBy: string;
  receipt?: string;
}

const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const expenses: Expense[] = [
    {
      id: '1',
      description: 'Monthly Electricity Bill',
      amount: 8500,
      category: 'Utilities',
      date: '2024-07-01',
      addedBy: 'Admin'
    },
    {
      id: '2',
      description: 'New Dumbbells Set',
      amount: 25000,
      category: 'Equipment',
      date: '2024-07-03',
      addedBy: 'Manager'
    },
    {
      id: '3',
      description: 'Cleaning Supplies',
      amount: 1200,
      category: 'Maintenance',
      date: '2024-07-05',
      addedBy: 'Staff'
    },
    {
      id: '4',
      description: 'Internet & WiFi',
      amount: 2500,
      category: 'Utilities',
      date: '2024-07-06',
      addedBy: 'Admin'
    }
  ];

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Utilities': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      'Equipment': 'bg-green-500/20 text-green-700 border-green-500/30',
      'Maintenance': 'bg-orange-500/20 text-orange-700 border-orange-500/30',
      'Staff': 'bg-purple-500/20 text-purple-700 border-purple-500/30'
    };
    return (
      <Badge className={colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'}>
        {category}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Utilities': return Lightbulb;
      case 'Equipment': return Wrench;
      case 'Maintenance': return ShoppingCart;
      default: return Receipt;
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <Receipt className="mr-3 h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            Expenses Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Track and manage all gym operational expenses
          </p>
        </div>
        <Button className="w-full sm:w-auto premium-button">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="glass-card border-white/40">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">₹{totalExpenses.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
                <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Month</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">₹{Math.round(totalExpenses * 0.6).toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
                <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Categories</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{new Set(expenses.map(e => e.category)).size}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg">
                <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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
                  placeholder="Search expenses by description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 border-white/60 text-gray-800 placeholder:text-gray-500"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-[180px] bg-white/70 border-white/60 text-gray-800">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expense Cards - Mobile */}
      <div className="block lg:hidden space-y-4">
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} className="glass-card border-white/40">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{expense.description}</h3>
                  <p className="text-xs text-gray-500 mt-1">{new Date(expense.date).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">₹{expense.amount.toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <div className="mt-1">{getCategoryBadge(expense.category)}</div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Added By</p>
                  <div className="flex items-center mt-1">
                    <User className="h-3 w-3 mr-1 text-gray-600" />
                    <span className="text-sm text-gray-600">{expense.addedBy}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expenses Table - Desktop */}
      <Card className="glass-card border-white/40 hidden lg:block">
        <CardHeader>
          <CardTitle className="text-gray-800">
            Expense Records ({filteredExpenses.length})
          </CardTitle>
          <CardDescription className="text-gray-600">
            Detailed view of all operational expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-600">Description</TableHead>
                  <TableHead className="text-gray-600">Amount</TableHead>
                  <TableHead className="text-gray-600">Category</TableHead>
                  <TableHead className="text-gray-600">Date</TableHead>
                  <TableHead className="text-gray-600">Added By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="border-gray-100 hover:bg-white/50">
                    <TableCell className="text-gray-800 font-medium">{expense.description}</TableCell>
                    <TableCell className="text-gray-800 font-semibold">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>{getCategoryBadge(expense.category)}</TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(expense.date).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="text-gray-600">{expense.addedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
