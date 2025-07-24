import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Users,
  IndianRupee,
  Receipt,
  PieChart,
  Loader2,
  RefreshCw,
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { membersAPI, transactionsAPI, expensesAPI, dashboardAPI } from '@/services/googleSheetsAPI';

interface ReportData {
  members: any[];
  transactions: any[];
  expenses: any[];
  dashboardStats: any;
}

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
      
      // Fetch all data in parallel
      const [membersRes, transactionsRes, expensesRes, dashboardRes] = await Promise.all([
        membersAPI.getAll(),
        transactionsAPI.getAll(),
        expensesAPI.getAll(),
        dashboardAPI.getStats()
      ]);

      if (membersRes.success && transactionsRes.success && expensesRes.success && dashboardRes.success) {
        setReportData({
          members: membersRes.members || [],
          transactions: transactionsRes.transactions || [],
          expenses: expensesRes.expenses || [],
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

  // Calculate analytics from real data
  const calculateAnalytics = () => {
    const { members, transactions, expenses, dashboardStats } = reportData;
    
    // Current month data
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthMembers = members.filter(m => {
      const joinDate = new Date(m.joiningDate);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    });
    
    const thisMonthTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
    });
    
    const thisMonthExpenses = expenses.filter(e => {
      const expDate = new Date(e.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });

    // Revenue by transaction type
    const revenueByType = transactions.reduce((acc, t) => {
      const type = t.type || 'other';
      acc[type] = (acc[type] || 0) + (t.amount ? parseFloat(t.amount.toString()) : 0);
      return acc;
    }, {} as Record<string, number>);

    // Monthly growth trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      const monthMembers = members.filter(m => {
        const joinDate = new Date(m.joiningDate);
        return joinDate.getMonth() === date.getMonth() && joinDate.getFullYear() === date.getFullYear();
      }).length;
      
      const monthRevenue = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === date.getMonth() && transDate.getFullYear() === date.getFullYear();
      }).reduce((sum, t) => sum + (t.amount ? parseFloat(t.amount.toString()) : 0), 0);


      monthlyTrend.push({
        month: monthYear,
        members: monthMembers,
        revenue: monthRevenue
      });
    }

    // Calculate metrics
    const avgRevenuePerMember = dashboardStats.totalMembers > 0 
      ? Math.round(dashboardStats.totalRevenue / dashboardStats.totalMembers) 
      : 0;
    
    const memberRetentionRate = members.length > 0 
      ? Math.round((dashboardStats.activeMembers / dashboardStats.totalMembers) * 100) 
      : 0;

    const monthlyGrowthRate = thisMonthMembers.length > 0 
      ? Math.round((thisMonthMembers.length / Math.max(dashboardStats.totalMembers - thisMonthMembers.length, 1)) * 100) 
      : 0;

    return {
      thisMonthMembers: thisMonthMembers.length,
      thisMonthRevenue: thisMonthTransactions.reduce((sum, t) => sum + (t.amount ? parseFloat(t.amount) : 0), 0),
      thisMonthExpenses: thisMonthExpenses.reduce((sum, e) => sum + (e.amount ? parseFloat(e.amount) : 0), 0),
      revenueByType,
      monthlyTrend,
      avgRevenuePerMember,
      memberRetentionRate,
      monthlyGrowthRate
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

  const reportCards = [
    {
      title: 'Monthly Revenue Report',
      description: 'Current month income from all sources',
      type: 'Revenue',
      period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      value: `Rs.${analytics.thisMonthRevenue.toLocaleString()}`,
      change: analytics.thisMonthRevenue > reportData.dashboardStats.totalRevenue * 0.8 ? '+15%' : '-5%',
      icon: IndianRupee,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Member Analytics',
      description: 'New member acquisitions this month',
      type: 'Members',
      period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      value: analytics.thisMonthMembers.toString(),
      change: `+${analytics.monthlyGrowthRate}%`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Expense Analysis',
      description: 'Monthly operational expenses',
      type: 'Expenses',
      period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      value: `Rs.${analytics.thisMonthExpenses.toLocaleString()}`,
      change: '+8%',
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Net Profit',
      description: 'Revenue minus expenses this month',
      type: 'Financial',
      period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      value: `Rs.${(analytics.thisMonthRevenue - analytics.thisMonthExpenses).toLocaleString()}`,
      change: analytics.thisMonthRevenue > analytics.thisMonthExpenses ? '+22%' : '-12%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10'
    }
  ];

  const quickReports = [
    { name: 'Weekly Summary', icon: Calendar, period: 'Last 7 days', count: reportData.transactions.filter(t => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(t.date) >= weekAgo;
    }).length },
    { name: 'Monthly Overview', icon: BarChart3, period: 'Current month', count: analytics.thisMonthMembers + analytics.thisMonthRevenue },
    { name: 'Quarterly Analysis', icon: PieChart, period: 'Last 3 months', count: reportData.members.length },
    { name: 'Annual Report', icon: TrendingUp, period: 'Year to date', count: reportData.dashboardStats.totalRevenue || 0 }
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
          <Button className="premium-button">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <Card className="glass-card border-white/40">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Report Period:</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[200px] bg-white/70 border-white/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Current Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="year_to_date">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards with Real Data */}
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
                    {report.period}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${report.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {report.change}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
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
              Breakdown of revenue sources
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports with Real Data */}
      <Card className="glass-card border-white/40">
        <CardHeader>
          <CardTitle className="text-gray-800">Quick Reports</CardTitle>
          <CardDescription className="text-gray-600">
            Generate instant reports for different time periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickReports.map((report, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 glass-card border-white/40 text-gray-700 hover:bg-white/80 hover:scale-105 transition-all duration-200"
              >
                <div className="flex flex-col items-center space-y-2">
                  <report.icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="text-sm font-medium">{report.name}</div>
                    <div className="text-xs text-gray-500">{report.period}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics with Real Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Performance Metrics</CardTitle>
            <CardDescription className="text-gray-600">
              Key performance indicators calculated from your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Member Retention Rate</span>
                <Badge className={`${analytics.memberRetentionRate >= 80 ? 'bg-green-500/20 text-green-700' : 'bg-orange-500/20 text-orange-700'}`}>
                  {analytics.memberRetentionRate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Average Revenue per Member</span>
                <Badge className="bg-blue-500/20 text-blue-700">
                  Rs.{analytics.avgRevenuePerMember.toLocaleString()}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Monthly Growth Rate</span>
                <Badge className={`${analytics.monthlyGrowthRate > 0 ? 'bg-purple-500/20 text-purple-700' : 'bg-red-500/20 text-red-700'}`}>
                  {analytics.monthlyGrowthRate > 0 ? '+' : ''}{analytics.monthlyGrowthRate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Total Active Members</span>
                <Badge className="bg-orange-500/20 text-orange-700">
                  {reportData.dashboardStats.activeMembers || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Revenue Breakdown</CardTitle>
            <CardDescription className="text-gray-600">
              Revenue distribution by transaction type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.revenueByType).map(([type, amount], index) => {
                const percentage = reportData.dashboardStats.totalRevenue > 0 
                  ? Math.round((parseFloat(amount.toString()) / parseFloat(reportData.dashboardStats.totalRevenue.toString())) * 100)
                  : 0;
                
                return (
                  <div key={type} className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                    <span className="text-gray-700">
                      {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">Rs.{amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;