
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingDown, BarChart3, Activity, Zap, Timer } from 'lucide-react';

interface Method {
  id: string;
  name: string;
  description: string;
  formula: string;
  icon: React.ReactNode;
  color: string;
  advantages: string[];
  disadvantages: string[];
  bestFor: string[];
}

interface MethodsSectionProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
}

export const MethodsSection: React.FC<MethodsSectionProps> = ({
  selectedMethod,
  onMethodSelect
}) => {
  const methods: Method[] = [
    {
      id: 'SLM',
      name: 'Straight Line Method',
      description: 'Equal depreciation amount each year',
      formula: 'Annual Depreciation = (Cost - Residual Value) / Useful Life',
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'bg-blue-500',
      advantages: ['Simple to calculate', 'Equal expense each period', 'Predictable'],
      disadvantages: ['May not reflect actual usage', 'Ignores maintenance costs'],
      bestFor: ['Assets with consistent usage', 'Simple accounting needs']
    },
    {
      id: 'WDV',
      name: 'Written Down Value',
      description: 'Higher depreciation in early years',
      formula: 'Rate = [1 - (Residual Value / Cost)^(1/Life)] × 100',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-green-500',
      advantages: ['Reflects actual asset value decline', 'Tax benefits early'],
      disadvantages: ['Complex calculation', 'Lower depreciation later'],
      bestFor: ['Technology assets', 'Vehicles', 'Equipment']
    },
    {
      id: 'WDV_FIXED_SLAB',
      name: 'WDV Fixed Slab',
      description: 'Fixed rates as per Income Tax Act',
      formula: 'Depreciation = Opening Value × Fixed Rate',
      icon: <Calculator className="w-5 h-5" />,
      color: 'bg-purple-500',
      advantages: ['Standardized rates', 'Tax compliance', 'Simple application'],
      disadvantages: ['Fixed rates may not suit all assets', 'Limited flexibility'],
      bestFor: ['Tax purposes', 'Compliance requirements', 'Standard asset categories']
    },
    {
      id: 'UNITS',
      name: 'Production Unit Method',
      description: 'Based on actual usage/production',
      formula: 'Depreciation = (Cost - Residual) × Units Used / Total Units',
      icon: <Activity className="w-5 h-5" />,
      color: 'bg-orange-500',
      advantages: ['Matches actual usage', 'Fair allocation', 'Variable with production'],
      disadvantages: ['Requires usage tracking', 'Complex administration'],
      bestFor: ['Manufacturing equipment', 'Vehicles by mileage', 'Production machinery']
    },
    {
      id: 'DOUBLE_DECLINING',
      name: 'Double Declining Balance',
      description: 'Accelerated depreciation method',
      formula: 'Rate = (2 / Useful Life) × 100, Depreciation = Book Value × Rate',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-red-500',
      advantages: ['Higher early depreciation', 'Tax advantages', 'Reflects technology obsolescence'],
      disadvantages: ['Complex calculation', 'May over-depreciate'],
      bestFor: ['Technology assets', 'Equipment with rapid obsolescence']
    },
    {
      id: 'SUM_OF_YEARS',
      name: 'Sum of Years Digits',
      description: 'Decreasing depreciation over time',
      formula: 'Fraction = Remaining Life / Sum of Years, Depreciation = Fraction × Depreciable Base',
      icon: <Timer className="w-5 h-5" />,
      color: 'bg-indigo-500',
      advantages: ['Gradual decline', 'Higher early depreciation', 'Systematic approach'],
      disadvantages: ['Complex calculation', 'Less common'],
      bestFor: ['Assets with declining efficiency', 'Equipment with maintenance costs']
    }
  ];

  return (
    <Card className="bg-card border">
      <CardHeader>
        <CardTitle>Depreciation Methods</CardTitle>
        <CardDescription>
          Choose the most appropriate depreciation method for your calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map((method) => (
            <div
              key={method.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedMethod === method.id
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onMethodSelect(method.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 ${method.color} text-white rounded-md`}>
                  {method.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{method.name}</h4>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-2 bg-accent/30 rounded text-xs">
                  <strong>Formula:</strong> {method.formula}
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-green-600 mb-1">Advantages:</p>
                    <ul className="text-xs space-y-1">
                      {method.advantages.map((adv, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-green-500">•</span>
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-red-600 mb-1">Disadvantages:</p>
                    <ul className="text-xs space-y-1">
                      {method.disadvantages.map((dis, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-red-500">•</span>
                          <span>{dis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-blue-600 mb-1">Best For:</p>
                    <div className="flex flex-wrap gap-1">
                      {method.bestFor.map((use, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedMethod === method.id && (
                <Button size="sm" className="w-full mt-3" variant="default">
                  Selected Method
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
