import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Info, AlertCircle } from 'lucide-react';

const FileFormatRequirements = () => {
  // These requirements are based on the updated field configuration
  const requiredFields = [
    { name: 'Asset Name/Description', description: 'Name or description of the asset', example: 'Dell Laptop' },
    { name: 'Asset Type', description: 'Category of the asset', example: 'Computer Equipment' },
    { name: 'Company Name', description: 'Company that owns the asset', example: 'ABC Corp' },
    { name: 'Department', description: 'Department using the asset', example: 'IT Department' },
    { name: 'Location/Place', description: 'Physical location of the asset', example: 'Mumbai Office, Floor 3' },
    { name: 'Vendor/Party Name', description: 'Supplier or vendor name', example: 'Dell India' },
    { name: 'Date of Acquisition', description: 'Purchase date (YYYY-MM-DD)', example: '2024-01-15' },
    { name: 'Cost of Acquisition', description: 'Purchase price in rupees', example: '50000' },
    { name: 'Useful Life (Years)', description: 'Expected useful life', example: '5' },
    { name: 'Residual Value', description: 'Expected value at end of life', example: '5000' },
    { name: 'Depreciation Method', description: 'Method for depreciation calculation', example: 'SLM' }
  ];

  const optionalFields = [
    { name: 'Serial Number/TAG No.', description: 'Unique identifier', example: 'DELL123456' },
    { name: 'Date of Put to Use', description: 'Date when asset was put to use', example: '2024-01-20' },
    { name: 'Depreciation Rate (%)', description: 'Annual depreciation rate', example: '20' },
    { name: 'Invoice/Bill Number', description: 'Purchase invoice number', example: 'INV-2024-001' },
    { name: 'Current Book Value', description: 'For historical imports', example: '40000' },
    { name: 'Historical Depreciation Years', description: 'Comma-separated years', example: '2021-22,2022-23' },
    { name: 'Owner/Assigned To', description: 'Person assigned to asset', example: 'John Doe' },
    { name: 'Office', description: 'Specific office location', example: 'Mumbai' },
    { name: 'Warranty Start Date', description: 'Warranty start date', example: '2024-01-15' },
    { name: 'Warranty End Date', description: 'Warranty end date', example: '2027-01-15' },
    { name: 'AMC Start Date', description: 'AMC start date', example: '2024-01-15' },
    { name: 'AMC End Date', description: 'AMC end date', example: '2025-01-15' },
    { name: 'Notes/Remarks', description: 'Additional information', example: 'High performance laptop' }
  ];

  const depreciationMethods = [
    { code: 'SLM', name: 'Straight Line Method' },
    { code: 'WDV', name: 'Written Down Value' },
    { code: 'WDV_FIXED_SLAB', name: 'WDV Fixed Slab' },
    { code: 'UNITS', name: 'Units of Production' },
    { code: 'DOUBLE_DECLINING', name: 'Double Declining Balance' },
    { code: 'SUM_OF_YEARS', name: 'Sum of Years Digits' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-500" />
            File Format Requirements
          </CardTitle>
          <CardDescription className="text-gray-400">
            Follow these guidelines for successful import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Guidelines */}
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-400">
              <div className="space-y-2">
                <p><strong>Supported Formats:</strong> Excel (.xlsx, .xls) and CSV (.csv)</p>
                <p><strong>Date Format:</strong> YYYY-MM-DD (e.g., 2024-01-15)</p>
                <p><strong>Currency:</strong> Numbers only, no currency symbols (e.g., 50000 not ₹50,000)</p>
                <p><strong>First Row:</strong> Must contain column headers</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Required Fields */}
          <div className="space-y-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <span className="text-red-400">*</span>
              Required Fields
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {requiredFields.map((field, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg border border-red-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{field.name}</h4>
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{field.description}</p>
                  <p className="text-green-400 text-xs">Example: {field.example}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Optional Fields</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {optionalFields.map((field, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg border border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{field.name}</h4>
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{field.description}</p>
                  <p className="text-green-400 text-xs">Example: {field.example}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Depreciation Methods */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Supported Depreciation Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {depreciationMethods.map((method, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg border border-gray-600">
                  <div className="text-green-400 font-medium">{method.code}</div>
                  <div className="text-gray-400 text-sm">{method.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Data Guidelines */}
          <Alert className="border-yellow-500/30 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              <div className="space-y-2">
                <p><strong>For Historical Data Import:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Include "Current Book Value" for continuing depreciation from existing value</li>
                  <li>Set "Start from Current Value" to "Yes" for historical continuation</li>
                  <li>List historical years as "2021-22,2022-23,2023-24" (comma-separated)</li>
                  <li>System will start new depreciation calculations from current financial year</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Sample Template */}
          <div className="space-y-2">
            <h3 className="text-white font-medium">Sample CSV Structure</h3>
            <div className="bg-black border border-gray-600 rounded-lg p-4 overflow-x-auto">
              <pre className="text-gray-300 text-xs whitespace-pre">
{`Asset Name,Asset Type,Company Name,Department,Location,Vendor Name,Date of Acquisition,Cost of Acquisition,Useful Life,Residual Value,Depreciation Method
Dell Laptop,Computer Equipment,ABC Corp,IT Department,Mumbai Office Floor 3,Dell India,2024-01-15,50000,5,5000,SLM
HP Printer,Computer Equipment,ABC Corp,Admin,Mumbai Office Floor 1,HP India,2024-02-10,25000,5,2500,WDV`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileFormatRequirements;