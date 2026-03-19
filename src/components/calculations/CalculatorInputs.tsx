
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calculator, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Asset } from '@/types/asset';

interface CalculatorInputsProps {
  assets: Asset[];
  selectedAsset: string;
  setSelectedAsset: (value: string) => void;
  selectedMethod: string;
  setSelectedMethod: (value: string) => void;
  calculatorInputs: {
    cost: string;
    residualValue: string;
    usefulLifeYears: string;
    usefulLifeDays: string;
    usefulLifeUnit: string;
    purchaseDate: Date;
    calculationDate: Date;
    totalCapacity: string;
    unitsProduced: string;
  };
  setCalculatorInputs: React.Dispatch<React.SetStateAction<any>>;
  onLoadAssetData: () => void;
  onCalculate: () => void;
  getDaysElapsed: () => number;
  getYearsElapsed: () => number;
}

const CalculatorInputs = ({
  assets,
  selectedAsset,
  setSelectedAsset,
  selectedMethod,
  setSelectedMethod,
  calculatorInputs,
  setCalculatorInputs,
  onLoadAssetData,
  onCalculate,
  getDaysElapsed,
  getYearsElapsed
}: CalculatorInputsProps) => {
  return (
    <Card className="border-green-500/20 bg-black/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Calculator className="w-5 h-5 text-green-500" />
          Depreciation Calculator
        </CardTitle>
        <CardDescription className="text-gray-300">
          Calculate depreciation using different methods with day-to-day precision
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white">Select Asset (Optional)</Label>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="border-green-500/20 text-white bg-black/40">
              <SelectValue placeholder="Choose an asset or enter manually" />
            </SelectTrigger>
            <SelectContent className="border-green-500/20 bg-black/90">
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id} className="text-white hover:bg-green-500/20">
                  {asset.name} - {asset.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedAsset && (
            <Button onClick={onLoadAssetData} className="w-full bg-green-500 hover:bg-green-600 text-black">
              Load Asset Data
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-white">Depreciation Method</Label>
          <Select value={selectedMethod} onValueChange={setSelectedMethod}>
            <SelectTrigger className="border-green-500/20 text-white bg-black/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-green-500/20 bg-black/90">
              <SelectItem value="SLM" className="text-white hover:bg-green-500/20">
                Straight Line Method (SLM)
              </SelectItem>
              <SelectItem value="WDV" className="text-white hover:bg-green-500/20">
                Written Down Value (WDV)
              </SelectItem>
              <SelectItem value="WDV_FIXED_SLAB" className="text-white hover:bg-green-500/20">
                WDV Fixed Slab (Financial Year)
              </SelectItem>
              <SelectItem value="UNITS" className="text-white hover:bg-green-500/20">
                Production Unit Method
              </SelectItem>
              <SelectItem value="DOUBLE_DECLINING" className="text-white hover:bg-green-500/20">
                Double Declining Balance
              </SelectItem>
              <SelectItem value="SUM_OF_YEARS" className="text-white hover:bg-green-500/20">
                Sum of Years Digits
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Asset Cost (₹)</Label>
            <Input
              type="number"
              value={calculatorInputs.cost}
              onChange={(e) => setCalculatorInputs(prev => ({ ...prev, cost: e.target.value }))}
              className="border-green-500/20 text-white placeholder:text-gray-400 bg-black/40"
              placeholder="100000"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Residual Value (₹)</Label>
            <Input
              type="number"
              value={calculatorInputs.residualValue}
              onChange={(e) => setCalculatorInputs(prev => ({ ...prev, residualValue: e.target.value }))}
              className="border-green-500/20 text-white placeholder:text-gray-400 bg-black/40"
              placeholder="10000"
            />
          </div>
        </div>

        {selectedMethod !== 'UNITS' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Useful Life Unit</Label>
              <Select 
                value={calculatorInputs.usefulLifeUnit} 
                onValueChange={(value) => setCalculatorInputs(prev => ({ ...prev, usefulLifeUnit: value }))}
              >
                <SelectTrigger className="border-green-500/20 text-white bg-black/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-green-500/20 bg-black/90">
                  <SelectItem value="years" className="text-white hover:bg-green-500/20">Years</SelectItem>
                  <SelectItem value="days" className="text-white hover:bg-green-500/20">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">
                Useful Life ({calculatorInputs.usefulLifeUnit === 'years' ? 'Years' : 'Days'})
              </Label>
              <Input
                type="number"
                step={calculatorInputs.usefulLifeUnit === 'years' ? '0.0001' : '1'}
                min="0"
                value={calculatorInputs.usefulLifeUnit === 'years' ? calculatorInputs.usefulLifeYears : calculatorInputs.usefulLifeDays}
                onChange={(e) => setCalculatorInputs(prev => ({ 
                  ...prev, 
                  [calculatorInputs.usefulLifeUnit === 'years' ? 'usefulLifeYears' : 'usefulLifeDays']: e.target.value 
                }))}
                className="border-green-500/20 text-white placeholder:text-gray-400 bg-black/40"
                placeholder={calculatorInputs.usefulLifeUnit === 'years' ? '2.9387' : '657'}
              />
              <p className="text-xs text-gray-400">
                {calculatorInputs.usefulLifeUnit === 'years' 
                  ? 'Enter decimal values like 2.93, 2.9387, etc.' 
                  : 'Enter number of days like 657, 1095, etc.'
                }
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Purchase Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-green-500/20 text-white bg-black/40",
                    !calculatorInputs.purchaseDate && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {calculatorInputs.purchaseDate ? format(calculatorInputs.purchaseDate, "PPP") : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={calculatorInputs.purchaseDate}
                  onSelect={(date) => date && setCalculatorInputs(prev => ({ ...prev, purchaseDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Calculation Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-green-500/20 text-white bg-black/40",
                    !calculatorInputs.calculationDate && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {calculatorInputs.calculationDate ? format(calculatorInputs.calculationDate, "PPP") : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={calculatorInputs.calculationDate}
                  onSelect={(date) => date && setCalculatorInputs(prev => ({ ...prev, calculationDate: date }))}
                  disabled={(date) => date < calculatorInputs.purchaseDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {selectedMethod === 'UNITS' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Total Capacity</Label>
              <Input
                type="number"
                value={calculatorInputs.totalCapacity}
                onChange={(e) => setCalculatorInputs(prev => ({ ...prev, totalCapacity: e.target.value }))}
                className="border-green-500/20 text-white placeholder:text-gray-400 bg-black/40"
                placeholder="10000"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Units Produced</Label>
              <Input
                type="number"
                value={calculatorInputs.unitsProduced}
                onChange={(e) => setCalculatorInputs(prev => ({ ...prev, unitsProduced: e.target.value }))}
                className="border-green-500/20 text-white placeholder:text-gray-400 bg-black/40"
                placeholder="2000"
              />
            </div>
          </div>
        )}

        <div className="p-3 bg-black/30 border border-green-500/20 rounded">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Days Elapsed:</span>
              <span className="text-white ml-2">{getDaysElapsed()} days</span>
            </div>
            <div>
              <span className="text-gray-400">Years Elapsed:</span>
              <span className="text-white ml-2">{getYearsElapsed().toFixed(3)} years</span>
            </div>
          </div>
        </div>

        <Button onClick={onCalculate} className="w-full bg-green-500 hover:bg-green-600 text-black">
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Depreciation
        </Button>
      </CardContent>
    </Card>
  );
};

export default CalculatorInputs;
