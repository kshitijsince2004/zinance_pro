import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

interface HistoricalColumnMapperProps {
  headers: string[];
  sampleData: any[];
  onMappingCompleted: (mapping: Record<string, string>) => void;
}

const REQUIRED_FIELDS = [
  { key: 'asset_name', label: 'Asset Name', required: true },
  { key: 'category', label: 'Category', required: true },
  { key: 'purchase_date', label: 'Purchase Date', required: true },
  { key: 'purchase_price', label: 'Purchase Price', required: true },
  { key: 'current_book_value', label: 'Current Book Value', required: true },
  { key: 'accumulated_depreciation', label: 'Accumulated Depreciation', required: false },
  { key: 'historical_method', label: 'Historical Depreciation Method', required: true },
  { key: 'historical_rate', label: 'Historical Depreciation Rate', required: true },
  { key: 'historical_useful_life', label: 'Historical Useful Life', required: true },
  { key: 'correct_method', label: 'Correct Depreciation Method', required: true },
  { key: 'correct_rate', label: 'Correct Depreciation Rate', required: true },
  { key: 'correct_useful_life', label: 'Correct Useful Life', required: true },
  { key: 'serial_number', label: 'Serial Number', required: false },
  { key: 'location', label: 'Location', required: false }
];

export const HistoricalColumnMapper: React.FC<HistoricalColumnMapperProps> = ({
  headers,
  sampleData,
  onMappingCompleted
}) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [autoMappingApplied, setAutoMappingApplied] = useState(false);

  React.useEffect(() => {
    applyAutoMapping();
  }, [headers]);

  const applyAutoMapping = () => {
    const autoMapping: Record<string, string> = {};

    REQUIRED_FIELDS.forEach(field => {
      // Try to find matching header
      const matchingHeader = headers.find(header => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedField = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Direct match
        if (normalizedHeader === normalizedField) return true;
        
        // Partial matches
        if (field.key === 'asset_name' && (
          normalizedHeader.includes('asset') && normalizedHeader.includes('name') ||
          normalizedHeader.includes('assetname') ||
          normalizedHeader === 'name'
        )) return true;
        
        if (field.key === 'category' && (
          normalizedHeader.includes('category') ||
          normalizedHeader.includes('class') ||
          normalizedHeader.includes('type')
        )) return true;
        
        if (field.key === 'purchase_date' && (
          normalizedHeader.includes('purchase') && normalizedHeader.includes('date') ||
          normalizedHeader.includes('purchasedate') ||
          normalizedHeader.includes('date')
        )) return true;
        
        if (field.key === 'purchase_price' && (
          normalizedHeader.includes('purchase') && normalizedHeader.includes('price') ||
          normalizedHeader.includes('purchaseprice') ||
          normalizedHeader.includes('cost') ||
          normalizedHeader.includes('value')
        )) return true;

        if (field.key === 'current_book_value' && (
          normalizedHeader.includes('book') && normalizedHeader.includes('value') ||
          normalizedHeader.includes('bookvalue') ||
          normalizedHeader.includes('current') && normalizedHeader.includes('value')
        )) return true;

        if (field.key === 'historical_method' && (
          normalizedHeader.includes('method') ||
          normalizedHeader.includes('depreciation') && normalizedHeader.includes('method')
        )) return true;

        return false;
      });

      if (matchingHeader) {
        autoMapping[matchingHeader] = field.key;
      }
    });

    setMapping(autoMapping);
    setAutoMappingApplied(true);
  };

  const handleMappingChange = (excelColumn: string, systemField: string) => {
    setMapping(prev => ({
      ...prev,
      [excelColumn]: systemField
    }));
  };

  const handleClearMapping = (excelColumn: string) => {
    setMapping(prev => {
      const newMapping = { ...prev };
      delete newMapping[excelColumn];
      return newMapping;
    });
  };

  const getRequiredFieldsStatus = () => {
    const mappedRequiredFields = REQUIRED_FIELDS.filter(field => field.required)
      .map(field => ({
        ...field,
        isMapped: Object.values(mapping).includes(field.key)
      }));

    return mappedRequiredFields;
  };

  const canProceed = () => {
    const requiredFieldsStatus = getRequiredFieldsStatus();
    return requiredFieldsStatus.every(field => field.isMapped);
  };

  const handleProceed = () => {
    if (canProceed()) {
      onMappingCompleted(mapping);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Column Mapping Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={applyAutoMapping}
              disabled={autoMappingApplied}
            >
              {autoMappingApplied ? 'Auto-mapping Applied' : 'Apply Auto-mapping'}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Excel Column</TableHead>
                  <TableHead>Sample Data</TableHead>
                  <TableHead>Map to System Field</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {headers.map((header, index) => {
                  const mappedField = mapping[header];
                  const systemField = REQUIRED_FIELDS.find(f => f.key === mappedField);
                  const sampleValue = sampleData[0]?.[header] || 'N/A';

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">{header}</Badge>
                      </TableCell>
                      <TableCell className="max-w-32 truncate">
                        {sampleValue}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={mappedField || ''}
                          onValueChange={(value) => handleMappingChange(header, value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select field..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">-- Not Mapped --</SelectItem>
                            {REQUIRED_FIELDS.map(field => (
                              <SelectItem 
                                key={field.key} 
                                value={field.key}
                                disabled={Object.values(mapping).includes(field.key) && mapping[header] !== field.key}
                              >
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {systemField?.required && (
                          <Badge variant="destructive">Required</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {mappedField && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearMapping(header)}
                          >
                            Clear
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Fields Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {getRequiredFieldsStatus().map(field => (
              <div key={field.key} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{field.label}</span>
                {field.isMapped ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            ))}
          </div>

          {!canProceed() && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please map all required fields before proceeding.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
        <Button 
          onClick={handleProceed}
          disabled={!canProceed()}
          className="flex items-center space-x-2"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Proceed to Impact Analysis</span>
        </Button>
      </div>
    </div>
  );
};