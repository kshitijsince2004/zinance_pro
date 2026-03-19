export interface Asset {
  id: string;
  name: string;
  type: string;
  category: string;
  purchaseDate: string;
  putToUseDate?: string;
  purchasePrice: number;
  depreciationRate: number;
  residualValue: number;
  currentValue: number;
  // For continuing from existing book values during import
  startFromCurrentValue?: boolean;
  owner: string;
  department: string;
  company: string;
  location: string;
  office: string;
  vendor: string;
  
  // Additional Asset Details
  assignedTo?: string;
  description?: string;
  model?: string;
  manufacturer?: string;
  uniqueIdentificationNumber?: string; // IMEI for mobile devices, System ID for computers
  assetImage?: string; // Base64 encoded image or URL
  
  // Billing and Invoice Details
  invoiceNumber: string;
  poNumber?: string;
  billToAddress?: string;
  shipToAddress?: string;
  gstNumber?: string;
  panNumber?: string;
  taxAmount?: number;
  discountAmount?: number;
  shippingAmount?: number;
  totalAmount?: number;
  paymentMethod?: string;
  paymentTerms?: string;
  
  // Warranty, AMC, Insurance
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  amcStartDate?: string;
  amcEndDate?: string;
  insuranceStartDate?: string;
  insuranceEndDate?: string;
  insuranceProvider?: string;
  insuranceAmount?: number;
  
  // Asset Relationships
  parentAssetId?: string;
  accessoryAssets?: string[];
  isAccessory?: boolean;
  
  status: 'active' | 'retired' | 'sold';
  notes?: string;
  qrCode?: string;
  depreciationMethod: 'SLM' | 'WDV' | 'WDV_FIXED_SLAB' | 'UNITS' | 'DOUBLE_DECLINING' | 'SUM_OF_YEARS';
  usefulLife?: number;
  productionCapacity?: number;
  unitsProduced?: number;
  serialNumber?: string;
  soldDate?: string;
  soldPrice?: number;
  verificationDate?: string;
  
  // Import Metadata (immutable)
  importMetadata?: {
    batchId: string;
    importDate: string;
    importTime: string;
    fileName: string;
    rowNumber: number;
    importedBy: string;
    importMethod: 'excel' | 'csv' | 'manual';
    originalData?: Record<string, any>;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  departments: string[];
  serialNumberFormat: {
    [department: string]: {
      [assetClass: string]: {
        prefix: string;
        nextNumber: number;
      };
    };
  };
  defaultDepreciationMethods?: {
    [department: string]: 'SLM' | 'WDV' | 'WDV_FIXED_SLAB' | 'UNITS' | 'DOUBLE_DECLINING' | 'SUM_OF_YEARS';
  };
  createdAt: string;
  updatedAt: string;
}

export interface AssetSummary {
  totalAssets: number;
  totalValue: number;
  activeAssets: number;
  retiredAssets: number;
  soldAssets: number;
  activeAmcs: number;
  expiringAmcs: number;
  expiredAmcs: number;
}

export interface AssetActivity {
  id: string;
  action: string;
  assetId: string;
  assetName: string;
  user: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface AssetReminder {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  date: string;
  days: number;
  priority: 'high' | 'medium' | 'low';
  type: 'amc' | 'warranty';
}

export interface ImportLog {
  id: string;
  batchId: string;
  fileName: string;
  importDate: string;
  importTime: string;
  importedBy: string;
  importMethod: 'excel' | 'csv' | 'manual';
  totalRows: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  metadata: {
    fileSize?: number;
    columnMappings: Record<string, string>;
    customFields: string[];
    errors: string[];
  };
  createdAt: string;
}
