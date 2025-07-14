
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Activity,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

const Analytics = () => {
  const analyticsCards = [
    {
      title: 'Growth Trend',
      value: '+24.5%',
      description: 'Member growth this quarter',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Peak Hours',
      value: '6-8 PM',
      description: 'Highest gym utilization',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Conversion Rate',
      value: '68%',
      description: 'Trial to membership conversion',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Avg. Session Time',
      value: '72 min',
      description: 'Average workout duration',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10'
    }
  ];

  const chartTypes = [
    { name: 'Revenue Trends', icon: LineChart, type: 'Line Chart' },
    { name: 'Member Distribution', icon: PieChart, type: 'Pie Chart' },
    { name: 'Monthly Comparison', icon: BarChart3, type: 'Bar Chart' },
    { name: 'Growth Analysis', icon: TrendingUp, type: 'Area Chart' }
  ];

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
            Advanced data insights and predictive analytics for your gym
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" className="glass-card border-white/40">
            Export Data
          </Button>
          <Button className="premium-button">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
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
                    <div className="text-xs text-gray-500">{chart.type}</div>
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
              Insights into member usage patterns and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Most Active Hours</div>
                  <div className="text-sm text-gray-600">Peak gym utilization times</div>
                </div>
                <Badge className="bg-blue-500/20 text-blue-700">6-8 PM</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Popular Equipment</div>
                  <div className="text-sm text-gray-600">Most used gym equipment</div>
                </div>
                <Badge className="bg-green-500/20 text-green-700">Treadmills</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Busy Days</div>
                  <div className="text-sm text-gray-600">Highest attendance days</div>
                </div>
                <Badge className="bg-purple-500/20 text-purple-700">Mon, Wed, Fri</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Avg. Workout Duration</div>
                  <div className="text-sm text-gray-600">Member session length</div>
                </div>
                <Badge className="bg-orange-500/20 text-orange-700">72 minutes</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/40">
          <CardHeader>
            <CardTitle className="text-gray-800">Predictive Insights</CardTitle>
            <CardDescription className="text-gray-600">
              AI-powered predictions and recommendations
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
                  Expected 15% growth in next quarter based on current trends
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-green-600 mr-2" />
                  <div className="font-medium text-green-800">Member Retention</div>
                </div>
                <div className="text-sm text-green-700">
                  23 members at risk of churning - consider targeted campaigns
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <div className="flex items-center mb-2">
                  <Target className="h-5 w-5 text-orange-600 mr-2" />
                  <div className="font-medium text-orange-800">Optimization</div>
                </div>
                <div className="text-sm text-orange-700">
                  Add 2 more treadmills to reduce peak-hour wait times
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <Activity className="h-5 w-5 text-purple-600 mr-2" />
                  <div className="font-medium text-purple-800">Capacity Planning</div>
                </div>
                <div className="text-sm text-purple-700">
                  Current capacity utilization at 73% - expansion recommended
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
