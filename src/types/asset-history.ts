export interface DepreciationHistory {
  id: string;
  assetId: string;
  financialYear: string;
  startDate: string;
  endDate: string;
  openingValue: number;
  depreciationAmount: number;
  closingValue: number;
  depreciationMethod: string;
  isSystemCalculated: boolean;
  isHistorical: boolean; // True for imported/historical data
  importBatchId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetHistoryEntry {
  id: string;
  assetId: string;
  assetName: string;
  action: 'created' | 'updated' | 'imported' | 'depreciation_updated' | 'transferred' | 'historical_import' | 'disposed';
  oldValue?: number;
  newValue?: number;
  field?: string;
  timestamp: string;
  user: string;
  details?: string;
  depreciationHistory?: DepreciationHistory;
}

export interface HistoricalAssetData {
  assetId: string;
  historicalDepreciation: DepreciationHistory[];
  startFromCurrentValue: boolean;
  currentBookValue: number;
  historicalYears: string[];
}