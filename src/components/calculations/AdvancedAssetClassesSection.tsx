
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building, Settings, Edit, Plus, Trash2, Save, Calculator } from 'lucide-react';
import { FIXED_DEPRECIATION_RATES } from '@/lib/depreciation/constants';

interface AssetClass {
  id: string;
  name: string;
  category: string;
  wdvFixedRate?: number;
  companyActRate?: number;
  applicableMethods: string[];
  description: string;
  examples: string[];
  isCustom: boolean;
}

interface AdvancedAssetClassesSectionProps {
  selectedClass: string;
  onClassSelect: (assetClass: string) => void;
}

export const AdvancedAssetClassesSection: React.FC<AdvancedAssetClassesSectionProps> = ({
  selectedClass,
  onClassSelect
}) => {
  const { toast } = useToast();
  const [editingClass, setEditingClass] = useState<AssetClass | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('wdv-fixed');
  
  const [assetClasses, setAssetClasses] = useState<AssetClass[]>([
    {
      id: 'buildings',
      name: 'Buildings',
      category: 'Infrastructure',
      wdvFixedRate: FIXED_DEPRECIATION_RATES['Buildings'] || 5,
      companyActRate: 5,
      applicableMethods: ['WDV_FIXED_SLAB', 'SLM', 'WDV'],
      description: 'Permanent structures and buildings',
      examples: ['Office buildings', 'Warehouses', 'Factories'],
      isCustom: false
    },
    {
      id: 'furniture',
      name: 'Furniture and fixtures',
      category: 'Office Equipment',
      wdvFixedRate: FIXED_DEPRECIATION_RATES['Furniture and fixtures'] || 25,
      companyActRate: 18.1,
      applicableMethods: ['WDV_FIXED_SLAB', 'SLM', 'WDV'],
      description: 'Office furniture and fixed installations',
      examples: ['Desks', 'Chairs', 'Cabinets', 'Light fixtures'],
      isCustom: false
    },
    {
      id: 'computers',
      name: 'Computers',
      category: 'Technology',
      wdvFixedRate: FIXED_DEPRECIATION_RATES['Computers'] || 40,
      companyActRate: 40,
      applicableMethods: ['WDV_FIXED_SLAB', 'SLM', 'WDV', 'DOUBLE_DECLINING'],
      description: 'Computing devices and peripherals',
      examples: ['Laptops', 'Desktops', 'Servers', 'Printers'],
      isCustom: false
    },
    {
      id: 'vehicles-heavy',
      name: 'Buses, vans, etc.',
      category: 'Vehicles',
      wdvFixedRate: FIXED_DEPRECIATION_RATES['Buses, vans, etc.'] || 30,
      companyActRate: 25,
      applicableMethods: ['WDV_FIXED_SLAB', 'SLM', 'WDV', 'UNITS'],
      description: 'Commercial and heavy vehicles',
      examples: ['Buses', 'Vans', 'Trucks'],
      isCustom: false
    },
    {
      id: 'vehicles-light',
      name: 'Cars, scooters, etc.',
      category: 'Vehicles',
      wdvFixedRate: FIXED_DEPRECIATION_RATES['Cars, scooters, etc.'] || 25,
      companyActRate: 18.1,
      applicableMethods: ['WDV_FIXED_SLAB', 'SLM', 'WDV', 'UNITS'],
      description: 'Personal and light vehicles',
      examples: ['Cars', 'Scooters', 'Motorcycles'],
      isCustom: false
    },
    {
      id: 'machinery',
      name: 'Plant and machinery',
      category: 'Manufacturing',
      wdvFixedRate: FIXED_DEPRECIATION_RATES['Plant and machinery'] || 20,
      companyActRate: 15,
      applicableMethods: ['WDV_FIXED_SLAB', 'SLM', 'WDV', 'UNITS'],
      description: 'Industrial equipment and machinery',
      examples: ['Manufacturing equipment', 'Production machinery'],
      isCustom: false
    }
  ]);

  const handleEditClass = (assetClass: AssetClass) => {
    setEditingClass({ ...assetClass });
    setIsDialogOpen(true);
  };

  const handleSaveClass = () => {
    if (!editingClass) return;
    
    if (!assetClasses.find(c => c.id === editingClass.id)) {
      setAssetClasses(prev => [...prev, editingClass]);
    } else {
      setAssetClasses(prev => prev.map(cls => 
        cls.id === editingClass.id ? editingClass : cls
      ));
    }
    
    setIsDialogOpen(false);
    setEditingClass(null);
    
    toast({
      title: 'Asset Class Updated',
      description: `${editingClass.name} has been successfully updated.`
    });
  };

  const handleAddClass = () => {
    const newClass: AssetClass = {
      id: `custom_${Date.now()}`,
      name: 'New Asset Class',
      category: 'Custom',
      wdvFixedRate: 20,
      companyActRate: 15,
      applicableMethods: ['SLM', 'WDV'],
      description: 'Custom asset class',
      examples: [],
      isCustom: true
    };
    
    setEditingClass(newClass);
    setIsDialogOpen(true);
  };

  const handleDeleteClass = (classId: string) => {
    const assetClass = assetClasses.find(c => c.id === classId);
    if (!assetClass?.isCustom) {
      toast({
        title: 'Cannot Delete',
        description: 'Standard asset classes cannot be deleted.',
        variant: 'destructive'
      });
      return;
    }
    
    setAssetClasses(prev => prev.filter(cls => cls.id !== classId));
    toast({
      title: 'Asset Class Deleted',
      description: 'Custom asset class has been deleted.'
    });
  };

  const wdvFixedClasses = assetClasses.filter(cls => cls.applicableMethods.includes('WDV_FIXED_SLAB'));
  const otherMethodClasses = assetClasses.filter(cls => !cls.applicableMethods.includes('WDV_FIXED_SLAB') || cls.applicableMethods.length > 1);

  return (
    <Card className="bg-card border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Advanced Asset Classes Management
            </CardTitle>
            <CardDescription>
              Configure asset classes and their depreciation rates
            </CardDescription>
          </div>
          <Button onClick={handleAddClass}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset Class
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wdv-fixed">WDV Fixed Slab Classes</TabsTrigger>
            <TabsTrigger value="other-methods">Other Method Classes</TabsTrigger>
          </TabsList>

          <TabsContent value="wdv-fixed" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">WDV Fixed Slab Asset Classes</h3>
              <p className="text-sm text-muted-foreground">
                Asset classes with fixed depreciation rates as per Income Tax Act
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Class</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Fixed Rate (%)</TableHead>
                    <TableHead>Examples</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wdvFixedClasses.map((assetClass) => (
                    <TableRow key={assetClass.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assetClass.name}</p>
                          <p className="text-sm text-muted-foreground">{assetClass.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assetClass.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/10 text-primary">
                          {assetClass.wdvFixedRate}% per annum
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {assetClass.examples.slice(0, 3).map((example, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {example}
                            </Badge>
                          ))}
                          {assetClass.examples.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{assetClass.examples.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onClassSelect(assetClass.name)}
                            className={selectedClass === assetClass.name ? 'bg-primary/10' : ''}
                          >
                            Select
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClass(assetClass)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {assetClass.isCustom && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClass(assetClass.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="other-methods" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Asset Classes for Other Methods</h3>
              <p className="text-sm text-muted-foreground">
                Asset classes with Company Act rates and multiple applicable methods
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Class</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Company Act Rate (%)</TableHead>
                    <TableHead>Applicable Methods</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetClasses.map((assetClass) => (
                    <TableRow key={assetClass.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assetClass.name}</p>
                          <p className="text-sm text-muted-foreground">{assetClass.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assetClass.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-600">
                          {assetClass.companyActRate}% per annum
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {assetClass.applicableMethods.map((method, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onClassSelect(assetClass.name)}
                            className={selectedClass === assetClass.name ? 'bg-primary/10' : ''}
                          >
                            Select
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClass(assetClass)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {assetClass.isCustom && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClass(assetClass.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingClass && !assetClasses.find(c => c.id === editingClass.id) ? 'Add New Asset Class' : 'Edit Asset Class'}
              </DialogTitle>
              <DialogDescription>
                Configure the asset class parameters and applicable methods
              </DialogDescription>
            </DialogHeader>
            
            {editingClass && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="className">Asset Class Name</Label>
                    <Input
                      id="className"
                      value={editingClass.name}
                      onChange={(e) => setEditingClass(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={editingClass.category}
                      onValueChange={(value) => setEditingClass(prev => prev ? { ...prev, category: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="Office Equipment">Office Equipment</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Vehicles">Vehicles</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editingClass.description}
                    onChange={(e) => setEditingClass(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wdvRate">WDV Fixed Rate (%)</Label>
                    <Input
                      id="wdvRate"
                      type="number"
                      value={editingClass.wdvFixedRate || ''}
                      onChange={(e) => setEditingClass(prev => prev ? { ...prev, wdvFixedRate: parseFloat(e.target.value) || 0 } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyRate">Company Act Rate (%)</Label>
                    <Input
                      id="companyRate"
                      type="number"
                      value={editingClass.companyActRate || ''}
                      onChange={(e) => setEditingClass(prev => prev ? { ...prev, companyActRate: parseFloat(e.target.value) || 0 } : null)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Examples (comma-separated)</Label>
                  <Input
                    value={editingClass.examples.join(', ')}
                    onChange={(e) => setEditingClass(prev => prev ? { 
                      ...prev, 
                      examples: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    } : null)}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveClass}>
                <Save className="w-4 h-4 mr-2" />
                Save Asset Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
