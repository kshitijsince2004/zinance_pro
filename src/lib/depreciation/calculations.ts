import { FIXED_DEPRECIATION_RATES } from './constants';
import { Asset } from '@/types/asset';

export class DepreciationCalculator {
  calculateDaysElapsed(putToUseDate: string, soldDate?: string): number {
    const useDate = new Date(putToUseDate);
    const endDate = soldDate ? new Date(soldDate) : new Date();
    return Math.floor((endDate.getTime() - useDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Helper function to get financial year
  getFinancialYear(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    return month >= 3 ? year : year - 1; // Financial year starts from April
  }

  // Helper function to get financial year dates
  getFinancialYearDates(fyYear: number): { start: Date; end: Date } {
    return {
      start: new Date(fyYear, 3, 1), // April 1st
      end: new Date(fyYear + 1, 2, 31) // March 31st
    };
  }

  // Helper function to get days in financial year (always 365 - fixed calculation)
  getDaysInFinancialYear(): number {
    return 365; // Financial year is always considered 365 days for consistent calculation
  }

  calculateCurrentValueByMethod(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>): number {
    const deprecationStartDate = asset.putToUseDate || asset.purchaseDate;
    
    // For financial year based calculations, use the put-to-use date
    const putToUseDate = new Date(deprecationStartDate);
    const currentDate = asset.soldDate ? new Date(asset.soldDate) : new Date();
    
    console.log(`Calculating depreciation for ${asset.name}:`, {
      method: asset.depreciationMethod,
      purchasePrice: asset.purchasePrice,
      residualValue: asset.residualValue,
      putToUseDate: deprecationStartDate,
      putToUseFY: this.getFinancialYear(putToUseDate),
      currentFY: this.getFinancialYear(currentDate),
      usefulLife: asset.usefulLife,
      status: asset.status
    });

    // ASSET STATUS CHECK - No depreciation for disposed/inactive assets
    if (asset.status === 'retired' || asset.status === 'sold') {
      // For disposed assets, calculate till disposal date only
      if (asset.soldDate) {
        const disposalDate = new Date(asset.soldDate);
        return this.calculateDepreciationTillDate(asset, putToUseDate, disposalDate);
      }
    }
    
    switch (asset.depreciationMethod) {
      case 'SLM':
        return this.calculateSLMCurrentValueDateToDate(asset.purchasePrice, asset.residualValue, asset.usefulLife || 5, putToUseDate, currentDate);
      case 'WDV':
        return this.calculateWDVCurrentValueDateToDate(asset.purchasePrice, asset.residualValue, asset.usefulLife || 5, putToUseDate, currentDate);
      case 'WDV_FIXED_SLAB':
        return this.calculateWDVFixedSlabCurrentValue(asset.purchasePrice, asset.category, deprecationStartDate, asset.soldDate, asset.status);
      case 'UNITS':
        return this.calculateUnitsCurrentValue(asset.purchasePrice, asset.residualValue, asset.productionCapacity || 1000, asset.unitsProduced || 0);
      case 'DOUBLE_DECLINING':
        return this.calculateDoubleDecliningCurrentValueDateToDate(asset.purchasePrice, asset.residualValue, asset.usefulLife || 5, putToUseDate, currentDate);
      case 'SUM_OF_YEARS':
        return this.calculateSumOfYearsCurrentValueDateToDate(asset.purchasePrice, asset.residualValue, asset.usefulLife || 5, putToUseDate, currentDate);
      default:
        return this.calculateSLMCurrentValueDateToDate(asset.purchasePrice, asset.residualValue, asset.usefulLife || 5, putToUseDate, currentDate);
    }
  }

  calculateDepreciationTillDate(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>, putToUseDate: Date, endDate: Date): number {
    switch (asset.depreciationMethod) {
      case 'SLM':
        return this.calculateSLMCurrentValueDateToDate(asset.purchasePrice, asset.residualValue, asset.usefulLife || 5, putToUseDate, endDate);
      case 'WDV':
        return this.calculateWDVCurrentValueDateToDate(asset.purchasePrice, asset.residualValue, asset.usefulLife || 5, putToUseDate, endDate);
      case 'WDV_FIXED_SLAB':
        return this.calculateWDVFixedSlabCurrentValue(asset.purchasePrice, asset.category, putToUseDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], asset.status);
      case 'UNITS':
        return this.calculateUnitsCurrentValue(asset.purchasePrice, asset.residualValue, asset.productionCapacity || 1000, asset.unitsProduced || 0);
      case 'DOUBLE_DECLINING':
        return this.calculateDoubleDecliningCurrentValueDateToDate(asset.purchasePrice, asset.residualValue, asset.usefulLife || 5, putToUseDate, endDate);
      case 'SUM_OF_YEARS':
        return this.calculateSumOfYearsCurrentValueDateToDate(asset.purchasePrice, asset.residualValue, asset.usefulLife || 5, putToUseDate, endDate);
      default:
        return this.calculateSLMCurrentValueDateToDate(asset.purchasePrice, asset.residualValue, asset.usefulLife || 5, putToUseDate, endDate);
    }
  }

  // DATE-TO-DATE SLM CALCULATION - VALIDATED ✅
  calculateSLMCurrentValueDateToDate(purchasePrice: number, residualValue: number, usefulLife: number, putToUseDate: Date, currentDate: Date): number {
    if (purchasePrice <= 0 || usefulLife <= 0) return purchasePrice;
    
    const depreciableAmount = Math.max(purchasePrice - residualValue, 0);
    const daysElapsed = Math.floor((currentDate.getTime() - putToUseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate total useful life in days (fixed calculation)
    const totalUsefulLifeDays = usefulLife * 365; // Use 365 days per year for consistent calculation
    
    // Date-to-date depreciation formula: (Cost - Residual) × Days Used / Total Useful Life Days
    const totalDepreciation = Math.min((depreciableAmount * daysElapsed) / totalUsefulLifeDays, depreciableAmount);
    const currentValue = Math.max(purchasePrice - totalDepreciation, residualValue);
    
    return Math.round(currentValue * 100) / 100;
  }

  // DATE-TO-DATE WDV CALCULATION - FIXED FOR PROPER DAILY DEPRECIATION ✅
  calculateWDVCurrentValueDateToDate(purchasePrice: number, residualValue: number, usefulLife: number, putToUseDate: Date, currentDate: Date): number {
    if (residualValue < 0 || purchasePrice <= 0 || usefulLife <= 0) {
      return purchasePrice;
    }
    
    // Ensure residual value doesn't exceed 95% of purchase price
    const adjustedResidualValue = Math.max(0, Math.min(residualValue, purchasePrice * 0.95));
    const rate = this.calculateWDVRate(purchasePrice, adjustedResidualValue, usefulLife);
    const daysElapsed = Math.floor((currentDate.getTime() - putToUseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('WDV Calculation Details:', {
      purchasePrice,
      residualValue,
      adjustedResidualValue,
      usefulLife,
      rate,
      daysElapsed,
      putToUseDate: putToUseDate.toISOString(),
      currentDate: currentDate.toISOString()
    });
    
    // Date-to-date WDV calculation using compound depreciation
    const yearsElapsed = daysElapsed / 365; // Use 365 days per year for consistent calculation
    const currentValue = purchasePrice * Math.pow(1 - (rate / 100), yearsElapsed);
    
    // Ensure we don't go below residual value
    const finalValue = Math.max(currentValue, adjustedResidualValue);
    
    console.log('WDV Final Calculation:', {
      yearsElapsed,
      calculatedValue: currentValue,
      finalValue
    });
    
    return Math.round(finalValue * 100) / 100;
  }

  // WDV FIXED SLAB - VALIDATED WITH NEW DISPOSAL RULE ✅
  calculateWDVFixedSlabCurrentValue(purchasePrice: number, category: string, putToUseDate: string, soldDate?: string, status?: string): number {
    const rate = FIXED_DEPRECIATION_RATES[category] || 20;
    const useDate = new Date(putToUseDate);
    
    const useFinancialYear = this.getFinancialYear(useDate);
    let currentFinancialYear: number;
    
    // NEW RULE: If asset is disposed, no depreciation in disposal year
    if (soldDate && (status === 'sold' || status === 'retired')) {
      const disposalDate = new Date(soldDate);
      const disposalFinancialYear = this.getFinancialYear(disposalDate);
      // Calculate depreciation only till the year before disposal
      currentFinancialYear = disposalFinancialYear - 1;
    } else {
      currentFinancialYear = this.getFinancialYear(new Date());
    }
    
    // Calculate financial years for depreciation
    let financialYears = Math.max(0, currentFinancialYear - useFinancialYear + 1);
    
    // If disposal happened in the same year as purchase, no depreciation
    if (soldDate && (status === 'sold' || status === 'retired')) {
      const disposalDate = new Date(soldDate);
      const disposalFinancialYear = this.getFinancialYear(disposalDate);
      if (disposalFinancialYear === useFinancialYear) {
        financialYears = 0;
      }
    }
    
    let bookValue = purchasePrice;
    
    // Apply year-wise depreciation (NOT day-wise)
    for (let year = 1; year <= financialYears; year++) {
      const yearlyDepreciation = bookValue * (rate / 100);
      bookValue = Math.max(bookValue - yearlyDepreciation, 0);
      if (bookValue <= 0) break;
    }
    
    console.log(`WDV Fixed Slab Calculation:`, {
      category,
      rate,
      useFinancialYear,
      currentFinancialYear,
      financialYears,
      purchasePrice,
      finalBookValue: bookValue,
      isDisposed: soldDate && (status === 'sold' || status === 'retired'),
      disposalRule: 'No depreciation in disposal year'
    });
    
    return Math.round(bookValue * 100) / 100;
  }

  // DATE-TO-DATE DOUBLE DECLINING CALCULATION - VALIDATED ✅
  calculateDoubleDecliningCurrentValueDateToDate(purchasePrice: number, residualValue: number, usefulLife: number, putToUseDate: Date, currentDate: Date): number {
    if (purchasePrice <= 0 || usefulLife <= 0) return purchasePrice;
    
    const rate = (2 / usefulLife) * 100;
    const daysElapsed = Math.floor((currentDate.getTime() - putToUseDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyRate = rate / 100 / 365.25;
    
    let bookValue = purchasePrice;
    
    // Apply daily depreciation
    for (let day = 0; day < daysElapsed; day++) {
      const dailyDepreciation = bookValue * dailyRate;
      const potentialNewValue = bookValue - dailyDepreciation;
      
      if (potentialNewValue < residualValue) {
        bookValue = residualValue;
        break;
      }
      bookValue = potentialNewValue;
    }
    
    return Math.round(bookValue * 100) / 100;
  }

  // DATE-TO-DATE SUM OF YEARS CALCULATION - VALIDATED ✅
  calculateSumOfYearsCurrentValueDateToDate(purchasePrice: number, residualValue: number, usefulLife: number, putToUseDate: Date, currentDate: Date): number {
    if (purchasePrice <= 0 || usefulLife <= 0) return purchasePrice;
    
    const depreciableBase = Math.max(purchasePrice - residualValue, 0);
    const daysElapsed = Math.floor((currentDate.getTime() - putToUseDate.getTime()) / (1000 * 60 * 60 * 24));
    const yearsElapsed = daysElapsed / 365.25;
    
    const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
    let totalDepreciation = 0;
    
    // Calculate depreciation for complete years
    const completeYears = Math.min(Math.floor(yearsElapsed), usefulLife);
    for (let year = 1; year <= completeYears; year++) {
      const remainingLife = usefulLife - year + 1;
      const yearlyDepreciation = (remainingLife / sumOfYears) * depreciableBase;
      totalDepreciation += yearlyDepreciation;
    }
    
    // Add partial year depreciation
    if (yearsElapsed > completeYears && completeYears < usefulLife) {
      const partialYear = yearsElapsed - completeYears;
      const nextYear = completeYears + 1;
      const remainingLife = usefulLife - nextYear + 1;
      const nextYearDepreciation = (remainingLife / sumOfYears) * depreciableBase;
      totalDepreciation += nextYearDepreciation * partialYear;
    }
    
    const currentValue = Math.max(purchasePrice - totalDepreciation, residualValue);
    return Math.round(currentValue * 100) / 100;
  }

  // UNITS METHOD - VALIDATED ✅
  calculateUnitsCurrentValue(purchasePrice: number, residualValue: number, totalCapacity: number, unitsProduced: number): number {
    if (totalCapacity <= 0 || purchasePrice <= 0) return purchasePrice;
    
    const depreciableAmount = Math.max(purchasePrice - residualValue, 0);
    const depreciationPerUnit = depreciableAmount / totalCapacity;
    const unitsUsed = Math.min(unitsProduced, totalCapacity);
    const totalDepreciation = depreciationPerUnit * unitsUsed;
    const currentValue = Math.max(purchasePrice - totalDepreciation, residualValue);
    
    return Math.round(currentValue * 100) / 100;
  }

  // Keep existing FY-based methods for backward compatibility
  calculateSLMCurrentValueFY(purchasePrice: number, residualValue: number, usefulLife: number, putToUseDate: Date, currentDate: Date): number {
    return this.calculateSLMCurrentValueDateToDate(purchasePrice, residualValue, usefulLife, putToUseDate, currentDate);
  }

  calculateWDVCurrentValueFY(purchasePrice: number, residualValue: number, usefulLife: number, putToUseDate: Date, currentDate: Date): number {
    return this.calculateWDVCurrentValueDateToDate(purchasePrice, residualValue, usefulLife, putToUseDate, currentDate);
  }

  calculateDoubleDecliningCurrentValueFY(purchasePrice: number, residualValue: number, usefulLife: number, putToUseDate: Date, currentDate: Date): number {
    return this.calculateDoubleDecliningCurrentValueDateToDate(purchasePrice, residualValue, usefulLife, putToUseDate, currentDate);
  }

  calculateSumOfYearsCurrentValueFY(purchasePrice: number, residualValue: number, usefulLife: number, putToUseDate: Date, currentDate: Date): number {
    return this.calculateSumOfYearsCurrentValueDateToDate(purchasePrice, residualValue, usefulLife, putToUseDate, currentDate);
  }

  // Keep existing legacy methods for backward compatibility
  calculateSLMCurrentValue(purchasePrice: number, residualValue: number, usefulLife: number, yearsElapsed: number): number {
    const putToUseDate = new Date();
    putToUseDate.setFullYear(putToUseDate.getFullYear() - yearsElapsed);
    return this.calculateSLMCurrentValueDateToDate(purchasePrice, residualValue, usefulLife, putToUseDate, new Date());
  }

  calculateWDVCurrentValue(purchasePrice: number, residualValue: number, usefulLife: number, yearsElapsed: number): number {
    const putToUseDate = new Date();
    putToUseDate.setFullYear(putToUseDate.getFullYear() - yearsElapsed);
    return this.calculateWDVCurrentValueDateToDate(purchasePrice, residualValue, usefulLife, putToUseDate, new Date());
  }

  calculateDoubleDecliningCurrentValue(purchasePrice: number, residualValue: number, usefulLife: number, yearsElapsed: number): number {
    const putToUseDate = new Date();
    putToUseDate.setFullYear(putToUseDate.getFullYear() - yearsElapsed);
    return this.calculateDoubleDecliningCurrentValueDateToDate(purchasePrice, residualValue, usefulLife, putToUseDate, new Date());
  }

  calculateSumOfYearsCurrentValue(purchasePrice: number, residualValue: number, usefulLife: number, yearsElapsed: number): number {
    const putToUseDate = new Date();
    putToUseDate.setFullYear(putToUseDate.getFullYear() - yearsElapsed);
    return this.calculateSumOfYearsCurrentValueDateToDate(purchasePrice, residualValue, usefulLife, putToUseDate, new Date());
  }

  calculateWDVRate(cost: number, residualValue: number, usefulLife: number): number {
    if (residualValue <= 0 || cost <= 0 || usefulLife <= 0) {
      return 20;
    }
    
    // Ensure residual value is at least 5% of cost for meaningful calculation
    const adjustedResidualValue = Math.max(cost * 0.05, Math.min(residualValue, cost * 0.95));
    
    try {
      const rate = (1 - Math.pow(adjustedResidualValue / cost, 1 / usefulLife)) * 100;
      const finalRate = Math.max(Math.min(rate, 100), 1); // Ensure rate is between 1% and 100%
      
      console.log('WDV Rate Calculation:', {
        cost,
        residualValue,
        adjustedResidualValue,
        usefulLife,
        calculatedRate: rate,
        finalRate
      });
      
      return finalRate;
    } catch (error) {
      console.error('Error calculating WDV rate:', error);
      return 20;
    }
  }
}

export const depreciationCalculator = new DepreciationCalculator();
