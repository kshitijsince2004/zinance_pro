
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ITActSlab {
  id: string;
  assetClass: string;
  category: string;
  depreciationRate: number;
  ruleType: 'half_year' | 'full_year';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ITActSlabFormProps {
  slab?: ITActSlab | null;
  onSubmit: (data: Omit<ITActSlab, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const ITActSlabForm: React.FC<ITActSlabFormProps> = ({
  slab,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    assetClass: '',
    category: '',
    depreciationRate: 0,
    ruleType: 'half_year' as 'half_year' | 'full_year',
    notes: ''
  });

  useEffect(() => {
    if (slab) {
      setFormData({
        assetClass: slab.assetClass,
        category: slab.category,
        depreciationRate: slab.depreciationRate,
        ruleType: slab.ruleType,
        notes: slab.notes || ''
      });
    }
  }, [slab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assetClass || !formData.category || formData.depreciationRate <= 0) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assetClass" className="text-gray-300">Asset Class</Label>
          <Input
            id="assetClass"
            value={formData.assetClass}
            onChange={(e) => setFormData(prev => ({ ...prev, assetClass: e.target.value }))}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="e.g., Computer, Furniture"
            required
          />
        </div>
        <div>
          <Label htmlFor="category" className="text-gray-300">Category Description</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="e.g., Computers including software"
            required
          />
        </div>
        <div>
          <Label htmlFor="depreciationRate" className="text-gray-300">Depreciation Rate (%)</Label>
          <Input
            id="depreciationRate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.depreciationRate}
            onChange={(e) => setFormData(prev => ({ ...prev, depreciationRate: parseFloat(e.target.value) || 0 }))}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="ruleType" className="text-gray-300">Rule Type</Label>
          <Select value={formData.ruleType} onValueChange={(value: 'half_year' | 'full_year') => 
            setFormData(prev => ({ ...prev, ruleType: value }))
          }>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="half_year">Half Year Rule</SelectItem>
              <SelectItem value="full_year">Full Year Rule</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes" className="text-gray-300">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="Additional notes or references..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-black"
        >
          {slab ? 'Update Slab' : 'Create Slab'}
        </Button>
      </div>
    </form>
  );
};
