
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, MapPin, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ColumnMapping, ImportData } from '@/pages/Import';
import SmartDecisionAlerts from './SmartDecisionAlerts';
import MappingRow from './MappingRow';

interface ColumnMapperProps {
  headers: string[];
  sampleData: ImportData;
  onMappingComplete: (mapping: ColumnMapping) => void;
  onBack: () => void;
}

const ColumnMapper: React.FC<ColumnMapperProps> = ({
  headers,
  sampleData,
  onMappingComplete,
  onBack
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [newFields, setNewFields] = useState<string[]>([]);
  const [smartDecisions, setSmartDecisions] = useState<string[]>([]);

  // Enhanced field options matching your comprehensive asset register
  const fieldOptions = [
    // Basic Asset Information
    { value: 'particular', label: 'Particular', required: false },
    { value: 'name', label: 'Asset Name/Description/Detail Description', required: true },
    { value: 'type', label: 'Asset Type', required: true },
    { value: 'category', label: 'Category', required: false },
    { value: 'status', label: 'Status', required: false },
    { value: 'serialNumber', label: 'Serial Number', required: false },
    
    // Purchase & Vendor Information
    { value: 'purchaseDate', label: 'Purchase Date', required: true },
    { value: 'putToUseDate', label: 'Put to use date', required: false },
    { value: 'vendorName', label: 'Vendor Name', required: false },
    { value: 'partyInvoiceNo', label: 'Party Invoice No', required: false },
    { value: 'vendorInvoiceNo', label: 'Vendor Invoice No', required: false },
    { value: 'vendorInvoiceDate', label: 'Vendor Invoice Date', required: false },
    
    // Financial Information
    { value: 'originalCost', label: 'Original Cost (Rs)', required: true },
    { value: 'salvagedValue', label: 'Salvaged value', required: false },
    { value: 'depMethod', label: 'Dep Method', required: false },
    { value: 'usefulLife', label: 'Useful Life', required: false },
    
    // Administrative Information
    { value: 'company', label: 'Company Name', required: true },
    { value: 'department', label: 'Department', required: true },
    { value: 'location', label: 'Location', required: true },
    { value: 'qty', label: 'Qty/Undated QTY', required: false },
    { value: 'poNo', label: 'PO No', required: false },
    { value: 'poDate', label: 'PO Date', required: false },
    
    // Historical Depreciation Data (2023-24)
    { value: 'accumulatedDep2023', label: 'Accumulated Dep. upto 31.03.2023', required: false },
    { value: 'wdv20230401', label: 'W.D.V as on 01.04.2023', required: false },
    { value: 'lifeUsed2023', label: 'Life Used till 31/03/2023', required: false },
    { value: 'remainingLife20230401', label: 'Remaining Life on 01.04.2023', required: false },
    { value: 'depreciableAmount', label: 'Depreciable amount over whole life', required: false },
    { value: 'remainingLife20240331', label: 'Remaining Life on 31.3.2023', required: false },
    { value: 'dep202324', label: 'Dep for the Year 2023-24', required: false },
    { value: 'wdv20240331', label: 'WDV as on 31.3.2024', required: false },
    { value: 'lifeUsed2024', label: 'Life Used till 31/03/2024', required: false },
    { value: 'remainingLife20240331', label: 'Remaining Life on 31.3.2024', required: false },
    
    // Future Projections (2024-25)
    { value: 'dep202425', label: 'Dep for the Year 2024-25', required: false },
    { value: 'wdv20250331', label: 'WDV as on 31.3.2025', required: false },
    
    // Disposal Information
    { value: 'sold', label: 'SOLD', required: false },
    { value: 'actualSale', label: 'Actual Sale', required: false },
    { value: 'profitLoss', label: 'Profit/(Loss)', required: false },
    
    // Additional Tracking
    { value: 'capDate', label: 'Cap date', required: false },
    { value: 'indentNo', label: 'Indent No', required: false },
    { value: 'indentDate', label: 'Indent Date', required: false },
    { value: 'grnNo', label: 'GRN No', required: false },
    { value: 'grnDate', label: 'GRN Date', required: false },
    { value: 'grnQuantity', label: 'GRN Quantity', required: false },
    { value: 'grnRemarks', label: 'GRN Remarks', required: false },
    { value: 'narration', label: 'Narration', required: false },
    { value: 'pbillNo', label: 'PBILL No', required: false },
    { value: 'lessThan5k', label: 'Less than 5k', required: false },
    
    // Service and Warranty Information
    { value: 'warrantyStartDate', label: 'Warranty Start Date', required: false },
    { value: 'warrantyEndDate', label: 'Warranty End Date', required: false },
    { value: 'amcStartDate', label: 'AMC Start Date', required: false },
    { value: 'amcEndDate', label: 'AMC End Date', required: false },
    
    // System Fields
    { value: 'notes', label: 'Remarks/Notes', required: false },
    { value: 'skip', label: 'Skip this column', required: false }
  ];

  // Auto-map columns based on header names
  useEffect(() => {
    const autoMapping: ColumnMapping = {};
    const detectedNewFields: string[] = [];
    const decisions: string[] = [];

    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      let mapped = false;

      // Enhanced auto-mapping with comprehensive pattern matching
      for (const field of fieldOptions) {
        const fieldLower = field.label.toLowerCase();
        const headerWords = lowerHeader.replace(/[^a-z0-9]/g, ' ').split(' ').filter(w => w.length > 0);
        const fieldWords = fieldLower.replace(/[^a-z0-9]/g, ' ').split(' ').filter(w => w.length > 0);
        
        // Direct label matching
        if (lowerHeader === fieldLower || headerWords.join('') === fieldWords.join('')) {
          autoMapping[header] = field.value;
          mapped = true;
          decisions.push(`Auto-mapped "${header}" to "${field.label}" (exact match)`);
          break;
        }
        
        // Specific field matching patterns
        const matchConditions = [
          // Basic fields
          field.value === 'particular' && lowerHeader.includes('particular'),
          field.value === 'name' && (lowerHeader.includes('description') || lowerHeader.includes('asset') || lowerHeader.includes('item') || lowerHeader.includes('detail')),
          field.value === 'type' && (lowerHeader.includes('asset') && lowerHeader.includes('type')),
          field.value === 'category' && lowerHeader.includes('category'),
          field.value === 'status' && lowerHeader.includes('status'),
          field.value === 'serialNumber' && lowerHeader.includes('serial'),
          
          // Purchase & vendor
          field.value === 'purchaseDate' && lowerHeader.includes('purchase') && lowerHeader.includes('date'),
          field.value === 'putToUseDate' && lowerHeader.includes('put') && lowerHeader.includes('use'),
          field.value === 'vendorName' && lowerHeader.includes('vendor') && lowerHeader.includes('name'),
          field.value === 'partyInvoiceNo' && lowerHeader.includes('party') && lowerHeader.includes('invoice'),
          field.value === 'vendorInvoiceNo' && lowerHeader.includes('vendor') && lowerHeader.includes('invoice') && !lowerHeader.includes('date'),
          field.value === 'vendorInvoiceDate' && lowerHeader.includes('vendor') && lowerHeader.includes('invoice') && lowerHeader.includes('date'),
          
          // Financial
          field.value === 'originalCost' && lowerHeader.includes('original') && lowerHeader.includes('cost'),
          field.value === 'salvagedValue' && lowerHeader.includes('salvaged'),
          field.value === 'depMethod' && lowerHeader.includes('dep') && lowerHeader.includes('method'),
          field.value === 'usefulLife' && lowerHeader.includes('useful') && lowerHeader.includes('life'),
          
          // Administrative
          field.value === 'location' && lowerHeader.includes('location'),
          field.value === 'qty' && (lowerHeader.includes('qty') || lowerHeader.includes('quantity')),
          field.value === 'poNo' && lowerHeader.includes('po') && lowerHeader.includes('no'),
          field.value === 'poDate' && lowerHeader.includes('po') && lowerHeader.includes('date'),
          
          // Historical depreciation patterns
          field.value === 'accumulatedDep2023' && lowerHeader.includes('accumulated') && lowerHeader.includes('2023'),
          field.value === 'wdv20230401' && lowerHeader.includes('wdv') && lowerHeader.includes('2023'),
          field.value === 'dep202324' && lowerHeader.includes('dep') && lowerHeader.includes('2023-24'),
          field.value === 'wdv20240331' && lowerHeader.includes('wdv') && lowerHeader.includes('2024'),
          field.value === 'dep202425' && lowerHeader.includes('dep') && lowerHeader.includes('2024-25'),
          field.value === 'wdv20250331' && lowerHeader.includes('wdv') && lowerHeader.includes('2025'),
          
          // Disposal
          field.value === 'sold' && lowerHeader.includes('sold'),
          field.value === 'actualSale' && lowerHeader.includes('actual') && lowerHeader.includes('sale'),
          field.value === 'profitLoss' && (lowerHeader.includes('profit') || lowerHeader.includes('loss')),
          
          // Additional tracking
          field.value === 'capDate' && lowerHeader.includes('cap') && lowerHeader.includes('date'),
          field.value === 'indentNo' && lowerHeader.includes('indent') && lowerHeader.includes('no'),
          field.value === 'indentDate' && lowerHeader.includes('indent') && lowerHeader.includes('date'),
          field.value === 'grnNo' && lowerHeader.includes('grn') && lowerHeader.includes('no'),
          field.value === 'grnDate' && lowerHeader.includes('grn') && lowerHeader.includes('date'),
          field.value === 'grnQuantity' && lowerHeader.includes('grn') && lowerHeader.includes('quantity'),
          field.value === 'grnRemarks' && lowerHeader.includes('grn') && lowerHeader.includes('remarks'),
          field.value === 'narration' && lowerHeader.includes('narration'),
          field.value === 'pbillNo' && lowerHeader.includes('pbill'),
          field.value === 'lessThan5k' && lowerHeader.includes('5k')
        ];
        
        if (matchConditions.some(condition => condition)) {
          autoMapping[header] = field.value;
          mapped = true;
          decisions.push(`Auto-mapped "${header}" to "${field.label}" (pattern match)`);
          break;
        }
      }

      // If not mapped to a standard field, it's a new custom field
      if (!mapped) {
        detectedNewFields.push(header);
        autoMapping[header] = `custom_${header.toLowerCase().replace(/\s+/g, '_')}`;
        decisions.push(`Created new custom field for "${header}"`);
      }
    });

    setMapping(autoMapping);
    setNewFields(detectedNewFields);
    setSmartDecisions(decisions);
  }, [headers]);

  const handleMappingChange = (importColumn: string, targetField: string) => {
    setMapping(prev => ({
      ...prev,
      [importColumn]: targetField
    }));
  };

  const getRequiredFields = () => {
    return fieldOptions.filter(f => f.required);
  };

  const getMappedRequiredFields = () => {
    const requiredFields = getRequiredFields();
    return requiredFields.filter(field => 
      Object.values(mapping).includes(field.value)
    );
  };

  const canProceed = () => {
    const requiredFields = getRequiredFields();
    const mappedRequiredFields = getMappedRequiredFields();
    return mappedRequiredFields.length === requiredFields.length;
  };

  const handleContinue = () => {
    onMappingComplete(mapping);
  };

  // Check if useful life values might be in days
  const checkUsefulLifeFormat = () => {
    const usefulLifeColumn = Object.keys(mapping).find(key => mapping[key] === 'usefulLife');
    if (usefulLifeColumn && sampleData[usefulLifeColumn]) {
      const value = parseFloat(String(sampleData[usefulLifeColumn]));
      if (!isNaN(value) && value > 50) {
        return { column: usefulLifeColumn, value, possiblyDays: true };
      }
    }
    return null;
  };

  const usefulLifeCheck = checkUsefulLifeFormat();

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-500" />
            Column Mapping
          </CardTitle>
          <CardDescription className="text-gray-400">
            Map your file columns to asset fields. Required fields must be mapped to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Smart Decision Alerts */}
          <SmartDecisionAlerts smartDecisions={smartDecisions} usefulLifeCheck={usefulLifeCheck} />

          {/* Mapping Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="text-green-400 font-medium">Total Columns</div>
              <div className="text-white text-lg font-bold">{headers.length}</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="text-blue-400 font-medium">Required Mapped</div>
              <div className="text-white text-lg font-bold">
                {getMappedRequiredFields().length}/{getRequiredFields().length}
              </div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="text-purple-400 font-medium">New Fields</div>
              <div className="text-white text-lg font-bold">{newFields.length}</div>
            </div>
          </div>

          {/* New Fields Alert */}
          {newFields.length > 0 && (
            <Alert className="border-purple-500/30 bg-purple-500/10">
              <AlertCircle className="h-4 w-4 text-purple-400" />
              <AlertDescription className="text-purple-400">
                <div>
                  <p className="font-medium">New custom fields detected:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newFields.map(field => (
                      <Badge key={field} variant="outline" className="text-purple-300 border-purple-500/50">
                        {field}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-sm">These will be added as custom fields to your asset management system.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Column Mappings */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Map Columns to Fields</h3>
            <div className="space-y-3">
              {headers.map((header, index) => (
                <MappingRow
                  key={index}
                  header={header}
                  sampleData={sampleData}
                  mapping={mapping}
                  onMappingChange={handleMappingChange}
                  fieldOptions={fieldOptions}
                  newFields={newFields}
                />
              ))}
            </div>
          </div>

          {/* Validation */}
          {!canProceed() && (
            <Alert className="border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                <div>
                  <p className="font-medium">Missing required field mappings:</p>
                  <ul className="list-disc list-inside mt-1">
                    {getRequiredFields()
                      .filter(field => !Object.values(mapping).includes(field.value))
                      .map(field => (
                        <li key={field.value}>{field.label}</li>
                      ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-gray-600 text-gray-300 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Preview
            </Button>
            
            <Button 
              onClick={handleContinue}
              disabled={!canProceed()}
              className="bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
            >
              {canProceed() ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Proceed to Import
                </>
              ) : (
                'Complete Required Mappings'
              )}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColumnMapper;
