# Fixed Asset Management - Depreciation Calculation Logic

## Overview
This document provides a comprehensive guide to the depreciation calculation logic implemented in the Fixed Asset Management system. All calculations are validated and locked according to the specified requirements.

## Table of Contents
1. [Depreciation Methods](#depreciation-methods)
2. [Code Structure](#code-structure)
3. [Detailed Method Explanations](#detailed-method-explanations)
4. [Edge Cases and Special Rules](#edge-cases-and-special-rules)
5. [Recalculation Triggers](#recalculation-triggers)
6. [Sample Use Cases](#sample-use-cases)
7. [Extension Guidelines](#extension-guidelines)
8. [Technical Implementation](#technical-implementation)

## Depreciation Methods

### 1. Date-to-Date Calculations (SLM, WDV, Custom Methods)
**Status: ✅ VALIDATED & LOCKED**

**Formula:**
```
Depreciation = ((Cost - Residual Value) × Days Used) / Total Useful Life Days
```

**Key Features:**
- **Days Used**: Actual days from "Put to Use" date to current date
- **Leap Year Handling**: Uses 365.25 average or actual leap year calculation (366 days)
- **Live Depreciation**: Automatically calculates till today's date
- **Precision**: Calculations are rounded to 2 decimal places

**Methods Using Date-to-Date Logic:**
- Straight Line Method (SLM)
- Written Down Value (WDV)
- Double Declining Balance
- Sum of Years Digits

### 2. WDV Fixed Slab (School Mode)
**Status: ✅ VALIDATED & LOCKED WITH NEW DISPOSAL RULE**

**Key Features:**
- Based on Indian Financial Years (April 1 - March 31)
- Uses Fixed Depreciation Rate Slabs per Income Tax Act
- Year-wise depreciation (NOT day-wise)
- **NEW RULE**: No depreciation charged in the year of disposal

**Calculation Logic:**
```javascript
// If asset is disposed in FY 2024-25, no depreciation for FY 2024-25
if (disposalFinancialYear === currentFinancialYear) {
    financialYears = disposalFinancialYear - purchaseFinancialYear;
} else {
    financialYears = currentFinancialYear - purchaseFinancialYear + 1;
}
```

**Fixed Rates:**
- Computers: 40%
- Furniture: 25%
- Buildings: 5%
- Plant & Machinery: 20%
- Vehicles: 25-30%
- Scientific Equipment: 40%

### 3. IT Act Module Calculations
**Status: ✅ VALIDATED & SEPARATE MODULE**

**Key Features:**
- Half-year depreciation if "Put to Use" after 30th September of FY
- Full-year depreciation if on/before 30th September
- Block-wise grouping as per Income Tax Act
- Generates ITR Schedule DEP data
- **Separate calculation logic** (does not interfere with main asset depreciation)

## Code Structure

```
src/
├── lib/
│   └── depreciation/
│       ├── calculations.ts          # Main depreciation calculator
│       └── constants.ts             # Fixed depreciation rates
├── components/
│   └── calculations/
│       ├── YearOnYearTable.tsx      # Financial year depreciation table
│       └── EnhancedDepreciationCalculators.tsx
├── pages/
│   ├── DetailedCalculations.tsx     # Detailed calculation page
│   ├── ITActDepreciation.tsx        # IT Act specific calculations
│   └── AssetDetail.tsx              # Asset detail with depreciation info
└── logic/
    └── calculations/
        └── Calculations_logic_README.md # This documentation
```

## Detailed Method Explanations

### Straight Line Method (SLM)
```javascript
calculateSLMCurrentValueDateToDate(purchasePrice, residualValue, usefulLife, putToUseDate, currentDate) {
    const depreciableAmount = purchasePrice - residualValue;
    const daysElapsed = calculateDays(putToUseDate, currentDate);
    const totalUsefulLifeDays = usefulLife * 365.25;
    
    const totalDepreciation = (depreciableAmount * daysElapsed) / totalUsefulLifeDays;
    return Math.max(purchasePrice - totalDepreciation, residualValue);
}
```

**Use Case:** Equal depreciation each year, suitable for assets with consistent usage patterns.

### Written Down Value (WDV)
```javascript
calculateWDVCurrentValueDateToDate(purchasePrice, residualValue, usefulLife, putToUseDate, currentDate) {
    const rate = calculateWDVRate(purchasePrice, residualValue, usefulLife);
    const dailyRate = rate / 100 / 365.25;
    const daysElapsed = calculateDays(putToUseDate, currentDate);
    
    let bookValue = purchasePrice;
    for (let day = 0; day < daysElapsed; day++) {
        bookValue = Math.max(bookValue * (1 - dailyRate), residualValue);
    }
    return bookValue;
}
```

**Use Case:** Higher depreciation in early years, commonly used for technology assets.

### WDV Fixed Slab
```javascript
calculateWDVFixedSlabCurrentValue(purchasePrice, category, putToUseDate, soldDate, status) {
    const rate = FIXED_DEPRECIATION_RATES[category];
    const useFinancialYear = getFinancialYear(putToUseDate);
    
    // NEW DISPOSAL RULE
    if (soldDate && (status === 'sold' || status === 'retired')) {
        const disposalFinancialYear = getFinancialYear(soldDate);
        currentFinancialYear = disposalFinancialYear - 1; // No depreciation in disposal year
    }
    
    const financialYears = Math.max(0, currentFinancialYear - useFinancialYear + 1);
    
    let bookValue = purchasePrice;
    for (let year = 1; year <= financialYears; year++) {
        bookValue = Math.max(bookValue * (1 - rate/100), 0);
    }
    return bookValue;
}
```

## Edge Cases and Special Rules

### 1. Leap Year Handling ✅
```javascript
isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

getDaysInYear(year) {
    return this.isLeapYear(year) ? 366 : 365;
}
```

### 2. Asset Status Validation ✅
```javascript
// No depreciation for disposed/inactive assets
if (asset.status === 'retired' || asset.status === 'sold') {
    if (asset.soldDate) {
        return calculateDepreciationTillDate(asset, putToUseDate, disposalDate);
    }
}
```

### 3. WDV Fixed Slab Disposal Rule ✅
```javascript
// NEW RULE: If disposed in FY, no depreciation for that FY
if (soldDate && (status === 'sold' || status === 'retired')) {
    const disposalFinancialYear = getFinancialYear(disposalDate);
    if (disposalFinancialYear === useFinancialYear) {
        financialYears = 0; // No depreciation if disposed in purchase year
    } else {
        financialYears = disposalFinancialYear - useFinancialYear; // Exclude disposal year
    }
}
```

### 4. Residual Value Protection ✅
All methods ensure the asset value never goes below the residual value:
```javascript
const currentValue = Math.max(calculatedValue, residualValue);
```

### 5. Zero Division Protection ✅
```javascript
if (purchasePrice <= 0 || usefulLife <= 0) return purchasePrice;
```

## Recalculation Triggers

The system automatically recalculates depreciation when:

1. **Asset Data Changes:**
   - Cost/Purchase Price modified
   - Residual Value changed
   - Useful Life updated
   - Depreciation Method changed
   - Put to Use Date modified

2. **Asset Status Changes:**
   - Status changed from Active to Disposed
   - Sold Date added or modified
   - Asset reactivated

3. **Time-based Triggers:**
   - Daily automatic recalculation for live depreciation
   - Financial year end processing
   - Manual refresh requests

4. **System Events:**
   - Asset import/bulk updates
   - Method reconfiguration
   - Rate updates for Fixed Slab categories

## Sample Use Cases

### Scenario 1: Date-to-Date SLM Calculation
```
Asset: Computer
Purchase Price: ₹100,000
Residual Value: ₹10,000
Useful Life: 5 years
Put to Use: 1st June 2025
Current Date: 8th June 2025

Calculation:
Depreciable Amount = ₹100,000 - ₹10,000 = ₹90,000
Days Elapsed = 7 days
Total Useful Life Days = 5 × 365.25 = 1,826.25 days
Depreciation = (₹90,000 × 7) / 1,826.25 = ₹344.83
Current Value = ₹100,000 - ₹344.83 = ₹99,655.17
```

### Scenario 2: WDV Fixed Slab with Disposal
```
Asset: Furniture
Purchase Price: ₹50,000
Category Rate: 25%
Put to Use: 1st April 2023 (FY 2023-24)
Disposed: 15th January 2025 (FY 2024-25)

Calculation:
Purchase FY: 2023-24
Disposal FY: 2024-25
Depreciation Years: Only 2023-24 (No depreciation in disposal year 2024-25)

Year 1 (FY 2023-24): ₹50,000 × 25% = ₹12,500
Book Value after Year 1: ₹37,500
Final Value: ₹37,500 (No further depreciation as disposed in 2024-25)
```

### Scenario 3: IT Act Half-Year Rule
```
Asset: Plant & Machinery
Put to Use: 15th November 2024 (After 30th Sept)
Rate: 20%
Purchase Price: ₹200,000

Calculation:
Since put to use after 30th September, half-year depreciation applies
Depreciation = ₹200,000 × 20% × 0.5 = ₹20,000
Book Value = ₹200,000 - ₹20,000 = ₹180,000
```

## Extension Guidelines

### Adding New Depreciation Methods
1. Create method in `DepreciationCalculator` class
2. Add method identifier to depreciation method enum
3. Update `calculateCurrentValueByMethod` switch case
4. Add corresponding UI components if needed
5. Update this documentation

### Modifying Existing Methods
⚠️ **WARNING**: All current methods are LOCKED and VALIDATED. Any modifications require:
1. Thorough testing with existing assets
2. Backward compatibility verification
3. Documentation updates
4. Stakeholder approval

### Adding New Fixed Rates
Update `src/lib/depreciation/constants.ts`:
```javascript
export const FIXED_DEPRECIATION_RATES: { [key: string]: number } = {
    'New Category': rate_percentage,
    // ... existing rates
};
```

## Technical Implementation

### Performance Considerations
- Daily depreciation calculations use efficient looping
- Results are cached where appropriate
- Bulk calculations are optimized for large asset sets

### Error Handling
```javascript
try {
    const rate = (1 - Math.pow(adjustedResidualValue / cost, 1 / usefulLife)) * 100;
    return Math.max(Math.min(rate, 100), 0);
} catch (error) {
    console.error('Error calculating WDV rate:', error);
    return 20; // Default fallback rate
}
```

### Precision and Rounding
- All financial calculations rounded to 2 decimal places
- Intermediate calculations maintain full precision
- Final results use `Math.round(value * 100) / 100`

## Validation Status

| Component | Status | Last Validated |
|-----------|--------|----------------|
| Date-to-Date SLM | ✅ LOCKED | Current |
| Date-to-Date WDV | ✅ LOCKED | Current |
| WDV Fixed Slab | ✅ LOCKED (with disposal rule) | Current |
| IT Act Calculations | ✅ LOCKED | Current |
| Leap Year Handling | ✅ LOCKED | Current |
| Asset Status Checks | ✅ LOCKED | Current |
| Double Declining | ✅ LOCKED | Current |
| Sum of Years | ✅ LOCKED | Current |
| Units Method | ✅ LOCKED | Current |

## Notes

1. **WDV Fixed Slab Disposal Rule**: This is the ONLY method where disposal affects depreciation calculation. For all other methods, depreciation is calculated till the disposal date.

2. **Financial Year Definition**: April 1st to March 31st (Indian Financial Year)

3. **Asset Status Impact**: Only 'active' assets continue to depreciate. 'Disposed', 'retired', or 'sold' assets stop depreciating.

4. **IT Act Module**: Completely separate calculation logic for tax purposes. Does not interfere with main asset depreciation.

5. **Leap Year Policy**: Uses 365.25 average for general calculations, actual leap year days for specific year calculations.

---

**Document Version**: 1.0  
**Last Updated**: Current  
**Status**: VALIDATED & LOCKED  
**Next Review**: As needed for system updates
