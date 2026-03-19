
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { TrendingUp, Calendar, DollarSign, Package } from 'lucide-react';
import { ReportsData } from '@/lib/reports-service';

interface TrendAnalysisProps {
  data: ReportsData;
  filters: any;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ data, filters }) => {
  const [selectedTrend, setSelectedTrend] = useState<'depreciation' | 'acquisition' | 'disposal' | 'verification'>('depreciation');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartConfig = {
    companiesAct: {
      label: "Companies Act",
      color: "hsl(var(--chart-1))",
    },
    itAct: {
      label: "IT Act",
      color: "hsl(var(--chart-2))",
    },
    count: {
      label: "Count",
      color: "hsl(var(--chart-3))",
    },
    value: {
      label: "Value (₹)",
      color: "hsl(var(--chart-4))",
    },
  };

  const getTrendInsights = () => {
    switch (selectedTrend) {
      case 'depreciation':
        const avgDepreciation = data.depreciationTrends.reduce((sum, item) => sum + item.companiesAct + item.itAct, 0) / (data.depreciationTrends.length * 2);
        const latestYear = data.depreciationTrends[data.depreciationTrends.length - 1];
        const isIncreasing = latestYear && (latestYear.companiesAct + latestYear.itAct) > avgDepreciation;
        
        return {
          trend: isIncreasing ? 'increasing' : 'decreasing',
          value: formatCurrency(avgDepreciation),
          description: `Average annual depreciation over 5 years`
        };
        
      case 'acquisition':
        const totalAcquisitions = data.acquisitionTrends.reduce((sum, item) => sum + item.count, 0);
        const avgAcquisitions = totalAcquisitions / data.acquisitionTrends.length;
        
        return {
          trend: data.acquisitionTrends[data.acquisitionTrends.length - 1]?.count > avgAcquisitions ? 'increasing' : 'decreasing',
          value: Math.round(avgAcquisitions).toString(),
          description: `Average assets acquired per year`
        };
        
      case 'disposal':
        const totalDisposals = data.disposalTrends.reduce((sum, item) => sum + item.count, 0);
        const avgDisposals = totalDisposals / data.disposalTrends.length;
        
        return {
          trend: data.disposalTrends[data.disposalTrends.length - 1]?.count > avgDisposals ? 'increasing' : 'decreasing',
          value: Math.round(avgDisposals).toString(),
          description: `Average assets disposed per year`
        };
        
      default:
        return {
          trend: 'stable',
          value: '0',
          description: 'No data available'
        };
    }
  };

  const renderChart = () => {
    switch (selectedTrend) {
      case 'depreciation':
        return (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <AreaChart data={data.depreciationTrends}>
              <XAxis dataKey="year" fontSize={12} />
              <YAxis fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="companiesAct" 
                stackId="1"
                stroke="var(--color-companiesAct)" 
                fill="var(--color-companiesAct)"
                fillOpacity={0.6}
                name="Companies Act"
              />
              <Area 
                type="monotone" 
                dataKey="itAct" 
                stackId="1"
                stroke="var(--color-itAct)" 
                fill="var(--color-itAct)"
                fillOpacity={0.6}
                name="IT Act"
              />
            </AreaChart>
          </ChartContainer>
        );
        
      case 'acquisition':
        return (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ComposedChart data={data.acquisitionTrends}>
              <XAxis dataKey="year" fontSize={12} />
              <YAxis yAxisId="left" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar yAxisId="left" dataKey="count" fill="var(--color-count)" name="Assets Acquired" />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="value" 
                stroke="var(--color-value)" 
                strokeWidth={3}
                name="Acquisition Value (₹)"
              />
            </ComposedChart>
          </ChartContainer>
        );
        
      case 'disposal':
        return (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart data={data.disposalTrends}>
              <XAxis dataKey="year" fontSize={12} />
              <YAxis fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" name="Assets Disposed" />
            </BarChart>
          </ChartContainer>
        );
        
      case 'verification':
        return (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart data={data.verificationStatus}>
              <XAxis dataKey="status" angle={-45} textAnchor="end" height={80} fontSize={10} />
              <YAxis fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" name="Asset Count" />
            </BarChart>
          </ChartContainer>
        );
        
      default:
        return null;
    }
  };

  const insights = getTrendInsights();

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Trend Selection */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <Select value={selectedTrend} onValueChange={(value: any) => setSelectedTrend(value)}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="depreciation">Depreciation Trends</SelectItem>
                <SelectItem value="acquisition">Acquisition Trends</SelectItem>
                <SelectItem value="disposal">Disposal Trends</SelectItem>
                <SelectItem value="verification">Verification Trends</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trend Insights Card */}
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className={`p-3 rounded-full flex-shrink-0 ${
              insights.trend === 'increasing' ? 'bg-green-100 dark:bg-green-900' : 
              insights.trend === 'decreasing' ? 'bg-red-100 dark:bg-red-900' : 
              'bg-gray-100 dark:bg-gray-900'
            }`}>
              {selectedTrend === 'depreciation' && <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />}
              {selectedTrend === 'acquisition' && <Package className="w-5 h-5 sm:w-6 sm:h-6" />}
              {selectedTrend === 'disposal' && <Package className="w-5 h-5 sm:w-6 sm:h-6" />}
              {selectedTrend === 'verification' && <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold capitalize">{selectedTrend} Trend</h3>
              <p className="text-xl sm:text-2xl font-bold truncate">{insights.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{insights.description}</p>
              <p className={`text-xs sm:text-sm font-medium ${
                insights.trend === 'increasing' ? 'text-green-600' : 
                insights.trend === 'decreasing' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                Trend: {insights.trend}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Trend Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm sm:text-base truncate">
            {selectedTrend === 'depreciation' && 'Depreciation Trends (5-Year)'}
            {selectedTrend === 'acquisition' && 'Asset Acquisition Trends (5-Year)'}
            {selectedTrend === 'disposal' && 'Asset Disposal Trends (5-Year)'}
            {selectedTrend === 'verification' && 'Verification Status Trends'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="w-full h-[250px] sm:h-[400px]">
            {renderChart()}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 w-full">
        {/* Year-over-Year Analysis */}
        <Card className="w-full min-w-0">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Year-over-Year Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {selectedTrend === 'depreciation' && data.depreciationTrends.slice(-2).map((item, index, arr) => {
                if (index === 0) return null;
                const prevYear = arr[index - 1];
                const currentTotal = item.companiesAct + item.itAct;
                const prevTotal = prevYear.companiesAct + prevYear.itAct;
                const change = ((currentTotal - prevTotal) / prevTotal) * 100;
                
                return (
                  <div key={item.year} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span className="font-medium">FY {item.year}-{(item.year + 1).toString().slice(-2)}</span>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(currentTotal)}</p>
                      <p className={`text-sm ${change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs prev year
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {selectedTrend === 'acquisition' && data.acquisitionTrends.slice(-2).map((item, index, arr) => {
                if (index === 0) return null;
                const prevYear = arr[index - 1];
                const change = ((item.count - prevYear.count) / prevYear.count) * 100;
                
                return (
                  <div key={item.year} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span className="font-medium">FY {item.year}-{(item.year + 1).toString().slice(-2)}</span>
                    <div className="text-right">
                      <p className="font-bold">{item.count} assets</p>
                      <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs prev year
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Forecast */}
        <Card className="w-full min-w-0">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Forecast & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {selectedTrend === 'depreciation' && (
                <>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Next Year Forecast</h4>
                    <p className="text-blue-700 dark:text-blue-300">
                      Expected depreciation: {formatCurrency(
                        (data.depreciationTrends[data.depreciationTrends.length - 1]?.companiesAct || 0) + 
                        (data.depreciationTrends[data.depreciationTrends.length - 1]?.itAct || 0)
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Tax Planning</h4>
                    <p className="text-green-700 dark:text-green-300">
                      Consider timing of asset purchases to optimize depreciation benefits
                    </p>
                  </div>
                </>
              )}
              
              {selectedTrend === 'acquisition' && (
                <>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Growth Pattern</h4>
                    <p className="text-blue-700 dark:text-blue-300">
                      Asset acquisition rate: {
                        data.acquisitionTrends.length > 1 ? 
                        (data.acquisitionTrends[data.acquisitionTrends.length - 1]?.count > 
                         data.acquisitionTrends[data.acquisitionTrends.length - 2]?.count ? 'Increasing' : 'Stable') :
                        'Stable'
                      }
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100">Budget Planning</h4>
                    <p className="text-orange-700 dark:text-orange-300">
                      Plan for AMC and insurance costs for new acquisitions
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
