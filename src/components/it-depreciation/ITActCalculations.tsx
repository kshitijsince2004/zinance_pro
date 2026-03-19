
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Hash, 
  MapPin, 
  User, 
  Calculator,
  TrendingDown,
  FileText,
  Clock
} from 'lucide-react';
import { Asset } from '@/lib/assets';
import { format } from 'date-fns';

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

interface ITActCalculationsProps {
  asset: Asset;
  depreciationData?: ITActDepreciationData;
  slab?: ITActSlab | null;
  financialYear: string;
}

export const ITActCalculations: React.FC<ITActCalculationsProps> = ({
  asset,
  depreciationData,
  slab,
  financialYear
}) => {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const formatDate = (dateString: string) => format(new Date(dateString), 'dd MMM yyyy');

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-500/20 text-green-600 dark:text-green-300',
      disposed: 'bg-red-500/20 text-red-600 dark:text-red-300',
      maintenance: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-300',
      inactive: 'bg-gray-500/20 text-gray-600 dark:text-gray-300'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.active;
  };

  return (
    <div className="space-y-6">
      {/* Asset Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{asset.name}</h2>
          <p className="text-muted-foreground mt-1">Asset ID: {asset.id}</p>
        </div>
        <Badge className={getStatusBadge(asset.status)}>
          {asset.status.toUpperCase()}
        </Badge>
      </div>

      {/* Basic Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Asset Type</p>
                <p className="text-foreground font-medium">{asset.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Building className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="text-foreground font-medium">{asset.company}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="text-foreground font-medium">{asset.department}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-foreground font-medium">{asset.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <p className="text-foreground font-medium">{asset.assignedTo || 'Unassigned'}</p>
              </div>
            </div>
            {asset.category && (
              <div className="flex items-center space-x-3">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="text-foreground font-medium">{asset.category}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Purchase Price</p>
              <p className="text-foreground font-bold text-xl">{formatCurrency(asset.purchasePrice)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Residual Value</p>
              <p className="text-foreground font-medium">{formatCurrency(asset.residualValue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Useful Life</p>
              <p className="text-foreground font-medium">{asset.usefulLife} years</p>
            </div>
            {asset.invoiceNumber && (
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="text-foreground font-medium">{asset.invoiceNumber}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Date Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Purchase Date</p>
                <p className="text-foreground font-medium">{formatDate(asset.purchaseDate)}</p>
              </div>
            </div>
            {asset.putToUseDate && (
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Put to Use Date</p>
                  <p className="text-foreground font-medium">{formatDate(asset.putToUseDate)}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-foreground font-medium">{formatDate(asset.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IT Act Depreciation Details */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            IT Act Depreciation Details - FY {financialYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {slab && depreciationData ? (
            <div className="space-y-6">
              {/* Slab Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Asset Class</p>
                  <p className="text-foreground font-medium">{slab.assetClass}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="text-foreground font-medium">{slab.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Depreciation Rate</p>
                  <p className="text-foreground font-bold text-lg">{slab.depreciationRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rule Type</p>
                  <Badge className={slab.ruleType === 'half_year' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-300' : 'bg-green-500/20 text-green-600 dark:text-green-300'}>
                    {slab.ruleType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Calculation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-blue-600 dark:text-blue-300 text-sm">Opening WDV</p>
                      <p className="text-foreground text-xl font-bold">{formatCurrency(depreciationData.openingWDV)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-red-600 dark:text-red-300 text-sm">Current Year Depreciation</p>
                      <p className="text-foreground text-xl font-bold">{formatCurrency(depreciationData.currentYearDepreciation)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-green-600 dark:text-green-300 text-sm">Closing WDV</p>
                      <p className="text-foreground text-xl font-bold">{formatCurrency(depreciationData.closingWDV)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Calculation Details */}
              <div className="space-y-4">
                <h4 className="text-foreground font-medium">Calculation Details</h4>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Parameter</TableHead>
                      <TableHead className="text-muted-foreground">Value</TableHead>
                      <TableHead className="text-muted-foreground">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-border">
                      <TableCell className="text-foreground">Method</TableCell>
                      <TableCell className="text-foreground">Written Down Value (WDV)</TableCell>
                      <TableCell className="text-muted-foreground">As per Income Tax Act</TableCell>
                    </TableRow>
                    <TableRow className="border-border">
                      <TableCell className="text-foreground">Put to Use Date</TableCell>
                      <TableCell className="text-foreground">{formatDate(depreciationData.calculationDetails.putToUseDate)}</TableCell>
                      <TableCell className="text-muted-foreground">Date when asset was first used</TableCell>
                    </TableRow>
                    <TableRow className="border-border">
                      <TableCell className="text-foreground">Half Year Rule Applied</TableCell>
                      <TableCell>
                        {depreciationData.halfYearRuleApplied ? (
                          <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-300">Yes</Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-600 dark:text-green-300">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {depreciationData.halfYearRuleApplied 
                          ? 'Asset put to use on/after Oct 1st - Half rate applicable'
                          : 'Asset put to use before Oct 1st - Full rate applicable'
                        }
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-border">
                      <TableCell className="text-foreground">Effective Rate</TableCell>
                      <TableCell className="text-foreground">
                        {depreciationData.halfYearRuleApplied 
                          ? `${slab.depreciationRate / 2}%` 
                          : `${slab.depreciationRate}%`
                        }
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {depreciationData.halfYearRuleApplied 
                          ? `${slab.depreciationRate}% ÷ 2 (Half year rule)`
                          : `${slab.depreciationRate}% (Full year)`
                        }
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Notes */}
              {slab.notes && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-foreground font-medium mb-2">Notes</h4>
                  <p className="text-muted-foreground">{slab.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No depreciation data available for this asset</p>
              <p className="text-sm text-muted-foreground mt-2">
                {!slab ? 'No matching IT Act slab found' : 'Depreciation not calculated yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      {(asset.description || asset.serialNumber || asset.model || asset.manufacturer) && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {asset.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-foreground">{asset.description}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {asset.serialNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Serial Number</p>
                    <p className="text-foreground font-medium">{asset.serialNumber}</p>
                  </div>
                )}
                {asset.model && (
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="text-foreground font-medium">{asset.model}</p>
                  </div>
                )}
                {asset.manufacturer && (
                  <div>
                    <p className="text-sm text-muted-foreground">Manufacturer</p>
                    <p className="text-foreground font-medium">{asset.manufacturer}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
