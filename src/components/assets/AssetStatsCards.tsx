
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, Users, Building } from 'lucide-react';
import { Asset } from '@/lib/assets';
import { AssetTrends } from '@/lib/asset-trends';

interface AssetStatsCardsProps {
  assets: Asset[];
  departments: string[];
}

const AssetStatsCards: React.FC<AssetStatsCardsProps> = ({ assets, departments }) => {
  // Calculate real-time statistics
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
  const activeAssets = assets.filter(asset => asset.status === 'active').length;
  const totalDepartments = departments.length;

  // Calculate trends using AssetTrends
  const totalAssetsTrend = AssetTrends.getTotalAssetsTrend(assets);
  const totalValueTrend = AssetTrends.getTotalValueTrend(assets);
  
  // Calculate active assets trend
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const lastMonthActiveAssets = assets.filter(asset => 
    asset.status === 'active' && 
    new Date(asset.createdAt || asset.purchaseDate) <= lastMonth
  ).length;
  const activeAssetsTrend = AssetTrends.getTotalAssetsTrend(assets.filter(a => a.status === 'active'));

  // Department trend (simplified - based on asset distribution)
  const departmentTrend = departments.length > 0 ? '+0%' : '0%';

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  const getTrendColor = (trend: string) => {
    if (trend.startsWith('+')) return 'border-green-500 text-green-500';
    if (trend.startsWith('-')) return 'border-red-400 text-red-400';
    return 'border-zinc-400 text-zinc-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-black/60 border-green-500/20 hover:border-green-500/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Total Assets</CardTitle>
          <Package className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">{totalAssets}</div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Across all departments</p>
            <Badge variant="outline" className={`text-xs ${getTrendColor(totalAssetsTrend)}`}>
              {totalAssetsTrend}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/60 border-green-500/20 hover:border-green-500/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">{formatCurrency(totalValue)}</div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Current asset value</p>
            <Badge variant="outline" className={`text-xs ${getTrendColor(totalValueTrend)}`}>
              {totalValueTrend}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/60 border-green-500/20 hover:border-green-500/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Active Assets</CardTitle>
          <Users className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">{activeAssets}</div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Currently in use</p>
            <Badge variant="outline" className={`text-xs ${getTrendColor(activeAssetsTrend)}`}>
              {activeAssetsTrend}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/60 border-green-500/20 hover:border-green-500/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Departments</CardTitle>
          <Building className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">{totalDepartments}</div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Active departments</p>
            <Badge variant="outline" className={`text-xs ${getTrendColor(departmentTrend)}`}>
              {departmentTrend}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetStatsCards;
