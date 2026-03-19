
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Car, Computer, Book, Music, Dumbbell, Settings } from 'lucide-react';
import { FIXED_DEPRECIATION_RATES } from '@/lib/depreciation/constants';

interface AssetClass {
  name: string;
  rate: number;
  icon: React.ReactNode;
  color: string;
  description: string;
  examples: string[];
  applicableMethod: string;
}

interface AssetClassesSectionProps {
  selectedClass: string;
  onClassSelect: (assetClass: string) => void;
}

export const AssetClassesSection: React.FC<AssetClassesSectionProps> = ({
  selectedClass,
  onClassSelect
}) => {
  const assetClasses: AssetClass[] = [
    {
      name: 'Buildings',
      rate: FIXED_DEPRECIATION_RATES['Buildings'] || 5,
      icon: <Building className="w-5 h-5" />,
      color: 'bg-stone-500',
      description: 'Permanent structures and buildings',
      examples: ['Office buildings', 'Warehouses', 'Factories', 'Residential buildings'],
      applicableMethod: 'WDV Fixed Slab'
    },
    {
      name: 'Furniture and fixtures',
      rate: FIXED_DEPRECIATION_RATES['Furniture and fixtures'] || 25,
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-amber-500',
      description: 'Office furniture and fixed installations',
      examples: ['Desks', 'Chairs', 'Cabinets', 'Light fixtures', 'Air conditioners'],
      applicableMethod: 'WDV Fixed Slab'
    },
    {
      name: 'Scientific equipments',
      rate: FIXED_DEPRECIATION_RATES['Scientific equipments'] || 40,
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-cyan-500',
      description: 'Laboratory and research equipment',
      examples: ['Microscopes', 'Spectrometers', 'Lab instruments', 'Testing equipment'],
      applicableMethod: 'WDV Fixed Slab'
    },
    {
      name: 'Computers',
      rate: FIXED_DEPRECIATION_RATES['Computers'] || 40,
      icon: <Computer className="w-5 h-5" />,
      color: 'bg-blue-500',
      description: 'Computing devices and peripherals',
      examples: ['Laptops', 'Desktops', 'Servers', 'Printers', 'Monitors'],
      applicableMethod: 'WDV Fixed Slab'
    },
    {
      name: 'Library books',
      rate: FIXED_DEPRECIATION_RATES['Library books'] || 50,
      icon: <Book className="w-5 h-5" />,
      color: 'bg-green-500',
      description: 'Books and educational materials',
      examples: ['Textbooks', 'Reference books', 'Journals', 'Digital content'],
      applicableMethod: 'WDV Fixed Slab'
    },
    {
      name: 'Buses, vans, etc.',
      rate: FIXED_DEPRECIATION_RATES['Buses, vans, etc.'] || 30,
      icon: <Car className="w-5 h-5" />,
      color: 'bg-red-500',
      description: 'Commercial and heavy vehicles',
      examples: ['Buses', 'Vans', 'Trucks', 'Commercial vehicles'],
      applicableMethod: 'WDV Fixed Slab'
    },
    {
      name: 'Cars, scooters, etc.',
      rate: FIXED_DEPRECIATION_RATES['Cars, scooters, etc.'] || 25,
      icon: <Car className="w-5 h-5" />,
      color: 'bg-orange-500',
      description: 'Personal and light vehicles',
      examples: ['Cars', 'Scooters', 'Motorcycles', 'Personal vehicles'],
      applicableMethod: 'WDV Fixed Slab'
    },
    {
      name: 'Plant and machinery',
      rate: FIXED_DEPRECIATION_RATES['Plant and machinery'] || 20,
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-purple-500',
      description: 'Industrial equipment and machinery',
      examples: ['Manufacturing equipment', 'Production machinery', 'Industrial tools'],
      applicableMethod: 'WDV Fixed Slab'
    },
    {
      name: 'Musical Instruments',
      rate: FIXED_DEPRECIATION_RATES['Musical Instruments'] || 50,
      icon: <Music className="w-5 h-5" />,
      color: 'bg-pink-500',
      description: 'Musical instruments and audio equipment',
      examples: ['Pianos', 'Guitars', 'Sound systems', 'Recording equipment'],
      applicableMethod: 'WDV Fixed Slab'
    },
    {
      name: 'Sports equipments',
      rate: FIXED_DEPRECIATION_RATES['Sports equipments'] || 50,
      icon: <Dumbbell className="w-5 h-5" />,
      color: 'bg-emerald-500',
      description: 'Sports and fitness equipment',
      examples: ['Gym equipment', 'Sports gear', 'Fitness machines', 'Athletic equipment'],
      applicableMethod: 'WDV Fixed Slab'
    }
  ];

  return (
    <Card className="bg-card border">
      <CardHeader>
        <CardTitle>Asset Classes & Depreciation Rates</CardTitle>
        <CardDescription>
          Fixed depreciation rates as per Income Tax Act for different asset categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assetClasses.map((assetClass) => (
            <div
              key={assetClass.name}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedClass === assetClass.name
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onClassSelect(assetClass.name)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 ${assetClass.color} text-white rounded-md`}>
                  {assetClass.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{assetClass.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {assetClass.rate}% per annum
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{assetClass.description}</p>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium mb-1">Examples:</p>
                  <div className="flex flex-wrap gap-1">
                    {assetClass.examples.map((example, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Applicable Method: <span className="font-medium">{assetClass.applicableMethod}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
