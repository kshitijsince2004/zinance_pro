
import React, { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { assetService, Asset } from '@/lib/assets';
import { depreciationCalculator } from '@/lib/depreciation/calculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalculatorInputs from '@/components/calculations/CalculatorInputs';
import CalculationResults from '@/components/calculations/CalculationResults';
import { AdvancedMethodsSection } from '@/components/calculations/AdvancedMethodsSection';
import { AdvancedAssetClassesSection } from '@/components/calculations/AdvancedAssetClassesSection';
import { AdvancedSettingsSection } from '@/components/calculations/AdvancedSettingsSection';
import { Calculator, Settings, Building2, Wrench } from 'lucide-react';

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

const Calculations = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState('SLM');
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('Computers');
  const [dayInterval, setDayInterval] = useState<number>(30);
  const [calculationType, setCalculationType] = useState<'calculator' | 'methods' | 'asset-classes' | 'settings'>('calculator');
  
  const [calculatorInputs, setCalculatorInputs] = useState({
    cost: '',
    residualValue: '',
    usefulLifeYears: '5',
    usefulLifeDays: '',
    usefulLifeUnit: 'years',
    purchaseDate: new Date(),
    calculationDate: new Date(),
    totalCapacity: '',
    unitsProduced: ''
  });
  
  const [calculationResult, setCalculationResult] = useState<DetailedResult | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = () => {
    const allAssets = assetService.getAllAssets();
    setAssets(allAssets);
  };

  const loadAssetData = () => {
    if (!selectedAsset) {
      toast({
        title: 'No Asset Selected',
        description: 'Please select an asset to load.',
        variant: 'destructive'
      });
      return;
    }
    
    const asset = assets.find(a => a.id === selectedAsset);
    if (asset) {
      setCalculatorInputs({
        cost: asset.purchasePrice.toString(),
        residualValue: asset.residualValue.toString(),
        usefulLifeYears: asset.usefulLife?.toString() || '5',
        usefulLifeDays: '',
        usefulLifeUnit: 'years',
        purchaseDate: new Date(asset.purchaseDate),
        calculationDate: new Date(),
        totalCapacity: asset.productionCapacity?.toString() || '',
        unitsProduced: asset.unitsProduced?.toString() || ''
      });
      
      // Update method based on asset's depreciation method
      if (asset.depreciationMethod) {
        setSelectedMethod(asset.depreciationMethod);
      }
      
      toast({
        title: 'Asset Data Loaded',
        description: `Loaded data for ${asset.name}`
      });
    }
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    // Update calculator inputs if needed
    if (selectedAsset) {
      const asset = assets.find(a => a.id === selectedAsset);
      if (asset) {
        // Update the asset's depreciation method in the calculator
        setCalculatorInputs(prev => ({ ...prev }));
      }
    }
  };

  const handleAssetClassSelect = (assetClass: string) => {
    setSelectedAssetClass(assetClass);
    // Auto-select WDV_FIXED_SLAB method for asset classes
    setSelectedMethod('WDV_FIXED_SLAB');
    
    toast({
      title: 'Asset Class Selected',
      description: `Selected ${assetClass} with WDV Fixed Slab method`
    });
  };

  const getUsefulLifeInYears = (): number => {
    if (calculatorInputs.usefulLifeUnit === 'days') {
      return parseFloat(calculatorInputs.usefulLifeDays) / 365.25 || 5;
    }
    return parseFloat(calculatorInputs.usefulLifeYears) || 5;
  };

  // FIXED: Ensure proper date calculation using date-fns
  const getDaysElapsed = (): number => {
    return Math.max(0, differenceInDays(calculatorInputs.calculationDate, calculatorInputs.purchaseDate));
  };

  const getYearsElapsed = (): number => {
    return getDaysElapsed() / 365.25;
  };

  const calculateDepreciationDetailed = (): DetailedResult => {
    const cost = parseFloat(calculatorInputs.cost) || 0;
    const residualValue = parseFloat(calculatorInputs.residualValue) || 0;
    const usefulLifeYears = getUsefulLifeInYears();
    const daysElapsed = getDaysElapsed();
    const yearsElapsed = getYearsElapsed();
    const totalCapacity = parseInt(calculatorInputs.totalCapacity) || 1000;
    const unitsProduced = parseInt(calculatorInputs.unitsProduced) || 0;

    const steps: CalculationStep[] = [];
    let finalValue = cost;
    let totalDepreciation = 0;

    console.log(`Calculating ${selectedMethod} depreciation:`, {
      cost,
      residualValue,
      usefulLifeYears,
      daysElapsed,
      yearsElapsed,
      totalCapacity,
      unitsProduced
    });

    if (selectedMethod === 'SLM') {
      const depreciableAmount = Math.max(cost - residualValue, 0);
      const annualDepreciation = depreciableAmount / usefulLifeYears;
      const dailyDepreciation = annualDepreciation / 365.25;
      totalDepreciation = Math.min(dailyDepreciation * daysElapsed, depreciableAmount);
      finalValue = Math.max(cost - totalDepreciation, residualValue);

      steps.push(
        {
          step: 1,
          description: 'Calculate Depreciable Amount',
          formula: 'Depreciable Amount = Cost - Residual Value',
          calculation: `₹${cost.toLocaleString()} - ₹${residualValue.toLocaleString()}`,
          result: depreciableAmount
        },
        {
          step: 2,
          description: 'Calculate Annual Depreciation',
          formula: 'Annual Depreciation = Depreciable Amount ÷ Useful Life',
          calculation: `₹${depreciableAmount.toLocaleString()} ÷ ${usefulLifeYears.toFixed(2)} years`,
          result: annualDepreciation
        },
        {
          step: 3,
          description: 'Calculate Daily Depreciation',
          formula: 'Daily Depreciation = Annual Depreciation ÷ 365.25',
          calculation: `₹${annualDepreciation.toLocaleString()} ÷ 365.25 days`,
          result: dailyDepreciation
        },
        {
          step: 4,
          description: 'Calculate Total Depreciation',
          formula: 'Total Depreciation = Daily Depreciation × Days Elapsed',
          calculation: `₹${dailyDepreciation.toFixed(2)} × ${daysElapsed} days`,
          result: totalDepreciation
        },
        {
          step: 5,
          description: 'Calculate Current Book Value',
          formula: 'Book Value = Cost - Total Depreciation',
          calculation: `₹${cost.toLocaleString()} - ₹${totalDepreciation.toLocaleString()}`,
          result: finalValue
        }
      );

    } else if (selectedMethod === 'WDV') {
      finalValue = depreciationCalculator.calculateWDVCurrentValueDateToDate(cost, residualValue, usefulLifeYears, calculatorInputs.purchaseDate, calculatorInputs.calculationDate);
      totalDepreciation = cost - finalValue;
      const rate = depreciationCalculator.calculateWDVRate(cost, residualValue, usefulLifeYears);

      steps.push(
        {
          step: 1,
          description: 'Calculate WDV Rate',
          formula: 'Rate = [1 - (Residual Value ÷ Cost)^(1÷Useful Life)] × 100',
          calculation: `[1 - (₹${residualValue} ÷ ₹${cost})^(1÷${usefulLifeYears.toFixed(2)})] × 100`,
          result: rate
        },
        {
          step: 2,
          description: 'Apply Day-to-Day Depreciation',
          formula: 'Daily Rate = Annual Rate ÷ 365.25',
          calculation: `${rate.toFixed(4)}% ÷ 365.25 = ${(rate/365.25).toFixed(6)}%`,
          result: rate / 365.25
        },
        {
          step: 3,
          description: 'Calculate Book Value',
          formula: 'Book Value = Cost × (1 - Daily Rate)^Days',
          calculation: `₹${cost} × (1 - ${(rate/365.25/100).toFixed(6)})^${daysElapsed}`,
          result: finalValue
        }
      );

    } else if (selectedMethod === 'WDV_FIXED_SLAB') {
      finalValue = depreciationCalculator.calculateWDVFixedSlabCurrentValue(
        cost, 
        selectedAssetClass, 
        calculatorInputs.purchaseDate.toISOString().split('T')[0],
        calculatorInputs.calculationDate.toISOString().split('T')[0]
      );
      totalDepreciation = cost - finalValue;

      steps.push(
        {
          step: 1,
          description: `Apply Fixed Slab Rate for ${selectedAssetClass}`,
          formula: 'Rate = Fixed Rate as per Income Tax Act',
          calculation: 'Financial year-based calculation',
          result: 20
        },
        {
          step: 2,
          description: 'Calculate Final Book Value',
          formula: 'Applied annually for financial years elapsed',
          calculation: `From ${calculatorInputs.purchaseDate.toDateString()} to ${calculatorInputs.calculationDate.toDateString()}`,
          result: finalValue
        }
      );

    } else if (selectedMethod === 'UNITS') {
      finalValue = depreciationCalculator.calculateUnitsCurrentValue(cost, residualValue, totalCapacity, unitsProduced);
      totalDepreciation = cost - finalValue;
      const ratePerUnit = (cost - residualValue) / totalCapacity;

      steps.push(
        {
          step: 1,
          description: 'Calculate Rate per Unit',
          formula: 'Rate per Unit = (Cost - Residual Value) ÷ Total Capacity',
          calculation: `(₹${cost} - ₹${residualValue}) ÷ ${totalCapacity}`,
          result: ratePerUnit
        },
        {
          step: 2,
          description: 'Calculate Total Depreciation',
          formula: 'Total Depreciation = Rate per Unit × Units Produced',
          calculation: `₹${ratePerUnit.toFixed(2)} × ${unitsProduced}`,
          result: totalDepreciation
        },
        {
          step: 3,
          description: 'Calculate Book Value',
          formula: 'Book Value = Cost - Total Depreciation',
          calculation: `₹${cost} - ₹${totalDepreciation}`,
          result: finalValue
        }
      );

    } else if (selectedMethod === 'DOUBLE_DECLINING') {
      finalValue = depreciationCalculator.calculateDoubleDecliningCurrentValueDateToDate(cost, residualValue, usefulLifeYears, calculatorInputs.purchaseDate, calculatorInputs.calculationDate);
      totalDepreciation = cost - finalValue;
      const rate = (2 / usefulLifeYears) * 100;

      steps.push(
        {
          step: 1,
          description: 'Calculate Double Declining Rate',
          formula: 'Rate = (2 ÷ Useful Life) × 100',
          calculation: `(2 ÷ ${usefulLifeYears.toFixed(2)}) × 100`,
          result: rate
        },
        {
          step: 2,
          description: 'Apply Day-to-Day Depreciation',
          formula: 'Daily Rate = Annual Rate ÷ 365.25',
          calculation: `${rate.toFixed(4)}% ÷ 365.25`,
          result: rate / 365.25
        },
        {
          step: 3,
          description: 'Calculate Book Value',
          formula: 'Book Value = Cost × (1 - Daily Rate)^Days',
          calculation: `₹${cost} × (1 - ${(rate/365.25/100).toFixed(6)})^${daysElapsed}`,
          result: finalValue
        }
      );

    } else if (selectedMethod === 'SUM_OF_YEARS') {
      finalValue = depreciationCalculator.calculateSumOfYearsCurrentValueDateToDate(cost, residualValue, usefulLifeYears, calculatorInputs.purchaseDate, calculatorInputs.calculationDate);
      totalDepreciation = cost - finalValue;
      const sumOfYears = (usefulLifeYears * (usefulLifeYears + 1)) / 2;

      steps.push(
        {
          step: 1,
          description: 'Calculate Sum of Years',
          formula: 'Sum = n × (n + 1) ÷ 2',
          calculation: `${usefulLifeYears.toFixed(2)} × (${usefulLifeYears.toFixed(2)} + 1) ÷ 2`,
          result: sumOfYears
        },
        {
          step: 2,
          description: 'Apply Day-to-Day Calculation',
          formula: 'Interpolated daily depreciation based on remaining life',
          calculation: `For ${daysElapsed} days elapsed`,
          result: totalDepreciation
        },
        {
          step: 3,
          description: 'Calculate Book Value',
          formula: 'Book Value = Cost - Total Depreciation',
          calculation: `₹${cost} - ₹${totalDepreciation}`,
          result: finalValue
        }
      );
    }

    return {
      method: selectedMethod,
      steps,
      finalValue: Math.round(finalValue),
      totalDepreciation: Math.round(totalDepreciation)
    };
  };

  const calculateDepreciation = () => {
    const cost = parseFloat(calculatorInputs.cost) || 0;

    if (!cost) {
      toast({
        title: 'Missing Values',
        description: 'Please enter the asset cost.',
        variant: 'destructive'
      });
      return;
    }

    const result = calculateDepreciationDetailed();
    setCalculationResult(result);

    console.log('Calculation completed:', result);

    toast({
      title: 'Calculation Complete',
      description: `Final Book Value: ₹${result.finalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Depreciation Calculations</h1>
          <p className="text-gray-300">Calculate asset depreciation with detailed step-by-step breakdown</p>
        </div>
      </div>

      <Tabs value={calculationType} onValueChange={(value) => setCalculationType(value as typeof calculationType)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="methods" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Methods
          </TabsTrigger>
          <TabsTrigger value="asset-classes" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Asset Classes
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <CalculatorInputs
              assets={assets}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              selectedMethod={selectedMethod}
              setSelectedMethod={setSelectedMethod}
              calculatorInputs={calculatorInputs}
              setCalculatorInputs={setCalculatorInputs}
              onLoadAssetData={loadAssetData}
              onCalculate={calculateDepreciation}
              getDaysElapsed={getDaysElapsed}
              getYearsElapsed={getYearsElapsed}
            />
            
            <CalculationResults calculationResult={calculationResult} />
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <AdvancedMethodsSection 
            selectedMethod={selectedMethod}
            onMethodSelect={handleMethodSelect}
          />
        </TabsContent>

        <TabsContent value="asset-classes" className="space-y-6">
          <AdvancedAssetClassesSection 
            selectedClass={selectedAssetClass}
            onClassSelect={handleAssetClassSelect}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AdvancedSettingsSection 
            dayInterval={dayInterval}
            onDayIntervalChange={setDayInterval}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Calculations;
