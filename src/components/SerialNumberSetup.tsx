
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assetService, Company } from '@/lib/assets';
import { useToast } from '@/hooks/use-toast';
import { Hash, Save, Edit, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SerialNumberSetup = () => {
  console.log('SerialNumberSetup: Component mounted');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedAssetClass, setSelectedAssetClass] = useState('');
  const [serialFormat, setSerialFormat] = useState('');
  const [editingFormat, setEditingFormat] = useState<{dept: string, assetClass: string, format: string} | null>(null);
  const [applyToExisting, setApplyToExisting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Updated asset categories to match the form
  const assetCategories = [
    'Buildings',
    'Furniture and fixtures', 
    'Scientific equipments',
    'Computers',
    'Library books',
    'Buses, vans, etc.',
    'Cars, scooters, etc.',
    'Plant and machinery',
    'Musical Instruments',
    'Sports equipments',
    'Office Equipment',
    'Electrical Equipment',
    'Medical Equipment',
    'Tools and Equipment',
    'Vehicles',
    'Land and Buildings',
    'Intangible Assets',
    'Other Assets'
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = () => {
    try {
      setIsLoading(true);
      setError(null);
      const allCompanies = assetService.getAllCompanies();
      console.log('SerialNumberSetup: Companies loaded:', allCompanies?.length || 0);
      setCompanies(allCompanies || []);
    } catch (err) {
      console.error('SerialNumberSetup: Error loading companies:', err);
      setError('Failed to load companies. Please try again.');
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCompanies = () => {
    loadCompanies();
  };

  const handleSaveFormat = () => {
    if (!selectedCompany || !selectedDepartment || !selectedAssetClass || !serialFormat) {
      toast({
        title: 'Error',
        description: 'Please fill all fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      assetService.updateCompanySerialFormat(selectedCompany, selectedDepartment, selectedAssetClass, serialFormat);
      refreshCompanies();

      toast({
        title: 'Serial Format Updated',
        description: `Serial number format updated for ${selectedDepartment} - ${selectedAssetClass}.`,
      });

      // Reset form
      setSelectedDepartment('');
      setSelectedAssetClass('');
      setSerialFormat('');
    } catch (error) {
      console.error('Error saving format:', error);
      toast({
        title: 'Error',
        description: 'Failed to save serial format. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditFormat = (dept: string, assetClass: string, format: string | { prefix: string; nextNumber: number }) => {
    const formatString = typeof format === 'string' ? format : format.prefix;
    setEditingFormat({ dept, assetClass, format: formatString });
  };

  const handleUpdateFormat = () => {
    if (!editingFormat || !selectedCompany) return;

    try {
      assetService.updateSerialNumberFormat(
        selectedCompany, 
        editingFormat.dept, 
        editingFormat.assetClass, 
        editingFormat.format,
        applyToExisting
      );
      
      refreshCompanies();
      setEditingFormat(null);
      setApplyToExisting(false);

      toast({
        title: 'Format Updated',
        description: `Serial number format updated${applyToExisting ? ' and applied to existing assets' : ''}.`,
      });
    } catch (error) {
      console.error('Error updating format:', error);
      toast({
        title: 'Error',
        description: 'Failed to update serial format. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFormat = (dept: string, assetClass: string) => {
    if (!selectedCompany) return;

    try {
      assetService.deleteSerialNumberFormat(selectedCompany, dept, assetClass);
      refreshCompanies();

      toast({
        title: 'Format Deleted',
        description: `Serial number format deleted for ${dept} - ${assetClass}.`,
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error deleting format:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete serial format. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Helper function to format the display value
  const formatDisplayValue = (format: string | { prefix: string; nextNumber: number }) => {
    if (typeof format === 'string') {
      return format;
    }
    return `${format.prefix}-${format.nextNumber?.toString().padStart(3, '0') || '001'}`;
  };

  // Helper function to get the string format for editing
  const getEditableFormat = (format: string | { prefix: string; nextNumber: number }) => {
    if (typeof format === 'string') {
      return format;
    }
    return format.prefix;
  };

  if (isLoading) {
    return (
      <Card className="glass-effect border-dark-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-green-400" />
            <span className="ml-2 text-gray-300">Loading companies...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-effect border-dark-border">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={loadCompanies} variant="outline" className="border-red-400 text-red-400">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedCompanyData = companies.find(c => c.id === selectedCompany);
  const validCompanies = companies.filter(company => 
    company && 
    company.id && 
    company.id.trim() !== '' && 
    company.name && 
    company.name.trim() !== ''
  );
  
  // Get departments from the selected company
  const availableDepartments = selectedCompanyData?.departments?.filter(dept => dept && dept.trim() !== '') || [];

  return (
    <Card className="glass-effect border-dark-border">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Hash className="w-5 h-5 text-neon-green" />
          Serial Number Format Setup
        </CardTitle>
        <CardDescription className="text-dark-muted">
          Configure serial number formats for different departments and asset classes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {validCompanies.length === 0 ? (
          <Alert className="border-yellow-500/20 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              No companies found. Please create companies first in the Company Setup tab.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Company Selection */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white">Company *</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="bg-black border-green-500/30 text-white">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-500/40">
                  {validCompanies.map(company => (
                    <SelectItem key={company.id} value={company.id} className="text-white hover:bg-green-500/20">
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCompanyData && (
              <>
                {/* Department Selection */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-white">Department *</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="bg-black border-green-500/30 text-white">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-green-500/40">
                      {availableDepartments.length > 0 ? (
                        availableDepartments.map(dept => (
                          <SelectItem key={dept} value={dept} className="text-white hover:bg-green-500/20">
                            {dept}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled className="text-gray-400">
                          No departments available - Create departments first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {availableDepartments.length === 0 && (
                    <p className="text-sm text-yellow-400">
                      Please create departments in the company setup first.
                    </p>
                  )}
                </div>

                {/* Asset Class Selection */}
                <div className="space-y-2">
                  <Label htmlFor="assetClass" className="text-white">Asset Class *</Label>
                  <Select value={selectedAssetClass} onValueChange={setSelectedAssetClass}>
                    <SelectTrigger className="bg-black border-green-500/30 text-white">
                      <SelectValue placeholder="Select asset class" />
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

                {/* Serial Format Input */}
                <div className="space-y-2">
                  <Label htmlFor="serialFormat" className="text-white">Serial Format *</Label>
                  <Input
                    id="serialFormat"
                    value={serialFormat}
                    onChange={e => setSerialFormat(e.target.value)}
                    placeholder="e.g., COMPANY_NAME/DEPARTMENT/OFFICE/LOCATION/ASSET_TYPE"
                    className="bg-black border-green-500/30 text-white placeholder:text-gray-400"
                  />
                  <p className="text-sm text-gray-400">
                    Format: Company_Name/Department_Name/Office/Location/Asset_Category. Numbers (001, 002, etc.) will be auto-appended.
                  </p>
                </div>

                <Button
                  onClick={handleSaveFormat}
                  className="bg-gradient-to-r from-neon-green to-black hover:from-neon-green/80 hover:to-black/80"
                  disabled={availableDepartments.length === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Format
                </Button>

                {/* Current Formats Display */}
                {selectedCompanyData.serialNumberFormat && Object.keys(selectedCompanyData.serialNumberFormat).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Current Formats</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedCompanyData.serialNumberFormat).map(([dept, classes]) => (
                        <div key={dept} className="p-3 bg-black/30 border border-green-500/20 rounded-lg">
                          <h4 className="font-medium text-green-300 mb-2">{dept}</h4>
                          <div className="space-y-2">
                            {Object.entries(classes).map(([assetClass, format]) => (
                              <div key={assetClass} className="flex items-center justify-between p-2 bg-black/20 rounded">
                                <div className="flex-1">
                                  <div className="text-sm text-gray-300">{assetClass}</div>
                                  <div className="text-white font-mono text-sm">
                                    {formatDisplayValue(format)}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditFormat(dept, assetClass, format)}
                                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-black border-red-500/20">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Delete Serial Format</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400">
                                          Are you sure you want to delete the serial number format for {dept} - {assetClass}?
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleDeleteFormat(dept, assetClass)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Edit Format Dialog */}
        {editingFormat && (
          <AlertDialog open={!!editingFormat} onOpenChange={() => setEditingFormat(null)}>
            <AlertDialogContent className="bg-black border-green-500/20">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Update Serial Format</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Update the serial number format for {editingFormat.dept} - {editingFormat.assetClass}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editFormat" className="text-white">Serial Format</Label>
                  <Input
                    id="editFormat"
                    value={editingFormat.format}
                    onChange={e => setEditingFormat(prev => prev ? {...prev, format: e.target.value} : null)}
                    className="bg-black border-green-500/30 text-white"
                    placeholder="e.g., COMPANY_NAME/DEPARTMENT/OFFICE/LOCATION/ASSET_TYPE"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="applyToExisting"
                    checked={applyToExisting}
                    onChange={e => setApplyToExisting(e.target.checked)}
                    className="rounded border-green-500/30"
                  />
                  <Label htmlFor="applyToExisting" className="text-white text-sm">
                    Apply this format to existing assets in this department and class
                  </Label>
                </div>
                {applyToExisting && (
                  <Alert className="border-yellow-500/20 bg-yellow-500/10">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-200">
                      This will update serial numbers for all existing assets in {editingFormat.dept} - {editingFormat.assetClass}. 
                      This action cannot be undone and may affect asset tracking.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  onClick={() => {
                    setEditingFormat(null);
                    setApplyToExisting(false);
                  }}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleUpdateFormat}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Update Format
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
};

export default SerialNumberSetup;
