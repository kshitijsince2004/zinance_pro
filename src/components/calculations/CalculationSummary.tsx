
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, TrendingDown, Clock, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Asset } from '@/types/asset';
import { assetService } from '@/lib/assets';

interface CalculationSummaryProps {
  asset: Asset;
  calculationDate: Date;
  daysElapsed: number;
  exactYearsElapsed: number;
}

export const CalculationSummary: React.FC<CalculationSummaryProps> = ({
  asset,
  calculationDate,
  daysElapsed,
  exactYearsElapsed
}) => {
  // Get real-time current value using the proper calculation method
  const currentValue = assetService.calculateCurrentValueByMethod(asset);
  const totalDepreciation = asset.purchasePrice - currentValue;
  const depreciationRate = (totalDepreciation / asset.purchasePrice) * 100;
  
  const putToUseDate = new Date(asset.putToUseDate || asset.purchaseDate);
  const remainingLife = asset.depreciationMethod === 'WDV_FIXED_SLAB' 
    ? 'N/A (Fixed Rate)' 
    : Math.max(0, (asset.usefulLife || 5) - exactYearsElapsed).toFixed(2);
  
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calculator className="w-6 h-6" />
          Calculation Summary
        </CardTitle>
        <CardDescription>
          Depreciation calculation as of {format(calculationDate, 'dd MMMM yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current Value */}
          <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <p className="text-sm font-medium text-green-600">Current Value</p>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ₹{currentValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Book value after depreciation
            </p>
          </div>

          {/* Total Depreciation */}
          <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <p className="text-sm font-medium text-red-600">Total Depreciation</p>
            </div>
            <p className="text-3xl font-bold text-red-600">
              ₹{totalDepreciation.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {depreciationRate.toFixed(2)}% of original cost
            </p>
          </div>

          {/* Asset Age */}
          <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-medium text-blue-600">Asset Age</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {exactYearsElapsed.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              years ({daysElapsed} days)
            </p>
          </div>

          {/* Remaining Life */}
          <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-medium text-orange-600">Remaining Life</p>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {typeof remainingLife === 'string' ? remainingLife : `${remainingLife} years`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {asset.depreciationMethod === 'WDV_FIXED_SLAB' ? 'Fixed rate method' : 'years of useful life left'}
            </p>
          </div>
        </div>

        {/* Asset Details */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Asset Information
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Purchase Price:</span>
              <span className="ml-2 font-medium">₹{asset.purchasePrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Residual Value:</span>
              <span className="ml-2 font-medium">₹{asset.residualValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Method:</span>
              <span className="ml-2 font-medium">{asset.depreciationMethod}</span>
            </div>
            {/* Only show useful life if not WDV_FIXED_SLAB */}
            {asset.depreciationMethod !== 'WDV_FIXED_SLAB' && (
              <div>
                <span className="text-muted-foreground">Useful Life:</span>
                <span className="ml-2 font-medium">{asset.usefulLife} years</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
