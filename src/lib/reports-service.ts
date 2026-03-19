
import { Asset } from '@/types/asset';
import { depreciationCalculator } from '@/lib/depreciation/calculations';

export interface ReportsData {
  totalAssets: number;
  activeAssets: number;
  disposedAssets: number;
  totalDepreciationThisFY: number;
  totalBookValue: number;
  unverifiedAssets: number;
  expiringServices: {
    insurance: number;
    amc: number;
    warranty: number;
  };
  assetClassDistribution: Array<{ name: string; count: number; value: number }>;
  departmentDistribution: Array<{ name: string; count: number; value: number }>;
  companyDistribution: Array<{ name: string; count: number; value: number }>;
  depreciationTrends: Array<{ year: number; companiesAct: number; itAct: number }>;
  acquisitionTrends: Array<{ year: number; count: number; value: number }>;
  disposalTrends: Array<{ year: number; count: number; value: number }>;
  verificationStatus: Array<{ status: string; count: number }>;
  serviceStatus: Array<{ type: string; active: number; expiring: number; expired: number }>;
}

class ReportsService {
  getFinancialYear(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    return month >= 3 ? year : year - 1;
  }

  getFinancialYearRange(fyYear: number): { start: Date; end: Date } {
    return {
      start: new Date(fyYear, 3, 1), // April 1st
      end: new Date(fyYear + 1, 2, 31) // March 31st
    };
  }

  calculateDepreciationForFY(asset: Asset, fyYear: number): number {
    const fyRange = this.getFinancialYearRange(fyYear);
    const putToUseDate = new Date(asset.putToUseDate || asset.purchaseDate);
    
    // Calculate depreciation for the financial year
    const startOfFY = new Date(Math.max(putToUseDate.getTime(), fyRange.start.getTime()));
    const endOfFY = asset.soldDate ? 
      new Date(Math.min(new Date(asset.soldDate).getTime(), fyRange.end.getTime())) : 
      fyRange.end;
    
    if (startOfFY >= endOfFY) return 0;
    
    const startValue = depreciationCalculator.calculateCurrentValueByMethod({
      ...asset,
      soldDate: startOfFY.toISOString().split('T')[0]
    });
    
    const endValue = depreciationCalculator.calculateCurrentValueByMethod({
      ...asset,
      soldDate: endOfFY.toISOString().split('T')[0]
    });
    
    return Math.max(0, startValue - endValue);
  }

  getFilteredReportsData(assets: Asset[], filters: any): ReportsData {
    const currentFY = this.getFinancialYear(new Date());
    const targetFY = filters.financialYear || currentFY;
    
    // Apply filters
    let filteredAssets = assets.filter(asset => {
      if (filters.companies.length > 0 && !filters.companies.includes(asset.company)) return false;
      if (filters.departments.length > 0 && !filters.departments.includes(asset.department)) return false;
      if (filters.assetStatus !== 'all' && asset.status !== filters.assetStatus) return false;
      if (filters.assetClasses.length > 0 && !filters.assetClasses.includes(asset.category)) return false;
      
      if (filters.verificationStatus !== 'all') {
        const isVerified = asset.verificationDate && 
          this.getFinancialYear(new Date(asset.verificationDate)) >= targetFY;
        if (filters.verificationStatus === 'verified' && !isVerified) return false;
        if (filters.verificationStatus === 'unverified' && isVerified) return false;
      }
      
      return true;
    });

    const totalAssets = filteredAssets.length;
    const activeAssets = filteredAssets.filter(a => a.status === 'active').length;
    const disposedAssets = filteredAssets.filter(a => a.status === 'retired' || a.status === 'sold').length;
    
    const totalDepreciationThisFY = filteredAssets.reduce((sum, asset) => {
      return sum + this.calculateDepreciationForFY(asset, targetFY);
    }, 0);
    
    const totalBookValue = filteredAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
    
    const unverifiedAssets = filteredAssets.filter(asset => {
      if (!asset.verificationDate) return true;
      return this.getFinancialYear(new Date(asset.verificationDate)) < targetFY;
    }).length;

    // Expiring services (next 30 days)
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);
    
    const expiringServices = {
      insurance: filteredAssets.filter(asset => 
        asset.insuranceEndDate && 
        new Date(asset.insuranceEndDate) <= next30Days &&
        new Date(asset.insuranceEndDate) >= new Date()
      ).length,
      amc: filteredAssets.filter(asset => 
        asset.amcEndDate && 
        new Date(asset.amcEndDate) <= next30Days &&
        new Date(asset.amcEndDate) >= new Date()
      ).length,
      warranty: filteredAssets.filter(asset => 
        asset.warrantyEndDate && 
        new Date(asset.warrantyEndDate) <= next30Days &&
        new Date(asset.warrantyEndDate) >= new Date()
      ).length
    };

    // Asset class distribution
    const assetClassMap = new Map<string, { count: number; value: number }>();
    filteredAssets.forEach(asset => {
      const existing = assetClassMap.get(asset.category) || { count: 0, value: 0 };
      assetClassMap.set(asset.category, {
        count: existing.count + 1,
        value: existing.value + asset.currentValue
      });
    });
    const assetClassDistribution = Array.from(assetClassMap.entries()).map(([name, data]) => ({
      name, ...data
    }));

    // Department distribution
    const departmentMap = new Map<string, { count: number; value: number }>();
    filteredAssets.forEach(asset => {
      const existing = departmentMap.get(asset.department) || { count: 0, value: 0 };
      departmentMap.set(asset.department, {
        count: existing.count + 1,
        value: existing.value + asset.currentValue
      });
    });
    const departmentDistribution = Array.from(departmentMap.entries()).map(([name, data]) => ({
      name, ...data
    }));

    // Company distribution
    const companyMap = new Map<string, { count: number; value: number }>();
    filteredAssets.forEach(asset => {
      const existing = companyMap.get(asset.company) || { count: 0, value: 0 };
      companyMap.set(asset.company, {
        count: existing.count + 1,
        value: existing.value + asset.currentValue
      });
    });
    const companyDistribution = Array.from(companyMap.entries()).map(([name, data]) => ({
      name, ...data
    }));

    // Depreciation trends (last 5 years)
    const depreciationTrends = [];
    for (let i = 4; i >= 0; i--) {
      const year = targetFY - i;
      const companiesActDep = filteredAssets.reduce((sum, asset) => {
        const tempAsset = { ...asset, depreciationMethod: 'SLM' as const };
        return sum + this.calculateDepreciationForFY(tempAsset, year);
      }, 0);
      
      const itActDep = filteredAssets.reduce((sum, asset) => {
        const tempAsset = { ...asset, depreciationMethod: 'WDV_FIXED_SLAB' as const };
        return sum + this.calculateDepreciationForFY(tempAsset, year);
      }, 0);
      
      depreciationTrends.push({
        year,
        companiesAct: Math.round(companiesActDep),
        itAct: Math.round(itActDep)
      });
    }

    // Acquisition trends
    const acquisitionTrends = [];
    for (let i = 4; i >= 0; i--) {
      const year = targetFY - i;
      const fyRange = this.getFinancialYearRange(year);
      const assetsInYear = filteredAssets.filter(asset => {
        const purchaseDate = new Date(asset.purchaseDate);
        return purchaseDate >= fyRange.start && purchaseDate <= fyRange.end;
      });
      
      acquisitionTrends.push({
        year,
        count: assetsInYear.length,
        value: Math.round(assetsInYear.reduce((sum, asset) => sum + asset.purchasePrice, 0))
      });
    }

    // Disposal trends
    const disposalTrends = [];
    for (let i = 4; i >= 0; i--) {
      const year = targetFY - i;
      const fyRange = this.getFinancialYearRange(year);
      const disposedInYear = filteredAssets.filter(asset => {
        if (!asset.soldDate) return false;
        const soldDate = new Date(asset.soldDate);
        return soldDate >= fyRange.start && soldDate <= fyRange.end;
      });
      
      disposalTrends.push({
        year,
        count: disposedInYear.length,
        value: Math.round(disposedInYear.reduce((sum, asset) => sum + asset.currentValue, 0))
      });
    }

    // Verification status
    const verificationStatus = [
      { 
        status: 'Verified This FY', 
        count: filteredAssets.filter(asset => 
          asset.verificationDate && 
          this.getFinancialYear(new Date(asset.verificationDate)) >= targetFY
        ).length 
      },
      { 
        status: 'Verified Previous FY', 
        count: filteredAssets.filter(asset => 
          asset.verificationDate && 
          this.getFinancialYear(new Date(asset.verificationDate)) === targetFY - 1
        ).length 
      },
      { 
        status: 'Never Verified', 
        count: filteredAssets.filter(asset => !asset.verificationDate).length 
      }
    ];

    // Service status
    const today = new Date();
    const serviceStatus = [
      {
        type: 'Insurance',
        active: filteredAssets.filter(asset => 
          asset.insuranceEndDate && new Date(asset.insuranceEndDate) > today
        ).length,
        expiring: expiringServices.insurance,
        expired: filteredAssets.filter(asset => 
          asset.insuranceEndDate && new Date(asset.insuranceEndDate) <= today
        ).length
      },
      {
        type: 'AMC',
        active: filteredAssets.filter(asset => 
          asset.amcEndDate && new Date(asset.amcEndDate) > today
        ).length,
        expiring: expiringServices.amc,
        expired: filteredAssets.filter(asset => 
          asset.amcEndDate && new Date(asset.amcEndDate) <= today
        ).length
      },
      {
        type: 'Warranty',
        active: filteredAssets.filter(asset => 
          asset.warrantyEndDate && new Date(asset.warrantyEndDate) > today
        ).length,
        expiring: expiringServices.warranty,
        expired: filteredAssets.filter(asset => 
          asset.warrantyEndDate && new Date(asset.warrantyEndDate) <= today
        ).length
      }
    ];

    return {
      totalAssets,
      activeAssets,
      disposedAssets,
      totalDepreciationThisFY,
      totalBookValue,
      unverifiedAssets,
      expiringServices,
      assetClassDistribution,
      departmentDistribution,
      companyDistribution,
      depreciationTrends,
      acquisitionTrends,
      disposalTrends,
      verificationStatus,
      serviceStatus
    };
  }

  compareData(assets: Asset[], comparison: {
    type: 'companies' | 'departments' | 'periods' | 'methods';
    items: string[];
    metrics: string[];
  }): any {
    // Implementation for comparison data
    const results: any = {};
    
    comparison.items.forEach(item => {
      let filteredAssets: Asset[] = [];
      
      switch (comparison.type) {
        case 'companies':
          filteredAssets = assets.filter(a => a.company === item);
          break;
        case 'departments':
          filteredAssets = assets.filter(a => a.department === item);
          break;
        // Add more comparison types as needed
      }
      
      results[item] = {
        totalAssets: filteredAssets.length,
        totalValue: filteredAssets.reduce((sum, a) => sum + a.currentValue, 0),
        averageAge: this.calculateAverageAge(filteredAssets),
        // Add more metrics as needed
      };
    });
    
    return results;
  }

  private calculateAverageAge(assets: Asset[]): number {
    if (assets.length === 0) return 0;
    
    const today = new Date();
    const totalAge = assets.reduce((sum, asset) => {
      const purchaseDate = new Date(asset.purchaseDate);
      const ageInYears = (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return sum + ageInYears;
    }, 0);
    
    return Math.round((totalAge / assets.length) * 100) / 100;
  }
}

export const reportsService = new ReportsService();
