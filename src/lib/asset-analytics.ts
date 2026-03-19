
import { Asset, AssetSummary, AssetReminder } from '@/types/asset';
import { assetStorage } from './asset-storage';

class AssetAnalytics {
  getAssetSummary(): AssetSummary {
    const assets = assetStorage.getAllAssets();
    const activeAssets = assets.filter(asset => asset.status === 'active');
    const retiredAssets = assets.filter(asset => asset.status === 'retired');
    const soldAssets = assets.filter(asset => asset.status === 'sold');
    
    // AMC calculations
    const now = new Date();
    const activeAmcs = assets.filter(asset => asset.amcEndDate && new Date(asset.amcEndDate) > now).length;
    const expiredAmcs = assets.filter(asset => asset.amcEndDate && new Date(asset.amcEndDate) <= now).length;
    const expiringAmcs = assets.filter(asset => {
      if (!asset.amcEndDate) return false;
      const endDate = new Date(asset.amcEndDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return endDate <= thirtyDaysFromNow && endDate > now;
    }).length;
    
    return {
      totalAssets: assets.length,
      totalValue: activeAssets.reduce((sum, asset) => sum + asset.currentValue, 0),
      activeAssets: activeAssets.length,
      retiredAssets: retiredAssets.length,
      soldAssets: soldAssets.length,
      activeAmcs,
      expiringAmcs,
      expiredAmcs
    };
  }

  getAssetsByDepartment(): Array<{ department: string; count: number }> {
    const assets = assetStorage.getAllAssets();
    const departmentCounts = assets.reduce((acc, asset) => {
      const dept = asset.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(departmentCounts).map(([department, count]) => ({
      department,
      count
    }));
  }

  getAssetsByCompany(): Array<{ company: string; count: number }> {
    const assets = assetStorage.getAllAssets();
    const companyCounts = assets.reduce((acc, asset) => {
      const company = asset.company || 'Default Company';
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(companyCounts).map(([company, count]) => ({
      company,
      count
    }));
  }

  getAmcStatus(): Array<{ name: string; count: number }> {
    const assets = assetStorage.getAllAssets();
    const now = new Date();
    
    let active = 0;
    let expiring = 0;
    let expired = 0;
    let noAmc = 0;

    assets.forEach(asset => {
      if (!asset.amcEndDate) {
        noAmc++;
      } else {
        const endDate = new Date(asset.amcEndDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        if (endDate < now) {
          expired++;
        } else if (endDate <= thirtyDaysFromNow) {
          expiring++;
        } else {
          active++;
        }
      }
    });

    return [
      { name: 'Active', count: active },
      { name: 'Expiring Soon', count: expiring },
      { name: 'Expired', count: expired },
      { name: 'No AMC', count: noAmc }
    ];
  }

  getAssetValueTrend(): Array<{ month: string; value: number }> {
    const assets = assetStorage.getAllAssets();
    const months = [];
    const currentDate = new Date();
    
    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      // Calculate total value of assets as of that month
      const totalValue = assets
        .filter(asset => new Date(asset.purchaseDate) <= date)
        .reduce((sum, asset) => sum + asset.currentValue, 0);
      
      months.push({
        month: monthName,
        value: totalValue
      });
    }
    
    return months;
  }

  getUpcomingReminders(): AssetReminder[] {
    const assets = assetStorage.getAllAssets();
    const reminders: AssetReminder[] = [];
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    assets.forEach(asset => {
      // AMC expiry reminders
      if (asset.amcEndDate) {
        const endDate = new Date(asset.amcEndDate);
        if (endDate > now && endDate <= threeMonthsFromNow) {
          const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          reminders.push({
            id: `amc-${asset.id}`,
            assetId: asset.id,
            assetName: asset.name,
            title: `AMC expiring for ${asset.name}`,
            date: asset.amcEndDate,
            type: 'amc',
            priority: daysUntilExpiry <= 30 ? 'high' : daysUntilExpiry <= 60 ? 'medium' : 'low',
            days: daysUntilExpiry
          });
        }
      }

      // Warranty expiry reminders
      if (asset.warrantyEndDate) {
        const endDate = new Date(asset.warrantyEndDate);
        if (endDate > now && endDate <= threeMonthsFromNow) {
          const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          reminders.push({
            id: `warranty-${asset.id}`,
            assetId: asset.id,
            assetName: asset.name,
            title: `Warranty expiring for ${asset.name}`,
            date: asset.warrantyEndDate,
            type: 'warranty',
            priority: daysUntilExpiry <= 30 ? 'high' : daysUntilExpiry <= 60 ? 'medium' : 'low',
            days: daysUntilExpiry
          });
        }
      }

      // Insurance expiry reminders (treated as AMC type for now)
      if (asset.insuranceEndDate) {
        const endDate = new Date(asset.insuranceEndDate);
        if (endDate > now && endDate <= threeMonthsFromNow) {
          const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          reminders.push({
            id: `insurance-${asset.id}`,
            assetId: asset.id,
            assetName: asset.name,
            title: `Insurance expiring for ${asset.name}`,
            date: asset.insuranceEndDate,
            type: 'amc', // Using 'amc' type as 'insurance' is not allowed
            priority: daysUntilExpiry <= 30 ? 'high' : daysUntilExpiry <= 60 ? 'medium' : 'low',
            days: daysUntilExpiry
          });
        }
      }
    });

    return reminders.sort((a, b) => a.days - b.days);
  }
}

export const assetAnalytics = new AssetAnalytics();
