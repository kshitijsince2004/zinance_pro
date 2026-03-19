
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { assetService, Asset } from '@/lib/assets';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, Package, Users, Link, X, AlertTriangle } from 'lucide-react';
import EnhancedDatePicker from './EnhancedDatePicker';

interface BulkAssetFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface BulkAssetData {
  name: string;
  type: string;
  category: string;
  department: string;
  company: string;
  location: string;
  office: string;
  vendor: string;
  invoiceNumber: string;
  purchaseDate: string;
  putToUseDate?: string;
  purchasePrice: string;
  residualValue: string;
  depreciationMethod: Asset['depreciationMethod'];
  usefulLife: string;
  owner: string;
  quantity: number;
  startingSerialNumber?: string;
  serialPrefix?: string;
  notes?: string;
}

interface AccessoryData extends BulkAssetData {
  parentAssetName: string;
}

const BulkAssetForm: React.FC<BulkAssetFormProps> = ({ onClose, onSuccess }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccessories, setHasAccessories] = useState(false);
  const [accessories, setAccessories] = useState<AccessoryData[]>([]);
  
  const [formData, setFormData] = useState<BulkAssetData>({
    name: '',
    type: '',
    category: '',
    department: '',
    company: '',
    location: '',
    office: '',
    vendor: '',
    invoiceNumber: '',
    purchaseDate: '',
    putToUseDate: '',
    purchasePrice: '',
    residualValue: '',
    depreciationMethod: 'SLM',
    usefulLife: '5',
    owner: '',
    quantity: 1,
    startingSerialNumber: '',
    serialPrefix: '',
    notes: ''
  });

  const [dateStates, setDateStates] = useState({
    purchaseDate: undefined as Date | undefined,
    putToUseDate: undefined as Date | undefined
  });

  const companies = assetService.getAllCompanies();
  const assetTypes = ['Computer Equipment', 'Office Equipment', 'Furniture', 'Vehicles', 'Machinery', 'Display Equipment', 'Network Equipment', 'Security Equipment', 'Other'];
  const assetCategories = ['Buildings', 'Furniture and fixtures', 'Scientific equipments', 'Computers', 'Library books', 'Buses, vans, etc.', 'Cars, scooters, etc.', 'Plant and machinery', 'Musical Instruments', 'Sports equipments'];
  const departments = ['IT', 'Finance', 'HR', 'Operations', 'Sales', 'Marketing', 'Administration', 'Design', 'Manufacturing', 'Quality'];
  const locations = ['Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune', 'Gurugram', 'Jaipur'];

  // Check if serial number format is set up
  const isSerialNumberSetup = formData.company && formData.department && formData.category ? 
    assetService.isSerialNumberFormatSetup(formData.company, formData.department, formData.category) : false;

  const handleInputChange = (field: keyof BulkAssetData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: keyof typeof dateStates, date: Date | undefined) => {
    setDateStates(prev => ({ ...prev, [field]: date }));
    
    const formatDateForInput = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    if (field === 'purchaseDate') {
      setFormData(prev => ({ 
        ...prev, 
        purchaseDate: date ? formatDateForInput(date) : '',
        putToUseDate: prev.putToUseDate || (date ? formatDateForInput(date) : '')
      }));
      
      if (!dateStates.putToUseDate) {
        setDateStates(prev => ({ ...prev, putToUseDate: date }));
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [field]: date ? formatDateForInput(date) : '' 
      }));
    }
  };

  const addAccessory = () => {
    const newAccessory: AccessoryData = {
      ...formData,
      parentAssetName: formData.name,
      name: '',
      type: '',
      category: '',
      quantity: 1,
      notes: `Accessory for ${formData.name}`
    };
    setAccessories(prev => [...prev, newAccessory]);
  };

  const removeAccessory = (index: number) => {
    setAccessories(prev => prev.filter((_, i) => i !== index));
  };

  const updateAccessory = (index: number, field: keyof AccessoryData, value: string | number) => {
    setAccessories(prev => prev.map((acc, i) => 
      i === index ? { ...acc, [field]: value } : acc
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate serial number setup
      if (!isSerialNumberSetup && !formData.startingSerialNumber) {
        toast({
          title: 'Serial Number Setup Required',
          description: 'Please set up serial number format for this company/department/category combination or provide manual serial numbers.',
          variant: 'destructive'
        });
        return;
      }

      // Create main assets
      const mainAssets: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>[] = [];
      
      for (let i = 0; i < formData.quantity; i++) {
        let serialNumber = '';
        
        if (isSerialNumberSetup) {
          const company = companies.find(c => c.name === formData.company);
          if (company) {
            serialNumber = assetService.generateSerialNumber(company.id, formData.department, formData.category);
          }
        } else if (formData.startingSerialNumber) {
          const baseNumber = parseInt(formData.startingSerialNumber);
          serialNumber = `${formData.serialPrefix || ''}${baseNumber + i}`;
        }

        mainAssets.push({
          name: formData.quantity > 1 ? `${formData.name} #${i + 1}` : formData.name,
          type: formData.type,
          category: formData.category,
          department: formData.department,
          company: formData.company,
          location: formData.location,
          office: formData.office,
          vendor: formData.vendor,
          invoiceNumber: formData.invoiceNumber,
          purchaseDate: formData.purchaseDate,
          putToUseDate: formData.putToUseDate || formData.purchaseDate,
          purchasePrice: parseFloat(formData.purchasePrice),
          residualValue: parseFloat(formData.residualValue),
          depreciationMethod: formData.depreciationMethod,
          usefulLife: parseInt(formData.usefulLife),
          owner: formData.owner,
          serialNumber,
          status: 'active',
          notes: formData.notes,
          depreciationRate: 0
        });
      }

      const createdMainAssets = assetService.bulkCreateAssets(mainAssets);

      // Create accessories if any
      if (hasAccessories && accessories.length > 0) {
        for (const mainAsset of createdMainAssets) {
          for (const accessoryData of accessories) {
            const accessoryAssets: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>[] = [];
            
            for (let i = 0; i < accessoryData.quantity; i++) {
              let accessorySerial = '';
              
              if (isSerialNumberSetup) {
                const company = companies.find(c => c.name === accessoryData.company);
                if (company) {
                  accessorySerial = assetService.generateSerialNumber(company.id, accessoryData.department, accessoryData.category);
                }
              }

              accessoryAssets.push({
                name: accessoryData.quantity > 1 ? `${accessoryData.name} #${i + 1}` : accessoryData.name,
                type: accessoryData.type,
                category: accessoryData.category,
                department: accessoryData.department,
                company: accessoryData.company,
                location: accessoryData.location,
                office: accessoryData.office,
                vendor: accessoryData.vendor,
                invoiceNumber: accessoryData.invoiceNumber,
                purchaseDate: accessoryData.purchaseDate,
                putToUseDate: accessoryData.putToUseDate || accessoryData.purchaseDate,
                purchasePrice: parseFloat(accessoryData.purchasePrice),
                residualValue: parseFloat(accessoryData.residualValue),
                depreciationMethod: accessoryData.depreciationMethod,
                usefulLife: parseInt(accessoryData.usefulLife),
                owner: accessoryData.owner,
                serialNumber: accessorySerial,
                status: 'active',
                notes: accessoryData.notes,
                depreciationRate: 0
              });
            }

            assetService.bulkCreateAssets(accessoryAssets, mainAsset.id);
          }
        }
      }

      toast({
        title: 'Assets Created Successfully',
        description: `Created ${mainAssets.length} main assets${hasAccessories ? ' with accessories' : ''}.`
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create assets. Please check your input and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-dark-border bg-black/95">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-neon-green" />
                Bulk Asset Creation
              </CardTitle>
              <CardDescription className="text-dark-muted">
                Create multiple assets of the same type efficiently
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Serial Number Setup Warning */}
            {formData.company && formData.department && formData.category && !isSerialNumberSetup && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-yellow-500 font-medium">Serial Number Format Not Set Up</h4>
                    <p className="text-sm text-yellow-400 mt-1">
                      No serial number format is configured for {formData.company} - {formData.department} - {formData.category}.
                      You'll need to provide manual serial numbers or set up the format first.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                      onClick={() => window.open('/companies', '_blank')}
                    >
                      Set Up Serial Number Format
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Asset Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Asset Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="iPad Pro 12.9"
                  required
                  className="bg-black border-green-500/30 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-white">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={e => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  className="bg-black border-green-500/30 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-white">Asset Type *</Label>
                <Select value={formData.type} onValueChange={value => handleInputChange('type', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white">
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/40">
                    {assetTypes.map(type => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-green-500/20">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">Category *</Label>
                <Select value={formData.category} onValueChange={value => handleInputChange('category', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/40">
                    {assetCategories.map(category => (
                      <SelectItem key={category} value={category} className="text-white hover:bg-green-500/20">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-white">Department *</Label>
                <Select value={formData.department} onValueChange={value => handleInputChange('department', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/40">
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept} className="text-white hover:bg-green-500/20">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-white">Company *</Label>
                <Select value={formData.company} onValueChange={value => handleInputChange('company', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/40">
                    {companies.length > 0 ? (
                      companies.map(company => (
                        <SelectItem key={company.id} value={company.name} className="text-white hover:bg-green-500/20">
                          {company.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled className="text-gray-400">
                        No companies available - Create companies first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Serial Number Configuration */}
            {!isSerialNumberSetup && (
              <div className="space-y-4">
                <h4 className="text-white font-medium">Manual Serial Number Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serialPrefix" className="text-white">Serial Prefix (Optional)</Label>
                    <Input
                      id="serialPrefix"
                      value={formData.serialPrefix}
                      onChange={e => handleInputChange('serialPrefix', e.target.value)}
                      placeholder="IPAD-"
                      className="bg-black border-green-500/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startingSerialNumber" className="text-white">Starting Number *</Label>
                    <Input
                      id="startingSerialNumber"
                      value={formData.startingSerialNumber}
                      onChange={e => handleInputChange('startingSerialNumber', e.target.value)}
                      placeholder="001"
                      className="bg-black border-green-500/30 text-white"
                      required={!isSerialNumberSetup}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate" className="text-white">Purchase Date *</Label>
                <EnhancedDatePicker
                  date={dateStates.purchaseDate}
                  onDateChange={(date) => handleDateChange('purchaseDate', date)}
                  placeholder="Select purchase date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="putToUseDate" className="text-white">Put to Use Date</Label>
                <EnhancedDatePicker
                  date={dateStates.putToUseDate}
                  onDateChange={(date) => handleDateChange('putToUseDate', date)}
                  placeholder="Select put to use date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice" className="text-white">Purchase Price (₹) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={e => handleInputChange('purchasePrice', e.target.value)}
                  placeholder="75000"
                  required
                  className="bg-black border-green-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="residualValue" className="text-white">Residual Value (₹) *</Label>
                <Input
                  id="residualValue"
                  type="number"
                  value={formData.residualValue}
                  onChange={e => handleInputChange('residualValue', e.target.value)}
                  placeholder="5000"
                  required
                  className="bg-black border-green-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber" className="text-white">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={e => handleInputChange('invoiceNumber', e.target.value)}
                  placeholder="INV-2024-001"
                  required
                  className="bg-black border-green-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor" className="text-white">Vendor *</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={e => handleInputChange('vendor', e.target.value)}
                  placeholder="Apple Authorized Reseller"
                  required
                  className="bg-black border-green-500/30 text-white"
                />
              </div>
            </div>

            {/* Location and Ownership */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">Location *</Label>
                <Select value={formData.location} onValueChange={value => handleInputChange('location', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/40">
                    {locations.map(location => (
                      <SelectItem key={location} value={location} className="text-white hover:bg-green-500/20">
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="office" className="text-white">Office *</Label>
                <Input
                  id="office"
                  value={formData.office}
                  onChange={e => handleInputChange('office', e.target.value)}
                  placeholder="Head Office"
                  required
                  className="bg-black border-green-500/30 text-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="owner" className="text-white">Owner *</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={e => handleInputChange('owner', e.target.value)}
                  placeholder="John Smith"
                  required
                  className="bg-black border-green-500/30 text-white"
                />
              </div>
            </div>

            {/* Accessories Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasAccessories"
                    checked={hasAccessories}
                    onCheckedChange={setHasAccessories}
                  />
                  <Label htmlFor="hasAccessories" className="text-white">Add accessories for these assets</Label>
                </div>
                {hasAccessories && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAccessory}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Accessory
                  </Button>
                )}
              </div>

              {hasAccessories && accessories.map((accessory, index) => (
                <Card key={index} className="bg-gray-800/30 border-gray-600">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm text-green-400 flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        Accessory #{index + 1}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAccessory(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Accessory Name *</Label>
                        <Input
                          value={accessory.name}
                          onChange={e => updateAccessory(index, 'name', e.target.value)}
                          placeholder="Apple Pencil"
                          className="bg-black border-green-500/30 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Type *</Label>
                        <Select value={accessory.type} onValueChange={value => updateAccessory(index, 'type', value)}>
                          <SelectTrigger className="bg-black border-green-500/30 text-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-green-500/40">
                            {assetTypes.map(type => (
                              <SelectItem key={type} value={type} className="text-white hover:bg-green-500/20">
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={accessory.quantity}
                          onChange={e => updateAccessory(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="bg-black border-green-500/30 text-white"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-neon-green to-black hover:from-neon-green/80 hover:to-black/80"
              >
                <Users className="w-4 h-4 mr-2" />
                {isLoading ? 'Creating...' : `Create ${formData.quantity} Asset${formData.quantity > 1 ? 's' : ''}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkAssetForm;
