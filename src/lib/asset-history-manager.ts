import { DepreciationHistory, AssetHistoryEntry, HistoricalAssetData } from '@/types/asset-history';
import { Asset } from '@/types/asset';

class AssetHistoryManager {
  private readonly HISTORY_STORAGE_KEY = 'asset_depreciation_history';
  private readonly ASSET_HISTORY_KEY = 'asset_history_entries';

  getAssetDepreciationHistory(assetId: string): DepreciationHistory[] {
    const allHistory = this.getAllDepreciationHistory();
    return allHistory.filter(h => h.assetId === assetId).sort((a, b) => a.financialYear.localeCompare(b.financialYear));
  }

  getAllDepreciationHistory(): DepreciationHistory[] {
    const stored = localStorage.getItem(this.HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  saveDepreciationHistory(history: DepreciationHistory[]): void {
    localStorage.setItem(this.HISTORY_STORAGE_KEY, JSON.stringify(history));
  }

  addHistoricalDepreciation(assetId: string, historicalData: Omit<DepreciationHistory, 'id' | 'createdAt' | 'updatedAt'>[]): void {
    const history = this.getAllDepreciationHistory();
    const newHistories: DepreciationHistory[] = historicalData.map(data => ({
      ...data,
      id: `${assetId}_${data.financialYear}_${Date.now()}`,
      assetId,
      isHistorical: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const filteredHistory = history.filter(h => !(h.assetId === assetId && h.isHistorical));
    this.saveDepreciationHistory([...filteredHistory, ...newHistories]);
  }

  updateDepreciationHistory(historyId: string, updates: Partial<DepreciationHistory>): DepreciationHistory | null {
    const history = this.getAllDepreciationHistory();
    const index = history.findIndex(h => h.id === historyId);
    
    if (index === -1) return null;

    const updatedHistory = {
      ...history[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    history[index] = updatedHistory;
    this.saveDepreciationHistory(history);
    return updatedHistory;
  }

  deleteDepreciationHistory(historyId: string): boolean {
    const history = this.getAllDepreciationHistory();
    const index = history.findIndex(h => h.id === historyId);
    
    if (index === -1) return false;

    history.splice(index, 1);
    this.saveDepreciationHistory(history);
    return true;
  }

  getCurrentBookValue(asset: Asset): number {
    const history = this.getAssetDepreciationHistory(asset.id);
    
    if (history.length === 0) {
      return asset.currentValue;
    }

    const latestHistorical = history
      .filter(h => h.isHistorical)
      .sort((a, b) => b.financialYear.localeCompare(a.financialYear))[0];

    if (latestHistorical) {
      return latestHistorical.closingValue;
    }

    return asset.currentValue;
  }

  getAssetHistoryEntries(assetId?: string): AssetHistoryEntry[] {
    const stored = localStorage.getItem(this.ASSET_HISTORY_KEY);
    const allEntries: AssetHistoryEntry[] = stored ? JSON.parse(stored) : [];
    
    if (assetId) {
      return allEntries.filter(e => e.assetId === assetId);
    }
    
    return allEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  logHistoryEntry(entry: Omit<AssetHistoryEntry, 'id' | 'timestamp' | 'assetName'>): void {
    const entries = this.getAssetHistoryEntries();
    const newEntry: AssetHistoryEntry = {
      ...entry,
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      assetName: entry.assetId
    };

    entries.unshift(newEntry);
    
    if (entries.length > 1000) {
      entries.splice(1000);
    }

    localStorage.setItem(this.ASSET_HISTORY_KEY, JSON.stringify(entries));
  }

  compareSystemVsHistorical(assetId: string, financialYear: string) {
    const history = this.getAssetDepreciationHistory(assetId);
    const historical = history.find(h => h.financialYear === financialYear && h.isHistorical);
    const systemCalculated = history.find(h => h.financialYear === financialYear && h.isSystemCalculated);

    let difference = 0;
    let variance = 0;

    if (historical && systemCalculated) {
      difference = systemCalculated.depreciationAmount - historical.depreciationAmount;
      variance = Math.abs(difference / historical.depreciationAmount) * 100;
    }

    return {
      historical,
      systemCalculated,
      difference,
      variance
    };
  }

  getFinancialYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    const fyYear = month >= 3 ? year : year - 1;
    return `${fyYear}-${fyYear + 1}`;
  }

  clearAllHistory(): void {
    localStorage.removeItem(this.HISTORY_STORAGE_KEY);
    localStorage.removeItem(this.ASSET_HISTORY_KEY);
  }
}

export const assetHistoryManager = new AssetHistoryManager();