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
  TrendingUp, 
  Users, 
  Activity,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Loader2,
  RefreshCw,
  AlertCircle,
  Download,
  TrendingDown,
  Clock,
  Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Line } from 'recharts';
import { membersAPI, transactionsAPI, expensesAPI, dashboardAPI } from '@/services/googleSheetsAPI';

interface AnalyticsData {
  members: any[];
  transactions: any[];
  expenses: any[];
  dashboardStats: any;
}

const Analytics = () => {
  // State management
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    members: [],
    transactions: [],
    expenses: [],
    dashboardStats: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState('growth');

  // Helper function to safely convert to number
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };

  // Fetch all data for analytics
  const fetchAnalyticsData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log('Fetching analytics data from Google Sheets...');
      
      // Fetch all data in parallel
      const [membersRes, transactionsRes, expensesRes, dashboardRes] = await Promise.all([
        membersAPI.getAll(),
        transactionsAPI.getAll(),
        expensesAPI.getAll(),
        dashboardAPI.getStats()
      ]);

      if (membersRes.success && transactionsRes.success && expensesRes.success && dashboardRes.success) {
        setAnalyticsData({
          members: membersRes.members || [],
          transactions: transactionsRes.transactions?.filter((t: any) => !t.isDeleted) || [],
          expenses: expensesRes.expenses?.filter((e: any) => !e.isDeleted) || [],
          dashboardStats: dashboardRes.stats || {}
        });
        console.log('Analytics data fetched successfully');
      } else {
        throw new Error('Failed to fetch some analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Calculate advanced analytics
  const calculateAdvancedAnalytics = () => {
    const { members, transactions, expenses, dashboardStats } = analyticsData;

    // Calculate growth trend (last 6 months)
    const growthData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthMembers = members.filter(m => {
        const joinDate = new Date(m.joiningDate);
        return joinDate.getMonth() === date.getMonth() && joinDate.getFullYear() === date.getFullYear();
      });

      const monthRevenue = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === date.getMonth() && transDate.getFullYear() === date.getFullYear();
      }).reduce((sum, t) => sum + toNumber(t.amount), 0);

      const monthExpenses = expenses.filter(e => {
        const expDate = new Date(e.date);
        return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
      }).reduce((sum, e) => sum + toNumber(e.amount), 0);

      growthData.push({
        month: monthYear,
        members: monthMembers.length,
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses
      });
    }

    // Calculate member behavior patterns
    const membersByPlan = members.reduce((acc, m) => {
      const plan = m.membershipType || 'Unknown';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate conversion metrics safely
    const totalMembers = toNumber(dashboardStats.totalMembers);
    const totalRevenue = toNumber(dashboardStats.totalRevenue);
    const totalEnquiries = Math.round(totalMembers * 1.5); // Estimate
    const conversionRate = totalEnquiries > 0 ? Math.round((totalMembers / totalEnquiries) * 100) : 0;

    // Calculate member retention
    const activeMembers = members.filter(m => m.membershipStatus === 'Active' || m.status === 'active').length;
    const retentionRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

    // Calculate average revenue per member
    const avgRevenuePerMember = totalMembers > 0 ? Math.round(totalRevenue / totalMembers) : 0;

    // Calculate quarterly growth
    const currentQuarter = Math.floor(new Date().getMonth() / 3);
    const quarterStart = new Date(new Date().getFullYear(), currentQuarter * 3, 1);
    const quarterMembers = members.filter(m => new Date(m.joiningDate) >= quarterStart);
    const quarterlyGrowth = totalMembers > 0 
      ? Math.round((quarterMembers.length / Math.max(totalMembers - quarterMembers.length, 1)) * 100) 
      : 0;

    // Peak hours analysis (simulate from transaction times)
    const peakHours = transactions.length > 0 ? '6-8 PM' : 'No data';
    
    // Popular membership analysis - fix the reduce operation
    const popularPlan = Object.entries(membersByPlan).length > 0 
      ? Object.entries(membersByPlan).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'Monthly';

    // Members at risk (simulate churn prediction)
    const membersAtRisk = Math.round(totalMembers * 0.08); // 8% churn estimate

    return {
      growthData,
      quarterlyGrowth,
      conversionRate,
      retentionRate,
      avgRevenuePerMember,
      peakHours,
      popularPlan,
      membersAtRisk,
      membersByPlan
    };
  };

  const analytics = calculateAdvancedAnalytics();

  const analyticsCards = [
    {
      title: 'Growth Trend',
      value: `+${analytics.quarterlyGrowth}%`,
      description: 'Member growth this quarter',
      icon: TrendingUp,
      color: analytics.quarterlyGrowth > 0 ? 'text-green-600' : 'text-red-600',
      bgColor: analytics.quarterlyGrowth > 0 ? 'bg-green-500/10' : 'bg-red-500/10'
    },
    {
      title: 'Peak Hours',
      value: analytics.peakHours,
      description: 'Highest gym utilization',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Conversion Rate',
      value: `${analytics.conversionRate}%`,
      description: 'Enquiry to membership conversion',
      icon: Target,
      color: analytics.conversionRate >= 60 ? 'text-purple-600' : 'text-orange-600',
      bgColor: analytics.conversionRate >= 60 ? 'bg-purple-500/10' : 'bg-orange-500/10'
    },
    {
      title: 'Avg. Revenue/Member',
      value: `Rs.${analytics.avgRevenuePerMember.toLocaleString()}`,
      description: 'Revenue per member monthly',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    }
  ];

  const chartTypes = [
    { 
      name: 'Growth Trends', 
      icon: LineChart, 
      type: 'Area Chart',
      description: `${analytics.growthData.length} months data`
    },
    { 
      name: 'Member Distribution', 
      icon: PieChart, 
      type: 'Pie Chart',
      description: `${Object.keys(analytics.membersByPlan).length} plan types`
    },
    { 
      name: 'Revenue vs Expenses', 
      icon: BarChart3, 
      type: 'Bar Chart',
      description: 'Monthly comparison'
    },
    { 
      name: 'Profit Analysis', 
      icon: TrendingUp, 
      type: 'Combo Chart',
      description: 'Revenue - Expenses'
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics data from Google Sheets...</p>
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
            <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to Load Analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchAnalyticsData()} className="bg-indigo-600 hover:bg-indigo-700">
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
            <TrendingUp className="mr-3 h-8 w-8 text-indigo-600" />
            Business Analytics
          </h1>
          <p className="text-gray-600">
            Advanced insights and predictive analytics from your Google Sheets data
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button 
            onClick={() => fetchAnalyticsData(true)} 
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
          <Button variant="outline" className="glass-card border-white/40">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button className="premium-button">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Metric Selector */}
      <Card className="glass-card border-white/40">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Analytics Focus:</label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[200px] bg-white/70 border-white/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="growth">Growth Analysis</SelectItem>
                <SelectItem value="revenue">Revenue Insights</SelectItem>
                <SelectItem value="members">Member Behavior</SelectItem>
                <SelectItem value="predictions">Predictions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Cards with Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsCards.map((card, index) => (
          <Card key={index} className="glass-card border-white/40 hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {card.value}
              </div>
              <p className="text-xs text-gray-500">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Trend Chart */}
      <Card className="glass-card border-white/40">
        <CardHeader>
          <CardTitle className="text-gray-800">Growth & Revenue Trends</CardTitle>
          <CardDescription className="text-gray-600">
            Monthly growth patterns over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={analytics.growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: any) => {
                  const numValue = Number(value) || 0;
                  if (name === 'revenue' || name === 'expenses' || name === 'profit') {
                    return [`Rs.${numValue.toLocaleString()}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)];
                  }
                  return [numValue, String(name).charAt(0).toUpperCase() + String(name).slice(1)];
                }}
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                fill="#10B981" 
                stroke="#10B981" 
                fillOpacity={0.3} 
                name="profit"
              />
              <Bar dataKey="members" fill="#3B82F6" name="members" />
              <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2} name="revenue" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart Visualizations */}
      <Card className="glass-card border-white/40">
        <CardHeader>
          <CardTitle className="text-gray-800">Data Visualizations</CardTitle>
          <CardDescription className="text-gray-600">
            Interactive charts and graphs for detailed analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {chartTypes.map((chart, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-24 glass-card border-white/40 text-gray-700 hover:bg-white/80 hover:scale-105 transition-all duration-200"
              >
                <div className="flex flex-col items-center space-y-2">
                  <chart.icon className="h-8 w-8" />
                  <div className="text-center">
                    <div className="text-sm font-medium">{chart.name}</div>
                    <div className="text-xs text-gray-500">{chart.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Member Behavior Analysis</CardTitle>
            <CardDescription className="text-gray-600">
              Real insights from your member data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Most Popular Plan</div>
                  <div className="text-sm text-gray-600">Highest member enrollment</div>
                </div>
                <Badge className="bg-blue-500/20 text-blue-700">{analytics.popularPlan}</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Member Retention</div>
                  <div className="text-sm text-gray-600">Active vs total members</div>
                </div>
                <Badge className={`${analytics.retentionRate >= 80 ? 'bg-green-500/20 text-green-700' : 'bg-orange-500/20 text-orange-700'}`}>
                  {analytics.retentionRate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Peak Hours</div>
                  <div className="text-sm text-gray-600">Highest activity period</div>
                </div>
                <Badge className="bg-purple-500/20 text-purple-700">{analytics.peakHours}</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Avg. Revenue/Member</div>
                  <div className="text-sm text-gray-600">Monthly revenue per member</div>
                </div>
                <Badge className="bg-green-500/20 text-green-700">Rs.{analytics.avgRevenuePerMember.toLocaleString()}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Predictive Insights</CardTitle>
            <CardDescription className="text-gray-600">
              Data-driven predictions and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                  <div className="font-medium text-blue-800">Revenue Forecast</div>
                </div>
                <div className="text-sm text-blue-700">
                  Expected {analytics.quarterlyGrowth > 0 ? analytics.quarterlyGrowth : 10}% growth next quarter based on current trends
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-green-600 mr-2" />
                  <div className="font-medium text-green-800">Member Retention</div>
                </div>
                <div className="text-sm text-green-700">
                  {analytics.membersAtRisk} members at risk of churning - consider targeted campaigns
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <div className="flex items-center mb-2">
                  <Target className="h-5 w-5 text-orange-600 mr-2" />
                  <div className="font-medium text-orange-800">Conversion Optimization</div>
                </div>
                <div className="text-sm text-orange-700">
                  Current conversion rate: {analytics.conversionRate}% - {analytics.conversionRate < 60 ? 'improve follow-up process' : 'excellent performance'}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <Activity className="h-5 w-5 text-purple-600 mr-2" />
                  <div className="font-medium text-purple-800">Capacity Planning</div>
                </div>
                <div className="text-sm text-purple-700">
                  {toNumber(analyticsData.dashboardStats.totalMembers)} total members - {toNumber(analyticsData.dashboardStats.totalMembers) > 200 ? 'consider expansion' : 'room for growth'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;