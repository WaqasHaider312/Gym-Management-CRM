
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
  Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  addedBy: string;
  receipt?: string;
}

const expenseFormSchema = z.object({
  description: z.string().min(3, { message: "Description must be at least 3 characters" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  category: z.string({
    required_error: "Please select a category",
  }),
  date: z.string().min(1, { message: "Date is required" }),
  notes: z.string().optional(),
});

const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form setup with zod validation
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
      <Badge className={`${colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'} transition-colors duration-150`}>
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

  const onSubmit = async (values: z.infer<typeof expenseFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Expense form submitted:', values);
      
      // Close dialog and show success
      setIsAddExpenseDialogOpen(false);
      setIsSuccessDialogOpen(true);
      
      // Show toast notification
      toast({
        title: "Expense Added Successfully",
        description: `"${values.description}" has been recorded.`,
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error Adding Expense",
        description: "There was a problem adding the expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Button 
          onClick={() => setIsAddExpenseDialogOpen(true)} 
          className="w-full sm:w-auto premium-button transition-transform duration-200 hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
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
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Rs.{Math.round(totalExpenses * 0.6).toLocaleString('en-US')}</p>
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
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{new Set(expenses.map(e => e.category)).size}</p>
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
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
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
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-[180px] bg-white/70 border-white/60 text-gray-800 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400">
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
      <div className="block lg:hidden space-y-4 animate-in fade-in-50 duration-300">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 bg-white/50 rounded-lg">
            <Receipt className="h-10 w-10 text-gray-400 mb-3" />
            <h3 className="text-base font-medium text-gray-700">No expenses found 📭</h3>
            <p className="text-gray-500 mt-1 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <Card key={expense.id} className="glass-card border-white/40 hover:shadow-md transition-all duration-200">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{expense.description}</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(expense.date).toLocaleDateString('en-US')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-800">Rs.{expense.amount.toLocaleString('en-US')}</p>
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
                
                <div className="mt-2 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs bg-white/60 hover:bg-white transition-colors duration-150"
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-150"
                  >
                    Edit
                  </Button>
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
              <h3 className="text-lg font-medium text-gray-700">No expenses found 📭</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} className="border-gray-100 hover:bg-white/50 transition-colors duration-150">
                      <TableCell className="text-gray-800 font-medium">{expense.description}</TableCell>
                      <TableCell className="text-gray-800 font-semibold">
                        Rs.{expense.amount.toLocaleString('en-US')}
                      </TableCell>
                      <TableCell>{getCategoryBadge(expense.category)}</TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(expense.date).toLocaleDateString('en-US')}
                      </TableCell>
                      <TableCell className="text-gray-600">{expense.addedBy}</TableCell>
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
                      Adding...
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
              The expense has been recorded in the system.
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
