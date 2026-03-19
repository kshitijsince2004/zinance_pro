
import { Asset } from '@/types/asset';
import { assetService } from '@/lib/assets';

export interface CalculationStep {
  step: number;
  title: string;
  description: string;
  formula: string;
  calculation: string;
  result: string;
  breakdown?: Record<string, string>;
}

export interface DetailedCalculationResult {
  method: string;
  finalValue: number;
  totalDepreciation: number;
  steps: CalculationStep[];
}

export const calculateDetailedSteps = (
  asset: Asset,
  exactYearsElapsed: number
): DetailedCalculationResult => {
  switch (asset.depreciationMethod) {
    case 'SLM':
      return calculateSLMSteps(asset, exactYearsElapsed);
    case 'WDV':
      return calculateWDVSteps(asset, exactYearsElapsed);
    case 'WDV_FIXED_SLAB':
      return calculateWDVFixedSlabSteps(asset, exactYearsElapsed);
    case 'UNITS':
      return calculateUnitsSteps(asset, exactYearsElapsed);
    case 'DOUBLE_DECLINING':
      return calculateDoubleDecliningSteps(asset, exactYearsElapsed);
    case 'SUM_OF_YEARS':
      return calculateSumOfYearsSteps(asset, exactYearsElapsed);
    default:
      return calculateSLMSteps(asset, exactYearsElapsed);
  }
};

const calculateSLMSteps = (asset: Asset, exactYearsElapsed: number): DetailedCalculationResult => {
  const depreciableAmount = asset.purchasePrice - asset.residualValue;
  const annualDepreciation = depreciableAmount / (asset.usefulLife || 5);
  const totalDepreciation = Math.min(annualDepreciation * exactYearsElapsed, depreciableAmount);
  const currentValue = Math.max(asset.purchasePrice - totalDepreciation, asset.residualValue);

  return {
    method: 'Straight Line Method (SLM)',
    finalValue: currentValue,
    totalDepreciation,
    steps: [
      {
        step: 1,
        title: 'Calculate Depreciable Amount',
        description: 'Subtract residual value from purchase price',
        formula: 'Depreciable Amount = Purchase Price - Residual Value',
        calculation: `₹${asset.purchasePrice.toLocaleString()} - ₹${asset.residualValue.toLocaleString()}`,
        result: `₹${depreciableAmount.toLocaleString()}`,
        breakdown: {
          'Purchase Price': `₹${asset.purchasePrice.toLocaleString()}`,
          'Residual Value': `₹${asset.residualValue.toLocaleString()}`,
          'Depreciable Amount': `₹${depreciableAmount.toLocaleString()}`
        }
      },
      {
        step: 2,
        title: 'Calculate Annual Depreciation',
        description: 'Divide depreciable amount by useful life',
        formula: 'Annual Depreciation = Depreciable Amount ÷ Useful Life',
        calculation: `₹${depreciableAmount.toLocaleString()} ÷ ${asset.usefulLife} years`,
        result: `₹${annualDepreciation.toLocaleString()}`,
        breakdown: {
          'Depreciable Amount': `₹${depreciableAmount.toLocaleString()}`,
          'Useful Life': `${asset.usefulLife} years`,
          'Annual Depreciation': `₹${annualDepreciation.toLocaleString()}`
        }
      },
      {
        step: 3,
        title: 'Calculate Total Depreciation',
        description: 'Multiply annual depreciation by years elapsed',
        formula: 'Total Depreciation = Annual Depreciation × Years Elapsed',
        calculation: `₹${annualDepreciation.toLocaleString()} × ${exactYearsElapsed.toFixed(4)} years`,
        result: `₹${totalDepreciation.toLocaleString()}`,
        breakdown: {
          'Annual Depreciation': `₹${annualDepreciation.toLocaleString()}`,
          'Years Elapsed': `${exactYearsElapsed.toFixed(4)} years`,
          'Total Depreciation': `₹${totalDepreciation.toLocaleString()}`
        }
      },
      {
        step: 4,
        title: 'Calculate Current Book Value',
        description: 'Subtract total depreciation from purchase price',
        formula: 'Book Value = Purchase Price - Total Depreciation',
        calculation: `₹${asset.purchasePrice.toLocaleString()} - ₹${totalDepreciation.toLocaleString()}`,
        result: `₹${currentValue.toLocaleString()}`,
        breakdown: {
          'Purchase Price': `₹${asset.purchasePrice.toLocaleString()}`,
          'Total Depreciation': `₹${totalDepreciation.toLocaleString()}`,
          'Current Book Value': `₹${currentValue.toLocaleString()}`
        }
      }
    ]
  };
};

const calculateWDVSteps = (asset: Asset, exactYearsElapsed: number): DetailedCalculationResult => {
  const rate = assetService.calculateWDVRate(asset.purchasePrice, asset.residualValue, asset.usefulLife || 5);
  let bookValue = asset.purchasePrice;
  const steps = [];

  steps.push({
    step: 1,
    title: 'Calculate WDV Rate',
    description: 'Determine depreciation rate using compound formula',
    formula: 'Rate = [1 - (Residual Value / Cost)^(1/Useful Life)] × 100',
    calculation: `[1 - (₹${asset.residualValue.toLocaleString()} / ₹${asset.purchasePrice.toLocaleString()})^(1/${asset.usefulLife})] × 100`,
    result: `${rate.toFixed(2)}%`,
    breakdown: {
      'Cost': `₹${asset.purchasePrice.toLocaleString()}`,
      'Residual Value': `₹${asset.residualValue.toLocaleString()}`,
      'Useful Life': `${asset.usefulLife} years`,
      'Calculated Rate': `${rate.toFixed(2)}%`
    }
  });

  const wholeYears = Math.floor(exactYearsElapsed);
  let cumulativeDepreciation = 0;

  for (let year = 1; year <= wholeYears; year++) {
    const yearlyDepreciation = bookValue * (rate / 100);
    bookValue = Math.max(bookValue - yearlyDepreciation, asset.residualValue);
    cumulativeDepreciation += yearlyDepreciation;
  }

  if (exactYearsElapsed > wholeYears && bookValue > asset.residualValue) {
    const partialYear = exactYearsElapsed - wholeYears;
    const partialDepreciation = bookValue * (rate / 100) * partialYear;
    bookValue = Math.max(bookValue - partialDepreciation, asset.residualValue);
    cumulativeDepreciation += partialDepreciation;
  }

  steps.push({
    step: 2,
    title: 'Apply Year-by-Year Depreciation',
    description: `Calculate depreciation for ${exactYearsElapsed.toFixed(4)} years`,
    formula: 'Each Year: Depreciation = Opening Balance × Rate%',
    calculation: `Applied ${rate.toFixed(2)}% for ${exactYearsElapsed.toFixed(4)} years`,
    result: `₹${bookValue.toLocaleString()}`,
    breakdown: {
      'Years Calculated': `${exactYearsElapsed.toFixed(4)} years`,
      'Rate Applied': `${rate.toFixed(2)}%`,
      'Total Depreciation': `₹${cumulativeDepreciation.toLocaleString()}`,
      'Final Book Value': `₹${bookValue.toLocaleString()}`
    }
  });

  return {
    method: 'Written Down Value (WDV)',
    finalValue: bookValue,
    totalDepreciation: asset.purchasePrice - bookValue,
    steps
  };
};

const calculateWDVFixedSlabSteps = (asset: Asset, exactYearsElapsed: number): DetailedCalculationResult => {
  const FIXED_RATES: { [key: string]: number } = {
    'Buildings': 5,
    'Furniture and fixtures': 25,
    'Scientific equipments': 40,
    'Computers': 40,
    'Library books': 50,
    'Buses, vans, etc.': 30,
    'Cars, scooters, etc.': 25,
    'Plant and machinery': 20,
    'Musical Instruments': 50,
    'Sports equipments': 50
  };

  const rate = FIXED_RATES[asset.category] || 20;
  const useDate = new Date(asset.putToUseDate || asset.purchaseDate);
  
  const getFinancialYear = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return month >= 3 ? year : year - 1;
  };
  
  const useFinancialYear = getFinancialYear(useDate);
  const currentFinancialYear = getFinancialYear(new Date());
  const financialYears = Math.max(1, currentFinancialYear - useFinancialYear + 1);
  
  let bookValue = asset.purchasePrice;
  let totalDepreciation = 0;
  
  for (let year = 1; year <= financialYears; year++) {
    const yearlyDepreciation = bookValue * (rate / 100);
    bookValue = Math.max(bookValue - yearlyDepreciation, 0);
    totalDepreciation += yearlyDepreciation;
    if (bookValue <= 0) break;
  }

  return {
    method: 'WDV Fixed Slab (Company Act)',
    finalValue: bookValue,
    totalDepreciation,
    steps: [
      {
        step: 1,
        title: 'Identify Fixed Rate',
        description: 'Determine rate based on asset category as per Company Act',
        formula: 'Rate = Fixed Rate per Category',
        calculation: `${asset.category} → ${rate}%`,
        result: `${rate}%`,
        breakdown: {
          'Asset Category': asset.category,
          'Fixed Rate (Company Act)': `${rate}%`
        }
      },
      {
        step: 2,
        title: 'Calculate Financial Years',
        description: 'Count financial years from put-to-use date',
        formula: 'Financial Years = Current FY - Put-to-use FY + 1',
        calculation: `${currentFinancialYear} - ${useFinancialYear} + 1`,
        result: `${financialYears} years`,
        breakdown: {
          'Put-to-use FY': `${useFinancialYear}-${(useFinancialYear + 1).toString().slice(-2)}`,
          'Current FY': `${currentFinancialYear}-${(currentFinancialYear + 1).toString().slice(-2)}`,
          'Financial Years': `${financialYears} years`
        }
      },
      {
        step: 3,
        title: 'Apply Fixed Rate Depreciation',
        description: 'Calculate depreciation for each financial year',
        formula: 'Each Year: Depreciation = Opening Balance × Fixed Rate%',
        calculation: `Applied ${rate}% for ${financialYears} financial years`,
        result: `₹${bookValue.toLocaleString()}`,
        breakdown: {
          'Rate Applied': `${rate}%`,
          'Financial Years': `${financialYears} years`,
          'Total Depreciation': `₹${totalDepreciation.toLocaleString()}`,
          'Final Book Value': `₹${bookValue.toLocaleString()}`
        }
      }
    ]
  };
};

const calculateUnitsSteps = (asset: Asset, exactYearsElapsed: number): DetailedCalculationResult => {
  const depreciableAmount = asset.purchasePrice - asset.residualValue;
  const ratePerUnit = depreciableAmount / (asset.productionCapacity || 1000);
  const unitsUsed = Math.min(asset.unitsProduced || 0, asset.productionCapacity || 1000);
  const totalDepreciation = ratePerUnit * unitsUsed;
  const currentValue = Math.max(asset.purchasePrice - totalDepreciation, asset.residualValue);

  return {
    method: 'Production Unit Method',
    finalValue: currentValue,
    totalDepreciation,
    steps: [
      {
        step: 1,
        title: 'Calculate Depreciable Amount',
        description: 'Subtract residual value from purchase price',
        formula: 'Depreciable Amount = Purchase Price - Residual Value',
        calculation: `₹${asset.purchasePrice.toLocaleString()} - ₹${asset.residualValue.toLocaleString()}`,
        result: `₹${depreciableAmount.toLocaleString()}`,
        breakdown: {
          'Purchase Price': `₹${asset.purchasePrice.toLocaleString()}`,
          'Residual Value': `₹${asset.residualValue.toLocaleString()}`,
          'Depreciable Amount': `₹${depreciableAmount.toLocaleString()}`
        }
      },
      {
        step: 2,
        title: 'Calculate Rate per Unit',
        description: 'Divide depreciable amount by total production capacity',
        formula: 'Rate per Unit = Depreciable Amount ÷ Total Capacity',
        calculation: `₹${depreciableAmount.toLocaleString()} ÷ ${(asset.productionCapacity || 1000).toLocaleString()} units`,
        result: `₹${ratePerUnit.toFixed(2)} per unit`,
        breakdown: {
          'Depreciable Amount': `₹${depreciableAmount.toLocaleString()}`,
          'Total Capacity': `${(asset.productionCapacity || 1000).toLocaleString()} units`,
          'Rate per Unit': `₹${ratePerUnit.toFixed(2)}`
        }
      },
      {
        step: 3,
        title: 'Calculate Total Depreciation',
        description: 'Multiply rate per unit by units produced',
        formula: 'Total Depreciation = Rate per Unit × Units Produced',
        calculation: `₹${ratePerUnit.toFixed(2)} × ${unitsUsed.toLocaleString()} units`,
        result: `₹${totalDepreciation.toLocaleString()}`,
        breakdown: {
          'Rate per Unit': `₹${ratePerUnit.toFixed(2)}`,
          'Units Produced': `${unitsUsed.toLocaleString()} units`,
          'Total Depreciation': `₹${totalDepreciation.toLocaleString()}`
        }
      },
      {
        step: 4,
        title: 'Calculate Current Book Value',
        description: 'Subtract total depreciation from purchase price',
        formula: 'Book Value = Purchase Price - Total Depreciation',
        calculation: `₹${asset.purchasePrice.toLocaleString()} - ₹${totalDepreciation.toLocaleString()}`,
        result: `₹${currentValue.toLocaleString()}`,
        breakdown: {
          'Purchase Price': `₹${asset.purchasePrice.toLocaleString()}`,
          'Total Depreciation': `₹${totalDepreciation.toLocaleString()}`,
          'Current Book Value': `₹${currentValue.toLocaleString()}`
        }
      }
    ]
  };
};

const calculateDoubleDecliningSteps = (asset: Asset, exactYearsElapsed: number): DetailedCalculationResult => {
  const rate = (2 / (asset.usefulLife || 5)) * 100;
  let bookValue = asset.purchasePrice;
  const wholeYears = Math.floor(exactYearsElapsed);
  
  for (let year = 1; year <= wholeYears; year++) {
    const yearlyDepreciation = bookValue * (rate / 100);
    const newBookValue = bookValue - yearlyDepreciation;
    if (newBookValue < asset.residualValue) {
      bookValue = asset.residualValue;
      break;
    }
    bookValue = newBookValue;
  }
  
  if (exactYearsElapsed > wholeYears && bookValue > asset.residualValue) {
    const partialYear = exactYearsElapsed - wholeYears;
    const partialDepreciation = bookValue * (rate / 100) * partialYear;
    const newBookValue = bookValue - partialDepreciation;
    bookValue = Math.max(newBookValue, asset.residualValue);
  }

  return {
    method: 'Double Declining Balance',
    finalValue: bookValue,
    totalDepreciation: asset.purchasePrice - bookValue,
    steps: [
      {
        step: 1,
        title: 'Calculate Depreciation Rate',
        description: 'Double the straight-line rate',
        formula: 'Rate = (2 ÷ Useful Life) × 100',
        calculation: `(2 ÷ ${asset.usefulLife}) × 100`,
        result: `${rate.toFixed(2)}%`,
        breakdown: {
          'Useful Life': `${asset.usefulLife} years`,
          'Straight Line Rate': `${(100 / (asset.usefulLife || 5)).toFixed(2)}%`,
          'Double Declining Rate': `${rate.toFixed(2)}%`
        }
      },
      {
        step: 2,
        title: 'Apply Double Declining Method',
        description: `Calculate depreciation for ${exactYearsElapsed.toFixed(4)} years`,
        formula: 'Each Year: Depreciation = Opening Balance × Rate%',
        calculation: `Applied ${rate.toFixed(2)}% for ${exactYearsElapsed.toFixed(4)} years`,
        result: `₹${bookValue.toLocaleString()}`,
        breakdown: {
          'Rate Applied': `${rate.toFixed(2)}%`,
          'Years Calculated': `${exactYearsElapsed.toFixed(4)} years`,
          'Total Depreciation': `₹${(asset.purchasePrice - bookValue).toLocaleString()}`,
          'Final Book Value': `₹${bookValue.toLocaleString()}`
        }
      }
    ]
  };
};

const calculateSumOfYearsSteps = (asset: Asset, exactYearsElapsed: number): DetailedCalculationResult => {
  const depreciableBase = asset.purchasePrice - asset.residualValue;
  const usefulLife = asset.usefulLife || 5;
  const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
  
  let totalDepreciation = 0;
  const completeYears = Math.floor(exactYearsElapsed);
  const partialYear = exactYearsElapsed - completeYears;
  
  for (let year = 1; year <= Math.min(completeYears, usefulLife); year++) {
    const remainingLife = usefulLife - year + 1;
    const yearlyDepreciation = (remainingLife / sumOfYears) * depreciableBase;
    totalDepreciation += yearlyDepreciation;
  }
  
  if (partialYear > 0 && completeYears < usefulLife) {
    const nextYear = completeYears + 1;
    const remainingLife = usefulLife - nextYear + 1;
    const nextYearDepreciation = (remainingLife / sumOfYears) * depreciableBase;
    totalDepreciation += nextYearDepreciation * partialYear;
  }
  
  const currentValue = Math.max(asset.purchasePrice - totalDepreciation, asset.residualValue);

  return {
    method: 'Sum of Years Digits',
    finalValue: currentValue,
    totalDepreciation,
    steps: [
      {
        step: 1,
        title: 'Calculate Sum of Years',
        description: 'Sum digits from 1 to useful life',
        formula: 'Sum = n(n+1) ÷ 2, where n = Useful Life',
        calculation: `${usefulLife}(${usefulLife}+1) ÷ 2`,
        result: `${sumOfYears}`,
        breakdown: {
          'Useful Life': `${usefulLife} years`,
          'Sum Formula': `${usefulLife} × ${usefulLife + 1} ÷ 2`,
          'Sum of Years': `${sumOfYears}`
        }
      },
      {
        step: 2,
        title: 'Calculate Depreciable Base',
        description: 'Subtract residual value from purchase price',
        formula: 'Depreciable Base = Purchase Price - Residual Value',
        calculation: `₹${asset.purchasePrice.toLocaleString()} - ₹${asset.residualValue.toLocaleString()}`,
        result: `₹${depreciableBase.toLocaleString()}`,
        breakdown: {
          'Purchase Price': `₹${asset.purchasePrice.toLocaleString()}`,
          'Residual Value': `₹${asset.residualValue.toLocaleString()}`,
          'Depreciable Base': `₹${depreciableBase.toLocaleString()}`
        }
      },
      {
        step: 3,
        title: 'Apply Sum of Years Method',
        description: `Calculate depreciation for ${exactYearsElapsed.toFixed(4)} years`,
        formula: 'Each Year: (Remaining Life ÷ Sum) × Depreciable Base',
        calculation: `Applied for ${exactYearsElapsed.toFixed(4)} years`,
        result: `₹${currentValue.toLocaleString()}`,
        breakdown: {
          'Years Calculated': `${exactYearsElapsed.toFixed(4)} years`,
          'Total Depreciation': `₹${totalDepreciation.toLocaleString()}`,
          'Final Book Value': `₹${currentValue.toLocaleString()}`
        }
      }
    ]
  };
};
