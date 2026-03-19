
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Download, TrendingUp, ArrowUpDown } from 'lucide-react';
import { ReportsData } from '@/lib/reports-service';

interface ComparisonModuleProps {
  data: ReportsData;
  filters: any;
  uniqueCompanies: string[];
  uniqueDepartments: string[];
}

export const ComparisonModule: React.FC<ComparisonModuleProps> = ({
  data,
  filters,
  uniqueCompanies,
  uniqueDepartments
}) => {
  const [comparisonType, setComparisonType] = useState<'companies' | 'departments' | 'methods'>('companies');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<string[]>(['count', 'value']);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const availableItems = useMemo(() => {
    switch (comparisonType) {
      case 'companies':
        return uniqueCompanies;
      case 'departments':
        return uniqueDepartments;
      case 'methods':
        return ['SLM', 'WDV', 'WDV_FIXED_SLAB', 'UNITS', 'DOUBLE_DECLINING', 'SUM_OF_YEARS'];
      default:
        return [];
    }
  }, [comparisonType, uniqueCompanies, uniqueDepartments]);

  const comparisonData = useMemo(() => {
    if (selectedItems.length === 0) return [];

    return selectedItems.map(item => {
      let filteredData;
      
      switch (comparisonType) {
        case 'companies':
          filteredData = data.companyDistribution.find(c => c.name === item);
          break;
        case 'departments':
          filteredData = data.departmentDistribution.find(d => d.name === item);
          break;
        case 'methods':
          // For methods comparison, we'd need to calculate depreciation using different methods
          filteredData = { name: item, count: 0, value: 0 }; // Placeholder
          break;
        default:
          filteredData = { name: item, count: 0, value: 0 };
      }

      return {
        name: item,
        count: filteredData?.count || 0,
        value: filteredData?.value || 0,
        avgValue: filteredData ? Math.round(filteredData.value / Math.max(filteredData.count, 1)) : 0
      };
    });
  }, [selectedItems, comparisonType, data]);

  const toggleItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const toggleMetric = (metric: string) => {
    setMetrics(prev => 
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const chartConfig = {
    count: {
      label: "Asset Count",
      color: "hsl(var(--chart-1))",
    },
    value: {
      label: "Total Value (₹)",
      color: "hsl(var(--chart-2))",
    },
    avgValue: {
      label: "Average Value (₹)",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Comparison Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowUpDown className="w-5 h-5 mr-2" />
            Comparison Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comparison Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Compare By</label>
              <Select value={comparisonType} onValueChange={(value: any) => {
                setComparisonType(value);
                setSelectedItems([]);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="companies">Companies</SelectItem>
                  <SelectItem value="departments">Departments</SelectItem>
                  <SelectItem value="methods">Depreciation Methods</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Item Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select {comparisonType} to Compare
            </label>
            <div className="flex flex-wrap gap-2">
              {availableItems.map(item => (
                <Badge
                  key={item}
                  variant={selectedItems.includes(item) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleItem(item)}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          {/* Metrics Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Metrics to Compare</label>
            <div className="flex flex-wrap gap-2">
              {['count', 'value', 'avgValue'].map(metric => (
                <Badge
                  key={metric}
                  variant={metrics.includes(metric) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleMetric(metric)}
                >
                  {metric === 'count' ? 'Asset Count' : 
                   metric === 'value' ? 'Total Value' : 'Average Value'}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedItems.length > 0 && (
        <>
          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Comparison Results</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">{comparisonType.slice(0, -1).replace(/^./, str => str.toUpperCase())}</th>
                      {metrics.includes('count') && <th className="text-right p-3">Asset Count</th>}
                      {metrics.includes('value') && <th className="text-right p-3">Total Value</th>}
                      {metrics.includes('avgValue') && <th className="text-right p-3">Average Value</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{item.name}</td>
                        {metrics.includes('count') && (
                          <td className="p-3 text-right">{item.count}</td>
                        )}
                        {metrics.includes('value') && (
                          <td className="p-3 text-right">{formatCurrency(item.value)}</td>
                        )}
                        {metrics.includes('avgValue') && (
                          <td className="p-3 text-right">{formatCurrency(item.avgValue)}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metrics.includes('count') && (
              <Card>
                <CardHeader>
                  <CardTitle>Asset Count Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={comparisonData}>
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" name="Asset Count" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {metrics.includes('value') && (
              <Card>
                <CardHeader>
                  <CardTitle>Total Value Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={comparisonData}>
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--color-value)" name="Total Value (₹)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.includes('count') && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Highest Asset Count</h4>
                    <p className="text-blue-700 dark:text-blue-300">
                      {comparisonData.reduce((max, item) => item.count > max.count ? item : max, comparisonData[0])?.name || 'N/A'}
                    </p>
                  </div>
                )}
                
                {metrics.includes('value') && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Highest Total Value</h4>
                    <p className="text-green-700 dark:text-green-300">
                      {comparisonData.reduce((max, item) => item.value > max.value ? item : max, comparisonData[0])?.name || 'N/A'}
                    </p>
                  </div>
                )}
                
                {metrics.includes('avgValue') && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">Highest Average Value</h4>
                    <p className="text-purple-700 dark:text-purple-300">
                      {comparisonData.reduce((max, item) => item.avgValue > max.avgValue ? item : max, comparisonData[0])?.name || 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
