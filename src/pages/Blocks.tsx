
import React, { useState, useEffect } from 'react';
import { BlockManagement } from '@/components/blocks/BlockManagement';
import { Asset } from '@/types/asset';

interface ITActSlab {
  id: string;
  assetClass: string;
  category: string;
  depreciationRate: number;
  ruleType: 'half_year' | 'full_year';
  notes?: string;
}

const Blocks = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [itActSlabs, setItActSlabs] = useState<ITActSlab[]>([]);
  const [selectedFY, setSelectedFY] = useState<string>('2024-25');

  useEffect(() => {
    // Load assets from localStorage
    const storedAssets = localStorage.getItem('assets');
    if (storedAssets) {
      setAssets(JSON.parse(storedAssets));
    }

    // Load IT Act slabs from localStorage
    const storedSlabs = localStorage.getItem('itActSlabs');
    if (storedSlabs) {
      setItActSlabs(JSON.parse(storedSlabs));
    } else {
      // Default slabs if none exist
      const defaultSlabs: ITActSlab[] = [
        {
          id: 'slab-1',
          assetClass: 'Computer',
          category: 'IT Equipment',
          depreciationRate: 60,
          ruleType: 'half_year',
          notes: 'Computers and peripherals'
        },
        {
          id: 'slab-2',
          assetClass: 'Furniture',
          category: 'Office Equipment',
          depreciationRate: 10,
          ruleType: 'half_year',
          notes: 'Office furniture and fixtures'
        }
      ];
      setItActSlabs(defaultSlabs);
      localStorage.setItem('itActSlabs', JSON.stringify(defaultSlabs));
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Asset Blocks</h1>
        <p className="text-muted-foreground">
          Group assets into blocks for depreciation calculations and reporting
        </p>
      </div>
      
      <BlockManagement 
        assets={assets}
        itActSlabs={itActSlabs}
        selectedFY={selectedFY}
      />
    </div>
  );
};

export default Blocks;
