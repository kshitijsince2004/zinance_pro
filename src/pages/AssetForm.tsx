import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assetService, Asset } from '@/lib/assets';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Package, IndianRupee, MapPin, Shield, Calculator, AlertTriangle, Users, Building, Receipt, FileText, RefreshCw } from 'lucide-react';
import ExcelImport from '@/components/ExcelImport';
import EnhancedDatePicker from '@/components/EnhancedDatePicker';
import DisposalModule from '@/components/DisposalModule';
import VerificationModule from '@/components/VerificationModule';
import CalculationDetails from '@/components/CalculationDetails';
import BulkAssetForm from '@/components/BulkAssetForm';

const AssetForm = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    purchaseDate: '',
    putToUseDate: '',
    purchasePrice: '',
    depreciationRate: '',
    residualValue: '',
    owner: '',
    department: '',
    company: '',
    location: '',
    office: '',
    vendor: '',
    // Billing and Invoice Details
    invoiceNumber: '',
    poNumber: '',
    billToAddress: '',
    shipToAddress: '',
    gstNumber: '',
    panNumber: '',
    taxAmount: '',
    discountAmount: '',
    shippingAmount: '',
    totalAmount: '',
    paymentMethod: '',
    paymentTerms: '',
    warrantyStartDate: '',
    warrantyEndDate: '',
    amcStartDate: '',
    amcEndDate: '',
    insuranceStartDate: '',
    insuranceEndDate: '',
    insuranceProvider: '',
    insuranceAmount: '',
    status: 'active' as Asset['status'],
    notes: '',
    depreciationMethod: 'SLM' as Asset['depreciationMethod'],
    usefulLife: '5',
    usefulLifeYears: '5',
    usefulLifeDays: '1825',
    usefulLifeUnit: 'years',
    productionCapacity: '',
    unitsProduced: '',
    serialNumber: '',
    soldDate: '',
    // New fields
    uniqueIdentificationNumber: '',  // For IMEI, etc.
    assetImage: ''  // For image upload
  });
  const [dateStates, setDateStates] = useState({
    purchaseDate: undefined as Date | undefined,
    putToUseDate: undefined as Date | undefined,
    warrantyStartDate: undefined as Date | undefined,
    warrantyEndDate: undefined as Date | undefined,
    amcStartDate: undefined as Date | undefined,
    amcEndDate: undefined as Date | undefined,
    insuranceStartDate: undefined as Date | undefined,
    insuranceEndDate: undefined as Date | undefined,
    soldDate: undefined as Date | undefined
  });
  const [isLoading, setIsLoading] = useState(false);
  const [autoSetDates, setAutoSetDates] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [showDisposal, setShowDisposal] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const companies = assetService.getAllCompanies();

  // Check if serial number format is set up
  const isSerialNumberSetup = formData.company && formData.department && formData.category ? 
    assetService.isSerialNumberFormatSetup(formData.company, formData.department, formData.category) : false;

  useEffect(() => {
    if (isEdit && id) {
      const asset = assetService.getAssetById(id);
      if (asset) {
        setCurrentAsset(asset);
        setFormData({
          name: asset.name,
          type: asset.type,
          category: asset.category,
          purchaseDate: asset.purchaseDate,
          putToUseDate: asset.putToUseDate || asset.purchaseDate,
          purchasePrice: (asset.purchasePrice ?? 0).toString(),
          depreciationRate: (asset.depreciationRate ?? 0).toString(),
          residualValue: (asset.residualValue ?? 0).toString(),
          owner: asset.owner,
          department: asset.department,
          company: asset.company,
          location: asset.location,
          office: asset.office,
          vendor: asset.vendor,
          // Billing and Invoice Details
          invoiceNumber: asset.invoiceNumber || '',
          poNumber: asset.poNumber || '',
          billToAddress: asset.billToAddress || '',
          shipToAddress: asset.shipToAddress || '',
          gstNumber: asset.gstNumber || '',
          panNumber: asset.panNumber || '',
          taxAmount: (asset.taxAmount ?? '').toString(),
          discountAmount: (asset.discountAmount ?? '').toString(),
          shippingAmount: (asset.shippingAmount ?? '').toString(),
          totalAmount: (asset.totalAmount ?? '').toString(),
          paymentMethod: asset.paymentMethod || '',
          paymentTerms: asset.paymentTerms || '',
          warrantyStartDate: asset.warrantyStartDate || '',
          warrantyEndDate: asset.warrantyEndDate || '',
          amcStartDate: asset.amcStartDate || '',
          amcEndDate: asset.amcEndDate || '',
          insuranceStartDate: asset.insuranceStartDate || '',
          insuranceEndDate: asset.insuranceEndDate || '',
          insuranceProvider: asset.insuranceProvider || '',
          insuranceAmount: (asset.insuranceAmount ?? '').toString(),
          status: asset.status,
          notes: asset.notes || '',
          depreciationMethod: asset.depreciationMethod || 'SLM',
          usefulLife: (asset.usefulLife ?? 5).toString(),
          usefulLifeYears: (asset.usefulLife ?? 5).toString(),
          usefulLifeDays: ((asset.usefulLife ?? 5) * 365).toString(),
          usefulLifeUnit: 'years',
          productionCapacity: (asset.productionCapacity ?? '').toString(),
          unitsProduced: (asset.unitsProduced ?? '').toString(),
          serialNumber: asset.serialNumber || '',
          soldDate: asset.soldDate || '',
          uniqueIdentificationNumber: (asset as any).uniqueIdentificationNumber || '',
          assetImage: (asset as any).assetImage || ''
        });
        setDateStates({
          purchaseDate: new Date(asset.purchaseDate),
          putToUseDate: asset.putToUseDate ? new Date(asset.putToUseDate) : new Date(asset.purchaseDate),
          warrantyStartDate: asset.warrantyStartDate ? new Date(asset.warrantyStartDate) : undefined,
          warrantyEndDate: asset.warrantyEndDate ? new Date(asset.warrantyEndDate) : undefined,
          amcStartDate: asset.amcStartDate ? new Date(asset.amcStartDate) : undefined,
          amcEndDate: asset.amcEndDate ? new Date(asset.amcEndDate) : undefined,
          insuranceStartDate: asset.insuranceStartDate ? new Date(asset.insuranceStartDate) : undefined,
          insuranceEndDate: asset.insuranceEndDate ? new Date(asset.insuranceEndDate) : undefined,
          soldDate: asset.soldDate ? new Date(asset.soldDate) : undefined
        });
      }
    }
  }, [isEdit, id]);

  // Auto-set put to use date when purchase date changes
  useEffect(() => {
    if (dateStates.purchaseDate && !isEdit) {
      if (!dateStates.putToUseDate) {
        setDateStates(prev => ({
          ...prev,
          putToUseDate: dateStates.purchaseDate
        }));
        const formatDateForInput = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        setFormData(prev => ({
          ...prev,
          putToUseDate: formatDateForInput(dateStates.purchaseDate!)
        }));
      }
    }
  }, [dateStates.purchaseDate, isEdit]);

  // Auto-set warranty, AMC, and insurance dates when purchase date changes
  useEffect(() => {
    if (autoSetDates && dateStates.purchaseDate) {
      const purchaseDate = dateStates.purchaseDate;
      const oneYearLater = new Date(purchaseDate);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      setDateStates(prev => ({
        ...prev,
        warrantyStartDate: purchaseDate,
        amcStartDate: purchaseDate,
        insuranceStartDate: purchaseDate,
        insuranceEndDate: oneYearLater
      }));

      // Format dates properly to avoid timezone issues
      const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      setFormData(prev => ({
        ...prev,
        warrantyStartDate: formatDateForInput(purchaseDate),
        amcStartDate: formatDateForInput(purchaseDate),
        insuranceStartDate: formatDateForInput(purchaseDate),
        insuranceEndDate: formatDateForInput(oneYearLater)
      }));
    }
  }, [dateStates.purchaseDate, autoSetDates]);

  // Add effect to generate serial number when company and department are selected
  useEffect(() => {
    if (formData.company && formData.department && formData.category && !id && !formData.serialNumber && isSerialNumberSetup) {
      const company = companies.find(c => c.name === formData.company);
      if (company) {
        const serialNumber = assetService.generateSerialNumber(company.id, formData.department, formData.category);
        setFormData(prev => ({
          ...prev,
          serialNumber
        }));
      }
    }
  }, [formData.company, formData.department, formData.category, id, isSerialNumberSetup]);
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleDateChange = (field: keyof typeof dateStates, date: Date | undefined) => {
    setDateStates(prev => ({
      ...prev,
      [field]: date
    }));

    // Format date properly to avoid timezone issues
    const formatDateForInput = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    setFormData(prev => ({
      ...prev,
      [field]: date ? formatDateForInput(date) : ''
    }));
  };
  const generateSerialNumber = () => {
    if (formData.company && formData.department && formData.category && isSerialNumberSetup) {
      const company = companies.find(c => c.name === formData.company);
      if (company) {
        const serialNumber = assetService.generateSerialNumber(company.id, formData.department, formData.category);
        setFormData(prev => ({
          ...prev,
          serialNumber
        }));
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Helper function to format dates properly
      const formatDateForAsset = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Calculate useful life in years based on the selected unit
      const usefulLifeInYears = formData.usefulLifeUnit === 'years' ? parseFloat(formData.usefulLifeYears) : parseFloat(formData.usefulLifeDays) / 365;

      // Create asset data object with proper date handling
      const assetData = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice),
        depreciationRate: parseFloat(formData.depreciationRate),
        residualValue: parseFloat(formData.residualValue),
        usefulLife: usefulLifeInYears,
        productionCapacity: formData.productionCapacity ? parseInt(formData.productionCapacity) : undefined,
        unitsProduced: formData.unitsProduced ? parseInt(formData.unitsProduced) : undefined,
        insuranceAmount: formData.insuranceAmount ? parseFloat(formData.insuranceAmount) : undefined,
        taxAmount: formData.taxAmount ? parseFloat(formData.taxAmount) : undefined,
        discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : undefined,
        shippingAmount: formData.shippingAmount ? parseFloat(formData.shippingAmount) : undefined,
        totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : undefined,
        // Ensure dates are properly formatted without timezone conversion
        purchaseDate: dateStates.purchaseDate ? formatDateForAsset(dateStates.purchaseDate) : formData.purchaseDate,
        putToUseDate: dateStates.putToUseDate ? formatDateForAsset(dateStates.putToUseDate) : formData.putToUseDate || formData.purchaseDate,
        warrantyStartDate: dateStates.warrantyStartDate ? formatDateForAsset(dateStates.warrantyStartDate) : formData.warrantyStartDate || undefined,
        warrantyEndDate: dateStates.warrantyEndDate ? formatDateForAsset(dateStates.warrantyEndDate) : formData.warrantyEndDate || undefined,
        amcStartDate: dateStates.amcStartDate ? formatDateForAsset(dateStates.amcStartDate) : formData.amcStartDate || undefined,
        amcEndDate: dateStates.amcEndDate ? formatDateForAsset(dateStates.amcEndDate) : formData.amcEndDate || undefined,
        insuranceStartDate: dateStates.insuranceStartDate ? formatDateForAsset(dateStates.insuranceStartDate) : formData.insuranceStartDate || undefined,
        insuranceEndDate: dateStates.insuranceEndDate ? formatDateForAsset(dateStates.insuranceEndDate) : formData.insuranceEndDate || undefined,
        soldDate: dateStates.soldDate ? formatDateForAsset(dateStates.soldDate) : formData.soldDate || undefined
      };
      if (isEdit && id) {
        assetService.updateAsset(id, assetData);
        toast({
          title: 'Asset Updated',
          description: 'Asset has been successfully updated.'
        });
      } else {
        assetService.createAsset(assetData as Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>);
        toast({
          title: 'Asset Created',
          description: 'Asset has been successfully created.'
        });
      }
      navigate('/assets');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEdit ? 'update' : 'create'} asset.`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const assetTypes = ['Computer Equipment', 'Office Equipment', 'Furniture', 'Vehicles', 'Machinery', 'Display Equipment', 'Network Equipment', 'Security Equipment', 'Other'];
  const assetCategories = ['Buildings', 'Furniture and fixtures', 'Scientific equipments', 'Computers', 'Library books', 'Buses, vans, etc.', 'Cars, scooters, etc.', 'Plant and machinery', 'Musical Instruments', 'Sports equipments'];
  
  // Get departments and locations from existing assets
  const existingAssets = assetService.getAllAssets();
  const departments = [...new Set(existingAssets.map(asset => asset.department).filter(dept => dept && dept.trim() !== ''))];
  const locations = [...new Set(existingAssets.map(asset => asset.location).filter(loc => loc && loc.trim() !== ''))];
  
  // Add fallback departments and locations if none exist
  if (departments.length === 0) {
    departments.push('IT', 'Finance', 'HR', 'Operations', 'Sales', 'Marketing', 'Administration', 'Design', 'Manufacturing', 'Quality');
  }
  if (locations.length === 0) {
    locations.push('Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune', 'Gurugram', 'Jaipur');
  }
  const paymentMethods = ['Cash', 'Cheque', 'Bank Transfer', 'Credit Card', 'UPI', 'Online Transfer'];
  if (showImport) {
    return <div className="space-y-6 animate-fade-in">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => setShowImport(false)} className="border-dark-border hover:bg-dark-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form
          </Button>
          <h1 className="text-3xl font-bold text-white neon-text">Import Assets</h1>
        </div>
        <ExcelImport />
      </div>;
  }
  if (showBulkForm) {
    return <div className="space-y-6 animate-fade-in">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => setShowBulkForm(false)} className="border-dark-border hover:bg-dark-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form
          </Button>
          <h1 className="text-3xl font-bold text-white neon-text">Bulk Asset Creation</h1>
        </div>
        <BulkAssetForm onClose={() => setShowBulkForm(false)} onSuccess={() => {
        setShowBulkForm(false);
        navigate('/assets');
      }} />
      </div>;
  }
  if (showDisposal && currentAsset) {
    return <div className="space-y-6 animate-fade-in">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => setShowDisposal(false)} className="border-dark-border hover:bg-dark-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Asset
          </Button>
          <h1 className="text-3xl font-bold text-white neon-text">Asset Disposal</h1>
        </div>
        <DisposalModule asset={currentAsset} onDispose={() => {
        setShowDisposal(false);
        navigate('/assets');
      }} onClose={() => setShowDisposal(false)} />
      </div>;
  }
  if (showVerification) {
    return <div className="space-y-6 animate-fade-in">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => setShowVerification(false)} className="border-dark-border hover:bg-dark-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form
          </Button>
          <h1 className="text-3xl font-bold text-white neon-text">Asset Verification</h1>
        </div>
        <VerificationModule />
      </div>;
  }
  if (showCalculationDetails && currentAsset) {
    return <div className="space-y-6 animate-fade-in">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => setShowCalculationDetails(false)} className="border-dark-border hover:bg-dark-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Asset
          </Button>
          <h1 className="text-3xl font-bold text-white neon-text">Calculation Details</h1>
        </div>
        <CalculationDetails asset={currentAsset} />
      </div>;
  }
  return <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/assets')} className="border-dark-border hover:bg-dark-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white neon-text">
              {isEdit ? 'Edit Asset' : 'Add New Asset'}
            </h1>
            <p className="text-dark-muted">
              {isEdit ? 'Update asset information' : 'Create a new asset record'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowBulkForm(true)} className="border-purple-500/30 text-stone-950 bg-green-500 hover:bg-green-400">
            <Users className="w-4 h-4 mr-2" />
            Bulk Add
          </Button>
          
          {isEdit && currentAsset && <>
              <Button variant="outline" onClick={() => setShowCalculationDetails(true)} className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20">
                <Calculator className="w-4 h-4 mr-2" />
                View Calculations
              </Button>
              <Button variant="outline" onClick={() => setShowDisposal(true)} className="border-red-500/30 text-red-400 hover:bg-red-500/20">
                Dispose Asset
              </Button>
              <Button variant="outline" onClick={() => setShowVerification(true)} className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                Verify Assets
              </Button>
            </>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Serial Number Setup Warning */}
        {formData.company && formData.department && formData.category && !isSerialNumberSetup && !isEdit && <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-yellow-500 font-medium">Serial Number Format Not Set Up</h4>
                <p className="text-sm text-yellow-400 mt-1">
                  No serial number format is configured for {formData.company} - {formData.department} - {formData.category}.
                  Serial numbers will need to be entered manually or you can set up the format first.
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20" onClick={() => window.open('/companies', '_blank')}>
                  <Building className="w-4 h-4 mr-2" />
                  Set Up Serial Number Format
                </Button>
              </div>
            </div>
          </div>}

        {/* Basic Information */}
        <Card className="glass-effect border-dark-border bg-black/95">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-neon-green" />
              Asset Information
            </CardTitle>
            <CardDescription className="text-dark-muted">
              Basic details about the asset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Asset Name *</Label>
                <Input id="name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="Dell Laptop - Inspiron 15" required className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type" className="text-white">Asset Type *</Label>
                <Select value={formData.type} onValueChange={value => handleInputChange('type', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white hover:border-green-500/50">
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/40 z-50">
                    {assetTypes.map(type => <SelectItem key={type} value={type} className="text-white hover:bg-green-500/20 focus:bg-green-500/20">
                        {type}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">Category *</Label>
                <Select value={formData.category} onValueChange={value => handleInputChange('category', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white hover:border-green-500/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/40 z-50">
                    {assetCategories.map(category => <SelectItem key={category} value={category} className="text-white hover:bg-green-500/20 focus:bg-green-500/20">
                        {category}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">Status *</Label>
                <Select value={formData.status} onValueChange={value => handleInputChange('status', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white hover:border-green-500/50">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/40 z-50">
                    <SelectItem value="active" className="text-white hover:bg-green-500/20 focus:bg-green-500/20">Active</SelectItem>
                    <SelectItem value="retired" className="text-white hover:bg-green-500/20 focus:bg-green-500/20">Retired</SelectItem>
                    <SelectItem value="sold" className="text-white hover:bg-green-500/20 focus:bg-green-500/20">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status === 'sold' && <div className="space-y-2">
                  <Label htmlFor="soldDate" className="text-white">Sold Date</Label>
                  <EnhancedDatePicker date={dateStates.soldDate} onDateChange={date => handleDateChange('soldDate', date)} placeholder="Select sold date" />
                </div>}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="serialNumber" className="text-white">Serial Number</Label>
                  {isSerialNumberSetup && <Button type="button" variant="outline" size="sm" onClick={generateSerialNumber} className="border-green-500/30 text-green-400 hover:bg-green-500/20">
                      Generate
                    </Button>}
                </div>
                <Input id="serialNumber" value={formData.serialNumber} onChange={e => handleInputChange('serialNumber', e.target.value)} placeholder={isSerialNumberSetup ? "Auto-generated" : "Enter serial number manually"} className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" />
              </div>

              {/* IMEI/System ID field for specific categories */}
              {(formData.category === 'Computers' || formData.category === 'Mobile Devices' || formData.category.toLowerCase().includes('computer') || formData.category.toLowerCase().includes('mobile')) && (
                <div className="space-y-2">
                  <Label htmlFor="uniqueIdentificationNumber" className="text-white">
                    {formData.category.toLowerCase().includes('mobile') ? 'IMEI Number' : 'System ID'}
                  </Label>
                  <Input 
                    id="uniqueIdentificationNumber" 
                    value={formData.uniqueIdentificationNumber} 
                    onChange={e => handleInputChange('uniqueIdentificationNumber', e.target.value)} 
                    placeholder={formData.category.toLowerCase().includes('mobile') ? "Enter IMEI number" : "Enter system ID"} 
                    className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" 
                  />
                </div>
              )}
            </div>

            {/* Asset Image Upload Section */}
            <div className="space-y-4 mt-6">
              <Label className="text-white">Asset Image</Label>
              <div className="space-y-4">
                {formData.assetImage ? (
                  <div className="relative">
                    <img 
                      src={formData.assetImage} 
                      alt="Asset preview" 
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-green-500/30"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange('assetImage', '')}
                      className="absolute top-2 right-2 border-red-500/30 text-red-400 hover:bg-red-500/20"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-green-500/30 rounded-lg p-6 text-center hover:border-green-500/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) { // 5MB limit
                            toast({
                              title: 'File too large',
                              description: 'Please select an image smaller than 5MB.',
                              variant: 'destructive'
                            });
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            handleInputChange('assetImage', event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="assetImageInput"
                    />
                    <label 
                      htmlFor="assetImageInput" 
                      className="cursor-pointer block"
                    >
                      <div className="space-y-2">
                        <Package className="w-12 h-12 text-green-500/50 mx-auto" />
                        <div>
                          <p className="text-white font-medium">Upload Asset Image</p>
                          <p className="text-gray-400 text-sm">Click to browse or drag and drop</p>
                          <p className="text-gray-500 text-xs mt-1">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card className="glass-effect border-dark-border bg-black/95">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-neon-green" />
              Financial & Depreciation Details
            </CardTitle>
            <CardDescription className="text-dark-muted">
              Purchase, depreciation, and method information (₹ - Rupees)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate" className="text-white">Purchase Date *</Label>
                <EnhancedDatePicker date={dateStates.purchaseDate} onDateChange={date => handleDateChange('purchaseDate', date)} placeholder="Select purchase date" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="putToUseDate" className="text-white">Put to Use Date *</Label>
                <EnhancedDatePicker date={dateStates.putToUseDate} onDateChange={date => handleDateChange('putToUseDate', date)} placeholder="Select put to use date" />
                <p className="text-xs text-gray-400">Date from which depreciation will be calculated</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vendor" className="text-white">Vendor *</Label>
                <Input id="vendor" value={formData.vendor} onChange={e => handleInputChange('vendor', e.target.value)} placeholder="Dell Technologies" className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber" className="text-white">Invoice Number *</Label>
                <Input id="invoiceNumber" value={formData.invoiceNumber} onChange={e => handleInputChange('invoiceNumber', e.target.value)} placeholder="INV-2024-001" className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchasePrice" className="text-white">Purchase Price (₹) *</Label>
                <Input id="purchasePrice" type="number" value={formData.purchasePrice} onChange={e => handleInputChange('purchasePrice', e.target.value)} placeholder="55000" className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="residualValue" className="text-white">Residual Value (₹) *</Label>
                <Input id="residualValue" type="number" value={formData.residualValue} onChange={e => handleInputChange('residualValue', e.target.value)} placeholder="5000" className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="depreciationMethod" className="text-white">Depreciation Method *</Label>
                <Select value={formData.depreciationMethod} onValueChange={value => handleInputChange('depreciationMethod', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white hover:border-green-500/50">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/40 z-50">
                    <SelectItem value="SLM" className="text-white hover:bg-green-500/20 focus:bg-green-500/20">Straight Line Method (SLM)</SelectItem>
                    <SelectItem value="WDV" className="text-white hover:bg-green-500/20 focus:bg-green-500/20">Written Down Value (WDV)</SelectItem>
                    <SelectItem value="WDV_FIXED_SLAB" className="text-white hover:bg-green-500/20 focus:bg-green-500/20">WDV Fixed Slab (School)</SelectItem>
                    <SelectItem value="UNITS" className="text-white hover:bg-green-500/20 focus:bg-green-500/20">Production Unit Method</SelectItem>
                    <SelectItem value="DOUBLE_DECLINING" className="text-white hover:bg-green-500/20 focus:bg-green-500/20">Double Declining Balance</SelectItem>
                    <SelectItem value="SUM_OF_YEARS" className="text-white hover:bg-green-500/20 focus:bg-green-500/20">Sum of Years Digits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.depreciationMethod === 'SLM' || formData.depreciationMethod === 'WDV' || formData.depreciationMethod === 'DOUBLE_DECLINING' || formData.depreciationMethod === 'SUM_OF_YEARS') && <div className="space-y-4 md:col-span-2">
                  <div className="space-y-2">
                    <Label className="text-white">Useful Life Unit</Label>
                    <Select value={formData.usefulLifeUnit} onValueChange={value => handleInputChange('usefulLifeUnit', value)}>
                      <SelectTrigger className="bg-black border-green-500/30 text-white hover:border-green-500/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-green-500/40 z-50">
                        <SelectItem value="years" className="text-white hover:bg-green-500/20 focus:bg-green-500/20">Years</SelectItem>
                        <SelectItem value="days" className="text-white hover:bg-green-500/20 focus:bg-green-500/20">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">
                      Useful Life ({formData.usefulLifeUnit === 'years' ? 'Years' : 'Days'})
                    </Label>
                    <Input type="number" step={formData.usefulLifeUnit === 'years' ? '0.0001' : '1'} min="0" value={formData.usefulLifeUnit === 'years' ? formData.usefulLifeYears : formData.usefulLifeDays} onChange={e => handleInputChange(formData.usefulLifeUnit === 'years' ? 'usefulLifeYears' : 'usefulLifeDays', e.target.value)} className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" placeholder={formData.usefulLifeUnit === 'years' ? '2.9387' : '657'} />
                    <p className="text-xs text-gray-400">
                      {formData.usefulLifeUnit === 'years' ? 'Enter decimal values like 2.93, 2.9387, etc.' : 'Enter number of days like 657, 1095, etc.'}
                    </p>
                  </div>
                </div>}

              {formData.depreciationMethod === 'UNITS' && <>
                  <div className="space-y-2">
                    <Label htmlFor="productionCapacity" className="text-white">Total Production Capacity *</Label>
                    <Input id="productionCapacity" type="number" value={formData.productionCapacity} onChange={e => handleInputChange('productionCapacity', e.target.value)} placeholder="10000" className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitsProduced" className="text-white">Units Produced (Current)</Label>
                    <Input id="unitsProduced" type="number" value={formData.unitsProduced} onChange={e => handleInputChange('unitsProduced', e.target.value)} placeholder="0" className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" />
                  </div>
                </>}

              {formData.depreciationMethod === 'WDV_FIXED_SLAB' && <div className="space-y-2 md:col-span-2">
                  <Label className="text-white">Fixed Depreciation Rates (School)</Label>
                  <div className="text-sm text-gray-400 p-3 bg-black/50 border border-green-500/20 rounded">
                    Rate is automatically applied based on asset category: Buildings (5%), Computers (40%), Cars (25%), etc.
                  </div>
                </div>}

              {formData.depreciationMethod === 'WDV' && <div className="space-y-2 md:col-span-2">
                  <Label className="text-white">WDV Rate Calculation</Label>
                  <div className="text-sm text-gray-400 p-3 bg-black/50 border border-green-500/20 rounded">
                    Rate = 1 - (Residual Value / Purchase Price)^(1/Useful Life) × 100
                  </div>
                </div>}
            </div>
          </CardContent>
        </Card>

        {/* Billing and Invoice Details */}
        <Card className="glass-effect border-dark-border bg-black/95">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-neon-blue" />
              Billing & Invoice Details
            </CardTitle>
            <CardDescription className="text-dark-muted">
              Purchase order, billing, and payment information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poNumber" className="text-white">PO Number</Label>
                <Input id="poNumber" value={formData.poNumber} onChange={e => handleInputChange('poNumber', e.target.value)} placeholder="PO-2024-001" className="bg-black border-green-500/30 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNumber" className="text-white">GST Number</Label>
                <Input id="gstNumber" value={formData.gstNumber} onChange={e => handleInputChange('gstNumber', e.target.value)} placeholder="22AAAAA0000A1Z5" className="bg-black border-green-500/30 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="panNumber" className="text-white">PAN Number</Label>
                <Input id="panNumber" value={formData.panNumber} onChange={e => handleInputChange('panNumber', e.target.value)} placeholder="AAAAA0000A" className="bg-black border-green-500/30 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-white">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={value => handleInputChange('paymentMethod', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/40">
                    {paymentMethods.map(method => <SelectItem key={method} value={method} className="text-white hover:bg-green-500/20">
                        {method}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxAmount" className="text-white">Tax Amount (₹)</Label>
                <Input id="taxAmount" type="number" value={formData.taxAmount} onChange={e => handleInputChange('taxAmount', e.target.value)} placeholder="9900" className="bg-black border-green-500/30 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountAmount" className="text-white">Discount Amount (₹)</Label>
                <Input id="discountAmount" type="number" value={formData.discountAmount} onChange={e => handleInputChange('discountAmount', e.target.value)} placeholder="5000" className="bg-black border-green-500/30 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingAmount" className="text-white">Shipping Amount (₹)</Label>
                <Input id="shippingAmount" type="number" value={formData.shippingAmount} onChange={e => handleInputChange('shippingAmount', e.target.value)} placeholder="500" className="bg-black border-green-500/30 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalAmount" className="text-white">Total Amount (₹)</Label>
                <Input id="totalAmount" type="number" value={formData.totalAmount} onChange={e => handleInputChange('totalAmount', e.target.value)} placeholder="60400" className="bg-black border-green-500/30 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="paymentTerms" className="text-white">Payment Terms</Label>
                <Input id="paymentTerms" value={formData.paymentTerms} onChange={e => handleInputChange('paymentTerms', e.target.value)} placeholder="Net 30 days" className="bg-black border-green-500/30 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="billToAddress" className="text-white">Bill To Address</Label>
                <Textarea id="billToAddress" value={formData.billToAddress} onChange={e => handleInputChange('billToAddress', e.target.value)} placeholder="Enter complete billing address" className="bg-black border-green-500/30 text-white placeholder:text-gray-400" rows={2} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shipToAddress" className="text-white">Ship To Address</Label>
                <Textarea id="shipToAddress" value={formData.shipToAddress} onChange={e => handleInputChange('shipToAddress', e.target.value)} placeholder="Same as bill to address or different delivery address" className="bg-black border-green-500/30 text-white placeholder:text-gray-400" rows={2} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Ownership */}
        <Card className="glass-effect border-dark-border bg-black/95">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-neon-purple" />
              Location & Ownership
            </CardTitle>
            <CardDescription className="text-dark-muted">
              Asset location and ownership details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner" className="text-white">Owner *</Label>
                <Input id="owner" value={formData.owner} onChange={e => handleInputChange('owner', e.target.value)} placeholder="John Smith" className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department" className="text-white">Department *</Label>
                <Select value={formData.department} onValueChange={value => handleInputChange('department', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white hover:border-green-500/50">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                   <SelectContent className="bg-black border-green-500/40 z-50">
                     {departments.map((dept, index) => <SelectItem key={index} value={dept} className="text-white hover:bg-green-500/20 focus:bg-green-500/20">
                         {dept}
                       </SelectItem>)}
                   </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company" className="text-white">Company *</Label>
                <Select value={formData.company} onValueChange={value => handleInputChange('company', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white hover:border-green-500/50">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/40 z-50">
                    {companies.length > 0 ? companies.map(company => <SelectItem key={company.id} value={company.name} className="text-white hover:bg-green-500/20 focus:bg-green-500/20">
                          {company.name}
                        </SelectItem>) : <SelectItem value="no-companies" disabled className="text-gray-400">
                        No companies available - Create companies first
                      </SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">Location *</Label>
                <Select value={formData.location} onValueChange={value => handleInputChange('location', value)}>
                  <SelectTrigger className="bg-black border-green-500/30 text-white hover:border-green-500/50">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                   <SelectContent className="bg-black border-green-500/40 z-50">
                     {locations.map((location, index) => <SelectItem key={index} value={location} className="text-white hover:bg-green-500/20 focus:bg-green-500/20">
                         {location}
                       </SelectItem>)}
                   </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="office" className="text-white">Office *</Label>
                <Input id="office" value={formData.office} onChange={e => handleInputChange('office', e.target.value)} placeholder="Head Office" className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warranty, AMC & Insurance */}
        <Card className="glass-effect border-dark-border bg-black/95">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              Warranty, AMC & Insurance (Optional)
            </CardTitle>
            <CardDescription className="text-dark-muted">
              Warranty, maintenance contract, and insurance details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <input type="checkbox" id="autoSetDates" checked={autoSetDates} onChange={e => setAutoSetDates(e.target.checked)} className="rounded border-green-500/30" />
              <Label htmlFor="autoSetDates" className="text-white">
                Auto-set warranty, AMC, and insurance start dates to purchase date
              </Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-green-400">Warranty</h4>
                <div className="space-y-2">
                  <Label htmlFor="warrantyStartDate" className="text-white">Start Date</Label>
                  <EnhancedDatePicker date={dateStates.warrantyStartDate} onDateChange={date => handleDateChange('warrantyStartDate', date)} placeholder="Select warranty start date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyEndDate" className="text-white">End Date</Label>
                  <EnhancedDatePicker date={dateStates.warrantyEndDate} onDateChange={date => handleDateChange('warrantyEndDate', date)} placeholder="Select warranty end date" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-blue-400">AMC</h4>
                <div className="space-y-2">
                  <Label htmlFor="amcStartDate" className="text-white">Start Date</Label>
                  <EnhancedDatePicker date={dateStates.amcStartDate} onDateChange={date => handleDateChange('amcStartDate', date)} placeholder="Select AMC start date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amcEndDate" className="text-white">End Date</Label>
                  <EnhancedDatePicker date={dateStates.amcEndDate} onDateChange={date => handleDateChange('amcEndDate', date)} placeholder="Select AMC end date" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-purple-400">Insurance</h4>
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider" className="text-white">Provider</Label>
                  <Input id="insuranceProvider" value={formData.insuranceProvider} onChange={e => handleInputChange('insuranceProvider', e.target.value)} placeholder="HDFC ERGO" className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceAmount" className="text-white">Amount (₹)</Label>
                  <Input id="insuranceAmount" type="number" value={formData.insuranceAmount} onChange={e => handleInputChange('insuranceAmount', e.target.value)} placeholder="50000" className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceStartDate" className="text-white">Start Date</Label>
                  <EnhancedDatePicker date={dateStates.insuranceStartDate} onDateChange={date => handleDateChange('insuranceStartDate', date)} placeholder="Select insurance start date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceEndDate" className="text-white">End Date</Label>
                  <EnhancedDatePicker date={dateStates.insuranceEndDate} onDateChange={date => handleDateChange('insuranceEndDate', date)} placeholder="Select insurance end date" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="glass-effect border-dark-border bg-black/95">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Additional Notes
            </CardTitle>
            <CardDescription className="text-dark-muted">
              Any additional information about the asset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} placeholder="Enter any additional notes or comments about the asset..." className="bg-black border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-500/60 min-h-[100px]" />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/assets')} className="border-gray-600 text-gray-300 hover:bg-white/10">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
            {isLoading ? <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </> : <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Update Asset' : 'Create Asset'}
              </>}
          </Button>
        </div>
      </form>
    </div>;
};

export default AssetForm;
