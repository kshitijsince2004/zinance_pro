
import { Asset, Company, AssetActivity, AssetReminder, AssetSummary } from '@/types/asset';

export class AssetStorage {
  getAllAssets(): Asset[] {
    const stored = localStorage.getItem('fams-assets');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  saveAssets(assets: Asset[]): void {
    localStorage.setItem('fams-assets', JSON.stringify(assets));
  }

  getAssetById(id: string): Asset | undefined {
    const assets = this.getAllAssets();
    return assets.find(asset => asset.id === id);
  }

  getAllCompanies(): Company[] {
    const stored = localStorage.getItem('fams-companies');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  saveCompanies(companies: Company[]): void {
    localStorage.setItem('fams-companies', JSON.stringify(companies));
  }

  getRecentActivities(): AssetActivity[] {
    const stored = localStorage.getItem('fams-activities');
    if (stored) {
      const activities = JSON.parse(stored);
      return activities.sort((a: AssetActivity, b: AssetActivity) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 10);
    }
    return [];
  }

  saveActivities(activities: AssetActivity[]): void {
    localStorage.setItem('fams-activities', JSON.stringify(activities.slice(0, 50)));
  }

  addActivity(action: string, assetId: string, assetName: string, user: string, type: AssetActivity['type']): void {
    const activities = this.getRecentActivities();
    const newActivity: AssetActivity = {
      id: Date.now().toString(),
      action,
      assetId,
      assetName,
      user,
      timestamp: new Date().toISOString(),
      type
    };
    
    activities.unshift(newActivity);
    this.saveActivities(activities);
  }
}

export const assetStorage = new AssetStorage();
