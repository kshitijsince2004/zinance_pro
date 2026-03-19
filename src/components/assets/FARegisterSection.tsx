import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Calculator, Download, RefreshCw, FileSpreadsheet, Settings } from 'lucide-react';
import { Asset } from '@/lib/assets';
import { depreciationCalculator } from '@/lib/depreciation/calculations';
import { assetHistoryManager } from '@/lib/asset-history-manager';
import { format, differenceInDays } from 'date-fns';
import EnhancedDatePicker from '../EnhancedDatePicker';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface FARegisterSectionProps {
  assets: Asset[];
}

interface AssetDepreciationData {
  asset: Asset;
  openingValue: number;
  depreciationForPeriod: number;
  closingValue: number;
  daysInPeriod: number;
}

interface ExportField {
  id: string;
  label: string;
  required: boolean;
}

const FARegisterSection: React.FC<FARegisterSectionProps> = ({ assets }) => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), 3, 1)); // Default to current FY start
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [depreciationData, setDepreciationData] = useState<AssetDepreciationData[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const { toast } = useToast();

  // Define all FA Register fields matching the provided format
  const faRegisterFields: ExportField[] = [
    { id: 'serialNo', label: 'S.No.', required: true },
    { id: 'description', label: 'Description', required: true },
    { id: 'partyName', label: 'Party Name', required: true },
    { id: 'itemName', label: 'Item Name', required: true },
    { id: 'tagNo', label: 'TAG No.', required: true },
    { id: 'newTagNo', label: 'New TAG No.', required: false },
    { id: 'place', label: 'Place', required: true },
    { id: 'serialNumber', label: 'Serial Number', required: false },
    { id: 'billNo', label: 'Bill No.', required: true },
    { id: 'dateOfEntry', label: 'Date of Entry', required: true },
    { id: 'dateOfPutToUse', label: 'Date of Put to Use', required: true },
    { id: 'balanceHistoricalValue', label: 'Balance Historical Value as on 01.04.24', required: true },
    { id: 'accumulatedDepFromStart', label: 'Accumulated Dep. From 01/04/16 to 31/03/24', required: true },
    { id: 'additionDuringYear', label: 'Addition During the Year', required: true },
    { id: 'saleDeleteDuringYear', label: 'Sale/Deletion during the Year', required: true },
    { id: 'grossBlockCurrent', label: 'Gross Block as on 31.03.2025', required: true },
    { id: 'usefulLifeCompaniesAct', label: 'Useful Life as per Companies Act 2013 (In Years)', required: true },
    { id: 'yearsUsedCurrent', label: 'No. of Years Used as on 31.03.2024', required: true },
    { id: 'remainingUsefulLife', label: 'Remaining Useful Life as on 31.03.2024', required: true },
    { id: 'depPeriodCurrentYear', label: 'Period for which depreciation charged in Current year', required: true },
    { id: 'residualValue', label: 'Residual Value', required: true },
    { id: 'depreciableValue', label: 'Depreciable Value', required: true },
    { id: 'depreciationForYear', label: 'Depreciation for the year', required: true },
    { id: 'saleAdjustmentDuringYear', label: 'Sale/Tf/Adjustment during the Year', required: true },
    { id: 'accDepCurrent', label: 'Acc. Dep. As on 31.03.2025', required: true },
    { id: 'valueCurrent', label: 'Value as on 31.03.2025', required: true }
  ];

  // Set default required fields on mount
  useEffect(() => {
    const requiredFields = faRegisterFields.filter(field => field.required).map(field => field.id);
    setSelectedFields(requiredFields);
  }, []);

  const handleFieldToggle = (fieldId: string) => {
    const field = faRegisterFields.find(f => f.id === fieldId);
    if (field?.required) return; // Can't unselect required fields
    
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const generateFARegisterData = () => {
    // Include all assets (active, disposed, and sold) for proper book keeping
    const allAssets = assets;
    
    return allAssets.map((asset, index) => {
      const history = assetHistoryManager.getAssetDepreciationHistory(asset.id);
      const currentBookValue = assetHistoryManager.getCurrentBookValue(asset);
      
      // Calculate years used and remaining
      const putToUseDate = new Date(asset.putToUseDate || asset.purchaseDate);
      const currentDate = new Date();
      const yearsUsed = Math.floor((currentDate.getTime() - putToUseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const remainingLife = Math.max(0, (asset.usefulLife || 5) - yearsUsed);
      
      // Get historical depreciation (imported data)
      const historicalDep = history.filter(h => h.isHistorical);
      const totalHistoricalDep = historicalDep.reduce((sum, h) => sum + h.depreciationAmount, 0);
      
      // Calculate current year depreciation
      const depreciationRate = asset.depreciationRate || (100 / (asset.usefulLife || 5));
      const currentYearDep = currentBookValue * (depreciationRate / 100);
      
      // Depreciable value
      const depreciableValue = asset.purchasePrice - (asset.residualValue || 0);
      
      // Handle disposed/sold assets
      const isDisposed = asset.status === 'sold' || asset.status === 'retired';
      const saleValue = asset.soldPrice || 0;
      
      const rowData: any = {};
      
      selectedFields.forEach(fieldId => {
        switch (fieldId) {
          case 'serialNo':
            rowData[fieldId] = index + 1;
            break;
          case 'description':
            rowData[fieldId] = asset.name || '';
            break;
          case 'partyName':
            rowData[fieldId] = asset.vendor || '';
            break;
          case 'itemName':
            rowData[fieldId] = asset.name || '';
            break;
          case 'tagNo':
            rowData[fieldId] = asset.id || '';
            break;
          case 'newTagNo':
            rowData[fieldId] = asset.serialNumber || '';
            break;
          case 'place':
            rowData[fieldId] = `${asset.location || ''}, ${asset.office || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
            break;
          case 'serialNumber':
            rowData[fieldId] = asset.serialNumber || '';
            break;
          case 'billNo':
            rowData[fieldId] = asset.invoiceNumber || '';
            break;
          case 'dateOfEntry':
            rowData[fieldId] = asset.purchaseDate ? format(new Date(asset.purchaseDate), 'dd/MM/yyyy') : '';
            break;
          case 'dateOfPutToUse':
            rowData[fieldId] = asset.putToUseDate ? format(new Date(asset.putToUseDate), 'dd/MM/yyyy') : asset.purchaseDate ? format(new Date(asset.purchaseDate), 'dd/MM/yyyy') : '';
            break;
          case 'balanceHistoricalValue':
            rowData[fieldId] = currentBookValue;
            break;
          case 'accumulatedDepFromStart':
            rowData[fieldId] = totalHistoricalDep;
            break;
          case 'additionDuringYear':
            // Check if asset was added during the current year
            const currentFY = assetHistoryManager.getFinancialYear(currentDate);
            const assetFY = assetHistoryManager.getFinancialYear(new Date(asset.purchaseDate));
            rowData[fieldId] = assetFY === currentFY ? asset.purchasePrice : 0;
            break;
          case 'saleDeleteDuringYear':
            rowData[fieldId] = isDisposed ? saleValue : 0;
            break;
          case 'grossBlockCurrent':
            rowData[fieldId] = isDisposed ? 0 : asset.purchasePrice;
            break;
          case 'usefulLifeCompaniesAct':
            rowData[fieldId] = asset.usefulLife || 5;
            break;
          case 'yearsUsedCurrent':
            rowData[fieldId] = yearsUsed;
            break;
          case 'remainingUsefulLife':
            rowData[fieldId] = remainingLife;
            break;
          case 'depPeriodCurrentYear':
            rowData[fieldId] = 12; // Full year in months
            break;
          case 'residualValue':
            rowData[fieldId] = asset.residualValue || 0;
            break;
          case 'depreciableValue':
            rowData[fieldId] = depreciableValue;
            break;
          case 'depreciationForYear':
            rowData[fieldId] = currentYearDep;
            break;
          case 'saleAdjustmentDuringYear':
            rowData[fieldId] = isDisposed ? (totalHistoricalDep + currentYearDep) : 0;
            break;
          case 'accDepCurrent':
            rowData[fieldId] = isDisposed ? 0 : totalHistoricalDep + currentYearDep;
            break;
          case 'valueCurrent':
            rowData[fieldId] = isDisposed ? 0 : Math.max(currentBookValue - currentYearDep, asset.residualValue || 0);
            break;
          default:
            rowData[fieldId] = '';
        }
      });
      
      return rowData;
    });
  };

  const calculatePeriodDepreciation = () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Invalid Date Range',
        description: 'Please select both start and end dates.',
        variant: 'destructive',
      });
      return;
    }

    if (startDate >= endDate) {
      toast({
        title: 'Invalid Date Range',
        description: 'Start date must be before end date.',
        variant: 'destructive',
      });
      return;
    }

    setIsCalculating(true);

    try {
      const calculatedData: AssetDepreciationData[] = assets.map(asset => {
        const putToUseDate = new Date(asset.putToUseDate || asset.purchaseDate);
        
        // Get historical depreciation data for this asset
        const depreciationHistory = assetHistoryManager.getAssetDepreciationHistory(asset.id);
        
        // Check if the selected period overlaps with historical data
        const selectedFY = assetHistoryManager.getFinancialYear(startDate);
        const historicalEntry = depreciationHistory.find(h => h.financialYear === selectedFY && h.isHistorical);
        
        let openingValue: number;
        let closingValue: number;
        let depreciationForPeriod: number;
        
        if (historicalEntry && 
            new Date(historicalEntry.startDate) <= endDate && 
            new Date(historicalEntry.endDate) >= startDate) {
          // Use historical data if available for this period
          openingValue = historicalEntry.openingValue;
          closingValue = historicalEntry.closingValue;
          depreciationForPeriod = historicalEntry.depreciationAmount;
        } else {
          // Use system calculation
          if (startDate <= putToUseDate) {
            // If start date is before put-to-use date, opening value is purchase price
            openingValue = asset.purchasePrice;
          } else {
            // Calculate current value as of start date, considering historical data
            if (depreciationHistory.length > 0 && asset.startFromCurrentValue) {
              // Start from current book value if asset has history
              openingValue = assetHistoryManager.getCurrentBookValue(asset);
            } else {
              openingValue = depreciationCalculator.calculateCurrentValueByMethod({
                ...asset,
                soldDate: startDate.toISOString().split('T')[0]
              });
            }
          }

          // Calculate closing value at end date
          if (endDate <= putToUseDate) {
            // If end date is before put-to-use date, no depreciation
            closingValue = asset.purchasePrice;
          } else {
            // Calculate current value as of end date
            if (depreciationHistory.length > 0 && asset.startFromCurrentValue) {
              // Calculate from current book value
              const currentBookValue = assetHistoryManager.getCurrentBookValue(asset);
              // Calculate additional depreciation from start date to end date
              const additionalDepreciation = calculateDepreciationForPeriod(asset, startDate, endDate, currentBookValue);
              closingValue = Math.max(currentBookValue - additionalDepreciation, asset.residualValue || 0);
            } else {
              closingValue = depreciationCalculator.calculateCurrentValueByMethod({
                ...asset,
                soldDate: endDate.toISOString().split('T')[0]
              });
            }
          }

          // Calculate depreciation for the period
          depreciationForPeriod = Math.max(0, openingValue - closingValue);
        }

        const daysInPeriod = differenceInDays(endDate, startDate) + 1;

        return {
          asset,
          openingValue,
          depreciationForPeriod,
          closingValue,
          daysInPeriod
        };
      });

      setDepreciationData(calculatedData);
      
      toast({
        title: 'Calculation Complete',
        description: `Depreciation calculated for ${calculatedData.length} assets from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      });
    } catch (error) {
      console.error('Error calculating period depreciation:', error);
      toast({
        title: 'Calculation Error',
        description: 'Failed to calculate depreciation for the selected period.',
        variant: 'destructive',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadFARegister = async () => {
    setIsDownloading(true);
    
    try {
      const faRegisterData = generateFARegisterData();
      
      // Create headers with proper labels
      const headers = selectedFields.map(fieldId => {
        const field = faRegisterFields.find(f => f.id === fieldId);
        return field?.label || fieldId;
      });
      
      // Create title row
      const titleRow = [`Fixed Assets Register - ${format(startDate, 'dd/MM/yyyy')} to ${format(endDate, 'dd/MM/yyyy')}`];
      const emptyRow = [''];
      
      // Create worksheet data with title and proper formatting
      const wsData = [
        titleRow,
        emptyRow,
        headers, 
        ...faRegisterData.map(row => 
          selectedFields.map(fieldId => {
            const value = row[fieldId];
            // Format numeric values properly
            if (typeof value === 'number' && !isNaN(value)) {
              return value.toFixed(2);
            }
            return value || '';
          })
        )
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Merge title cell across all columns
      const titleRange = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: selectedFields.length - 1, r: 0 } });
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push(XLSX.utils.decode_range(titleRange));
      
      // Set column widths for better readability
      const colWidths = selectedFields.map((fieldId) => {
        const field = faRegisterFields.find(f => f.id === fieldId);
        // Set appropriate widths based on field type
        if (['description', 'details', 'place'].includes(fieldId)) {
          return { wch: 25 };
        } else if (['serialNumber', 'billNo', 'tagNo'].includes(fieldId)) {
          return { wch: 20 };
        } else if (fieldId.includes('Value') || fieldId.includes('Amount') || fieldId.includes('Dep')) {
          return { wch: 18 };
        }
        return { wch: 15 };
      });
      ws['!cols'] = colWidths;

      // Style the title row
      if (ws['A1']) {
        ws['A1'].s = {
          font: { bold: true, sz: 14 },
          alignment: { horizontal: 'center' }
        };
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Fixed Assets Register');
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `Fixed_Assets_Register_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}_${currentDate}.xlsx`;
      
      XLSX.writeFile(wb, filename);
      
      toast({
        title: 'Download Complete',
        description: `Fixed Assets Register downloaded as ${filename}`,
      });
      
    } catch (error) {
      console.error('Error downloading FA Register:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download Fixed Assets Register.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const exportToCSV = () => {
    if (depreciationData.length === 0) {
      toast({
        title: 'No Data',
        description: 'Please calculate depreciation first.',
        variant: 'destructive',
      });
      return;
    }

    const headers = [
      'Asset Name', 'Serial Number', 'Department', 'Category', 
      'Purchase Date', 'Put to Use Date', 'Opening Value', 
      'Depreciation for Period', 'Closing Value', 'Days in Period'
    ];

    const csvContent = [
      headers.join(','),
      ...depreciationData.map(data => [
        data.asset.name || '',
        data.asset.serialNumber || '',
        data.asset.department || '',
        data.asset.category || '',
        data.asset.purchaseDate ? format(new Date(data.asset.purchaseDate), 'dd/MM/yyyy') : '',
        data.asset.putToUseDate ? format(new Date(data.asset.putToUseDate), 'dd/MM/yyyy') : '',
        data.openingValue.toFixed(2),
        data.depreciationForPeriod.toFixed(2),
        data.closingValue.toFixed(2),
        data.daysInPeriod
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fa-register-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `FA Register exported for period ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTotalValues = () => {
    return depreciationData.reduce(
      (totals, data) => ({
        openingValue: totals.openingValue + data.openingValue,
        depreciation: totals.depreciation + data.depreciationForPeriod,
        closingValue: totals.closingValue + data.closingValue
      }),
      { openingValue: 0, depreciation: 0, closingValue: 0 }
    );
  };

  // Helper method to calculate depreciation for a specific period
  const calculateDepreciationForPeriod = (asset: Asset, start: Date, end: Date, baseValue: number): number => {
    const daysElapsed = differenceInDays(end, start);
    const yearsElapsed = daysElapsed / 365.25;
    
    switch (asset.depreciationMethod) {
      case 'SLM':
        const annualDepreciation = (baseValue - (asset.residualValue || 0)) / (asset.usefulLife || 5);
        return annualDepreciation * yearsElapsed;
      case 'WDV':
        const rate = depreciationCalculator.calculateWDVRate(asset.purchasePrice, asset.residualValue || 0, asset.usefulLife || 5);
        return baseValue * (1 - Math.pow(1 - (rate / 100), yearsElapsed)) - baseValue;
      default:
        const defaultAnnualDep = (baseValue - (asset.residualValue || 0)) / (asset.usefulLife || 5);
        return defaultAnnualDep * yearsElapsed;
    }
  };

  const totals = getTotalValues();

  return (
    <div className="space-y-6">
      {/* Date Range Selection and Field Selector */}
      <Card className="bg-black/60 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-400" />
            FA Register - Period Analysis & Export
          </CardTitle>
          <p className="text-gray-400">
            Select date range and fields for FA Register generation with complete historical data.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Start Date</label>
              <EnhancedDatePicker
                date={startDate}
                onDateChange={(date) => setStartDate(date || new Date())}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">End Date</label>
              <EnhancedDatePicker
                date={endDate}
                onDateChange={(date) => setEndDate(date || new Date())}
                placeholder="Select end date"
                minDate={startDate}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={calculatePeriodDepreciation}
                disabled={isCalculating}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                {isCalculating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4 mr-2" />
                )}
                Calculate
              </Button>
              {depreciationData.length > 0 && (
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Period
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFieldSelector(!showFieldSelector)}
                variant="outline"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
              >
                <Settings className="w-4 h-4 mr-2" />
                Fields
              </Button>
              <Button
                onClick={downloadFARegister}
                disabled={isDownloading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isDownloading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                )}
                Download FA Register
              </Button>
            </div>
          </div>

          {/* Field Selection Panel */}
          {showFieldSelector && (
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
              <h3 className="text-white font-medium mb-3">Select Fields for FA Register Export</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {faRegisterFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => handleFieldToggle(field.id)}
                      disabled={field.required}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <label 
                      htmlFor={field.id} 
                      className={`text-sm cursor-pointer ${field.required ? 'text-white' : 'text-gray-300'}`}
                    >
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-400">
                {selectedFields.length} of {faRegisterFields.length} fields selected
              </div>
            </div>
          )}

          {startDate && endDate && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-sm text-green-400">
                <strong>Selected Period:</strong> {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
                <span className="ml-4">
                  <strong>Duration:</strong> {differenceInDays(endDate, startDate) + 1} days
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Table */}
      {depreciationData.length > 0 && (
        <Card className="bg-black/60 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>FA Register Results ({depreciationData.length} assets)</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-green-400 text-green-400">
                  Period: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-600">
                    <TableHead className="text-gray-300">Asset Details</TableHead>
                    <TableHead className="text-gray-300">Department</TableHead>
                    <TableHead className="text-gray-300">Put to Use Date</TableHead>
                    <TableHead className="text-gray-300 text-right">Opening Value</TableHead>
                    <TableHead className="text-gray-300 text-right">Depreciation</TableHead>
                    <TableHead className="text-gray-300 text-right">Closing Value</TableHead>
                    <TableHead className="text-gray-300 text-center">Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depreciationData.map((data, index) => (
                    <TableRow key={data.asset.id} className="border-gray-600 hover:bg-gray-800/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{data.asset.name}</p>
                          <p className="text-sm text-gray-400">{data.asset.serialNumber || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{data.asset.category}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{data.asset.department}</TableCell>
                      <TableCell className="text-white">
                        {data.asset.putToUseDate ? format(new Date(data.asset.putToUseDate), 'dd/MM/yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right text-blue-400 font-medium">
                        {formatCurrency(data.openingValue)}
                      </TableCell>
                      <TableCell className="text-right text-red-400 font-medium">
                        {formatCurrency(data.depreciationForPeriod)}
                      </TableCell>
                      <TableCell className="text-right text-green-400 font-medium">
                        {formatCurrency(data.closingValue)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {data.asset.depreciationMethod}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow className="border-gray-600 bg-gray-800/50 font-bold">
                    <TableCell colSpan={3} className="text-white">
                      <strong>TOTALS</strong>
                    </TableCell>
                    <TableCell className="text-right text-blue-400 font-bold">
                      {formatCurrency(totals.openingValue)}
                    </TableCell>
                    <TableCell className="text-right text-red-400 font-bold">
                      {formatCurrency(totals.depreciation)}
                    </TableCell>
                    <TableCell className="text-right text-green-400 font-bold">
                      {formatCurrency(totals.closingValue)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Total Assets:</span>
                  <span className="ml-2 font-medium text-white">{depreciationData.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Period:</span>
                  <span className="ml-2 font-medium text-white">{differenceInDays(endDate, startDate) + 1} days</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Depreciation:</span>
                  <span className="ml-2 font-medium text-red-400">{formatCurrency(totals.depreciation)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Net Book Value:</span>
                  <span className="ml-2 font-medium text-green-400">{formatCurrency(totals.closingValue)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {depreciationData.length === 0 && (
        <Card className="bg-black/60 border-blue-500/20">
          <CardContent className="p-6">
            <div className="text-center text-gray-400">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-lg font-medium text-white mb-2">FA Register Analysis</h3>
              <p className="mb-4">
                Generate complete Fixed Assets Register with historical data and custom field selection.
              </p>
              <div className="text-left max-w-2xl mx-auto space-y-2 text-sm">
                <p><strong className="text-blue-400">Key Features:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Select date range for period analysis</li>
                  <li>Choose specific fields for export</li>
                  <li>Complete historical data preservation</li>
                  <li>Companies Act 2013 compliance</li>
                  <li>Excel export with proper formatting</li>
                  <li>Real-time depreciation calculations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FARegisterSection;
