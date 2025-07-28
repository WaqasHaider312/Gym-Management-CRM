import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Users,
  IndianRupee,
  Receipt,
  Loader2,
  RefreshCw,
  AlertCircle,
  Eye,
  FileText,
  CalendarIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { membersAPI, transactionsAPI, expensesAPI, dashboardAPI } from '@/services/googleSheetsAPI';

// ============ INTERFACES ============
interface ReportData {
  members: any[];
  transactions: any[];
  expenses: any[];
  dashboardStats: any;
}

interface DateRange {
  from: Date;
  to: Date;
}

// ============ UTILITY FUNCTIONS ============
const getDateRangeFromPeriod = (period: string): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return { from: today, to: today };
    case 'last_7_days':
      const last7Days = new Date(today);
      last7Days.setDate(today.getDate() - 6);
      return { from: last7Days, to: today };
    case 'last_30_days':
      const last30Days = new Date(today);
      last30Days.setDate(today.getDate() - 29);
      return { from: last30Days, to: today };
    case 'current_month':
      return { 
        from: new Date(now.getFullYear(), now.getMonth(), 1), 
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0) 
      };
    case 'last_month':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: lastMonth, to: lastMonthEnd };
    case 'last_3_months':
      const last3Months = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { from: last3Months, to: today };
    case 'year_to_date':
      return { 
        from: new Date(now.getFullYear(), 0, 1), 
        to: today 
      };
    default:
      return { 
        from: new Date(now.getFullYear(), now.getMonth(), 1), 
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0) 
      };
  }
};

const filterDataByDateRange = (data: any[], dateRange: DateRange, dateField: string = 'date') => {
  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= dateRange.from && itemDate <= dateRange.to;
  });
};

const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ============ DETAIL MODAL COMPONENT ============
const ReportDetailModal: React.FC<{
  title: string;
  data: any[];
  isOpen: boolean;
  onClose: () => void;
}> = ({ title, data, isOpen, onClose }) => {
  const handleExport = () => {
    if (data.length > 0) {
      exportToCSV(data, `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/40 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-purple-600" />
            {title} - Detailed Report
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Complete breakdown showing {data.length} records
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No data available for this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(data[0]).map((header) => (
                      <TableHead key={header} className="text-gray-600 capitalize">
                        {header.replace(/_/g, ' ')}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 100).map((row, index) => (
                    <TableRow key={index}>
                      {Object.entries(row).map(([key, value]) => (
                        <TableCell key={key} className="text-gray-700">
                          {key === 'amount' || key === 'fee' || key === 'revenue'
                            ? `Rs.${Number(value || 0).toLocaleString()}`
                            : key === 'date' || key.toLowerCase().includes('date')
                            ? new Date(String(value || '')).toLocaleDateString()
                            : String(value || 'N/A')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.length > 100 && (
                <div className="text-center mt-4 text-sm text-gray-600">
                  Showing first 100 records of {data.length} total records
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleExport} className="premium-button">
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============ MAIN REPORTS COMPONENT ============
const Reports = () => {
  // State management
  const [reportData, setReportData] = useState<ReportData>({
    members: [],
    transactions: [],
    expenses: [],
    dashboardStats: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  
  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<any[]>([]);

  // Get current date range
  const getCurrentDateRange = (): DateRange => {
    return customDateRange || getDateRangeFromPeriod(selectedPeriod);
  };

  // Fetch all data for reports
  const fetchReportData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log('Fetching report data from Google Sheets...');
      
      const [membersRes, transactionsRes, expensesRes, dashboardRes] = await Promise.all([
        membersAPI.getAll(),
        transactionsAPI.getAll(),
        expensesAPI.getAll(),
        dashboardAPI.getStats()
      ]);

      if (membersRes.success && transactionsRes.success && expensesRes.success && dashboardRes.success) {
        setReportData({
          members: membersRes.members || [],
          transactions: transactionsRes.transactions?.filter((t: any) => !t.isDeleted) || [],
          expenses: expensesRes.expenses?.filter((e: any) => !e.isDeleted) || [],
          dashboardStats: dashboardRes.stats || {}
        });
        console.log('Report data fetched successfully');
      } else {
        throw new Error('Failed to fetch some report data');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchReportData();
  }, []);

  // Calculate analytics from filtered data
  const calculateAnalytics = () => {
    const { members, transactions, expenses } = reportData;
    const dateRange = getCurrentDateRange();
    
    // Helper function to safely convert to number
    const toNumber = (value: any): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') return parseFloat(value) || 0;
      return 0;
    };
    
    // Filter data by selected date range
    const filteredTransactions = filterDataByDateRange(transactions, dateRange);
    const filteredExpenses = filterDataByDateRange(expenses, dateRange);
    const filteredMembers = filterDataByDateRange(members, dateRange, 'joiningDate');
    
    // Revenue by transaction type
    const revenueByType = filteredTransactions.reduce((acc, t) => {
      const type = t.type || 'other';
      const amount = toNumber(t.amount);
      acc[type] = (acc[type] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    // Monthly growth trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthMembers = members.filter(m => {
        const joinDate = new Date(m.joiningDate);
        return joinDate >= monthStart && joinDate <= monthEnd;
      }).length;
      
      const monthRevenue = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= monthStart && transDate <= monthEnd;
      }).reduce((sum, t) => {
        return sum + toNumber(t.amount);
      }, 0);

      monthlyTrend.push({
        month: monthYear,
        members: monthMembers,
        revenue: monthRevenue
      });
    }

    // Calculate totals for the selected period
    const periodRevenue = filteredTransactions.reduce((sum, t) => {
      return sum + toNumber(t.amount);
    }, 0);
    
    const periodExpenses = filteredExpenses.reduce((sum, e) => {
      return sum + toNumber(e.amount);
    }, 0);
    
    return {
      periodMembers: filteredMembers.length,
      periodRevenue,
      periodExpenses,
      periodProfit: periodRevenue - periodExpenses,
      revenueByType,
      monthlyTrend,
      filteredTransactions,
      filteredExpenses,
      filteredMembers
    };
  };

  const analytics = calculateAnalytics();

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Prepare pie chart data
  const pieChartData = Object.entries(analytics.revenueByType).map(([type, amount], index) => ({
    name: type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: amount,
    color: COLORS[index % COLORS.length]
  }));

  // Handle detail view
  const handleViewDetails = (reportType: string) => {
    // Helper function to safely convert to number
    const toNumber = (value: any): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') return parseFloat(value) || 0;
      return 0;
    };

    switch (reportType) {
      case 'revenue':
        setModalTitle('Revenue Details');
        setModalData(analytics.filteredTransactions.map(t => ({
          date: t.date,
          member_name: t.memberName,
          type: t.type,
          amount: toNumber(t.amount),
          payment_method: t.paymentMethod,
          status: t.status
        })));
        break;
      case 'members':
        setModalTitle('Member Details');
        setModalData(analytics.filteredMembers.map(m => ({
          name: m.name,
          phone: m.phone,
          membership_type: m.membershipType,
          joining_date: m.joiningDate,
          status: m.status,
          fee: toNumber(m.fee)
        })));
        break;
      case 'expenses':
        setModalTitle('Expense Details');
        setModalData(analytics.filteredExpenses.map(e => ({
          description: e.description,
          amount: toNumber(e.amount),
          category: e.category,
          date: e.date,
          added_by: e.addedBy
        })));
        break;
      case 'profit':
        const profitData = [
          ...analytics.filteredTransactions.map(t => ({
            date: t.date,
            type: 'Revenue',
            description: `${t.type} - ${t.memberName}`,
            amount: toNumber(t.amount)
          })),
          ...analytics.filteredExpenses.map(e => ({
            date: e.date,
            type: 'Expense',
            description: e.description,
            amount: -toNumber(e.amount)
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setModalTitle('Profit Analysis');
        setModalData(profitData);
        break;
    }
    setDetailModalOpen(true);
  };

  // Handle export all data
  const handleExportAll = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    exportToCSV(analytics.filteredTransactions, `transactions_${timestamp}`);
    exportToCSV(analytics.filteredExpenses, `expenses_${timestamp}`);
    exportToCSV(analytics.filteredMembers, `members_${timestamp}`);
    
    const summaryData = [{
      period: `${getCurrentDateRange().from.toISOString().split('T')[0]} to ${getCurrentDateRange().to.toISOString().split('T')[0]}`,
      total_revenue: analytics.periodRevenue,
      total_expenses: analytics.periodExpenses,
      net_profit: analytics.periodProfit,
      new_members: analytics.periodMembers,
      total_transactions: analytics.filteredTransactions.length
    }];
    
    exportToCSV(summaryData, `summary_report_${timestamp}`);
  };

  // Report cards data
  const reportCards = [
    {
      title: 'Revenue Report',
      description: 'Total income for selected period',
      value: `Rs.${analytics.periodRevenue.toLocaleString()}`,
      change: '+15%',
      icon: IndianRupee,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
      onViewDetails: () => handleViewDetails('revenue')
    },
    {
      title: 'Member Analytics',
      description: 'New member acquisitions',
      value: analytics.periodMembers.toString(),
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      onViewDetails: () => handleViewDetails('members')
    },
    {
      title: 'Expense Analysis',
      description: 'Operational expenses',
      value: `Rs.${analytics.periodExpenses.toLocaleString()}`,
      change: '+8%',
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
      onViewDetails: () => handleViewDetails('expenses')
    },
    {
      title: 'Net Profit',
      description: 'Revenue minus expenses',
      value: `Rs.${analytics.periodProfit.toLocaleString()}`,
      change: analytics.periodProfit > 0 ? '+22%' : '-12%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
      onViewDetails: () => handleViewDetails('profit')
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading report data from Google Sheets...</p>
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
            <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to Load Reports</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchReportData()} className="bg-purple-600 hover:bg-purple-700">
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
            <BarChart3 className="mr-3 h-8 w-8 text-purple-600" />
            Advanced Reports
          </h1>
          <p className="text-gray-600">
            Real-time business intelligence from your Google Sheets data
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button 
            onClick={() => fetchReportData(true)} 
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
          <Button onClick={handleExportAll} className="premium-button">
            <Download className="mr-2 h-4 w-4" />
            Export All Reports
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <Card className="glass-card border-white/40">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Report Period:</label>
              <Select 
                value={customDateRange ? 'custom' : selectedPeriod} 
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setShowCustomDatePicker(true);
                  } else {
                    setSelectedPeriod(value);
                    setCustomDateRange(null);
                    setShowCustomDatePicker(false);
                  }
                }}
              >
                <SelectTrigger className="w-[200px] bg-white/70 border-white/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="current_month">Current Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="year_to_date">Year to Date</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range Picker */}
            {showCustomDatePicker && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={customDateRange?.from ? customDateRange.from.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setCustomDateRange(prev => ({ 
                      from: date, 
                      to: prev?.to || date 
                    }));
                  }}
                  className="w-40 bg-white/70 border-white/60"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="date"
                  value={customDateRange?.to ? customDateRange.to.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setCustomDateRange(prev => ({ 
                      from: prev?.from || date, 
                      to: date 
                    }));
                  }}
                  className="w-40 bg-white/70 border-white/60"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCustomDatePicker(false);
                    setCustomDateRange(null);
                    setSelectedPeriod('current_month');
                  }}
                  className="bg-white/70 border-white/60"
                >
                  ×
                </Button>
              </div>
            )}

            {/* Current Range Display */}
            <div className="text-sm text-gray-600">
              Selected: {getCurrentDateRange().from.toLocaleDateString()} - {getCurrentDateRange().to.toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards with Functional View Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((report, index) => (
          <Card key={index} className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {report.title}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {report.description}
                </CardDescription>
              </div>
              <div className={`${report.bgColor} p-3 rounded-lg`}>
                <report.icon className={`h-6 w-6 ${report.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {report.value}
                  </div>
                  <Badge className="mt-2 bg-gray-100 text-gray-700">
                    {getCurrentDateRange().from.toLocaleDateString()} - {getCurrentDateRange().to.toLocaleDateString()}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${report.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {report.change}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={report.onViewDetails}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Monthly Growth Trend</CardTitle>
            <CardDescription className="text-gray-600">
              Member acquisition and revenue over last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="members" stroke="#3B82F6" name="New Members" />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue (Rs)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown Pie Chart */}
        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Revenue by Type</CardTitle>
            <CardDescription className="text-gray-600">
              Breakdown of revenue sources for selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Rs.${value.toLocaleString()}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No revenue data for selected period</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Performance Metrics</CardTitle>
            <CardDescription className="text-gray-600">
              Key performance indicators for selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Total Transactions</span>
                <Badge className="bg-blue-500/20 text-blue-700">
                  {analytics.filteredTransactions.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Average Transaction Value</span>
                <Badge className="bg-green-500/20 text-green-700">
                  Rs.{analytics.filteredTransactions.length > 0 
                    ? Math.round(analytics.periodRevenue / analytics.filteredTransactions.length).toLocaleString()
                    : '0'}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Profit Margin</span>
                <Badge className={`${analytics.periodProfit > 0 ? 'bg-purple-500/20 text-purple-700' : 'bg-red-500/20 text-red-700'}`}>
                  {analytics.periodRevenue > 0 
                    ? Math.round((analytics.periodProfit / analytics.periodRevenue) * 100) 
                    : 0}%
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">New Members</span>
                <Badge className="bg-orange-500/20 text-orange-700">
                  {analytics.periodMembers}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Revenue Breakdown</CardTitle>
            <CardDescription className="text-gray-600">
              Revenue distribution by transaction type for selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.revenueByType).length > 0 ? (
                Object.entries(analytics.revenueByType).map(([type, amount]) => {
                  const numericAmount = Number(amount) || 0;
                  const numericRevenue = Number(analytics.periodRevenue) || 1;
                  const percentage = Math.round((numericAmount / numericRevenue) * 100);
                  
                  return (
                    <div key={type} className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                      <span className="text-gray-700">
                        {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">Rs.{numericAmount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{percentage}%</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No revenue data for selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <ReportDetailModal
        title={modalTitle}
        data={modalData}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setModalTitle('');
          setModalData([]);
        }}
      />
    </div>
  );
};

export default Reports;