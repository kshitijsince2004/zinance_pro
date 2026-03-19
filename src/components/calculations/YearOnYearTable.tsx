
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingDown, Calendar } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { Asset } from '@/types/asset';
import { depreciationCalculator } from '@/lib/depreciation/calculations';
import { FIXED_DEPRECIATION_RATES } from '@/lib/depreciation/constants';

interface YearOnYearTableProps {
  asset: Asset;
  exactYearsElapsed: number;
  putToUseDate: Date;
  calculationDate: Date;
  getFinancialYear: (date: Date) => string;
}

export const YearOnYearTable: React.FC<YearOnYearTableProps> = ({
  asset,
  exactYearsElapsed,
  putToUseDate,
  calculationDate,
  getFinancialYear
}) => {
  const usefulLife = asset.usefulLife || 5;
  
  // Calculate year-by-year depreciation for full financial years
  const calculateYearByYearDepreciation = (): Array<{
    year: number;
    fyYear: string;
    startDate: Date;
    endDate: Date;
    daysInFY: number;
    daysInPeriod: number;
    isPartialYear: boolean;
    openingValue: number;
    depreciation: number;
    closingValue: number;
    cumulativeDepreciation: number;
    method: string;
    isPostUsefulLife: boolean;
  }> => {
    const years = [];
    let bookValue = asset.purchasePrice;
    let cumulativeDepreciation = 0;
    let yearCounter = 1;

    // For WDV_FIXED_SLAB, use financial year based calculation
    if (asset.depreciationMethod === 'WDV_FIXED_SLAB') {
      const rate = FIXED_DEPRECIATION_RATES[asset.category] || 20;
      const putToUseFY = depreciationCalculator.getFinancialYear(putToUseDate);
      const currentFY = depreciationCalculator.getFinancialYear(calculationDate);
      
      // Continue until calculation date or until book value reaches residual value
      for (let fyIndex = 0; fyIndex <= currentFY - putToUseFY; fyIndex++) {
        const fyYear = putToUseFY + fyIndex;
        const fyStart = new Date(fyYear, 3, 1); // April 1st
        const fyEnd = new Date(fyYear + 1, 2, 31); // March 31st
        
        const effectiveStart = fyIndex === 0 ? putToUseDate : fyStart;
        const isLastYear = fyYear === currentFY;
        const effectiveEnd = isLastYear && calculationDate < fyEnd ? calculationDate : fyEnd;
        
        const daysInFY = differenceInDays(fyEnd, fyStart) + 1;
        const daysInThisPeriod = differenceInDays(effectiveEnd, effectiveStart) + 1;
        const isPartialYear = daysInThisPeriod < daysInFY;
        
        const openingValue = bookValue;
        // WDV Fixed Slab always applies full year depreciation for the financial year
        const periodDepreciation = Math.min(bookValue * (rate / 100), bookValue - asset.residualValue);
        const closingValue = Math.max(bookValue - periodDepreciation, asset.residualValue);
        
        cumulativeDepreciation += periodDepreciation;
        
        years.push({
          year: fyIndex + 1,
          fyYear: getFinancialYear(effectiveStart),
          startDate: effectiveStart,
          endDate: effectiveEnd,
          daysInFY,
          daysInPeriod: daysInThisPeriod,
          isPartialYear,
          openingValue,
          depreciation: periodDepreciation,
          closingValue,
          cumulativeDepreciation,
          method: asset.depreciationMethod,
          isPostUsefulLife: fyIndex >= Math.ceil(usefulLife)
        });
        
        bookValue = closingValue;
        
        if (bookValue <= asset.residualValue || isLastYear) break;
      }
    } else {
      // For other methods, continue with existing logic but extend beyond useful life
      let currentDate = new Date(putToUseDate);
      
      // Continue until calculation date or until book value reaches residual value
      while (currentDate < calculationDate && bookValue > asset.residualValue) {
        const fyStartYear = currentDate.getMonth() >= 3 ? currentDate.getFullYear() : currentDate.getFullYear() - 1;
        const fyStart = new Date(fyStartYear, 3, 1);
        const fyEnd = new Date(fyStartYear + 1, 2, 31);
        
        const effectiveStart = yearCounter === 1 ? putToUseDate : (currentDate > fyStart ? currentDate : fyStart);
        const effectiveEnd = calculationDate < fyEnd ? calculationDate : fyEnd;

        const daysInFY = differenceInDays(fyEnd, fyStart) + 1;
        const daysInThisPeriod = differenceInDays(effectiveEnd, effectiveStart) + 1;
        const isPartialYear = daysInThisPeriod < daysInFY;

        const openingValue = bookValue;
        let periodDepreciation = 0;

        // Check if we're beyond useful life
        const isPostUsefulLife = yearCounter > Math.ceil(usefulLife);

        if (!isPostUsefulLife) {
          switch (asset.depreciationMethod) {
            case 'SLM': {
              const depreciableAmount = Math.max(asset.purchasePrice - asset.residualValue, 0);
              const annualDepreciation = depreciableAmount / usefulLife;
              periodDepreciation = annualDepreciation * (daysInThisPeriod / 365);
              break;
            }
            case 'WDV': {
              const rate = depreciationCalculator.calculateWDVRate(asset.purchasePrice, asset.residualValue, usefulLife);
              periodDepreciation = bookValue * (rate / 100) * (daysInThisPeriod / 365);
              break;
            }
            case 'DOUBLE_DECLINING': {
              const rate = (2 / usefulLife) * 100;
              periodDepreciation = bookValue * (rate / 100) * (daysInThisPeriod / 365);
              break;
            }
            case 'SUM_OF_YEARS': {
              const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
              const remainingLife = Math.max(usefulLife - yearCounter + 1, 0);
              const depreciableBase = asset.purchasePrice - asset.residualValue;
              const yearlyDepreciation = (remainingLife / sumOfYears) * depreciableBase;
              periodDepreciation = yearlyDepreciation * (daysInThisPeriod / 365);
              break;
            }
            case 'UNITS': {
              const totalCapacity = asset.productionCapacity || 1000;
              const unitsProduced = asset.unitsProduced || 0;
              const ratePerUnit = (asset.purchasePrice - asset.residualValue) / totalCapacity;
              periodDepreciation = ratePerUnit * Math.min(unitsProduced, totalCapacity);
              break;
            }
            default:
              const depreciableAmount = Math.max(asset.purchasePrice - asset.residualValue, 0);
              const annualDepreciation = depreciableAmount / usefulLife;
              periodDepreciation = annualDepreciation * (daysInThisPeriod / 365);
          }
        } else {
          // Post useful life - no further depreciation for most methods
          // Exception: some methods may continue depreciating until residual value
          if (asset.depreciationMethod === 'WDV' || asset.depreciationMethod === 'DOUBLE_DECLINING') {
            // These methods can continue beyond useful life until residual value is reached
            const rate = asset.depreciationMethod === 'WDV' ? 
              depreciationCalculator.calculateWDVRate(asset.purchasePrice, asset.residualValue, usefulLife) :
              (2 / usefulLife) * 100;
            periodDepreciation = bookValue * (rate / 100) * (daysInThisPeriod / 365);
          } else {
            periodDepreciation = 0; // No further depreciation for other methods
          }
        }

        periodDepreciation = Math.min(periodDepreciation, bookValue - asset.residualValue);
        periodDepreciation = Math.max(0, periodDepreciation);

        const closingValue = Math.max(bookValue - periodDepreciation, asset.residualValue);
        cumulativeDepreciation += periodDepreciation;

        years.push({
          year: yearCounter,
          fyYear: getFinancialYear(effectiveStart),
          startDate: effectiveStart,
          endDate: effectiveEnd,
          daysInFY,
          daysInPeriod: daysInThisPeriod,
          isPartialYear,
          openingValue,
          depreciation: periodDepreciation,
          closingValue,
          cumulativeDepreciation,
          method: asset.depreciationMethod,
          isPostUsefulLife
        });

        bookValue = closingValue;
        
        // Break if we've reached residual value or if no more depreciation is possible
        if (bookValue <= asset.residualValue || (isPostUsefulLife && periodDepreciation === 0)) {
          break;
        }

        yearCounter++;
        currentDate = addDays(fyEnd, 1);
      }
    }

    return years;
  };

  const yearlyDepreciation = calculateYearByYearDepreciation();

  return (
    <Card className="bg-card border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-primary" />
          Year on Year Depreciation Schedule
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Financial year-wise depreciation breakdown using {asset.depreciationMethod} method
          {yearlyDepreciation.some(y => y.isPostUsefulLife) && (
            <span className="text-orange-400 ml-2">
              • Includes post-useful life periods
            </span>
          )}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Financial Year</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Days</TableHead>
                <TableHead className="text-right">Opening Value</TableHead>
                <TableHead className="text-right">Depreciation</TableHead>
                <TableHead className="text-right">Closing Value</TableHead>
                <TableHead className="text-right">Cumulative Dep.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearlyDepreciation.map((yearData, index) => (
                <TableRow key={index} className={yearData.isPostUsefulLife ? 'bg-orange-500/5' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">FY {yearData.fyYear}</Badge>
                      {yearData.isPartialYear && (
                        <Badge variant="secondary" className="text-xs">Partial</Badge>
                      )}
                      {yearData.isPostUsefulLife && (
                        <Badge variant="outline" className="text-xs border-orange-400 text-orange-400">
                          Post-Life
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(yearData.startDate, 'dd MMM yyyy')}</div>
                      <div className="text-muted-foreground text-xs">
                        to {format(yearData.endDate, 'dd MMM yyyy')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{yearData.daysInPeriod}</div>
                      <div className="text-muted-foreground text-xs">
                        of {yearData.daysInFY} days
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{yearData.openingValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </TableCell>
                  <TableCell className="text-right text-red-600 font-medium">
                    ₹{yearData.depreciation.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    ₹{yearData.closingValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </TableCell>
                  <TableCell className="text-right text-orange-600 font-medium">
                    ₹{yearData.cumulativeDepreciation.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Years:</span>
              <span className="ml-2 font-medium">{yearlyDepreciation.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Depreciation:</span>
              <span className="ml-2 font-medium text-red-600">
                ₹{yearlyDepreciation.reduce((sum, year) => sum + year.depreciation, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Final Value:</span>
              <span className="ml-2 font-medium text-green-600">
                ₹{(yearlyDepreciation[yearlyDepreciation.length - 1]?.closingValue || asset.purchasePrice).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Method:</span>
              <span className="ml-2 font-medium">{asset.depreciationMethod}</span>
            </div>
          </div>
          {yearlyDepreciation.some(y => y.isPostUsefulLife) && (
            <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-orange-700 text-xs">
              <strong>Note:</strong> Some years are beyond the asset's useful life of {usefulLife} years. 
              Depreciation continues until the residual value is reached.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
