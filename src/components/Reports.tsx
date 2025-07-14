
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Users,
  IndianRupee,
  Receipt,
  PieChart
} from 'lucide-react';

const Reports = () => {
  const reportCards = [
    {
      title: 'Monthly Revenue Report',
      description: 'Detailed breakdown of monthly income sources',
      type: 'Revenue',
      period: 'July 2024',
      value: '₹2,45,000',
      change: '+18%',
      icon: IndianRupee,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Member Analytics',
      description: 'Member acquisition, retention, and churn analysis',
      type: 'Members',
      period: 'July 2024',
      value: '284',
      change: '+12',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Expense Analysis',
      description: 'Monthly operational expenses breakdown',
      type: 'Expenses',
      period: 'July 2024',
      value: '₹45,000',
      change: '+5%',
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Profit & Loss Statement',
      description: 'Complete financial overview and profitability',
      type: 'Financial',
      period: 'July 2024',
      value: '₹2,00,000',
      change: '+22%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10'
    }
  ];

  const quickReports = [
    { name: 'Weekly Summary', icon: Calendar, period: 'Last 7 days' },
    { name: 'Monthly Overview', icon: BarChart3, period: 'Current month' },
    { name: 'Quarterly Analysis', icon: PieChart, period: 'Last 3 months' },
    { name: 'Annual Report', icon: TrendingUp, period: 'Year to date' }
  ];

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
            Comprehensive business intelligence and detailed analytics
          </p>
        </div>
        <Button className="mt-4 sm:mt-0 premium-button">
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </div>

      {/* Report Cards */}
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
                  <div className="text-sm text-green-600 font-medium">
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

      {/* Quick Reports */}
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

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Performance Metrics</CardTitle>
            <CardDescription className="text-gray-600">
              Key performance indicators for your gym
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Member Retention Rate</span>
                <Badge className="bg-green-500/20 text-green-700">92%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Average Revenue per Member</span>
                <Badge className="bg-blue-500/20 text-blue-700">₹863</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Monthly Growth Rate</span>
                <Badge className="bg-purple-500/20 text-purple-700">+4.2%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Equipment Utilization</span>
                <Badge className="bg-orange-500/20 text-orange-700">87%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Revenue Breakdown</CardTitle>
            <CardDescription className="text-gray-600">
              Monthly revenue by membership type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">12 Month Plans</span>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">₹1,20,000</div>
                  <div className="text-sm text-gray-500">49%</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">6 Month Plans</span>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">₹75,000</div>
                  <div className="text-sm text-gray-500">31%</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Monthly Plans</span>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">₹35,000</div>
                  <div className="text-sm text-gray-500">14%</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">Personal Training</span>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">₹15,000</div>
                  <div className="text-sm text-gray-500">6%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
