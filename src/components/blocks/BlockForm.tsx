
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Block } from '@/types/blocks';

interface ITActSlab {
  id: string;
  assetClass: string;
  category: string;
  depreciationRate: number;
  ruleType: 'half_year' | 'full_year';
  notes?: string;
}

interface BlockFormProps {
  block?: Block | null;
  itActSlabs: ITActSlab[];
  availableCompanies: string[];
  availableDepartments: string[];
  onSubmit: (data: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const BlockForm: React.FC<BlockFormProps> = ({
  block,
  itActSlabs,
  availableCompanies,
  availableDepartments,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    depreciationRate: 0,
    slabId: '',
    assetClass: '',
    category: '',
    tags: [] as string[],
    notes: '',
    isActive: true,
    groupingCriteria: {
      company: '',
      department: '',
      location: '',
      costCenter: '',
      customField1: '',
      customField2: ''
    }
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (block) {
      setFormData({
        name: block.name,
        code: block.code || '',
        depreciationRate: block.depreciationRate,
        slabId: block.slabId || '',
        assetClass: block.assetClass || '',
        category: block.category || '',
        tags: block.tags || [],
        notes: block.notes || '',
        isActive: block.isActive,
        groupingCriteria: {
          company: block.groupingCriteria?.company || '',
          department: block.groupingCriteria?.department || '',
          location: block.groupingCriteria?.location || '',
          costCenter: block.groupingCriteria?.costCenter || '',
          customField1: block.groupingCriteria?.customField1 || '',
          customField2: block.groupingCriteria?.customField2 || ''
        }
      });
    }
  }, [block]);

  const handleSlabChange = (slabId: string) => {
    const selectedSlab = itActSlabs.find(slab => slab.id === slabId);
    if (selectedSlab) {
      setFormData(prev => ({
        ...prev,
        slabId,
        assetClass: selectedSlab.assetClass,
        category: selectedSlab.category,
        depreciationRate: selectedSlab.depreciationRate
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Block Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter block name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Block Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Enter block code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slab">IT Act Slab</Label>
              <Select value={formData.slabId} onValueChange={handleSlabChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select IT Act slab" />
                </SelectTrigger>
                <SelectContent>
                  {itActSlabs.map(slab => (
                    <SelectItem key={slab.id} value={slab.id}>
                      {slab.assetClass} - {slab.depreciationRate}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="depreciationRate">Depreciation Rate (%)</Label>
              <Input
                id="depreciationRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.depreciationRate}
                onChange={(e) => setFormData(prev => ({ ...prev, depreciationRate: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter depreciation rate"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active Block</Label>
            </div>
          </CardContent>
        </Card>

        {/* Grouping Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grouping Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select 
                value={formData.groupingCriteria.company} 
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  groupingCriteria: { ...prev.groupingCriteria, company: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No filter</SelectItem>
                  {availableCompanies.map(company => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={formData.groupingCriteria.department} 
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  groupingCriteria: { ...prev.groupingCriteria, department: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No filter</SelectItem>
                  {availableDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.groupingCriteria.location}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  groupingCriteria: { ...prev.groupingCriteria, location: e.target.value }
                }))}
                placeholder="Enter location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costCenter">Cost Center</Label>
              <Input
                id="costCenter"
                value={formData.groupingCriteria.costCenter}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  groupingCriteria: { ...prev.groupingCriteria, costCenter: e.target.value }
                }))}
                placeholder="Enter cost center"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags and Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter additional notes"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {block ? 'Update Block' : 'Create Block'}
        </Button>
      </div>
    </form>
  );
};
