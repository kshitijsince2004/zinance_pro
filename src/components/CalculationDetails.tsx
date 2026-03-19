import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Asset, assetService } from '@/lib/assets';
import { Calculator, TrendingDown, Calendar, IndianRupee } from 'lucide-react';

interface CalculationDetailsProps {
  asset: Asset;
}

const CalculationDetails = ({ asset }: CalculationDetailsProps) => {
  const daysElapsed = assetService.calculateDaysElapsed(asset.purchaseDate, asset.soldDate);
  const yearsElapsed = daysElapsed / 365;
  
  const renderSLMDetails = () => {
    const { depreciation, bookValue } = assetService.calculateDepreciationSLM(
      asset.purchasePrice, 
      asset.residualValue, 
      asset.usefulLife || 5, 
      Math.floor(yearsElapsed)
    );
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-400">Straight Line Method (SLM)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Annual Depreciation</p>
            <p className="text-lg font-semibold text-white">₹{depreciation.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Current Book Value</p>
            <p className="text-lg font-semibold text-white">₹{bookValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          <p>Formula: (Cost - Residual Value) / Useful Life</p>
          <p>Calculation: (₹{asset.purchasePrice.toLocaleString()} - ₹{asset.residualValue.toLocaleString()}) / {asset.usefulLife} years</p>
        </div>
      </div>
    );
  };

  const renderWDVDetails = () => {
    const { depreciation, bookValue, rate } = assetService.calculateDepreciationWDV(
      asset.purchasePrice, 
      asset.residualValue, 
      asset.usefulLife || 5, 
      Math.floor(yearsElapsed)
    );
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-400">Written Down Value (WDV)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Depreciation Rate</p>
            <p className="text-lg font-semibold text-white">{rate.toFixed(2)}%</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Current Year Depreciation</p>
            <p className="text-lg font-semibold text-white">₹{depreciation.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Current Book Value</p>
            <p className="text-lg font-semibold text-white">₹{bookValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          <p>Rate Formula: [1 - (Residual Value / Cost)^(1/Useful Life)] × 100</p>
          <p>Rate Calculation: [1 - (₹{asset.residualValue.toLocaleString()} / ₹{asset.purchasePrice.toLocaleString()})^(1/{asset.usefulLife})] × 100 = {rate.toFixed(2)}%</p>
          <p>Annual Depreciation: Book Value × {rate.toFixed(2)}%</p>
        </div>
      </div>
    );
  };

  const renderUnitsDetails = () => {
    const { depreciation, bookValue, ratePerUnit } = assetService.calculateDepreciationUnits(
      asset.purchasePrice, 
      asset.residualValue, 
      asset.productionCapacity || 1000, 
      asset.unitsProduced || 0
    );
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-400">Production Unit Method</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Rate per Unit</p>
            <p className="text-lg font-semibold text-white">₹{ratePerUnit}</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Total Depreciation</p>
            <p className="text-lg font-semibold text-white">₹{depreciation.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Current Book Value</p>
            <p className="text-lg font-semibold text-white">₹{bookValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          <p>Formula: (Cost - Residual Value) / Total Production Capacity</p>
          <p>Rate Calculation: (₹{asset.purchasePrice.toLocaleString()} - ₹{asset.residualValue.toLocaleString()}) / {asset.productionCapacity} units = ₹{ratePerUnit}/unit</p>
          <p>Units Produced: {asset.unitsProduced} / {asset.productionCapacity}</p>
        </div>
      </div>
    );
  };

  const renderDoubleDeclineDetails = () => {
    const { depreciation, bookValue, rate } = assetService.calculateDepreciationDoubleDeclining(
      asset.purchasePrice, 
      asset.residualValue, 
      asset.usefulLife || 5, 
      Math.floor(yearsElapsed)
    );
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-400">Double Declining Balance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Depreciation Rate</p>
            <p className="text-lg font-semibold text-white">{rate.toFixed(2)}%</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Current Year Depreciation</p>
            <p className="text-lg font-semibold text-white">₹{depreciation.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Current Book Value</p>
            <p className="text-lg font-semibold text-white">₹{bookValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          <p>Rate Formula: (2 / Useful Life) × 100</p>
          <p>Rate Calculation: (2 / {asset.usefulLife}) × 100 = {rate.toFixed(2)}%</p>
          <p>Annual Depreciation: Book Value × {rate.toFixed(2)}%</p>
        </div>
      </div>
    );
  };

  const renderSumOfYearsDetails = () => {
    const { depreciation, bookValue } = assetService.calculateDepreciationSumOfYears(
      asset.purchasePrice, 
      asset.residualValue, 
      asset.usefulLife || 5, 
      Math.floor(yearsElapsed)
    );
    
    const sumOfYears = ((asset.usefulLife || 5) * ((asset.usefulLife || 5) + 1)) / 2;
    const remainingLife = (asset.usefulLife || 5) - Math.floor(yearsElapsed) + 1;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-400">Sum of Years Digits</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Sum of Years</p>
            <p className="text-lg font-semibold text-white">{sumOfYears}</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Current Year Depreciation</p>
            <p className="text-lg font-semibold text-white">₹{depreciation.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Current Book Value</p>
            <p className="text-lg font-semibold text-white">₹{bookValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          <p>Sum Formula: n(n+1)/2 where n = Useful Life</p>
          <p>Sum Calculation: {asset.usefulLife}({asset.usefulLife}+1)/2 = {sumOfYears}</p>
          <p>Current Year Fraction: {Math.max(remainingLife, 0)}/{sumOfYears}</p>
        </div>
      </div>
    );
  };

  const renderWDVFixedSlabDetails = () => {
    // Calculate financial years for display
    const getFinancialYear = (date: Date): number => {
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-based (0 = January, 3 = April)
      return month >= 3 ? year : year - 1;
    };
    
    const purchaseDate = new Date(asset.purchaseDate);
    const currentDate = asset.soldDate ? new Date(asset.soldDate) : new Date();
    const purchaseFinancialYear = getFinancialYear(purchaseDate);
    const currentFinancialYear = getFinancialYear(currentDate);
    const financialYears = Math.max(1, currentFinancialYear - purchaseFinancialYear + 1);
    
    const fixedRates: { [key: string]: number } = {
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
    
    const rate = fixedRates[asset.category] || 20;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-400">WDV Fixed Slab (Company Act) - Financial Year Based</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Depreciation Rate</p>
            <p className="text-lg font-semibold text-white">{rate}%</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Financial Years</p>
            <p className="text-lg font-semibold text-white">{financialYears}</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-500/20 rounded">
            <p className="text-sm text-gray-400">Current Book Value</p>
            <p className="text-lg font-semibold text-white">₹{asset.currentValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          <p>Fixed rates as per Company Act based on asset category</p>
          <p>Category: {asset.category} (Rate: {rate}%)</p>
          <p>Purchase FY: {purchaseFinancialYear}-{(purchaseFinancialYear + 1).toString().slice(-2)}</p>
          <p>Current FY: {currentFinancialYear}-{(currentFinancialYear + 1).toString().slice(-2)}</p>
          <p>Note: Depreciation calculated based on financial years (April 1 - March 31)</p>
        </div>
      </div>
    );
  };

  const renderMethodDetails = () => {
    switch (asset.depreciationMethod) {
      case 'SLM':
        return renderSLMDetails();
      case 'WDV':
        return renderWDVDetails();
      case 'WDV_FIXED_SLAB':
        return renderWDVFixedSlabDetails();
      case 'UNITS':
        return renderUnitsDetails();
      case 'DOUBLE_DECLINING':
        return renderDoubleDeclineDetails();
      case 'SUM_OF_YEARS':
        return renderSumOfYearsDetails();
      default:
        return renderSLMDetails();
    }
  };

  return (
    <Card className="glass-effect border-dark-border">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-neon-green" />
          Depreciation Calculation Details
        </CardTitle>
        <CardDescription className="text-dark-muted">
          Detailed breakdown of depreciation calculations for {asset.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Asset Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-black/30 border border-green-500/20 rounded">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Purchase Price</span>
            </div>
            <p className="text-lg font-semibold text-white">₹{asset.purchasePrice.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-black/30 border border-green-500/20 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Age</span>
            </div>
            <p className="text-lg font-semibold text-white">{yearsElapsed.toFixed(1)} years</p>
          </div>
          <div className="p-3 bg-black/30 border border-green-500/20 rounded">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-400">Method</span>
            </div>
            <p className="text-lg font-semibold text-white">{asset.depreciationMethod}</p>
          </div>
          <div className="p-3 bg-black/30 border border-green-500/20 rounded">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Current Value</span>
            </div>
            <p className="text-lg font-semibold text-white">₹{asset.currentValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Method-specific Details */}
        {renderMethodDetails()}

        {/* Depreciation Summary */}
        <div className="mt-6 p-4 bg-black/30 border border-green-500/20 rounded">
          <h4 className="text-md font-semibold text-white mb-2">Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total Depreciation:</span>
              <span className="text-white ml-2">₹{(asset.purchasePrice - asset.currentValue).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400">Remaining Value:</span>
              <span className="text-white ml-2">₹{asset.currentValue.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400">Depreciation %:</span>
              <span className="text-white ml-2">{(((asset.purchasePrice - asset.currentValue) / asset.purchasePrice) * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculationDetails;
