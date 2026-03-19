
import React from 'react';
import { Asset } from '@/types/asset';
import { FIXED_DEPRECIATION_RATES } from '@/lib/depreciation/constants';

export class EnhancedDepreciationCalculator {
  private formatUsefulLife(years: number): string {
    return years.toFixed(Math.min(4, years.toString().split('.')[1]?.length || 0));
  }

  calculateSLMDateToDate(asset: Asset, yearsElapsed: number) {
    const depreciableAmount = Math.max(asset.purchasePrice - asset.residualValue, 0);
    const usefulLife = asset.usefulLife || 5;
    const annualDepreciation = depreciableAmount / usefulLife;
    const totalDepreciation = Math.min(annualDepreciation * yearsElapsed, depreciableAmount);
    const bookValue = Math.max(asset.purchasePrice - totalDepreciation, asset.residualValue);
    
    return {
      method: 'Straight Line Method (SLM)',
      depreciableAmount,
      annualDepreciation,
      totalDepreciation,
      bookValue,
      calculations: [
        {
          step: 1,
          title: 'Calculate Depreciable Amount',
          formula: 'Depreciable Amount = Purchase Price - Residual Value',
          calculation: `₹${asset.purchasePrice.toLocaleString()} - ₹${asset.residualValue.toLocaleString()}`,
          result: `₹${depreciableAmount.toLocaleString()}`,
          description: 'This is the total amount that can be depreciated over the asset\'s useful life.'
        },
        {
          step: 2,
          title: 'Calculate Annual Depreciation',
          formula: 'Annual Depreciation = Depreciable Amount ÷ Useful Life',
          calculation: `₹${depreciableAmount.toLocaleString()} ÷ ${this.formatUsefulLife(usefulLife)} years`,
          result: `₹${Math.round(annualDepreciation).toLocaleString()}`,
          description: 'The fixed amount depreciated each year under the straight-line method.'
        },
        {
          step: 3,
          title: 'Calculate Total Depreciation',
          formula: 'Total Depreciation = Annual Depreciation × Years Elapsed',
          calculation: `₹${Math.round(annualDepreciation).toLocaleString()} × ${yearsElapsed.toFixed(6)} years`,
          result: `₹${Math.round(totalDepreciation).toLocaleString()}`,
          description: 'The accumulated depreciation from purchase date to calculation date.'
        },
        {
          step: 4,
          title: 'Calculate Current Book Value',
          formula: 'Book Value = Purchase Price - Total Depreciation',
          calculation: `₹${asset.purchasePrice.toLocaleString()} - ₹${Math.round(totalDepreciation).toLocaleString()}`,
          result: `₹${Math.round(bookValue).toLocaleString()}`,
          description: 'The current value of the asset after depreciation.'
        }
      ]
    };
  }

  calculateWDVDateToDate(asset: Asset, yearsElapsed: number) {
    const rate = this.calculateWDVRate(asset.purchasePrice, asset.residualValue, asset.usefulLife || 5);
    let bookValue = asset.purchasePrice;
    const calculationSteps = [
      {
        step: 1,
        title: 'Calculate WDV Rate',
        formula: 'Rate = [1 - (Residual Value ÷ Cost)^(1/Useful Life)] × 100',
        calculation: `[1 - (₹${asset.residualValue.toLocaleString()} ÷ ₹${asset.purchasePrice.toLocaleString()})^(1/${this.formatUsefulLife(asset.usefulLife || 5)})] × 100`,
        result: `${rate.toFixed(6)}%`,
        description: 'The annual depreciation rate for the Written Down Value method.'
      }
    ];
    
    const years = Math.floor(yearsElapsed);
    let stepNumber = 2;
    
    // Calculate depreciation for complete years with precise calculations
    for (let year = 1; year <= years; year++) {
      const yearlyDepreciation = bookValue * (rate / 100);
      const newBookValue = Math.max(bookValue - yearlyDepreciation, asset.residualValue);
      calculationSteps.push({
        step: stepNumber++,
        title: `Year ${year} Depreciation`,
        formula: 'Depreciation = Opening Book Value × Rate',
        calculation: `₹${bookValue.toFixed(2)} × ${rate.toFixed(6)}%`,
        result: `₹${yearlyDepreciation.toFixed(2)}`,
        description: `Depreciation for year ${year}.`
      });
      calculationSteps.push({
        step: stepNumber++,
        title: `Year ${year} Closing Value`,
        formula: 'Closing Value = Opening Value - Depreciation',
        calculation: `₹${bookValue.toFixed(2)} - ₹${yearlyDepreciation.toFixed(2)}`,
        result: `₹${newBookValue.toFixed(2)}`,
        description: `Book value at the end of year ${year}.`
      });
      bookValue = newBookValue;
      if (bookValue <= asset.residualValue) break;
    }
    
    // Handle partial year with precise calculations
    if (yearsElapsed > years && bookValue > asset.residualValue) {
      const partialYear = yearsElapsed - years;
      const partialDepreciation = bookValue * (rate / 100) * partialYear;
      const finalBookValue = Math.max(bookValue - partialDepreciation, asset.residualValue);
      calculationSteps.push({
        step: stepNumber++,
        title: `Partial Year (${partialYear.toFixed(6)}) Depreciation`,
        formula: 'Depreciation = Book Value × Rate × Partial Year',
        calculation: `₹${bookValue.toFixed(2)} × ${rate.toFixed(6)}% × ${partialYear.toFixed(6)}`,
        result: `₹${partialDepreciation.toFixed(2)}`,
        description: 'Depreciation for the partial year period.'
      });
      bookValue = finalBookValue;
    }
    
    const totalDepreciation = asset.purchasePrice - bookValue;
    
    return {
      method: 'Written Down Value (WDV)',
      rate,
      totalDepreciation,
      bookValue,
      calculations: calculationSteps
    };
  }

  calculateWDVFixedSlabDateToDate(asset: Asset, calculationDate: Date) {
    const purchaseDate = new Date(asset.purchaseDate);
    const rate = FIXED_DEPRECIATION_RATES[asset.category] || 20;
    
    const getFinancialYear = (date: Date): number => {
      const year = date.getFullYear();
      const month = date.getMonth();
      return month >= 3 ? year : year - 1;
    };
    
    const purchaseFinancialYear = getFinancialYear(purchaseDate);
    const currentFinancialYear = getFinancialYear(calculationDate);
    
    let financialYears;
    const isSold = asset.status === 'sold' && asset.soldDate;
    if (isSold) {
      const saleDate = new Date(asset.soldDate!);
      const saleFinancialYear = getFinancialYear(saleDate);
      financialYears = Math.max(0, saleFinancialYear - purchaseFinancialYear);
    } else {
      financialYears = Math.max(1, currentFinancialYear - purchaseFinancialYear + 1);
    }
    
    let bookValue = asset.purchasePrice;
    const calculationSteps = [
      {
        step: 1,
        title: 'Fixed Rate Information',
        formula: `Fixed WDV Rate for ${asset.category}`,
        calculation: `As per Income Tax Act`,
        result: `${rate}%`,
        description: 'The prescribed depreciation rate for this asset category.'
      }
    ];
    
    let stepNumber = 2;
    for (let year = 1; year <= financialYears; year++) {
      const yearlyDepreciation = bookValue * (rate / 100);
      const newBookValue = Math.max(bookValue - yearlyDepreciation, 0);
      const financialYearLabel = `FY ${(purchaseFinancialYear + year - 1)}-${(purchaseFinancialYear + year).toString().slice(-2)}`;
      calculationSteps.push({
        step: stepNumber++,
        title: `${financialYearLabel} Depreciation`,
        formula: 'Depreciation = Opening Value × Rate',
        calculation: `₹${bookValue.toFixed(2)} × ${rate}%`,
        result: `₹${yearlyDepreciation.toFixed(2)}`,
        description: `Depreciation for ${financialYearLabel}.`
      });
      bookValue = newBookValue;
      if (bookValue <= 0) break;
    }
    
    const totalDepreciation = asset.purchasePrice - bookValue;
    
    return {
      method: 'WDV Fixed Slab (Company Act) - Financial Year Based',
      rate,
      financialYears,
      totalDepreciation,
      bookValue,
      calculations: calculationSteps
    };
  }

  calculateUnitsDateToDate(asset: Asset) {
    const totalCapacity = asset.productionCapacity || 1000;
    const unitsProduced = asset.unitsProduced || 0;
    const ratePerUnit = (asset.purchasePrice - asset.residualValue) / totalCapacity;
    const totalDepreciation = ratePerUnit * Math.min(unitsProduced, totalCapacity);
    const bookValue = Math.max(asset.purchasePrice - totalDepreciation, asset.residualValue);
    
    return {
      method: 'Production Unit Method',
      ratePerUnit,
      totalDepreciation,
      bookValue,
      calculations: [
        {
          step: 1,
          title: 'Calculate Rate per Unit',
          formula: 'Rate per Unit = (Purchase Price - Residual Value) ÷ Total Capacity',
          calculation: `(₹${asset.purchasePrice.toLocaleString()} - ₹${asset.residualValue.toLocaleString()}) ÷ ${totalCapacity}`,
          result: `₹${ratePerUnit.toFixed(4)}`,
          description: 'The depreciation cost per unit of production.'
        },
        {
          step: 2,
          title: 'Calculate Total Depreciation',
          formula: 'Total Depreciation = Rate per Unit × Units Produced',
          calculation: `₹${ratePerUnit.toFixed(4)} × ${unitsProduced}`,
          result: `₹${totalDepreciation.toFixed(2)}`,
          description: 'Total depreciation based on actual production.'
        },
        {
          step: 3,
          title: 'Calculate Book Value',
          formula: 'Book Value = Purchase Price - Total Depreciation',
          calculation: `₹${asset.purchasePrice.toLocaleString()} - ₹${totalDepreciation.toFixed(2)}`,
          result: `₹${bookValue.toFixed(2)}`,
          description: 'Current value based on production usage.'
        }
      ]
    };
  }

  calculateDoubleDecliningDateToDate(asset: Asset, yearsElapsed: number) {
    const usefulLife = asset.usefulLife || 5;
    const rate = (2 / usefulLife) * 100;
    let bookValue = asset.purchasePrice;
    const calculationSteps = [
      {
        step: 1,
        title: 'Calculate Double Declining Rate',
        formula: 'Rate = (2 ÷ Useful Life) × 100',
        calculation: `(2 ÷ ${this.formatUsefulLife(usefulLife)}) × 100`,
        result: `${rate.toFixed(6)}%`,
        description: 'The accelerated depreciation rate (double the straight-line rate).'
      }
    ];
    
    const years = Math.floor(yearsElapsed);
    let stepNumber = 2;
    
    for (let year = 1; year <= years; year++) {
      const yearlyDepreciation = bookValue * (rate / 100);
      const potentialNewValue = bookValue - yearlyDepreciation;
      
      if (potentialNewValue < asset.residualValue) {
        const adjustedDepreciation = bookValue - asset.residualValue;
        calculationSteps.push({
          step: stepNumber++,
          title: `Year ${year} Depreciation (Limited)`,
          formula: 'Depreciation = Opening Value - Residual Value',
          calculation: `₹${bookValue.toFixed(2)} - ₹${asset.residualValue.toLocaleString()}`,
          result: `₹${adjustedDepreciation.toFixed(2)}`,
          description: 'Depreciation limited to prevent going below residual value.'
        });
        bookValue = asset.residualValue;
        break;
      }
      
      calculationSteps.push({
        step: stepNumber++,
        title: `Year ${year} Depreciation`,
        formula: 'Depreciation = Opening Value × Rate',
        calculation: `₹${bookValue.toFixed(2)} × ${rate.toFixed(6)}%`,
        result: `₹${yearlyDepreciation.toFixed(2)}`,
        description: `Accelerated depreciation for year ${year}.`
      });
      bookValue = potentialNewValue;
    }
    
    // Handle partial year
    if (yearsElapsed > years && bookValue > asset.residualValue) {
      const partialYear = yearsElapsed - years;
      const partialDepreciation = bookValue * (rate / 100) * partialYear;
      const finalBookValue = Math.max(bookValue - partialDepreciation, asset.residualValue);
      calculationSteps.push({
        step: stepNumber++,
        title: `Partial Year (${partialYear.toFixed(6)}) Depreciation`,
        formula: 'Depreciation = Book Value × Rate × Partial Year',
        calculation: `₹${bookValue.toFixed(2)} × ${rate.toFixed(6)}% × ${partialYear.toFixed(6)}`,
        result: `₹${partialDepreciation.toFixed(2)}`,
        description: 'Depreciation for the partial year period.'
      });
      bookValue = finalBookValue;
    }
    
    const totalDepreciation = asset.purchasePrice - bookValue;
    
    return {
      method: 'Double Declining Balance',
      rate,
      totalDepreciation,
      bookValue,
      calculations: calculationSteps
    };
  }

  calculateSumOfYearsDateToDate(asset: Asset, yearsElapsed: number) {
    const usefulLife = asset.usefulLife || 5;
    const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
    const depreciableBase = asset.purchasePrice - asset.residualValue;
    
    const calculationSteps = [
      {
        step: 1,
        title: 'Calculate Sum of Years',
        formula: 'Sum = n(n+1)/2 where n = Useful Life',
        calculation: `${this.formatUsefulLife(usefulLife)}(${this.formatUsefulLife(usefulLife)}+1)/2`,
        result: `${sumOfYears}`,
        description: 'The sum of all years in the useful life period.'
      }
    ];
    
    let totalDepreciation = 0;
    const years = Math.min(Math.floor(yearsElapsed), usefulLife);
    let stepNumber = 2;
    
    for (let year = 1; year <= years; year++) {
      const remainingLife = usefulLife - year + 1;
      const yearlyDepreciation = (remainingLife / sumOfYears) * depreciableBase;
      totalDepreciation += yearlyDepreciation;
      calculationSteps.push({
        step: stepNumber++,
        title: `Year ${year} Depreciation`,
        formula: `Depreciation = (${remainingLife}/${sumOfYears}) × Depreciable Base`,
        calculation: `(${remainingLife}/${sumOfYears}) × ₹${depreciableBase.toLocaleString()}`,
        result: `₹${yearlyDepreciation.toFixed(2)}`,
        description: `Higher depreciation in earlier years, decreasing over time.`
      });
    }
    
    // Handle partial year
    if (yearsElapsed > years && years < usefulLife) {
      const partialYear = yearsElapsed - years;
      const nextYear = years + 1;
      const remainingLife = usefulLife - nextYear + 1;
      const nextYearDepreciation = (remainingLife / sumOfYears) * depreciableBase;
      const partialDepreciation = nextYearDepreciation * partialYear;
      totalDepreciation += partialDepreciation;
      
      calculationSteps.push({
        step: stepNumber++,
        title: `Partial Year ${nextYear} (${partialYear.toFixed(6)}) Depreciation`,
        formula: `Partial Depreciation = (${remainingLife}/${sumOfYears}) × Depreciable Base × Partial Year`,
        calculation: `(${remainingLife}/${sumOfYears}) × ₹${depreciableBase.toLocaleString()} × ${partialYear.toFixed(6)}`,
        result: `₹${partialDepreciation.toFixed(2)}`,
        description: 'Depreciation for the partial year period.'
      });
    }
    
    const bookValue = Math.max(asset.purchasePrice - totalDepreciation, asset.residualValue);
    
    return {
      method: 'Sum of Years Digits',
      sumOfYears,
      totalDepreciation,
      bookValue,
      calculations: calculationSteps
    };
  }

  private calculateWDVRate(cost: number, residualValue: number, usefulLife: number): number {
    if (residualValue <= 0 || cost <= 0 || usefulLife <= 0) {
      return 20;
    }
    
    const adjustedResidualValue = Math.min(residualValue, cost * 0.95);
    
    try {
      const rate = (1 - Math.pow(adjustedResidualValue / cost, 1 / usefulLife)) * 100;
      return Math.max(Math.min(rate, 100), 0);
    } catch (error) {
      console.error('Error calculating WDV rate:', error);
      return 20;
    }
  }
}

export const enhancedDepreciationCalculator = new EnhancedDepreciationCalculator();
