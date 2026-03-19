
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImportData } from '@/pages/Import';
import * as XLSX from 'xlsx';

// Define the props interface for the FileUploader component
interface FileUploaderProps {
  onFileUploaded: (data: ImportData[], headers: string[], fileName: string) => void;
}

// Main FileUploader component for handling file uploads
const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded }) => {
  // State to track loading status during file processing
  const [isLoading, setIsLoading] = useState(false);
  // State to track if drag and drop is active
  const [dragActive, setDragActive] = useState(false);
  // Hook for displaying toast notifications
  const { toast } = useToast();

  // Enhanced date parsing function to handle various date formats
  const parseDate = (value: any): string => {
    // Return empty string if value is null, undefined, or empty
    if (!value) return '';
    
    // If it's already a valid date object (from Excel), convert to ISO string
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    // Convert value to string and trim whitespace
    const stringValue = String(value).trim();
    
    // Handle DD/MM/YYYY format (common in many regions)
    if (stringValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const [day, month, year] = stringValue.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Handle DD-MM-YYYY format (alternative format)
    if (stringValue.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
      const [day, month, year] = stringValue.split('-');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Handle DD.MM.YYYY format (European format)
    if (stringValue.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
      const [day, month, year] = stringValue.split('.');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Handle YYYY-MM-DD format (ISO format - already correct)
    if (stringValue.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
      const [year, month, day] = stringValue.split('-');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try to parse as a regular date using JavaScript Date constructor
    const parsedDate = new Date(stringValue);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
    
    // Return as-is if unable to parse
    return stringValue;
  };

  // Enhanced value processing function to handle different data types
  const processValue = (value: any, header: string): any => {
    // Return empty string for null, undefined, or empty values
    if (value === null || value === undefined || value === '') return '';
    
    // Define keywords that indicate date fields
    const dateFields = ['date', 'acquisition', 'purchase', 'warranty', 'amc', 'insurance', 'use'];
    // Check if current header contains any date-related keywords
    const isDateField = dateFields.some(field => 
      header.toLowerCase().includes(field.toLowerCase())
    );
    
    // Process date fields using the parseDate function
    if (isDateField) {
      return parseDate(value);
    }
    
    // Convert value to string and trim whitespace
    const stringValue = String(value).trim();
    // Attempt to parse as a number
    const numValue = parseFloat(stringValue);
    
    // Return number if valid and not a string with leading zeros (like serial numbers)
    if (!isNaN(numValue) && stringValue !== '' && !stringValue.match(/^0\d+$/)) {
      return numValue;
    }
    
    // Return as string if not a valid number
    return stringValue;
  };

  // Function to parse CSV files with enhanced handling of quoted values
  const parseCSV = (text: string): { data: ImportData[]; headers: string[] } => {
    // Split text into lines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim());
    // Throw error if file is empty
    if (lines.length === 0) throw new Error('File is empty');

    // Better CSV parsing that handles quoted values properly
    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      // Iterate through each character in the line
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        // Toggle quote state when encountering quote character
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          // Only split on comma if not inside quotes
          result.push(current.trim());
          current = '';
        } else {
          // Add character to current field
          current += char;
        }
      }
      
      // Add the last field
      result.push(current.trim());
      return result;
    };

    // Parse headers from first line and remove quotes
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
    const data: ImportData[] = [];

    // Process each data line
    for (let i = 1; i < lines.length; i++) {
      // Parse values from line and remove quotes
      const values = parseCSVLine(lines[i]).map(v => v.replace(/"/g, ''));
      const row: ImportData = {};
      
      // Map each header to its corresponding value
      headers.forEach((header, index) => {
        const rawValue = values[index] || '';
        row[header] = processValue(rawValue, header);
      });
      
      data.push(row);
    }

    return { data, headers };
  };

  // Function to parse Excel files using XLSX library
  const parseExcel = (buffer: ArrayBuffer): { data: ImportData[]; headers: string[] } => {
    // Read the Excel file from buffer with date parsing enabled
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    // Get the first sheet name
    const sheetName = workbook.SheetNames[0];
    // Get the worksheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert worksheet to JSON format with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
    
    // Throw error if no data found
    if (jsonData.length === 0) throw new Error('File is empty');
    
    // Extract headers and convert to strings
    const headers = (jsonData[0] as string[]).map(h => String(h || '').trim());
    const data: ImportData[] = [];

    // Process each data row
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      const rowData: ImportData = {};
      
      // Map each header to its corresponding processed value
      headers.forEach((header, index) => {
        const rawValue = row[index];
        rowData[header] = processValue(rawValue, header);
      });
      
      data.push(rowData);
    }

    return { data, headers };
  };

  // Main function to handle file selection and processing
  const handleFileSelect = async (file: File) => {
    // Return early if no file selected
    if (!file) return;

    // Log file information for debugging
    console.log('File selected:', file.name, file.type, file.size);

    // Define allowed MIME types for file validation
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    // Validate file type using MIME type or file extension
    const isValidType = allowedTypes.some(type => file.type === type) || 
                       file.name.match(/\.(csv|xlsx|xls)$/i);

    // Show error if file type is not valid
    if (!isValidType) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a CSV, XLS, or XLSX file.',
        variant: 'destructive',
      });
      return;
    }

    // Set loading state to true
    setIsLoading(true);

    try {
      let data: ImportData[];
      let headers: string[];

      // Process CSV files
      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        // Read file as text
        const text = await file.text();
        // Parse CSV content
        const result = parseCSV(text);
        data = result.data;
        headers = result.headers;
      } else {
        // Process Excel files
        // Read file as array buffer
        const buffer = await file.arrayBuffer();
        // Parse Excel content
        const result = parseExcel(buffer);
        data = result.data;
        headers = result.headers;
      }

      // Validate that data was extracted
      if (data.length === 0) {
        throw new Error('No data rows found in file');
      }

      // Log parsed data for debugging
      console.log('Parsed data:', { rowCount: data.length, headers });

      // Call the callback function with parsed data
      onFileUploaded(data, headers, file.name);

      // Show success toast
      toast({
        title: 'File Uploaded Successfully',
        description: `Found ${data.length} rows with ${headers.length} columns.`,
      });
    } catch (error) {
      // Log error for debugging
      console.error('Upload error:', error);
      // Show error toast
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to process the file.',
        variant: 'destructive',
      });
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  // Handle file input change event
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Get selected file
    const file = event.target.files?.[0];
    if (file) {
      // Log file selection for debugging
      console.log('File input changed:', file.name);
      // Process the selected file
      handleFileSelect(file);
    }
    // Reset input value to allow re-uploading same file
    event.target.value = '';
  };

  // Handle drag and drop functionality
  const handleDrop = (event: React.DragEvent) => {
    // Prevent default browser behavior
    event.preventDefault();
    // Reset drag active state
    setDragActive(false);
    
    // Get dropped file
    const file = event.dataTransfer.files[0];
    if (file) {
      // Log file drop for debugging
      console.log('File dropped:', file.name);
      // Process the dropped file
      handleFileSelect(file);
    }
  };

  // Handle drag over event
  const handleDragOver = (event: React.DragEvent) => {
    // Prevent default browser behavior
    event.preventDefault();
    // Set drag active state
    setDragActive(true);
  };

  // Handle drag leave event
  const handleDragLeave = (event: React.DragEvent) => {
    // Prevent default browser behavior
    event.preventDefault();
    // Reset drag active state
    setDragActive(false);
  };

  // Handle click on drag area to trigger file input
  const handleClick = () => {
    // Get file input element by ID
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      // Programmatically click the file input
      fileInput.click();
    }
  };

  // Render the component
  return (
    <div className="space-y-6">
      {/* Main upload card */}
      <Card className="bg-black/60 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-500" />
            Upload Asset Data
          </CardTitle>
          <CardDescription className="text-gray-400">
            Upload a CSV or Excel file containing asset information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-600 hover:border-green-500/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <div className="flex flex-col items-center space-y-4">
              {/* Upload icon with dynamic color based on drag state */}
              <Upload className={`w-12 h-12 ${dragActive ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                {/* Main instruction text */}
                <p className="text-white font-medium">Drag and drop your file here</p>
                {/* Secondary instruction text */}
                <p className="text-gray-400 text-sm">or click to browse</p>
              </div>
              {/* Choose file button */}
              <Button 
                variant="outline" 
                className="bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30"
                onClick={(e) => {
                  // Prevent event bubbling
                  e.stopPropagation();
                  // Trigger file input click
                  handleClick();
                }}
              >
                Choose File
              </Button>
              {/* Hidden file input */}
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
              />
            </div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="text-white">Processing file...</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="bg-black/60 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            File Format Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Required columns section */}
          <div className="text-gray-300 space-y-2">
            <h4 className="font-medium text-white">Required Columns:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Asset Type</li>
              <li>Company Name</li>
              <li>Department</li>
              <li>Location / Floor / User</li>
              <li>Description</li>
              <li>Vendor Name</li>
              <li>Date of Acquisition (YYYY-MM-DD)</li>
              <li>Cost of Acquisition</li>
              <li>Useful Life (Years)</li>
              <li>Residual Value</li>
            </ul>
          </div>
          
          {/* Optional columns section */}
          <div className="text-gray-300 space-y-2">
            <h4 className="font-medium text-white">Optional Columns:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Asset ID Number (auto-generated if not provided)</li>
              <li>Date of Put to Use</li>
              <li>Warranty Start/End Date</li>
              <li>AMC Start/End Date</li>
              <li>Insurance Start/End Date, Policy Number</li>
              <li>Serial Number</li>
              <li>Remarks / Notes</li>
              <li>Any custom fields (will be added dynamically)</li>
            </ul>
          </div>

          {/* Custom fields alert */}
          <Alert className="border-yellow-500/30 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              <strong>Note:</strong> Any additional columns found in your file will be automatically recognized and added as custom fields to the asset management system.
            </AlertDescription>
          </Alert>

          {/* Supported date formats section */}
          <div className="text-gray-300 space-y-2">
            <h4 className="font-medium text-white">Supported Date Formats:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>DD/MM/YYYY (e.g., 15/03/2024)</li>
              <li>DD-MM-YYYY (e.g., 15-03-2024)</li>
              <li>DD.MM.YYYY (e.g., 15.03.2024)</li>
              <li>YYYY-MM-DD (e.g., 2024-03-15)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploader;
