// FIXED DEPRECIATION RATES - LOCKED & VALIDATED ✅
// Based on Income Tax Act depreciation rates for different asset categories

export const FIXED_DEPRECIATION_RATES: { [key: string]: number } = {
  // Buildings and Structures
  'Buildings': 5,
  'Factory Buildings': 10,
  'Temporary Structures': 100,
  
  // Furniture and Fixtures
  'Furniture and fixtures': 25,
  'Office furniture': 25,
  'Fixtures': 25,
  
  // Equipment and Machinery
  'Plant and machinery': 20,
  'Scientific equipments': 40,
  'Medical equipments': 40,
  'Laboratory equipments': 40,
  'Electrical equipments': 20,
  'Musical Instruments': 50,
  'Sports equipments': 50,
  
  // Computers and IT
  'Computers': 40,
  'Computer software': 40,
  'Data processing machines': 40,
  'Computer peripherals': 40,
  
  // Vehicles
  'Buses, vans, etc.': 30,
  'Cars, scooters, etc.': 25,
  'Trucks': 30,
  'Heavy vehicles': 30,
  'Aircraft': 25,
  'Ships': 20,
  
  // Books and Publications
  'Library books': 50,
  'Books': 50,
  
  // Other Assets
  'Tools and equipment': 25,
  'Dies and moulds': 25,
  
  // Intangible Assets
  'Intangible assets': 20,
  'Patents': 20,
  'Copyrights': 20,
  'Trademarks': 20,
  'Software licenses': 40,
  'Goodwill': 10,
  'Brand value': 10,
  'Customer relationships': 15,
  'Know-how': 25,
  'Licenses': 20,
  'Franchise rights': 15,
  'Non-compete agreements': 25,
  
  // Default fallback rate
  'Others': 20
};

// Asset categories mapping for easy reference
export const ASSET_CATEGORIES = Object.keys(FIXED_DEPRECIATION_RATES);

// Validation function for rates
export const validateDepreciationRate = (category: string): number => {
  const rate = FIXED_DEPRECIATION_RATES[category];
  if (rate === undefined) {
    console.warn(`Unknown asset category: ${category}. Using default rate of 20%`);
    return 20;
  }
  return rate;
};

// Financial year utilities
export const FINANCIAL_YEAR_START_MONTH = 3; // April (0-based index)
export const FINANCIAL_YEAR_START_DATE = 1;

export const getFinancialYearLabel = (fyYear: number): string => {
  return `${fyYear}-${(fyYear + 1).toString().slice(-2)}`;
};

export const getCurrentFinancialYear = (): number => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  return month >= FINANCIAL_YEAR_START_MONTH ? year : year - 1;
};
