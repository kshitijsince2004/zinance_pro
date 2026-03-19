
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Calculator, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EnhancedDatePicker from '../EnhancedDatePicker';

interface DepreciationDateSelectorProps {
  onCalculate: (startDate: Date, endDate: Date, type: string) => void;
  onClose: () => void;
}

const DepreciationDateSelector: React.FC<DepreciationDateSelectorProps> = ({ onCalculate, onClose }) => {
  const [calculationType, setCalculationType] = useState<'custom' | 'current_fy' | 'previous_fy' | 'next_fy' | 'specific_fy'>('custom');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [specificFY, setSpecificFY] = useState<string>('');

  // Get financial year dates
  const getFinancialYear = (date: Date): { start: Date; end: Date; label: string } => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const fyStart = month >= 3 ? year : year - 1;
    
    return {
      start: new Date(fyStart, 3, 1), // April 1st
      end: new Date(fyStart + 1, 2, 31), // March 31st
      label: `${fyStart}-${(fyStart + 1).toString().slice(-2)}`
    };
  };

  const getCurrentFY = () => getFinancialYear(new Date());
  const getPreviousFY = () => {
    const currentFY = getCurrentFY();
    return getFinancialYear(new Date(currentFY.start.getFullYear() - 1, 3, 1));
  };
  const getNextFY = () => {
    const currentFY = getCurrentFY();
    return getFinancialYear(new Date(currentFY.start.getFullYear() + 1, 3, 1));
  };

  // Generate FY options for the last 10 years and next 5 years
  const generateFYOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = -10; i <= 5; i++) {
      const fyStart = currentYear + i;
      const label = `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
      options.push({ value: fyStart.toString(), label });
    }
    
    return options;
  };

  const handleCalculate = () => {
    let calculationStart: Date;
    let calculationEnd: Date;
    let type: string;

    switch (calculationType) {
      case 'current_fy':
        const currentFY = getCurrentFY();
        calculationStart = currentFY.start;
        calculationEnd = currentFY.end;
        type = `Current FY (${currentFY.label})`;
        break;
      case 'previous_fy':
        const previousFY = getPreviousFY();
        calculationStart = previousFY.start;
        calculationEnd = previousFY.end;
        type = `Previous FY (${previousFY.label})`;
        break;
      case 'next_fy':
        const nextFY = getNextFY();
        calculationStart = nextFY.start;
        calculationEnd = nextFY.end;
        type = `Next FY (${nextFY.label})`;
        break;
      case 'specific_fy':
        if (!specificFY) return;
        const fyStart = parseInt(specificFY);
        calculationStart = new Date(fyStart, 3, 1);
        calculationEnd = new Date(fyStart + 1, 2, 31);
        type = `FY ${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
        break;
      case 'custom':
      default:
        calculationStart = startDate;
        calculationEnd = endDate;
        type = `Custom (${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()})`;
        break;
    }

    onCalculate(calculationStart, calculationEnd, type);
  };

  const fyOptions = generateFYOptions();

  return (
    <Card className="glass-effect border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-blue-400" />
          Depreciation Calculation Date Range
        </CardTitle>
        <p className="text-sm text-gray-400">
          Select the date range for calculating asset depreciation values
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calculation Type Selection */}
        <div className="space-y-2">
          <Label className="text-white">Calculation Type</Label>
          <Select value={calculationType} onValueChange={(value: any) => setCalculationType(value)}>
            <SelectTrigger className="bg-black border-green-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-green-500/40">
              <SelectItem value="custom" className="text-white hover:bg-green-500/20">Custom Date Range</SelectItem>
              <SelectItem value="current_fy" className="text-white hover:bg-green-500/20">Current Financial Year</SelectItem>
              <SelectItem value="previous_fy" className="text-white hover:bg-green-500/20">Previous Financial Year</SelectItem>
              <SelectItem value="next_fy" className="text-white hover:bg-green-500/20">Next Financial Year</SelectItem>
              <SelectItem value="specific_fy" className="text-white hover:bg-green-500/20">Specific Financial Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Display */}
        <div className="p-3 bg-black/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-white font-medium">Selected Range:</span>
          </div>
          
          {calculationType === 'current_fy' && (
            <div className="text-sm text-gray-300">
              <Badge variant="outline" className="border-green-400 text-green-400 mb-2">Current FY</Badge>
              <div>{getCurrentFY().start.toLocaleDateString()} to {getCurrentFY().end.toLocaleDateString()}</div>
              <div className="text-xs text-gray-400">FY {getCurrentFY().label}</div>
            </div>
          )}
          
          {calculationType === 'previous_fy' && (
            <div className="text-sm text-gray-300">
              <Badge variant="outline" className="border-orange-400 text-orange-400 mb-2">Previous FY</Badge>
              <div>{getPreviousFY().start.toLocaleDateString()} to {getPreviousFY().end.toLocaleDateString()}</div>
              <div className="text-xs text-gray-400">FY {getPreviousFY().label}</div>
            </div>
          )}
          
          {calculationType === 'next_fy' && (
            <div className="text-sm text-gray-300">
              <Badge variant="outline" className="border-purple-400 text-purple-400 mb-2">Next FY</Badge>
              <div>{getNextFY().start.toLocaleDateString()} to {getNextFY().end.toLocaleDateString()}</div>
              <div className="text-xs text-gray-400">FY {getNextFY().label}</div>
            </div>
          )}
        </div>

        {/* Custom Date Range */}
        {calculationType === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Start Date</Label>
              <EnhancedDatePicker
                date={startDate}
                onDateChange={(date) => setStartDate(date || new Date())}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">End Date</Label>
              <EnhancedDatePicker
                date={endDate}
                onDateChange={(date) => setEndDate(date || new Date())}
                placeholder="Select end date"
                minDate={startDate}
              />
            </div>
          </div>
        )}

        {/* Specific FY Selection */}
        {calculationType === 'specific_fy' && (
          <div className="space-y-2">
            <Label className="text-white">Select Financial Year</Label>
            <Select value={specificFY} onValueChange={setSpecificFY}>
              <SelectTrigger className="bg-black border-green-500/30 text-white">
                <SelectValue placeholder="Select FY" />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-500/40">
                {fyOptions.map(fy => (
                  <SelectItem key={fy.value} value={fy.value} className="text-white hover:bg-green-500/20">
                    FY {fy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {specificFY && (
              <div className="text-sm text-gray-300 mt-2">
                <div>
                  {new Date(parseInt(specificFY), 3, 1).toLocaleDateString()} to {new Date(parseInt(specificFY) + 1, 2, 31).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-500/30 text-gray-400 hover:bg-gray-500/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCalculate}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            disabled={calculationType === 'specific_fy' && !specificFY}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Depreciation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepreciationDateSelector;
