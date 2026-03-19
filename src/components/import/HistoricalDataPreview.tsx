import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, FileText } from 'lucide-react';

interface HistoricalDataPreviewProps {
  data: any[];
  headers: string[];
  onValidated: () => void;
  onErrorsFound: (errors: string[]) => void;
}

export const HistoricalDataPreview: React.FC<HistoricalDataPreviewProps> = ({
  data,
  headers,
  onValidated,
  onErrorsFound
}) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationStats, setValidationStats] = useState({
    totalRows: 0,
    validRows: 0,
    errorRows: 0,
    warningRows: 0
  });

  useEffect(() => {
    validateData();
  }, [data]);

  const validateData = () => {
    const errors: string[] = [];
    let validRows = 0;
    let errorRows = 0;
    let warningRows = 0;

    // Basic validation rules
    data.forEach((row, index) => {
      const rowNumber = index + 1;
      
      // Check for required fields
      if (!row['Asset Name'] && !row['asset_name'] && !row['Name']) {
        errors.push(`Row ${rowNumber}: Asset name is missing`);
        errorRows++;
        return;
      }

      if (!row['Purchase Price'] && !row['purchase_price'] && !row['Cost']) {
        errors.push(`Row ${rowNumber}: Purchase price is missing`);
        errorRows++;
        return;
      }

      if (!row['Purchase Date'] && !row['purchase_date'] && !row['Date']) {
        errors.push(`Row ${rowNumber}: Purchase date is missing`);
        errorRows++;
        return;
      }

      // Check for year-wise depreciation data
      const hasYearWiseData = headers.some(header => 
        header.match(/\d{4}-\d{2}/) || header.includes('FY') || header.includes('Year')
      );
      
      if (!hasYearWiseData) {
        errors.push(`Row ${rowNumber}: No year-wise depreciation data found`);
        warningRows++;
      } else {
        validRows++;
      }
    });

    setValidationErrors(errors);
    setValidationStats({
      totalRows: data.length,
      validRows,
      errorRows,
      warningRows
    });

    onErrorsFound(errors);
  };

  const handleProceed = () => {
    if (validationErrors.filter(e => e.includes('missing')).length === 0) {
      onValidated();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Data Validation Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{validationStats.totalRows}</div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{validationStats.validRows}</div>
              <div className="text-sm text-muted-foreground">Valid Rows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{validationStats.errorRows}</div>
              <div className="text-sm text-muted-foreground">Error Rows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{validationStats.warningRows}</div>
              <div className="text-sm text-muted-foreground">Warning Rows</div>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Validation Issues Found:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.slice(0, 10).map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                  {validationErrors.length > 10 && (
                    <li className="text-sm italic">... and {validationErrors.length - 10} more issues</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  {headers.slice(0, 8).map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                  {headers.length > 8 && (
                    <TableHead>... +{headers.length - 8} more</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant="outline">{index + 1}</Badge>
                    </TableCell>
                    {headers.slice(0, 8).map((header, cellIndex) => (
                      <TableCell key={cellIndex} className="max-w-32 truncate">
                        {row[header] || '-'}
                      </TableCell>
                    ))}
                    {headers.length > 8 && (
                      <TableCell className="text-muted-foreground">...</TableCell>
                    )}
                  </TableRow>
                ))}
                {data.length > 10 && (
                  <TableRow>
                    <TableCell colSpan={Math.min(headers.length + 1, 10)} className="text-center text-muted-foreground">
                      ... and {data.length - 10} more rows
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Back to Upload
        </Button>
        <Button 
          onClick={handleProceed}
          disabled={validationStats.errorRows > 0}
          className="flex items-center space-x-2"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Proceed to Mapping</span>
        </Button>
      </div>
    </div>
  );
};