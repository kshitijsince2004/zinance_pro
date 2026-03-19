
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Calendar,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format, addYears, differenceInDays, addDays } from 'date-fns';
import { Asset } from '@/types/asset';
import { assetService } from '@/lib/assets';
import { cn } from '@/lib/utils';

interface AssetLifecycleDisplayProps {
  asset: Asset;
  putToUseDate: Date;
  getFinancialYear: (date: Date) => string;
}

export const AssetLifecycleDisplay: React.FC<AssetLifecycleDisplayProps> = ({
  asset,
  putToUseDate,
  getFinancialYear
}) => {
  const usefulLife = asset.usefulLife || 5;
  const endOfLifeDate = addDays(putToUseDate, Math.ceil(usefulLife * 365.25));
  const today = new Date();
  const totalDays = differenceInDays(endOfLifeDate, putToUseDate);
  const elapsedDays = Math.max(0, differenceInDays(today, putToUseDate));
  const progressPercentage = Math.min((elapsedDays / totalDays) * 100, 100);
  
  const currentValue = assetService.calculateCurrentValueByMethod(asset);
  const totalDepreciableAmount = asset.purchasePrice - asset.residualValue;
  const currentDepreciation = asset.purchasePrice - currentValue;

  // Calculate depreciation for each financial year until asset reaches end of useful life
  const calculateYearlyDepreciation = (): Array<{
    year: number;
    fyYear: string;
    startDate: Date;
    endDate: Date;
    daysInPeriod: number;
    isPartialYear: boolean;
    bookValueStart: number;
    depreciation: number;
    bookValueEnd: number;
    cumulativeDepreciation: number;
    assetAge: number;
    financialAge: number;
  }> => {
    const years = [];
    let currentDate = new Date(putToUseDate);
    let bookValue = asset.purchasePrice;
    let cumulativeDepreciation = 0;
    let yearCounter = 1;

    // Continue until we reach the end of useful life
    while (yearCounter <= Math.ceil(usefulLife)) {
      const fyStartYear = currentDate.getMonth() >= 3 ? currentDate.getFullYear() : currentDate.getFullYear() - 1;
      const fyStart = new Date(fyStartYear, 3, 1); // April 1st
      const fyEnd = new Date(fyStartYear + 1, 2, 31); // March 31st
      
      // Determine the effective start and end dates for this period
      const effectiveStart = yearCounter === 1 ? putToUseDate : (currentDate > fyStart ? currentDate : fyStart);
      
      // For the final year, use the exact end of useful life date
      let effectiveEnd: Date;
      if (yearCounter === Math.ceil(usefulLife)) {
        effectiveEnd = endOfLifeDate;
      } else {
        effectiveEnd = fyEnd;
      }

      const daysInThisPeriod = differenceInDays(effectiveEnd, effectiveStart) + 1;
      const daysInFY = differenceInDays(fyEnd, fyStart) + 1;
      const isPartialYear = daysInThisPeriod < daysInFY;

      const bookValueStart = bookValue;
      let periodDepreciation = 0;

      // Calculate depreciation based on method
      switch (asset.depreciationMethod) {
        case 'SLM': {
          const annualDepreciation = totalDepreciableAmount / usefulLife;
          if (yearCounter === Math.ceil(usefulLife)) {
            // Final partial year - calculate exact depreciation needed
            const remainingYears = usefulLife - (yearCounter - 1);
            periodDepreciation = Math.min(annualDepreciation * remainingYears, bookValue - asset.residualValue);
          } else {
            periodDepreciation = annualDepreciation * (daysInThisPeriod / 365.25);
          }
          break;
        }
        case 'WDV': {
          const rate = assetService.calculateWDVRate(asset.purchasePrice, asset.residualValue, usefulLife);
          if (yearCounter === Math.ceil(usefulLife)) {
            // Final partial year - depreciate to residual value
            periodDepreciation = Math.max(0, bookValue - asset.residualValue);
          } else {
            periodDepreciation = bookValue * (rate / 100) * (daysInThisPeriod / 365.25);
          }
          break;
        }
        default:
          const annualDep = totalDepreciableAmount / usefulLife;
          periodDepreciation = annualDep * (daysInThisPeriod / 365.25);
      }

      // Ensure we don't depreciate below residual value
      periodDepreciation = Math.min(periodDepreciation, bookValue - asset.residualValue);
      periodDepreciation = Math.max(0, periodDepreciation);

      const bookValueEnd = Math.max(bookValue - periodDepreciation, asset.residualValue);
      cumulativeDepreciation += periodDepreciation;

      // Calculate ages
      const assetAgeInDays = differenceInDays(effectiveEnd, putToUseDate);
      const assetAge = assetAgeInDays / 365.25;
      const financialAge = yearCounter - 1 + (daysInThisPeriod / 365.25);

      years.push({
        year: yearCounter,
        fyYear: getFinancialYear(effectiveStart),
        startDate: effectiveStart,
        endDate: effectiveEnd,
        daysInPeriod: daysInThisPeriod,
        isPartialYear,
        bookValueStart,
        depreciation: periodDepreciation,
        bookValueEnd,
        cumulativeDepreciation,
        assetAge,
        financialAge
      });

      bookValue = bookValueEnd;
      
      // Break if we've reached residual value or end of useful life
      if (bookValue <= asset.residualValue || yearCounter >= Math.ceil(usefulLife)) {
        break;
      }

      yearCounter++;
      currentDate = addDays(fyEnd, 1);
    }

    return years;
  };

  const yearlyDepreciation = calculateYearlyDepreciation();

  const getLifecycleStatus = () => {
    const ageInYears = elapsedDays / 365.25;
    if (ageInYears < usefulLife * 0.3) return { status: 'New', color: 'bg-green-500', icon: CheckCircle };
    if (ageInYears < usefulLife * 0.7) return { status: 'Good', color: 'bg-blue-500', icon: CheckCircle };
    if (ageInYears < usefulLife) return { status: 'Aging', color: 'bg-yellow-500', icon: AlertTriangle };
    return { status: 'End of Life', color: 'bg-red-500', icon: AlertTriangle };
  };

  const lifecycleStatus = getLifecycleStatus();
  const StatusIcon = lifecycleStatus.icon;

  return (
    <div className="space-y-6">
      {/* Lifecycle Overview */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Asset Lifecycle Overview
          </CardTitle>
          <CardDescription>
            Complete asset lifecycle from put-to-use to end of useful life ({usefulLife.toFixed(2)} years)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${lifecycleStatus.color}`}></div>
              <div>
                <h3 className="text-lg font-semibold">Asset Status: {lifecycleStatus.status}</h3>
                <p className="text-sm text-muted-foreground">
                  {elapsedDays} days since put-to-use • {Math.max(0, totalDays - elapsedDays)} days remaining
                </p>
                <p className="text-sm text-muted-foreground">
                  Asset Age: {(elapsedDays / 365.25).toFixed(2)} years • Financial Age: {(elapsedDays / 365.25).toFixed(2)} years
                </p>
              </div>
            </div>
            <StatusIcon className="w-6 h-6 text-muted-foreground" />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Lifecycle Progress</span>
              <span>{progressPercentage.toFixed(2)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Key Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <p className="text-sm text-blue-400">Put-to-Use Date</p>
              </div>
              <p className="font-medium">{format(putToUseDate, 'dd MMM yyyy')}</p>
              <p className="text-xs text-muted-foreground">FY {getFinancialYear(putToUseDate)}</p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-400">Current Date</p>
              </div>
              <p className="font-medium">{format(today, 'dd MMM yyyy')}</p>
              <p className="text-xs text-muted-foreground">FY {getFinancialYear(today)}</p>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-400">End of Life</p>
              </div>
              <p className="font-medium">{format(endOfLifeDate, 'dd MMM yyyy')}</p>
              <p className="text-xs text-muted-foreground">FY {getFinancialYear(endOfLifeDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            Financial Lifecycle Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-accent/20 rounded-lg">
              <p className="text-2xl font-bold text-primary">₹{asset.purchasePrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
              <p className="text-sm text-muted-foreground">Original Cost</p>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-lg">
              <p className="text-2xl font-bold text-red-500">₹{currentDepreciation.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
              <p className="text-sm text-muted-foreground">Depreciated</p>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <p className="text-2xl font-bold text-green-500">₹{currentValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
              <p className="text-sm text-muted-foreground">Current Value</p>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <p className="text-2xl font-bold text-blue-500">₹{asset.residualValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
              <p className="text-sm text-muted-foreground">Residual Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Milestones - All Years with Financial Year Details */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle>Lifecycle Milestones - Year by Year Depreciation</CardTitle>
          <CardDescription>
            Complete year-by-year depreciation breakdown for {usefulLife.toFixed(2)} years useful life using {asset.depreciationMethod} method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {yearlyDepreciation.map((yearData, index) => {
              const isPassed = today >= yearData.endDate;
              const isCurrent = today >= yearData.startDate && today <= yearData.endDate;
              
              return (
                <div key={index} className={cn(
                  "flex items-center justify-between p-4 rounded-lg border",
                  isPassed ? "bg-green-500/10 border-green-500/20" : 
                  isCurrent ? "bg-blue-500/10 border-blue-500/20" : 
                  "bg-accent/20 border-border"
                )}>
                  <div className="flex items-center gap-4">
                    <Badge className={cn(
                      "text-white",
                      isPassed ? 'bg-green-500' : 
                      isCurrent ? 'bg-blue-500' : 
                      'bg-gray-500'
                    )}>
                      Year {yearData.year}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        FY {yearData.fyYear} {yearData.isPartialYear && '(Partial)'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(yearData.startDate, 'dd MMM yyyy')} - {format(yearData.endDate, 'dd MMM yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Asset Age: {yearData.assetAge.toFixed(2)} years • Financial Age: {yearData.financialAge.toFixed(2)} years
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {yearData.daysInPeriod} days • Book Value: ₹{yearData.bookValueStart.toFixed(2)} → ₹{yearData.bookValueEnd.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-500">
                      -₹{yearData.depreciation.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </p>
                    <p className="text-sm text-muted-foreground">Depreciation</p>
                    <p className="text-xs text-muted-foreground">
                      Total: ₹{yearData.cumulativeDepreciation.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
