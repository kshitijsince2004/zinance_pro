
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calculator, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { DetailedCalculationResult } from './DetailedMethodCalculators';

interface StepByStepDisplayProps {
  calculations: DetailedCalculationResult;
  purchaseDate: Date;
  putToUseDate: Date;
  calculationDate: Date;
  exactYearsElapsed: number;
  daysElapsed: number;
  purchasePrice: number;
  getFinancialYear: (date: Date) => string;
}

export const StepByStepDisplay: React.FC<StepByStepDisplayProps> = ({
  calculations,
  purchaseDate,
  putToUseDate,
  calculationDate,
  exactYearsElapsed,
  daysElapsed,
  purchasePrice,
  getFinancialYear
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));

  const toggleStep = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  return (
    <Card className="bg-card border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          {calculations.method}
        </CardTitle>
        <CardDescription>
          Financial Year Based Calculation from {format(putToUseDate, 'dd MMM yyyy')} ({getFinancialYear(putToUseDate)}) to {format(calculationDate, 'dd MMM yyyy')} ({getFinancialYear(calculationDate)})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-accent/20 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Purchase Date</p>
            <p className="font-medium">{format(purchaseDate, 'dd MMM yyyy')}</p>
            <p className="text-xs text-muted-foreground">FY {getFinancialYear(purchaseDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Put-to-Use Date</p>
            <p className="font-medium">{format(putToUseDate, 'dd MMM yyyy')}</p>
            <p className="text-xs text-muted-foreground">FY {getFinancialYear(putToUseDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Calculation Date</p>
            <p className="font-medium">{format(calculationDate, 'dd MMM yyyy')}</p>
            <p className="text-xs text-muted-foreground">FY {getFinancialYear(calculationDate)}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">Total Depreciation</p>
            <p className="text-2xl font-bold text-red-500">
              ₹{Math.round(calculations.totalDepreciation).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {((calculations.totalDepreciation / purchasePrice) * 100).toFixed(2)}% of cost
            </p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">Current Book Value</p>
            <p className="text-2xl font-bold text-green-500">
              ₹{Math.round(calculations.finalValue).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {((calculations.finalValue / purchasePrice) * 100).toFixed(2)}% of cost
            </p>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">Time Elapsed</p>
            <p className="text-2xl font-bold text-blue-500">
              {exactYearsElapsed.toFixed(2)} years
            </p>
            <p className="text-xs text-muted-foreground">
              {daysElapsed} days
            </p>
          </div>
        </div>

        {/* Detailed Steps */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Calculation Steps</h4>
          <div className="space-y-3">
            {calculations.steps.map((step, index) => (
              <Collapsible key={index} open={expandedSteps.has(index)} onOpenChange={() => toggleStep(index)}>
                <div className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger className="w-full p-4 bg-accent/20 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                          {step.step}
                        </div>
                        <div className="text-left">
                          <h5 className="font-semibold">{step.title}</h5>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-primary/20 text-primary">
                          {step.result}
                        </Badge>
                        {expandedSteps.has(index) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 space-y-4 bg-background">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Formula</Label>
                          <div className="p-3 bg-muted/50 rounded font-mono text-sm">
                            {step.formula}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Calculation</Label>
                          <div className="p-3 bg-muted/50 rounded font-mono text-sm">
                            {step.calculation}
                          </div>
                        </div>
                      </div>
                      
                      {step.breakdown && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Breakdown</Label>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {Object.entries(step.breakdown).map(([key, value]) => (
                              <div key={key} className="p-2 bg-accent/30 rounded text-sm">
                                <p className="text-xs text-muted-foreground">{key}</p>
                                <p className="font-medium">{String(value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Result: {step.result}</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
