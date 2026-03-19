import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { assetService } from '@/lib/assets';
import { assetHistoryManager } from '@/lib/asset-history-manager';
import { Download, FileSpreadsheet, AlertCircle, Check } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportField {
  id: string;
  label: string;
  category: 'basic' | 'financial' | 'historical' | 'calculated' | 'administrative';
  required: boolean;
  description?: string;
}

const ExportModule = () => {
  const { toast } = useToast();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');

  // Comprehensive field list based on Companies Act 2013 requirements
  const exportFields: ExportField[] = [
    // Basic Asset Information
    { id: 'serialNo', label: 'S.No.', category: 'basic', required: true },
    { id: 'description', label: 'Description', category: 'basic', required: true },
    { id: 'partyName', label: 'Party Name', category: 'administrative', required: false },
    { id: 'itemName', label: 'Item Name', category: 'basic', required: true },
    { id: 'tagNo', label: 'TAG No.', category: 'basic', required: true },
    { id: 'newTagNo', label: 'New TAG No.', category: 'basic', required: false },
    { id: 'place', label: 'Place', category: 'administrative', required: true },
    { id: 'serialNumber', label: 'Serial Number', category: 'basic', required: false },
    { id: 'billNo', label: 'Bill No.', category: 'financial', required: true },
    
    // Date Information
    { id: 'dateOfEntry', label: 'Date of Entry', category: 'financial', required: true },
    { id: 'dateOfPutToUse', label: 'Date of Put to Use', category: 'financial', required: true },
    
    // Financial Information
    { id: 'balanceHistoricalValue', label: 'Balance Historical Value as on 01.04.24', category: 'historical', required: true },
    { id: 'accumulatedDepFromStart', label: 'Accumulated Dep. From 01/04/16 to 31/03/24', category: 'historical', required: true },
    { id: 'additionDuringYear', label: 'Addition During the Year', category: 'calculated', required: true },
    { id: 'saleDeleteDuringYear', label: 'Sale/Deletion during the Year', category: 'calculated', required: true },
    { id: 'grossBlockCurrent', label: 'Gross Block as on 31.03.2025', category: 'calculated', required: true },
    
    // Depreciation Information
    { id: 'usefulLifeCompaniesAct', label: 'Useful Life as per Companies Act 2013 (In Years)', category: 'financial', required: true },
    { id: 'yearsUsedCurrent', label: 'No. of Years Used as on 31.03.2024', category: 'calculated', required: true },
    { id: 'remainingUsefulLife', label: 'Remaining Useful Life as on 31.03.2024', category: 'calculated', required: true },
    { id: 'depPeriodCurrentYear', label: 'Period for which depreciation charged in Current year', category: 'calculated', required: true },
    { id: 'residualValue', label: 'Residual Value', category: 'financial', required: true },
    { id: 'depreciableValue', label: 'Depreciable Value', category: 'calculated', required: true },
    { id: 'depreciationForYear', label: 'Depreciation for the year', category: 'calculated', required: true },
    { id: 'saleAdjustmentDuringYear', label: 'Sale/Tf/Adjustment during the Year', category: 'calculated', required: true },
    { id: 'accDepCurrent', label: 'Acc. Dep. As on 31.03.2025', category: 'calculated', required: true },
    { id: 'valueCurrent', label: 'Value as on 31.03.2025', category: 'calculated', required: true },
    
    // Additional Administrative Fields
    { id: 'department', label: 'Department', category: 'administrative', required: false },
    { id: 'company', label: 'Company', category: 'administrative', required: false },
    { id: 'owner', label: 'Owner/Assigned To', category: 'administrative', required: false },
    { id: 'vendor', label: 'Vendor', category: 'administrative', required: false },
    { id: 'category', label: 'Category', category: 'basic', required: false },
    { id: 'type', label: 'Type', category: 'basic', required: false },
    { id: 'depreciationMethod', label: 'Depreciation Method', category: 'financial', required: false },
    { id: 'currentBookValue', label: 'Current Book Value', category: 'calculated', required: false },
    { id: 'notes', label: 'Notes/Remarks', category: 'basic', required: false }
  ];

  // Set default required fields on mount
  React.useEffect(() => {
    const requiredFields = exportFields.filter(field => field.required).map(field => field.id);
    setSelectedFields(requiredFields);
  }, []);

  const handleFieldToggle = (fieldId: string) => {
    const field = exportFields.find(f => f.id === fieldId);
    if (field?.required) return; // Can't unselect required fields
    
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const generateExportData = () => {
    const assets = assetService.getAllAssets();
    const currentFinancialYear = '2024-25';
    
    return assets.map((asset, index) => {
      const history = assetHistoryManager.getAssetDepreciationHistory(asset.id);
      const currentBookValue = assetHistoryManager.getCurrentBookValue(asset);
      
      // Calculate years used and remaining
      const putToUseDate = new Date(asset.putToUseDate || asset.purchaseDate);
      const currentDate = new Date();
      const yearsUsed = Math.floor((currentDate.getTime() - putToUseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const remainingLife = Math.max(0, (asset.usefulLife || 5) - yearsUsed);
      
      // Get historical depreciation
      const historicalDep = history.filter(h => h.isHistorical);
      const totalHistoricalDep = historicalDep.reduce((sum, h) => sum + h.depreciationAmount, 0);
      
      // Calculate current year depreciation
      const depreciationRate = asset.depreciationRate || (100 / (asset.usefulLife || 5));
      const currentYearDep = currentBookValue * (depreciationRate / 100);
      
      const exportRow: any = {};
      
      selectedFields.forEach(fieldId => {
        switch (fieldId) {
          case 'serialNo':
            exportRow[fieldId] = index + 1;
            break;
          case 'description':
            exportRow[fieldId] = asset.name;
            break;
          case 'partyName':
            exportRow[fieldId] = asset.vendor || '';
            break;
          case 'itemName':
            exportRow[fieldId] = asset.name;
            break;
          case 'tagNo':
            exportRow[fieldId] = asset.id;
            break;
          case 'newTagNo':
            exportRow[fieldId] = asset.serialNumber || '';
            break;
          case 'place':
            exportRow[fieldId] = `${asset.location || ''}, ${asset.office || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
            break;
          case 'serialNumber':
            exportRow[fieldId] = asset.serialNumber || '';
            break;
          case 'billNo':
            exportRow[fieldId] = asset.invoiceNumber || '';
            break;
          case 'dateOfEntry':
            exportRow[fieldId] = asset.purchaseDate;
            break;
          case 'dateOfPutToUse':
            exportRow[fieldId] = asset.putToUseDate || asset.purchaseDate;
            break;
          case 'balanceHistoricalValue':
            exportRow[fieldId] = currentBookValue;
            break;
          case 'accumulatedDepFromStart':
            exportRow[fieldId] = totalHistoricalDep;
            break;
          case 'additionDuringYear':
            exportRow[fieldId] = 0; // No additions during current year
            break;
          case 'saleDeleteDuringYear':
            exportRow[fieldId] = (asset.status === 'sold' || asset.status === 'retired') ? asset.purchasePrice : 0;
            break;
          case 'grossBlockCurrent':
            exportRow[fieldId] = asset.purchasePrice;
            break;
          case 'usefulLifeCompaniesAct':
            exportRow[fieldId] = asset.usefulLife || 5;
            break;
          case 'yearsUsedCurrent':
            exportRow[fieldId] = yearsUsed;
            break;
          case 'remainingUsefulLife':
            exportRow[fieldId] = remainingLife;
            break;
          case 'depPeriodCurrentYear':
            exportRow[fieldId] = 12; // Full year
            break;
          case 'residualValue':
            exportRow[fieldId] = asset.residualValue || 0;
            break;
          case 'depreciableValue':
            exportRow[fieldId] = asset.purchasePrice - (asset.residualValue || 0);
            break;
          case 'depreciationForYear':
            exportRow[fieldId] = currentYearDep;
            break;
          case 'saleAdjustmentDuringYear':
            exportRow[fieldId] = 0;
            break;
          case 'accDepCurrent':
            exportRow[fieldId] = totalHistoricalDep + currentYearDep;
            break;
          case 'valueCurrent':
            exportRow[fieldId] = Math.max(currentBookValue - currentYearDep, asset.residualValue || 0);
            break;
          case 'department':
            exportRow[fieldId] = asset.department;
            break;
          case 'company':
            exportRow[fieldId] = asset.company;
            break;
          case 'owner':
            exportRow[fieldId] = asset.owner;
            break;
          case 'vendor':
            exportRow[fieldId] = asset.vendor;
            break;
          case 'category':
            exportRow[fieldId] = asset.category;
            break;
          case 'type':
            exportRow[fieldId] = asset.type;
            break;
          case 'depreciationMethod':
            exportRow[fieldId] = asset.depreciationMethod;
            break;
          case 'currentBookValue':
            exportRow[fieldId] = currentBookValue;
            break;
          case 'notes':
            exportRow[fieldId] = asset.notes || '';
            break;
          default:
            exportRow[fieldId] = '';
        }
      });
      
      return exportRow;
    });
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: 'No Fields Selected',
        description: 'Please select at least one field to export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData = generateExportData();
      
      // Create headers with proper labels
      const headers = selectedFields.map(fieldId => {
        const field = exportFields.find(f => f.id === fieldId);
        return field?.label || fieldId;
      });
      
      // Create worksheet data
      const wsData = [headers, ...exportData.map(row => 
        selectedFields.map(fieldId => row[fieldId] || '')
      )];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Fixed Assets Register');
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `Fixed_Assets_Register_${currentDate}.${exportFormat}`;
      
      if (exportFormat === 'xlsx') {
        XLSX.writeFile(wb, filename);
      } else {
        XLSX.writeFile(wb, filename, { bookType: 'csv' });
      }
      
      toast({
        title: 'Export Successful',
        description: `Fixed Assets Register exported as ${filename}`,
      });
      
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const categorizedFields = exportFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, ExportField[]>);

  const categoryTitles = {
    basic: 'Basic Information',
    financial: 'Financial Information',
    historical: 'Historical Data',
    calculated: 'Calculated Values',
    administrative: 'Administrative Details'
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-green-500" />
            Export Assets Data
          </CardTitle>
          <CardDescription className="text-gray-400">
            Export asset data in Excel or CSV format with Companies Act 2013 compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-2">
            <label className="text-white font-medium">Export Format</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="radio"
                  value="xlsx"
                  checked={exportFormat === 'xlsx'}
                  onChange={(e) => setExportFormat(e.target.value as 'xlsx')}
                  className="text-green-500"
                />
                <FileSpreadsheet className="w-4 h-4" />
                Excel (.xlsx)
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv')}
                  className="text-green-500"
                />
                <FileSpreadsheet className="w-4 h-4" />
                CSV (.csv)
              </label>
            </div>
          </div>

          {/* Field Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Select Fields to Export</h3>
              <div className="text-sm text-gray-400">
                {selectedFields.length} of {exportFields.length} fields selected
              </div>
            </div>

            <Alert className="border-yellow-500/30 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-400">
                Fields marked with * are required for Companies Act 2013 compliance and cannot be deselected.
              </AlertDescription>
            </Alert>

            {Object.entries(categorizedFields).map(([category, fields]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-green-400 font-medium">{categoryTitles[category as keyof typeof categoryTitles]}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-2 p-2 rounded bg-white/5">
                      <Checkbox
                        id={field.id}
                        checked={selectedFields.includes(field.id)}
                        onCheckedChange={() => handleFieldToggle(field.id)}
                        disabled={field.required}
                        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      <label 
                        htmlFor={field.id} 
                        className={`text-sm flex-1 cursor-pointer ${field.required ? 'text-white' : 'text-gray-300'}`}
                      >
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedFields.length === 0}
              className="bg-green-500 hover:bg-green-600 text-black"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Fixed Assets Register
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportModule;