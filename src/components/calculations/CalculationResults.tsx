
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Calculator } from 'lucide-react';

interface CalculationStep {
  step: number;
  description: string;
  formula: string;
  calculation: string;
  result: number;
}

interface DetailedResult {
  method: string;
  steps: CalculationStep[];
  finalValue: number;
  totalDepreciation: number;
}

interface CalculationResultsProps {
  calculationResult: DetailedResult | null;
}

const CalculationResults = ({ calculationResult }: CalculationResultsProps) => {
  return (
    <Card className="border-green-500/20 bg-black/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="w-5 h-5 text-green-500" />
          Step-by-Step Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {calculationResult ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-green-500 text-black">{calculationResult.method}</Badge>
              {calculationResult.method !== 'WDV_FIXED_SLAB' && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">Day-to-Day</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10">
                <p className="text-sm text-gray-300">Total Depreciation</p>
                <p className="text-lg font-semibold text-red-400">
                  ₹{calculationResult.totalDepreciation.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/10">
                <p className="text-sm text-gray-300">Final Book Value</p>
                <p className="text-lg font-semibold text-green-400">
                  ₹{calculationResult.finalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-white">Calculation Steps</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {calculationResult.steps.map((step) => (
                  <div key={step.step} className="p-4 rounded-lg border border-green-500/10 bg-black/40">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-black text-xs font-bold flex items-center justify-center">
                        {step.step}
                      </div>
                      <h5 className="font-medium text-white">{step.description}</h5>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-300">{step.formula}</p>
                      <p className="text-green-400">{step.calculation}</p>
                      <p className="text-white font-medium">
                        Result: ₹{step.result.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-gray-300">
            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Run a calculation to see detailed steps</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalculationResults;
