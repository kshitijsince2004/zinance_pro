import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { assetService } from '@/lib/assets';
import { authService } from '@/lib/auth';
import { AssetTrends } from '@/lib/asset-trends';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Clock,
  Users,
  Building,
  MapPin,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const summary = assetService.getAssetSummary();
  const departmentData = assetService.getAssetsByDepartment();
  const companyData = assetService.getAssetsByCompany();
  const amcStatusData = assetService.getAmcStatus();
  const valueTrend = assetService.getAssetValueTrend();
  const recentActivities = assetService.getRecentActivities();
  const upcomingReminders = assetService.getUpcomingReminders();
  const currentUser = authService.getCurrentUser();

  // Get all assets for trend calculations
  const allAssets = assetService.getAllAssets();

  const COLORS = ['#22c55e', '#06b6d4', '#8b5cf6', '#ef4444'];

  const stats = [
    {
      title: 'Total Assets',
      value: summary.totalAssets,
      description: 'Across all departments',
      icon: Package,
      color: 'text-green-500',
      trend: AssetTrends.getTotalAssetsTrend(allAssets)
    },
    {
      title: 'Total Value',
      value: summary.totalValue > 0 ? `₹${(summary.totalValue / 100000).toFixed(1)}L` : '₹0',
      description: 'Current asset value',
      icon: DollarSign,
      color: 'text-green-500',
      trend: AssetTrends.getTotalValueTrend(allAssets)
    },
    {
      title: 'Active AMCs',
      value: summary.activeAmcs,
      description: 'Maintenance contracts',
      icon: CheckCircle,
      color: 'text-green-500',
      trend: AssetTrends.getActiveAmcTrend(allAssets)
    },
    {
      title: 'Expiring Soon',
      value: summary.expiringAmcs,
      description: 'Within 30 days',
      icon: AlertTriangle,
      color: 'text-yellow-400',
      trend: AssetTrends.getExpiringSoonTrend(allAssets)
    }
  ];

  // ... keep existing code (formatActivityTime function)
  const formatActivityTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-secondary">Welcome back, {currentUser?.name}</p>
        </div>
        {authService.hasPermission('write', 'assets') && (
          <Link to="/assets/new">
            <Button className="bg-green-500 hover:bg-green-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card backdrop-blur-sm border-green-500/20 hover:border-green-500/40 transition-all duration-300 group cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} group-hover:scale-110 transition-transform`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-secondary">{stat.description}</p>
                <Badge 
                  variant="outline" 
                  className={`text-xs badge-text ${
                    stat.trend.startsWith('+') ? 'border-green-500 text-green-500' : 
                    stat.trend.startsWith('-') ? 'border-red-400 text-red-400' : 
                    'border-zinc-400 text-zinc-400'
                  }`}
                >
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets by Department */}
        <Card className="bg-card backdrop-blur-sm border-green-500/20">
          <CardHeader>
            <CardTitle className="text-primary">Assets by {departmentData.length > 0 ? 'Department' : 'Company'}</CardTitle>
            <CardDescription className="text-secondary">
              Distribution across {departmentData.length > 0 ? 'departments' : 'companies'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData.length > 0 ? departmentData : companyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey={departmentData.length > 0 ? "department" : "company"} 
                  stroke="var(--text-muted)" 
                  fontSize={12}
                />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-glass)', 
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AMC Status */}
        <Card className="bg-card backdrop-blur-sm border-green-500/20">
          <CardHeader>
            <CardTitle className="text-primary">AMC Status</CardTitle>
            <CardDescription className="text-secondary">
              Maintenance contract overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={amcStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {amcStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-glass)', 
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Asset Value Trend */}
      <Card className="bg-card backdrop-blur-sm border-green-500/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Asset Value Trend
          </CardTitle>
          <CardDescription className="text-secondary">
            Total asset value over time (depreciation applied)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={valueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-glass)', 
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  backdropFilter: 'blur(10px)'
                }}
                formatter={(value) => [`₹${(value as number / 100000).toFixed(1)}L`, 'Value']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#22c55e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-card backdrop-blur-sm border-green-500/20">
          <CardHeader>
            <CardTitle className="text-primary">Recent Activity</CardTitle>
            <CardDescription className="text-secondary">
              Latest system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? recentActivities.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-card backdrop-blur-sm border border-green-500/10 hover:border-green-500/20 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'info' ? 'bg-blue-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary">{activity.action}</p>
                    <p className="text-sm text-secondary truncate">{activity.assetName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-secondary">{activity.user}</p>
                    <p className="text-xs text-muted">{formatActivityTime(activity.timestamp)}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activities</p>
                  <p className="text-xs mt-2">Activities will appear here when you start managing assets</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card className="bg-card backdrop-blur-sm border-green-500/20">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Upcoming Reminders
            </CardTitle>
            <CardDescription className="text-secondary">
              AMC and warranty expiries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReminders.length > 0 ? upcomingReminders.slice(0, 5).map((reminder, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card backdrop-blur-sm border border-green-500/10 hover:border-green-500/20 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">{reminder.title}</p>
                    <p className="text-xs text-secondary">{new Date(reminder.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`text-xs badge-text ${
                        reminder.priority === 'high' ? 'border-red-400 text-red-400' :
                        reminder.priority === 'medium' ? 'border-yellow-400 text-yellow-400' :
                        'border-green-400 text-green-400'
                      }`}
                    >
                      {reminder.days} days
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming reminders</p>
                  <p className="text-xs mt-2">AMC and warranty reminders will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
