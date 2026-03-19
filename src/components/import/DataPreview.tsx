
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, ArrowLeft, ArrowRight } from 'lucide-react';
import { ImportData } from '@/pages/Import';
import ValidationAlerts from './ValidationAlerts';
import DataTable from './DataTable';
import DataSummaryStats from './DataSummaryStats';

// Define the props interface for DataPreview component
interface DataPreviewProps {
  data: ImportData[];                           // Array of imported data
  headers: string[];                            // Array of column headers
  fileName: string;                             // Name of the uploaded file
  onConfirm: () => void;                        // Callback when user confirms data
  onBack: () => void;                           // Callback to go back to upload step
  onDataChange?: (updatedData: ImportData[]) => void; // Optional callback for data changes
}

// DataPreview component for previewing and editing imported data
const DataPreview: React.FC<DataPreviewProps> = ({ 
  data, 
  headers, 
  fileName, 
  onConfirm, 
  onBack,
  onDataChange 
}) => {
  // Count empty rows (rows where all values are empty/null/undefined)
  const emptyRows = data.filter(row => 
    Object.values(row).every(value => value === '' || value === null || value === undefined)
  ).length;

  // Define required fields for asset import validation
  const requiredFields = [
    'Asset Type', 'Company Name', 'Department', 'Description', 
    'Vendor Name', 'Date of Acquisition', 'Cost of Acquisition', 
    'Useful Life', 'Residual Value'
  ];

  // Find missing required fields by checking if headers contain required field names
  const missingRequiredFields = requiredFields.filter(field => 
    !headers.some(header => 
      // Check if header contains the required field name (case insensitive)
      header.toLowerCase().includes(field.toLowerCase()) ||
      // Or if the required field name contains the header (for partial matches)
      field.toLowerCase().includes(header.toLowerCase())
    )
  );

  // Render the data preview interface
  return (
    <div className="space-y-6">
      {/* Main preview card */}
      <Card className="bg-black/60 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-500" />
            Data Preview & Edit
          </CardTitle>
          <CardDescription className="text-gray-400">
            {/* Dynamic description showing file name and row count */}
            Preview and edit data from "{fileName}" - {data.length} rows. Click any cell to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Validation warnings component - shows issues with data */}
          <ValidationAlerts emptyRows={emptyRows} missingRequiredFields={missingRequiredFields} />

          {/* Data table component - displays data in editable table format */}
          <DataTable data={data} headers={headers} onDataChange={onDataChange} />

          {/* Summary statistics component - shows data overview */}
          <DataSummaryStats data={data} headers={headers} emptyRows={emptyRows} />

          {/* Action buttons */}
          <div className="flex justify-between mt-6">
            {/* Back button - returns to upload step */}
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-gray-600 text-gray-300 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
            
            {/* Continue button - proceeds to column mapping */}
            <Button 
              onClick={onConfirm}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Continue to Mapping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPreview;
