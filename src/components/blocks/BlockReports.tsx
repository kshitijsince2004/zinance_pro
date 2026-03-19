
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { Block, BlockAssignment, BlockDepreciationData } from '@/types/blocks';
import { Asset } from '@/lib/assets';
import * as XLSX from 'xlsx';

interface BlockReportsProps {
  assets: Asset[];
  blocks: Block[];
  selectedFY: string;
}

export const BlockReports: React.FC<BlockReportsProps> = ({
  assets,
  blocks,
  selectedFY
}) => {
  const [blockAssignments, setBlockAssignments] = useState<BlockAssignment[]>([]);
  const [blockDepreciationData, setBlockDepreciationData] = useState<BlockDepreciationData[]>([]);
  const [reportType, setReportType] = useState<'register' | 'movements' | 'balances' | 'unassigned' | 'schedule-dep'>('register');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  useEffect(() => {
    loadData();
    calculateBlockDepreciation();
  }, [selectedFY, blocks, assets]);

  const loadData = () => {
    const storedAssignments = localStorage.getItem('block-assignments');
    if (storedAssignments) {
      setBlockAssignments(JSON.parse(storedAssignments));
    }
  };

  const calculateBlockDepreciation = () => {
    const blockDepData: BlockDepreciationData[] = blocks.map(block => {
      const blockAssetIds = blockAssignments
        .filter(ba => ba.blockId === block.id)
        .map(ba => ba.assetId);
      
      const blockAssets = assets.filter(asset => 
        blockAssetIds.includes(asset.id) &&
        (filterCompany === 'all' || asset.company === filterCompany) &&
        (filterDepartment === 'all' || asset.department === filterDepartment)
      );

      const openingWDV = blockAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
      const additions = 0; // Simplified - would need to track acquisitions during FY
      const deletions = 0; // Simplified - would need to track disposals during FY
      
      // Apply half-year rule for additions
      const additionsWithHalfYear = additions * 0.5; // Simplified
      const effectiveWDVForDepreciation = openingWDV + additionsWithHalfYear - deletions;
      
      const currentYearDepreciation = (effectiveWDVForDepreciation * block.depreciationRate) / 100;
      const closingWDV = Math.max(0, effectiveWDVForDepreciation - currentYearDepreciation);

      return {
        blockId: block.id,
        financialYear: selectedFY,
        openingWDV,
        additions,
        deletions,
        currentYearDepreciation,
        closingWDV,
        assetCount: blockAssets.length,
        calculationDetails: {
          additionsWithHalfYear,
          deletionsBeforeDepreciation: deletions,
          effectiveWDVForDepreciation
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    setBlockDepreciationData(blockDepData);
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const getUniqueCompanies = () => [...new Set(assets.map(a => a.company))];
  const getUniqueDepartments = () => [...new Set(assets.map(a => a.department))];

  const getUnassignedAssets = () => {
    const assignedAssetIds = blockAssignments.map(ba => ba.assetId);
    return assets.filter(asset => 
      !assignedAssetIds.includes(asset.id) &&
      (filterCompany === 'all' || asset.company === filterCompany) &&
      (filterDepartment === 'all' || asset.department === filterDepartment)
    );
  };

  const exportBlockRegister = () => {
    const data = blockDepreciationData.map(depData => {
      const block = blocks.find(b => b.id === depData.blockId);
      return {
        'Block Name': block?.name || 'Unknown',
        'Block Code': block?.code || '-',
        'Asset Class': block?.assetClass || '-',
        'Depreciation Rate': `${block?.depreciationRate || 0}%`,
        'Asset Count': depData.assetCount,
        'Opening WDV': depData.openingWDV,
        'Additions': depData.additions,
        'Deletions': depData.deletions,
        'Current Year Depreciation': depData.currentYearDepreciation,
        'Closing WDV': depData.closingWDV,
        'Financial Year': selectedFY
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Block Register');
    XLSX.writeFile(wb, `Block_Depreciation_Register_FY${selectedFY}.xlsx`);
  };

  const exportScheduleDEP = () => {
    const data = blockDepreciationData.map((depData, index) => {
      const block = blocks.find(b => b.id === depData.blockId);
      return {
        'Sr. No.': index + 1,
        'Description of Asset': `${block?.assetClass || 'Unknown'} - ${block?.name || 'Block'}`,
        'Rate of Depreciation': `${block?.depreciationRate || 0}%`,
        'Opening WDV': depData.openingWDV,
        'Additions during the year': depData.additions,
        'Deductions during the year': depData.deletions,
        'Current Year Depreciation': depData.currentYearDepreciation,
        'Closing WDV': depData.closingWDV
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schedule DEP');
    XLSX.writeFile(wb, `Schedule_DEP_Block_Wise_FY${selectedFY}.xlsx`);
  };

  const exportUnassignedAssets = () => {
    const unassignedAssets = getUnassignedAssets();
    const data = unassignedAssets.map(asset => ({
      'Asset Name': asset.name,
      'Asset ID': asset.id,
      'Company': asset.company,
      'Department': asset.department,
      'Asset Type': asset.type,
      'Purchase Date': asset.purchaseDate,
      'Purchase Cost': asset.purchasePrice,
      'Current Value': asset.currentValue,
      'Status': asset.status
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Unassigned Assets');
    XLSX.writeFile(wb, `Unassigned_Assets_FY${selectedFY}.xlsx`);
  };

  const totalOpeningWDV = blockDepreciationData.reduce((sum, data) => sum + data.openingWDV, 0);
  const totalDepreciation = blockDepreciationData.reduce((sum, data) => sum + data.currentYearDepreciation, 0);
  const totalClosingWDV = blockDepreciationData.reduce((sum, data) => sum + data.closingWDV, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Block Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive block-wise reporting for IT Act compliance</p>
        </div>
        <div className="flex space-x-2">
          {reportType === 'register' && (
            <Button onClick={exportBlockRegister} className="bg-green-500 hover:bg-green-600 text-black">
              <Download className="w-4 h-4 mr-2" />
              Export Register
            </Button>
          )}
          {reportType === 'schedule-dep' && (
            <Button onClick={exportScheduleDEP} className="bg-blue-500 hover:bg-blue-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export Schedule DEP
            </Button>
          )}
          {reportType === 'unassigned' && (
            <Button onClick={exportUnassignedAssets} className="bg-orange-500 hover:bg-orange-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export Unassigned
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {getUniqueCompanies().map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {getUniqueDepartments().map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="register">Block-Wise Register</SelectItem>
                <SelectItem value="balances">Opening & Closing Balances</SelectItem>
                <SelectItem value="unassigned">Unassigned Assets</SelectItem>
                <SelectItem value="schedule-dep">Schedule DEP (ITR-6)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-blue-600 dark:text-blue-300 text-sm">Total Blocks</p>
              <p className="text-foreground text-2xl font-bold">{blocks.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-green-600 dark:text-green-300 text-sm">Opening WDV</p>
              <p className="text-foreground text-xl font-bold">{formatCurrency(totalOpeningWDV)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-300 text-sm">Total Depreciation</p>
              <p className="text-foreground text-xl font-bold">{formatCurrency(totalDepreciation)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-purple-600 dark:text-purple-300 text-sm">Closing WDV</p>
              <p className="text-foreground text-xl font-bold">{formatCurrency(totalClosingWDV)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            {reportType === 'register' && <><BarChart3 className="w-5 h-5 mr-2" />Block-Wise Depreciation Register</>}
            {reportType === 'balances' && <><TrendingUp className="w-5 h-5 mr-2" />Opening & Closing Balances</>}
            {reportType === 'unassigned' && <><FileText className="w-5 h-5 mr-2" />Unassigned Assets Report</>}
            {reportType === 'schedule-dep' && <><FileText className="w-5 h-5 mr-2" />Schedule DEP (ITR-6 Format)</>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] w-full">
            {reportType === 'register' && (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Block Name</TableHead>
                    <TableHead className="text-muted-foreground">Asset Class</TableHead>
                    <TableHead className="text-muted-foreground">Rate</TableHead>
                    <TableHead className="text-muted-foreground">Assets</TableHead>
                    <TableHead className="text-muted-foreground">Opening WDV</TableHead>
                    <TableHead className="text-muted-foreground">Additions</TableHead>
                    <TableHead className="text-muted-foreground">Deletions</TableHead>
                    <TableHead className="text-muted-foreground">Depreciation</TableHead>
                    <TableHead className="text-muted-foreground">Closing WDV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockDepreciationData.map((depData) => {
                    const block = blocks.find(b => b.id === depData.blockId);
                    return (
                      <TableRow key={depData.blockId} className="border-border hover:bg-muted/50">
                        <TableCell className="text-foreground font-medium">{block?.name || 'Unknown'}</TableCell>
                        <TableCell className="text-foreground">{block?.assetClass || '-'}</TableCell>
                        <TableCell className="text-foreground">{block?.depreciationRate || 0}%</TableCell>
                        <TableCell className="text-foreground">{depData.assetCount}</TableCell>
                        <TableCell className="text-foreground">{formatCurrency(depData.openingWDV)}</TableCell>
                        <TableCell className="text-foreground">{formatCurrency(depData.additions)}</TableCell>
                        <TableCell className="text-foreground">{formatCurrency(depData.deletions)}</TableCell>
                        <TableCell className="text-foreground">{formatCurrency(depData.currentYearDepreciation)}</TableCell>
                        <TableCell className="text-foreground">{formatCurrency(depData.closingWDV)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="border-border bg-muted/50 font-bold">
                    <TableCell className="text-foreground" colSpan={4}>TOTAL</TableCell>
                    <TableCell className="text-foreground">{formatCurrency(totalOpeningWDV)}</TableCell>
                    <TableCell className="text-foreground">₹0</TableCell>
                    <TableCell className="text-foreground">₹0</TableCell>
                    <TableCell className="text-foreground">{formatCurrency(totalDepreciation)}</TableCell>
                    <TableCell className="text-foreground">{formatCurrency(totalClosingWDV)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}

            {reportType === 'unassigned' && (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Asset Name</TableHead>
                    <TableHead className="text-muted-foreground">Company</TableHead>
                    <TableHead className="text-muted-foreground">Department</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Purchase Cost</TableHead>
                    <TableHead className="text-muted-foreground">Current Value</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getUnassignedAssets().map((asset) => (
                    <TableRow key={asset.id} className="border-border hover:bg-muted/50">
                      <TableCell className="text-foreground font-medium">{asset.name}</TableCell>
                      <TableCell className="text-foreground">{asset.company}</TableCell>
                      <TableCell className="text-foreground">{asset.department}</TableCell>
                      <TableCell className="text-foreground">{asset.type}</TableCell>
                      <TableCell className="text-foreground">{formatCurrency(asset.purchasePrice)}</TableCell>
                      <TableCell className="text-foreground">{formatCurrency(asset.currentValue)}</TableCell>
                      <TableCell>
                        <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-300">
                          {asset.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {reportType === 'schedule-dep' && (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Sr. No.</TableHead>
                    <TableHead className="text-muted-foreground">Description of Asset</TableHead>
                    <TableHead className="text-muted-foreground">Rate of Depreciation</TableHead>
                    <TableHead className="text-muted-foreground">Opening WDV</TableHead>
                    <TableHead className="text-muted-foreground">Additions</TableHead>
                    <TableHead className="text-muted-foreground">Deductions</TableHead>
                    <TableHead className="text-muted-foreground">Depreciation</TableHead>
                    <TableHead className="text-muted-foreground">Closing WDV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockDepreciationData.map((depData, index) => {
                    const block = blocks.find(b => b.id === depData.blockId);
                    return (
                      <TableRow key={depData.blockId} className="border-border hover:bg-muted/50">
                        <TableCell className="text-foreground">{index + 1}</TableCell>
                        <TableCell className="text-foreground">{`${block?.assetClass || 'Unknown'} - ${block?.name || 'Block'}`}</TableCell>
                        <TableCell className="text-foreground">{block?.depreciationRate || 0}%</TableCell>
                        <TableCell className="text-foreground">{formatCurrency(depData.openingWDV)}</TableCell>
                        <TableCell className="text-foreground">{formatCurrency(depData.additions)}</TableCell>
                        <TableCell className="text-foreground">{formatCurrency(depData.deletions)}</TableCell>
                        <TableCell className="text-foreground">{formatCurrency(depData.currentYearDepreciation)}</TableCell>
                        <TableCell className="text-foreground">{formatCurrency(depData.closingWDV)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="border-border bg-muted/50 font-bold">
                    <TableCell className="text-foreground" colSpan={3}>TOTAL</TableCell>
                    <TableCell className="text-foreground">{formatCurrency(totalOpeningWDV)}</TableCell>
                    <TableCell className="text-foreground">₹0</TableCell>
                    <TableCell className="text-foreground">₹0</TableCell>
                    <TableCell className="text-foreground">{formatCurrency(totalDepreciation)}</TableCell>
                    <TableCell className="text-foreground">{formatCurrency(totalClosingWDV)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
