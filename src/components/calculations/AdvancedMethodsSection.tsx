
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Calculator, TrendingDown, BarChart3, Activity, Zap, Timer, Edit, Plus, Trash2, Save, Settings, Eye, EyeOff } from 'lucide-react';

interface DepreciationMethod {
  id: string;
  name: string;
  shortCode: string;
  description: string;
  formula: string;
  detailedFormula: string;
  isEnabled: boolean;
  isCustom: boolean;
  applicableFor: string[];
  parameters: Record<string, any>;
  companyActCompliant: boolean;
  icon: React.ReactNode;
  color: string;
}

interface AdvancedMethodsSectionProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
}

export const AdvancedMethodsSection: React.FC<AdvancedMethodsSectionProps> = ({
  selectedMethod,
  onMethodSelect
}) => {
  const { toast } = useToast();
  const [editingMethod, setEditingMethod] = useState<DepreciationMethod | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFormulas, setShowFormulas] = useState(true);
  
  const [methods, setMethods] = useState<DepreciationMethod[]>([
    {
      id: 'SLM',
      name: 'Straight Line Method',
      shortCode: 'SLM',
      description: 'Equal depreciation amount each year',
      formula: 'Annual Depreciation = (Cost - Residual Value) / Useful Life',
      detailedFormula: 'Daily Depreciation = Annual Depreciation / 365.25\nTotal Depreciation = Daily Depreciation × Days Elapsed\nBook Value = Cost - Total Depreciation',
      isEnabled: true,
      isCustom: false,
      applicableFor: ['All Assets'],
      parameters: { requiresResidualValue: true, requiresUsefulLife: true },
      companyActCompliant: true,
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'WDV',
      name: 'Written Down Value',
      shortCode: 'WDV',
      description: 'Declining balance method with calculated rate',
      formula: 'Rate = [1 - (Residual Value / Cost)^(1/Life)] × 100',
      detailedFormula: 'Daily Rate = Annual Rate / 365.25\nDaily Depreciation = Book Value × Daily Rate\nBook Value = Previous Book Value - Daily Depreciation',
      isEnabled: true,
      isCustom: false,
      applicableFor: ['All Assets'],
      parameters: { requiresResidualValue: true, requiresUsefulLife: true, minRate: 1, maxRate: 100 },
      companyActCompliant: true,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'WDV_FIXED_SLAB',
      name: 'WDV Fixed Slab',
      shortCode: 'WDV-FS',
      description: 'Fixed rates as per Income Tax Act',
      formula: 'Depreciation = Opening Value × Fixed Rate',
      detailedFormula: 'Annual Depreciation = Book Value × Fixed Rate\nFinancial Year Calculation = From April to March\nBook Value = Previous Book Value - Annual Depreciation',
      isEnabled: true,
      isCustom: false,
      applicableFor: ['Specific Asset Classes'],
      parameters: { useFixedRates: true, financialYearBased: true },
      companyActCompliant: true,
      icon: <Calculator className="w-5 h-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 'UNITS',
      name: 'Production Unit Method',
      shortCode: 'UNITS',
      description: 'Based on actual usage/production',
      formula: 'Depreciation = (Cost - Residual) × Units Used / Total Units',
      detailedFormula: 'Rate per Unit = (Cost - Residual Value) / Total Capacity\nDepreciation = Rate per Unit × Units Produced\nBook Value = Cost - Total Depreciation',
      isEnabled: true,
      isCustom: false,
      applicableFor: ['Manufacturing Equipment', 'Vehicles'],
      parameters: { requiresCapacity: true, requiresUsage: true },
      companyActCompliant: true,
      icon: <Activity className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      id: 'DOUBLE_DECLINING',
      name: 'Double Declining Balance',
      shortCode: 'DDB',
      description: 'Accelerated depreciation method',
      formula: 'Rate = (2 / Useful Life) × 100',
      detailedFormula: 'Annual Rate = 2 / Useful Life × 100\nDaily Rate = Annual Rate / 365.25\nDepreciation = Book Value × Rate\nBook Value = Previous Book Value - Depreciation',
      isEnabled: true,
      isCustom: false,
      applicableFor: ['Technology Assets', 'Equipment'],
      parameters: { acceleratedMethod: true, requiresUsefulLife: true },
      companyActCompliant: false,
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-red-500'
    },
    {
      id: 'SUM_OF_YEARS',
      name: 'Sum of Years Digits',
      shortCode: 'SYD',
      description: 'Decreasing depreciation over time',
      formula: 'Fraction = Remaining Life / Sum of Years',
      detailedFormula: 'Sum of Years = n × (n + 1) / 2\nFraction = Remaining Life / Sum of Years\nDepreciation = Fraction × Depreciable Base\nBook Value = Cost - Total Depreciation',
      isEnabled: false,
      isCustom: false,
      applicableFor: ['Specialized Equipment'],
      parameters: { requiresUsefulLife: true, complexCalculation: true },
      companyActCompliant: false,
      icon: <Timer className="w-5 h-5" />,
      color: 'bg-indigo-500'
    }
  ]);

  const handleMethodToggle = (methodId: string, enabled: boolean) => {
    setMethods(prev => prev.map(method => 
      method.id === methodId ? { ...method, isEnabled: enabled } : method
    ));
    toast({
      title: enabled ? 'Method Enabled' : 'Method Disabled',
      description: `${methods.find(m => m.id === methodId)?.name} has been ${enabled ? 'enabled' : 'disabled'}.`
    });
  };

  const handleEditMethod = (method: DepreciationMethod) => {
    setEditingMethod({ ...method });
    setIsDialogOpen(true);
  };

  const handleSaveMethod = () => {
    if (!editingMethod) return;
    
    setMethods(prev => prev.map(method => 
      method.id === editingMethod.id ? editingMethod : method
    ));
    
    setIsDialogOpen(false);
    setEditingMethod(null);
    
    toast({
      title: 'Method Updated',
      description: `${editingMethod.name} has been successfully updated.`
    });
  };

  const handleAddMethod = () => {
    const newMethod: DepreciationMethod = {
      id: `CUSTOM_${Date.now()}`,
      name: 'New Custom Method',
      shortCode: 'CUSTOM',
      description: 'Custom depreciation method',
      formula: 'Enter your formula here',
      detailedFormula: 'Enter detailed formula steps here',
      isEnabled: true,
      isCustom: true,
      applicableFor: ['All Assets'],
      parameters: {},
      companyActCompliant: false,
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-gray-500'
    };
    
    setEditingMethod(newMethod);
    setIsDialogOpen(true);
  };

  const handleDeleteMethod = (methodId: string) => {
    const method = methods.find(m => m.id === methodId);
    if (!method?.isCustom) {
      toast({
        title: 'Cannot Delete',
        description: 'Standard methods cannot be deleted.',
        variant: 'destructive'
      });
      return;
    }
    
    setMethods(prev => prev.filter(method => method.id !== methodId));
    toast({
      title: 'Method Deleted',
      description: 'Custom method has been deleted.'
    });
  };

  return (
    <Card className="bg-card border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Advanced Depreciation Methods
            </CardTitle>
            <CardDescription>
              Manage and configure depreciation calculation methods
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFormulas(!showFormulas)}
            >
              {showFormulas ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showFormulas ? 'Hide' : 'Show'} Formulas
            </Button>
            <Button onClick={handleAddMethod}>
              <Plus className="w-4 h-4 mr-2" />
              Add Method
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Applicable For</TableHead>
                {showFormulas && <TableHead>Formula</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${method.color} text-white rounded-md`}>
                        {method.icon}
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{method.shortCode}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={method.isEnabled}
                        onCheckedChange={(checked) => handleMethodToggle(method.id, checked)}
                      />
                      <span className="text-sm">
                        {method.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={method.companyActCompliant ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                      {method.companyActCompliant ? 'Compliant' : 'Non-Standard'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {method.applicableFor.map((type, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  {showFormulas && (
                    <TableCell>
                      <div className="max-w-xs">
                        <code className="text-xs bg-muted p-1 rounded block whitespace-pre-wrap">
                          {method.formula}
                        </code>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMethodSelect(method.id)}
                        className={selectedMethod === method.id ? 'bg-primary/10' : ''}
                      >
                        Select
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMethod(method)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {method.isCustom && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMethod(method.id)}
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMethod?.isCustom && !methods.find(m => m.id === editingMethod.id) ? 'Add New Method' : 'Edit Method'}
              </DialogTitle>
              <DialogDescription>
                Configure the depreciation method parameters and formula
              </DialogDescription>
            </DialogHeader>
            
            {editingMethod && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="methodName">Method Name</Label>
                    <Input
                      id="methodName"
                      value={editingMethod.name}
                      onChange={(e) => setEditingMethod(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shortCode">Short Code</Label>
                    <Input
                      id="shortCode"
                      value={editingMethod.shortCode}
                      onChange={(e) => setEditingMethod(prev => prev ? { ...prev, shortCode: e.target.value } : null)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editingMethod.description}
                    onChange={(e) => setEditingMethod(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="formula">Formula</Label>
                  <Textarea
                    id="formula"
                    value={editingMethod.formula}
                    onChange={(e) => setEditingMethod(prev => prev ? { ...prev, formula: e.target.value } : null)}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="detailedFormula">Detailed Formula Steps</Label>
                  <Textarea
                    id="detailedFormula"
                    value={editingMethod.detailedFormula}
                    onChange={(e) => setEditingMethod(prev => prev ? { ...prev, detailedFormula: e.target.value } : null)}
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enabled"
                      checked={editingMethod.isEnabled}
                      onCheckedChange={(checked) => setEditingMethod(prev => prev ? { ...prev, isEnabled: checked } : null)}
                    />
                    <Label htmlFor="enabled">Enabled</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="compliant"
                      checked={editingMethod.companyActCompliant}
                      onCheckedChange={(checked) => setEditingMethod(prev => prev ? { ...prev, companyActCompliant: checked } : null)}
                    />
                    <Label htmlFor="compliant">Company Act Compliant</Label>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMethod}>
                <Save className="w-4 h-4 mr-2" />
                Save Method
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
