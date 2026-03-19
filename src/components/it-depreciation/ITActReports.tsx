
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calculator } from 'lucide-react';
import { Asset } from '@/lib/assets';
import * as XLSX from 'xlsx';

interface ITActSlab {
  id: string;
  assetClass: string;
  category: string;
  depreciationRate: number;
  ruleType: 'half_year' | 'full_year';
  notes?: string;
}

interface ITActDepreciationData {
  assetId: string;
  financialYear: string;
  openingWDV: number;
  currentYearDepreciation: number;
  closingWDV: number;
  halfYearRuleApplied: boolean;
  slabId: string;
  calculationDetails: {
    putToUseDate: string;
    isHalfYear: boolean;
    depreciationRate: number;
    method: 'WDV';
  };
}

interface ITActReportsProps {
  assets: Asset[];
  depreciationData: ITActDepreciationData[];
  itActSlabs: ITActSlab[];
  selectedFY: string;
}

export const ITActReports: React.FC<ITActReportsProps> = ({
  assets,
  depreciationData,
  itActSlabs,
  selectedFY
}) => {
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'schedule-dep'>('summary');

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const getAssetSlab = (assetId: string) => {
    const depData = depreciationData.find(d => d.assetId === assetId);
    return depData ? itActSlabs.find(s => s.id === depData.slabId) : null;
  };

  const generateSummaryReport = () => {
    const summary = itActSlabs.map(slab => {
      const slabAssets = depreciationData.filter(d => d.slabId === slab.id);
      const totalOpeningWDV = slabAssets.reduce((sum, d) => sum + d.openingWDV, 0);
      const totalDepreciation = slabAssets.reduce((sum, d) => sum + d.currentYearDepreciation, 0);
      const totalClosingWDV = slabAssets.reduce((sum, d) => sum + d.closingWDV, 0);
      
      return {
        assetClass: slab.assetClass,
        category: slab.category,
        rate: slab.depreciationRate,
        assetCount: slabAssets.length,
        openingWDV: totalOpeningWDV,
        depreciation: totalDepreciation,
        closingWDV: totalClosingWDV
      };
    }).filter(item => item.assetCount > 0);

    return summary;
  };

  const generateScheduleDEP = () => {
    return generateSummaryReport().map((item, index) => ({
      srNo: index + 1,
      description: item.category,
      rate: `${item.rate}%`,
      openingWDV: item.openingWDV,
      additions: 0, // Simplified for this implementation
      deductions: 0,
      depreciation: item.depreciation,
      closingWDV: item.closingWDV
    }));
  };

  const exportToExcel = (data: any[], filename: string, sheetName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}_FY${selectedFY}.xlsx`);
  };

  const exportSummaryReport = () => {
    const data = generateSummaryReport().map(item => ({
      'Asset Class': item.assetClass,
      'Category': item.category,
      'Depreciation Rate': `${item.rate}%`,
      'No. of Assets': item.assetCount,
      'Opening WDV': item.openingWDV,
      'Current Year Depreciation': item.depreciation,
      'Closing WDV': item.closingWDV
    }));
    
    exportToExcel(data, 'IT_Act_Depreciation_Summary', 'Summary Report');
  };

  const exportDetailedReport = () => {
    const data = assets.map(asset => {
      const depData = depreciationData.find(d => d.assetId === asset.id);
      const slab = getAssetSlab(asset.id);
      
      return {
        'Asset Name': asset.name,
        'Asset ID': asset.id,
        'Company': asset.company,
        'Department': asset.department,
        'Asset Class': slab?.assetClass || 'Unknown',
        'Purchase Date': asset.purchaseDate,
        'Put to Use Date': asset.putToUseDate || asset.purchaseDate,
        'Purchase Cost': asset.purchasePrice,
        'IT Act Rate': slab?.depreciationRate || 0,
        'Half Year Rule': depData?.halfYearRuleApplied ? 'Yes' : 'No',
        'Opening WDV': depData?.openingWDV || 0,
        'Current Year Depreciation': depData?.currentYearDepreciation || 0,
        'Closing WDV': depData?.closingWDV || 0
      };
    });
    
    exportToExcel(data, 'IT_Act_Depreciation_Detailed', 'Detailed Report');
  };

  const exportScheduleDEP = () => {
    const data = generateScheduleDEP().map(item => ({
      'Sr. No.': item.srNo,
      'Description of Asset': item.description,
      'Rate of Depreciation': item.rate,
      'Opening WDV': item.openingWDV,
      'Additions during the year': item.additions,
      'Deductions during the year': item.deductions,
      'Current Year Depreciation': item.depreciation,
      'Closing WDV': item.closingWDV
    }));
    
    exportToExcel(data, 'Schedule_DEP_ITR6', 'Schedule DEP');
  };

  const summaryData = generateSummaryReport();
  const scheduleDEPData = generateScheduleDEP();
  const totalOpeningWDV = summaryData.reduce((sum, item) => sum + item.openingWDV, 0);
  const totalDepreciation = summaryData.reduce((sum, item) => sum + item.depreciation, 0);
  const totalClosingWDV = summaryData.reduce((sum, item) => sum + item.closingWDV, 0);

  return (
    <div className="space-y-6">
      {/* Report Navigation */}
      <div className="flex space-x-2 border-b border-gray-700">
        {[
          { id: 'summary', label: 'Summary Report', icon: Calculator },
          { id: 'detailed', label: 'Detailed Report', icon: FileText },
          { id: 'schedule-dep', label: 'Schedule DEP (ITR-6)', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
              reportType === tab.id
                ? 'bg-green-500/20 text-green-300 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/60 border-blue-500/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-blue-300 text-sm">Total Assets</p>
              <p className="text-white text-2xl font-bold">{assets.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black/60 border-green-500/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-green-300 text-sm">Opening WDV</p>
              <p className="text-white text-xl font-bold">{formatCurrency(totalOpeningWDV)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black/60 border-red-500/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-red-300 text-sm">Total Depreciation</p>
              <p className="text-white text-xl font-bold">{formatCurrency(totalDepreciation)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black/60 border-purple-500/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-purple-300 text-sm">Closing WDV</p>
              <p className="text-white text-xl font-bold">{formatCurrency(totalClosingWDV)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <Card className="bg-black/60 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">
              {reportType === 'summary' && 'Asset Class Summary Report'}
              {reportType === 'detailed' && 'Detailed Asset Report'}
              {reportType === 'schedule-dep' && 'Schedule DEP (ITR-6 Format)'}
            </CardTitle>
            <div className="flex space-x-2">
              {reportType === 'summary' && (
                <Button onClick={exportSummaryReport} className="bg-green-500 hover:bg-green-600 text-black">
                  <Download className="w-4 h-4 mr-2" />
                  Export Summary
                </Button>
              )}
              {reportType === 'detailed' && (
                <Button onClick={exportDetailedReport} className="bg-green-500 hover:bg-green-600 text-black">
                  <Download className="w-4 h-4 mr-2" />
                  Export Detailed
                </Button>
              )}
              {reportType === 'schedule-dep' && (
                <Button onClick={exportScheduleDEP} className="bg-green-500 hover:bg-green-600 text-black">
                  <Download className="w-4 h-4 mr-2" />
                  Export Schedule DEP
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {reportType === 'summary' && (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-600">
                    <TableHead className="text-gray-300">Asset Class</TableHead>
                    <TableHead className="text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-300">Rate</TableHead>
                    <TableHead className="text-gray-300">Assets</TableHead>
                    <TableHead className="text-gray-300">Opening WDV</TableHead>
                    <TableHead className="text-gray-300">Depreciation</TableHead>
                    <TableHead className="text-gray-300">Closing WDV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.map((item, index) => (
                    <TableRow key={index} className="border-gray-600 hover:bg-gray-800/30">
                      <TableCell className="text-white font-medium">{item.assetClass}</TableCell>
                      <TableCell className="text-white">{item.category}</TableCell>
                      <TableCell className="text-white">{item.rate}%</TableCell>
                      <TableCell className="text-white">{item.assetCount}</TableCell>
                      <TableCell className="text-white">{formatCurrency(item.openingWDV)}</TableCell>
                      <TableCell className="text-white">{formatCurrency(item.depreciation)}</TableCell>
                      <TableCell className="text-white">{formatCurrency(item.closingWDV)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-gray-600 bg-gray-800/50 font-bold">
                    <TableCell className="text-white" colSpan={4}>TOTAL</TableCell>
                    <TableCell className="text-white">{formatCurrency(totalOpeningWDV)}</TableCell>
                    <TableCell className="text-white">{formatCurrency(totalDepreciation)}</TableCell>
                    <TableCell className="text-white">{formatCurrency(totalClosingWDV)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}

            {reportType === 'detailed' && (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-600">
                    <TableHead className="text-gray-300">Asset Name</TableHead>
                    <TableHead className="text-gray-300">Company</TableHead>
                    <TableHead className="text-gray-300">Department</TableHead>
                    <TableHead className="text-gray-300">Asset Class</TableHead>
                    <TableHead className="text-gray-300">Purchase Cost</TableHead>
                    <TableHead className="text-gray-300">IT Rate</TableHead>
                    <TableHead className="text-gray-300">Half Year</TableHead>
                    <TableHead className="text-gray-300">Opening WDV</TableHead>
                    <TableHead className="text-gray-300">Depreciation</TableHead>
                    <TableHead className="text-gray-300">Closing WDV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => {
                    const depData = depreciationData.find(d => d.assetId === asset.id);
                    const slab = getAssetSlab(asset.id);
                    return (
                      <TableRow key={asset.id} className="border-gray-600 hover:bg-gray-800/30">
                        <TableCell className="text-white font-medium">{asset.name}</TableCell>
                        <TableCell className="text-white">{asset.company}</TableCell>
                        <TableCell className="text-white">{asset.department}</TableCell>
                        <TableCell className="text-white">{slab?.assetClass || 'Unknown'}</TableCell>
                        <TableCell className="text-white">{formatCurrency(asset.purchasePrice)}</TableCell>
                        <TableCell className="text-white">{slab?.depreciationRate || 0}%</TableCell>
                        <TableCell>
                          {depData?.halfYearRuleApplied ? (
                            <Badge className="bg-orange-500/20 text-orange-300">Yes</Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-300">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-white">{formatCurrency(depData?.openingWDV || 0)}</TableCell>
                        <TableCell className="text-white">{formatCurrency(depData?.currentYearDepreciation || 0)}</TableCell>
                        <TableCell className="text-white">{formatCurrency(depData?.closingWDV || 0)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {reportType === 'schedule-dep' && (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-blue-300 font-medium mb-2">Schedule DEP - Depreciation under Income Tax Act</h3>
                  <p className="text-gray-300 text-sm">For Financial Year {selectedFY}</p>
                  <p className="text-gray-300 text-sm">This format is suitable for ITR-6 filing</p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-600">
                      <TableHead className="text-gray-300">Sr. No.</TableHead>
                      <TableHead className="text-gray-300">Description of Asset</TableHead>
                      <TableHead className="text-gray-300">Rate of Depreciation</TableHead>
                      <TableHead className="text-gray-300">Opening WDV</TableHead>
                      <TableHead className="text-gray-300">Additions</TableHead>
                      <TableHead className="text-gray-300">Deductions</TableHead>
                      <TableHead className="text-gray-300">Depreciation</TableHead>
                      <TableHead className="text-gray-300">Closing WDV</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleDEPData.map((item) => (
                      <TableRow key={item.srNo} className="border-gray-600 hover:bg-gray-800/30">
                        <TableCell className="text-white">{item.srNo}</TableCell>
                        <TableCell className="text-white">{item.description}</TableCell>
                        <TableCell className="text-white">{item.rate}</TableCell>
                        <TableCell className="text-white">{formatCurrency(item.openingWDV)}</TableCell>
                        <TableCell className="text-white">{formatCurrency(item.additions)}</TableCell>
                        <TableCell className="text-white">{formatCurrency(item.deductions)}</TableCell>
                        <TableCell className="text-white">{formatCurrency(item.depreciation)}</TableCell>
                        <TableCell className="text-white">{formatCurrency(item.closingWDV)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-gray-600 bg-gray-800/50 font-bold">
                      <TableCell className="text-white" colSpan={3}>TOTAL</TableCell>
                      <TableCell className="text-white">{formatCurrency(totalOpeningWDV)}</TableCell>
                      <TableCell className="text-white">₹0</TableCell>
                      <TableCell className="text-white">₹0</TableCell>
                      <TableCell className="text-white">{formatCurrency(totalDepreciation)}</TableCell>
                      <TableCell className="text-white">{formatCurrency(totalClosingWDV)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
