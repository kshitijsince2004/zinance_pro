
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { assetService } from '@/lib/assets';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon,
  TrendingDown,
  Clock,
  BarChart3
} from 'lucide-react';
import { format, differenceInDays, differenceInYears } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalculationSummary } from '@/components/calculations/CalculationSummary';
import { calculateDetailedSteps } from '@/components/calculations/DetailedMethodCalculators';
import { StepByStepDisplay } from '@/components/calculations/StepByStepDisplay';
import { YearOnYearTable } from '@/components/calculations/YearOnYearTable';
import { AssetLifecycleDisplay } from '@/components/calculations/AssetLifecycleDisplay';

const DetailedCalculations = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [calculationDate, setCalculationDate] = useState<Date>(new Date());
  const [calculationType, setCalculationType] = useState<'date-to-date' | 'year-on-year' | 'lifecycle'>('date-to-date');

  const asset = id ? assetService.getAssetById(id) : null;

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">Asset Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested asset could not be found.</p>
          <Button onClick={() => navigate('/assets')} className="bg-primary hover:bg-primary/90">
            Back to Assets
          </Button>
        </div>
      </div>
    );
  }

  const purchaseDate = new Date(asset.purchaseDate);
  const putToUseDate = new Date(asset.putToUseDate || asset.purchaseDate);
  const daysElapsed = differenceInDays(calculationDate, putToUseDate);
  const exactYearsElapsed = daysElapsed / 365.25;

  const detailedCalculations = calculateDetailedSteps(asset, exactYearsElapsed);

  // Calculate financial year for display
  const getFinancialYear = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const fyStart = month >= 3 ? year : year - 1;
    return `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in bg-background min-h-screen text-foreground">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-card border p-6">
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/assets/${asset.id}`)}
              className="border-border hover:bg-accent transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Asset
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-primary">
                Detailed Calculations
              </h1>
              <p className="text-muted-foreground text-lg">{asset.name} • {asset.depreciationMethod}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <p>Purchase FY: {getFinancialYear(purchaseDate)}</p>
              <p>Put-to-use FY: {getFinancialYear(putToUseDate)}</p>
              <p>Calculation FY: {getFinancialYear(calculationDate)}</p>
              <p>Useful Life: {(asset.usefulLife || 5).toFixed(2)} years</p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !calculationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {calculationDate ? format(calculationDate, "PPP") : <span>Pick calculation date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={calculationDate}
                  onSelect={(date) => date && setCalculationDate(date)}
                  disabled={(date) => date < putToUseDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Asset Summary */}
      <CalculationSummary 
        asset={asset}
        calculationDate={calculationDate}
        daysElapsed={daysElapsed}
        exactYearsElapsed={exactYearsElapsed}
      />

      {/* Calculation Tabs */}
      <Tabs value={calculationType} onValueChange={(value) => setCalculationType(value as typeof calculationType)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="date-to-date" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Step-by-Step
          </TabsTrigger>
          <TabsTrigger value="year-on-year" className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Year on Year
          </TabsTrigger>
          <TabsTrigger value="lifecycle" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Asset Lifecycle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="date-to-date" className="space-y-6">
          <StepByStepDisplay
            calculations={detailedCalculations}
            purchaseDate={purchaseDate}
            putToUseDate={putToUseDate}
            calculationDate={calculationDate}
            exactYearsElapsed={exactYearsElapsed}
            daysElapsed={daysElapsed}
            purchasePrice={asset.purchasePrice}
            getFinancialYear={getFinancialYear}
          />
        </TabsContent>

        <TabsContent value="year-on-year" className="space-y-6">
          <YearOnYearTable
            asset={asset}
            exactYearsElapsed={exactYearsElapsed}
            putToUseDate={putToUseDate}
            calculationDate={calculationDate}
            getFinancialYear={getFinancialYear}
          />
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-6">
          <AssetLifecycleDisplay
            asset={asset}
            putToUseDate={putToUseDate}
            getFinancialYear={getFinancialYear}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetailedCalculations;
