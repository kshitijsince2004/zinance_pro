
import { Asset } from './assets';

export class AssetTrends {
  private static calculateMonthlyTrend(currentValue: number, previousValue: number): string {
    if (previousValue === 0) return '0%';
    const percentChange = ((currentValue - previousValue) / previousValue) * 100;
    const sign = percentChange > 0 ? '+' : '';
    return `${sign}${percentChange.toFixed(1)}%`;
  }

  static getTotalAssetsTrend(assets: Asset[]): string {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const currentTotal = assets.length;
    const lastMonthTotal = assets.filter(asset => 
      new Date(asset.createdAt || asset.purchaseDate) <= lastMonth
    ).length;
    
    return this.calculateMonthlyTrend(currentTotal, lastMonthTotal);
  }

  static getTotalValueTrend(assets: Asset[]): string {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    // Current value
    const currentValue = assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
    
    // Estimate previous month value (simplified approach)
    const lastMonthAssets = assets.filter(asset => 
      new Date(asset.createdAt || asset.purchaseDate) <= lastMonth
    );
    const lastMonthValue = lastMonthAssets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
    
    return this.calculateMonthlyTrend(currentValue, lastMonthValue);
  }

  static getActiveAmcTrend(assets: Asset[]): string {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const currentActive = assets.filter(asset => 
      asset.amcEndDate && new Date(asset.amcEndDate) > now
    ).length;
    
    const lastMonthActive = assets.filter(asset => 
      asset.amcEndDate && new Date(asset.amcEndDate) > lastMonth
    ).length;
    
    return this.calculateMonthlyTrend(currentActive, lastMonthActive);
  }

  static getExpiringSoonTrend(assets: Asset[]): string {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const currentExpiring = assets.filter(asset => {
      if (!asset.amcEndDate) return false;
      const endDate = new Date(asset.amcEndDate);
      return endDate <= thirtyDaysFromNow && endDate > now;
    }).length;
    
    // For expiring soon, we compare with last week's count
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekThirtyDays = new Date(lastWeek);
    lastWeekThirtyDays.setDate(lastWeekThirtyDays.getDate() + 30);
    
    const lastWeekExpiring = assets.filter(asset => {
      if (!asset.amcEndDate) return false;
      const endDate = new Date(asset.amcEndDate);
      return endDate <= lastWeekThirtyDays && endDate > lastWeek;
    }).length;
    
    return this.calculateMonthlyTrend(currentExpiring, lastWeekExpiring);
  }
}
