import { Asset, Company } from '@/types/asset';
import { assetStorage } from './asset-storage';
import { depreciationCalculator } from './depreciation/calculations';
import { assetAnalytics } from './asset-analytics';
import { assetUtils } from './asset-utils';
import { auditService } from './audit';
import { notificationService } from './notifications';
import { serviceRecordsManager } from './asset-service/service-records';
import { companyManager } from './asset-service/company-management';

class AssetService {
  // Industry standard warranty/AMC/Insurance durations (in months)
  private getIndustryStandards(category: string) {
    const standards: Record<string, { warranty: number; amc: number; insurance: number }> = {
      'Computer': { warranty: 12, amc: 12, insurance: 12 },
      'Laptop': { warranty: 24, amc: 12, insurance: 12 },
      'Printer': { warranty: 12, amc: 12, insurance: 12 },
      'Server': { warranty: 36, amc: 12, insurance: 12 },
      'Network Equipment': { warranty: 12, amc: 12, insurance: 12 },
      'Furniture': { warranty: 60, amc: 0, insurance: 12 },
      'Vehicle': { warranty: 36, amc: 6, insurance: 12 },
      'Machinery': { warranty: 24, amc: 12, insurance: 12 },
      'Software': { warranty: 12, amc: 12, insurance: 0 },
      'Mobile Phone': { warranty: 12, amc: 12, insurance: 12 },
      'Tablet': { warranty: 12, amc: 12, insurance: 12 },
      'Monitor': { warranty: 36, amc: 0, insurance: 12 },
      'UPS': { warranty: 24, amc: 12, insurance: 12 },
      'Air Conditioner': { warranty: 12, amc: 12, insurance: 12 },
      'Generator': { warranty: 24, amc: 6, insurance: 12 }
    };
    
    return standards[category] || { warranty: 12, amc: 12, insurance: 12 };
  }

  private autoSetServiceDates(assetData: any) {
    const standards = this.getIndustryStandards(assetData.category || assetData.type);
    const purchaseDate = new Date(assetData.purchaseDate);
    
    const result = { ...assetData };
    
    if (!result.warrantyStartDate) {
      result.warrantyStartDate = assetData.purchaseDate;
    }
    if (!result.warrantyEndDate && standards.warranty > 0) {
      const warrantyEnd = new Date(purchaseDate);
      warrantyEnd.setMonth(warrantyEnd.getMonth() + standards.warranty);
      result.warrantyEndDate = warrantyEnd.toISOString().split('T')[0];
    }
    
    if (!result.amcStartDate && standards.amc > 0) {
      result.amcStartDate = assetData.purchaseDate;
    }
    if (!result.amcEndDate && standards.amc > 0) {
      const amcEnd = new Date(purchaseDate);
      amcEnd.setMonth(amcEnd.getMonth() + standards.amc);
      result.amcEndDate = amcEnd.toISOString().split('T')[0];
    }
    
    if (!result.insuranceStartDate && standards.insurance > 0) {
      result.insuranceStartDate = assetData.purchaseDate;
    }
    if (!result.insuranceEndDate && standards.insurance > 0) {
      const insuranceEnd = new Date(purchaseDate);
      insuranceEnd.setMonth(insuranceEnd.getMonth() + standards.insurance);
      result.insuranceEndDate = insuranceEnd.toISOString().split('T')[0];
    }
    
    return result;
  }

  private addServiceReminders(asset: Asset) {
    const today = new Date();
    const reminderDays = 30;
    
    if (asset.warrantyEndDate) {
      const warrantyEnd = new Date(asset.warrantyEndDate);
      const reminderDate = new Date(warrantyEnd);
      reminderDate.setDate(reminderDate.getDate() - reminderDays);
      
      if (reminderDate > today) {
        notificationService.addNotification({
          title: 'Warranty Expiring Soon',
          message: `Warranty for ${asset.name} expires on ${warrantyEnd.toLocaleDateString()}`,
          type: 'warning',
          userId: 'current'
        });
      }
    }
    
    if (asset.amcEndDate) {
      const amcEnd = new Date(asset.amcEndDate);
      const reminderDate = new Date(amcEnd);
      reminderDate.setDate(reminderDate.getDate() - reminderDays);
      
      if (reminderDate > today) {
        notificationService.addNotification({
          title: 'AMC Expiring Soon',
          message: `AMC for ${asset.name} expires on ${amcEnd.toLocaleDateString()}`,
          type: 'warning',
          userId: 'current'
        });
      }
    }
    
    if (asset.insuranceEndDate) {
      const insuranceEnd = new Date(asset.insuranceEndDate);
      const reminderDate = new Date(insuranceEnd);
      reminderDate.setDate(reminderDate.getDate() - reminderDays);
      
      if (reminderDate > today) {
        notificationService.addNotification({
          title: 'Insurance Expiring Soon',
          message: `Insurance for ${asset.name} expires on ${insuranceEnd.toLocaleDateString()}`,
          type: 'warning',
          userId: 'current'
        });
      }
    }
  }

  // Delegate service records management
  cleanupOrphanedServiceRecords(): void {
    const assets = this.getAllAssets();
    const assetIds = new Set(assets.map(a => a.id));
    serviceRecordsManager.cleanupOrphanedServiceRecords(assetIds);
  }

  // Delegate company management
  getAllCompanies = companyManager.getAllCompanies.bind(companyManager);
  createCompany = companyManager.createCompany.bind(companyManager);
  updateCompanySerialFormat = companyManager.updateCompanySerialFormat.bind(companyManager);
  generateSerialNumber = companyManager.generateSerialNumber.bind(companyManager);
  isSerialNumberFormatSetup = companyManager.isSerialNumberFormatSetup.bind(companyManager);

  getAllAssets(): Asset[] {
    return assetStorage.getAllAssets();
  }

  getAssetById(id: string): Asset | undefined {
    return assetStorage.getAssetById(id);
  }

  createAsset(assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>): Asset {
    const assets = this.getAllAssets();
    
    const putToUseDate = assetData.putToUseDate || assetData.purchaseDate;
    const processedData = this.autoSetServiceDates(assetData);
    
    let serialNumber = processedData.serialNumber;
    if (!serialNumber) {
      const company = this.getAllCompanies().find(c => c.name === processedData.company);
      if (company) {
        serialNumber = this.generateSerialNumber(company.id, processedData.department, processedData.type);
      }
    }
    
    const newAsset: Asset = {
      ...processedData,
      putToUseDate,
      serialNumber,
      id: Date.now().toString(),
      currentValue: depreciationCalculator.calculateCurrentValueByMethod({ ...processedData, putToUseDate }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    assets.push(newAsset);
    assetStorage.saveAssets(assets);
    assetStorage.addActivity('Asset Added', newAsset.id, newAsset.name, 'System', 'success');
    
    this.addServiceReminders(newAsset);
    auditService.logAssetCreated(newAsset);
    
    return newAsset;
  }

  updateAsset(id: string, updates: Partial<Asset>): Asset {
    const assets = this.getAllAssets();
    const assetIndex = assets.findIndex(asset => asset.id === id);
    if (assetIndex === -1) throw new Error('Asset not found');

    const previousAsset = assets[assetIndex];
    const updatedAsset = {
      ...previousAsset,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.purchasePrice || updates.depreciationRate || updates.residualValue || updates.purchaseDate || updates.putToUseDate || updates.depreciationMethod || updates.soldDate) {
      updatedAsset.currentValue = depreciationCalculator.calculateCurrentValueByMethod(updatedAsset);
    }

    assets[assetIndex] = updatedAsset;
    assetStorage.saveAssets(assets);
    assetStorage.addActivity('Asset Updated', updatedAsset.id, updatedAsset.name, 'System', 'info');
    
    if (updates.warrantyEndDate || updates.amcEndDate || updates.insuranceEndDate) {
      this.addServiceReminders(updatedAsset);
    }
    
    auditService.logAssetUpdated(id, updatedAsset.name, previousAsset, updates);
    return updatedAsset;
  }

  deleteAsset(id: string): void {
    const assets = this.getAllAssets();
    const assetIndex = assets.findIndex(asset => asset.id === id);
    if (assetIndex === -1) throw new Error('Asset not found');
    
    const asset = assets[assetIndex];
    
    serviceRecordsManager.updateServiceRecordsStatus(id, 'terminated');
    
    assets.splice(assetIndex, 1);
    assetStorage.saveAssets(assets);
    assetStorage.addActivity('Asset Deleted', asset.id, asset.name, 'System', 'warning');
    
    auditService.logAssetDeleted(asset);
  }

  disposeAsset(assetId: string, disposalMethod: 'sale' | 'writeoff' | 'transfer' | 'scrap', salePrice?: number): Asset {
    const asset = this.getAssetById(assetId);
    if (!asset) throw new Error('Asset not found');

    const status = disposalMethod === 'sale' || disposalMethod === 'transfer' ? 'sold' : 'retired';
    const soldDate = new Date().toISOString().split('T')[0];

    const serviceStatus = disposalMethod === 'transfer' ? 'transferred' : 'cancelled';
    serviceRecordsManager.updateServiceRecordsStatus(assetId, serviceStatus);

    const updatedAsset = this.updateAsset(assetId, {
      status,
      soldDate
    });
    
    assetStorage.addActivity(`Asset Disposed (${disposalMethod})`, assetId, asset.name, 'System', 'warning');
    
    auditService.log('Asset Disposed', 'Asset', assetId, {
      disposalMethod,
      salePrice,
      disposedAt: soldDate
    }, undefined, { status, soldDate }, 'success', undefined, asset.name);
    
    return updatedAsset;
  }

  getAssetSummary = assetAnalytics.getAssetSummary.bind(assetAnalytics);
  getAssetsByDepartment = assetAnalytics.getAssetsByDepartment.bind(assetAnalytics);
  getAssetsByCompany = assetAnalytics.getAssetsByCompany.bind(assetAnalytics);
  getUpcomingReminders = assetAnalytics.getUpcomingReminders.bind(assetAnalytics);
  getAmcStatus = assetAnalytics.getAmcStatus.bind(assetAnalytics);
  getAssetValueTrend = assetAnalytics.getAssetValueTrend.bind(assetAnalytics);

  filterAssets = assetUtils.filterAssets.bind(assetUtils);
  sortAssets = assetUtils.sortAssets.bind(assetUtils);
  groupAssets = assetUtils.groupAssets.bind(assetUtils);

  getRecentActivities = assetStorage.getRecentActivities.bind(assetStorage);
  addActivity = assetStorage.addActivity.bind(assetStorage);

  calculateCurrentValueByMethod = depreciationCalculator.calculateCurrentValueByMethod.bind(depreciationCalculator);
  calculateDaysElapsed = depreciationCalculator.calculateDaysElapsed.bind(depreciationCalculator);
  
  // Individual calculation methods for backwards compatibility
  calculateSLMCurrentValue = depreciationCalculator.calculateSLMCurrentValue.bind(depreciationCalculator);
  calculateWDVCurrentValue = depreciationCalculator.calculateWDVCurrentValue.bind(depreciationCalculator);
  calculateWDVFixedSlabCurrentValue = depreciationCalculator.calculateWDVFixedSlabCurrentValue.bind(depreciationCalculator);
  calculateUnitsCurrentValue = depreciationCalculator.calculateUnitsCurrentValue.bind(depreciationCalculator);
  calculateDoubleDecliningCurrentValue = depreciationCalculator.calculateDoubleDecliningCurrentValue.bind(depreciationCalculator);
  calculateSumOfYearsCurrentValue = depreciationCalculator.calculateSumOfYearsCurrentValue.bind(depreciationCalculator);
  calculateWDVRate = depreciationCalculator.calculateWDVRate.bind(depreciationCalculator);

  // Legacy depreciation methods for backwards compatibility
  calculateDepreciationSLM(purchasePrice: number, residualValue: number, usefulLife: number, yearsElapsed: number) {
    const depreciableAmount = Math.max(purchasePrice - residualValue, 0);
    const depreciation = depreciableAmount / usefulLife;
    const bookValue = this.calculateSLMCurrentValue(purchasePrice, residualValue, usefulLife, yearsElapsed);
    return { depreciation, bookValue };
  }

  calculateDepreciationWDV(purchasePrice: number, residualValue: number, usefulLife: number, yearsElapsed: number) {
    const rate = this.calculateWDVRate(purchasePrice, residualValue, usefulLife);
    const bookValue = this.calculateWDVCurrentValue(purchasePrice, residualValue, usefulLife, yearsElapsed);
    const previousValue = yearsElapsed > 0 ? this.calculateWDVCurrentValue(purchasePrice, residualValue, usefulLife, yearsElapsed - 1) : purchasePrice;
    const depreciation = previousValue - bookValue;
    return { depreciation, bookValue, rate };
  }

  calculateDepreciationUnits(purchasePrice: number, residualValue: number, totalCapacity: number, unitsProduced: number) {
    const depreciableAmount = Math.max(purchasePrice - residualValue, 0);
    const ratePerUnit = depreciableAmount / totalCapacity;
    const depreciation = ratePerUnit * Math.min(unitsProduced, totalCapacity);
    const bookValue = this.calculateUnitsCurrentValue(purchasePrice, residualValue, totalCapacity, unitsProduced);
    return { depreciation, bookValue, ratePerUnit };
  }

  calculateDepreciationDoubleDeclining(purchasePrice: number, residualValue: number, usefulLife: number, yearsElapsed: number) {
    const rate = (2 / usefulLife) * 100;
    const bookValue = this.calculateDoubleDecliningCurrentValue(purchasePrice, residualValue, usefulLife, yearsElapsed);
    const previousValue = yearsElapsed > 0 ? this.calculateDoubleDecliningCurrentValue(purchasePrice, residualValue, usefulLife, yearsElapsed - 1) : purchasePrice;
    const depreciation = previousValue - bookValue;
    return { depreciation, bookValue, rate };
  }

  calculateDepreciationSumOfYears(purchasePrice: number, residualValue: number, usefulLife: number, yearsElapsed: number) {
    const bookValue = this.calculateSumOfYearsCurrentValue(purchasePrice, residualValue, usefulLife, yearsElapsed);
    const previousValue = yearsElapsed > 0 ? this.calculateSumOfYearsCurrentValue(purchasePrice, residualValue, usefulLife, yearsElapsed - 1) : purchasePrice;
    const depreciation = previousValue - bookValue;
    return { depreciation, bookValue };
  }

  // Update asset depreciation method
  updateAssetDepreciation(assetId: string): void {
    const asset = this.getAssetById(assetId);
    if (!asset) return;
    
    const updatedValue = this.calculateCurrentValueByMethod(asset);
    this.updateAsset(assetId, { currentValue: updatedValue });
  }

  // Asset Operations
  verifyAsset(assetId: string): Asset {
    const asset = this.getAssetById(assetId);
    if (!asset) throw new Error('Asset not found');

    const updatedAsset = this.updateAsset(assetId, {
      verificationDate: new Date().toISOString().split('T')[0]
    });
    
    assetStorage.addActivity('Asset Verified', assetId, asset.name, 'System', 'success');
    return updatedAsset;
  }

  bulkVerifyAssets(assetIds: string[]): void {
    const verificationDate = new Date().toISOString().split('T')[0];
    
    assetIds.forEach(assetId => {
      const asset = this.getAssetById(assetId);
      if (asset) {
        this.updateAsset(assetId, { verificationDate });
        assetStorage.addActivity('Asset Verified (Bulk)', assetId, asset.name, 'System', 'success');
      }
    });
  }

  bulkCreateAssets(assetsData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>[], parentAssetId?: string): Asset[] {
    const assets = this.getAllAssets();
    const newAssets: Asset[] = [];
    
    assetsData.forEach((assetData, index) => {
      const putToUseDate = assetData.putToUseDate || assetData.purchaseDate;
      
      // Auto-set warranty, AMC, and insurance dates with industry standards
      const processedData = this.autoSetServiceDates(assetData);
      
      const newAsset: Asset = {
        ...processedData,
        putToUseDate,
        id: (Date.now() + index).toString(),
        parentAssetId: parentAssetId,
        isAccessory: !!parentAssetId,
        currentValue: depreciationCalculator.calculateCurrentValueByMethod({ ...processedData, putToUseDate }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      newAssets.push(newAsset);
      assets.push(newAsset);
      
      // Add service reminders for each asset
      this.addServiceReminders(newAsset);
      
      // Audit log
      auditService.logAssetCreated(newAsset);
    });

    if (parentAssetId) {
      const parentAsset = assets.find(a => a.id === parentAssetId);
      if (parentAsset) {
        parentAsset.accessoryAssets = [
          ...(parentAsset.accessoryAssets || []),
          ...newAssets.map(a => a.id)
        ];
        parentAsset.updatedAt = new Date().toISOString();
      }
    }

    assetStorage.saveAssets(assets);
    
    newAssets.forEach(asset => {
      assetStorage.addActivity('Asset Added (Bulk)', asset.id, asset.name, 'System', 'success');
    });
    
    return newAssets;
  }

  // Import/Export
  importAssetsFromExcel(data: any[]): { success: number; errors: string[] } {
    const errors: string[] = [];
    let success = 0;

    data.forEach((row, index) => {
      try {
        const assetData = {
          name: row.name || row.assetName || '',
          type: row.type || row.assetType || '',
          category: row.category || '',
          purchaseDate: row.purchaseDate || new Date().toISOString().split('T')[0],
          putToUseDate: row.putToUseDate || row.purchaseDate || new Date().toISOString().split('T')[0],
          purchasePrice: parseFloat(row.purchasePrice) || 0,
          depreciationRate: parseFloat(row.depreciationRate) || 0,
          residualValue: parseFloat(row.residualValue) || 0,
          owner: row.owner || '',
          department: row.department || '',
          company: row.company || 'Default Company',
          location: row.location || '',
          office: row.office || '',
          vendor: row.vendor || '',
          invoiceNumber: row.invoiceNumber || `INV-${Date.now()}`,
          status: (row.status as Asset['status']) || 'active',
          depreciationMethod: (row.depreciationMethod as Asset['depreciationMethod']) || 'SLM',
          usefulLife: parseInt(row.usefulLife) || 5,
          notes: row.notes || '',
          // Include service dates from import if provided
          warrantyStartDate: row.warrantyStartDate,
          warrantyEndDate: row.warrantyEndDate,
          amcStartDate: row.amcStartDate,
          amcEndDate: row.amcEndDate,
          insuranceStartDate: row.insuranceStartDate,
          insuranceEndDate: row.insuranceEndDate
        };

        this.createAsset(assetData as Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>);
        success++;
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    return { success, errors };
  }

  updateSerialNumberFormat(companyId: string, department: string, assetClass: string, newPrefix: string, applyToExisting: boolean = false): void {
    const companies = this.getAllCompanies();
    const company = companies.find(c => c.id === companyId);
    
    if (!company) return;

    const oldPrefix = company.serialNumberFormat[department]?.[assetClass]?.prefix;
    
    // Update the format
    if (!company.serialNumberFormat[department]) {
      company.serialNumberFormat[department] = {};
    }
    
    const currentNextNumber = company.serialNumberFormat[department][assetClass]?.nextNumber || 1;
    company.serialNumberFormat[department][assetClass] = {
      prefix: newPrefix,
      nextNumber: currentNextNumber
    };
    
    // Update company
    const companyIndex = companies.findIndex(c => c.id === companyId);
    companies[companyIndex] = { ...company, updatedAt: new Date().toISOString() };
    assetStorage.saveCompanies(companies);

    // If user wants to apply to existing assets
    if (applyToExisting && oldPrefix) {
      this.updateExistingAssetSerialNumbers(company.name, department, assetClass, oldPrefix, newPrefix);
    }
  }

  updateExistingAssetSerialNumbers(companyName: string, department: string, assetClass: string, oldPrefix: string, newPrefix: string): void {
    const assets = this.getAllAssets();
    const updatedAssets = assets.map(asset => {
      if (asset.company === companyName && 
          asset.department === department && 
          asset.type === assetClass && 
          asset.serialNumber?.startsWith(oldPrefix)) {
        
        // Extract the number part and create new serial number
        const numberPart = asset.serialNumber.replace(oldPrefix + '-', '');
        return {
          ...asset,
          serialNumber: `${newPrefix}-${numberPart}`,
          updatedAt: new Date().toISOString()
        };
      }
      return asset;
    });
    
    assetStorage.saveAssets(updatedAssets);
  }

  deleteSerialNumberFormat(companyId: string, department: string, assetClass: string): void {
    const companies = this.getAllCompanies();
    const company = companies.find(c => c.id === companyId);
    
    if (!company || !company.serialNumberFormat[department] || !company.serialNumberFormat[department][assetClass]) {
      return;
    }
    
    delete company.serialNumberFormat[department][assetClass];
    
    // If department has no more asset classes, remove department
    if (Object.keys(company.serialNumberFormat[department]).length === 0) {
      delete company.serialNumberFormat[department];
    }
    
    const companyIndex = companies.findIndex(c => c.id === companyId);
    companies[companyIndex] = { ...company, updatedAt: new Date().toISOString() };
    assetStorage.saveCompanies(companies);
  }
}

export const assetService = new AssetService();
export type { Asset, Company } from '@/types/asset';
export type { AssetSummary, AssetActivity, AssetReminder } from '@/types/asset';
