
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { ColumnMapping, ImportData } from '@/pages/Import';

interface MappingRowProps {
  header: string;
  sampleData: ImportData;
  mapping: ColumnMapping;
  onMappingChange: (importColumn: string, targetField: string) => void;
  fieldOptions: Array<{
    value: string;
    label: string;
    required: boolean;
  }>;
  newFields: string[];
}

const MappingRow: React.FC<MappingRowProps> = ({
  header,
  sampleData,
  mapping,
  onMappingChange,
  fieldOptions,
  newFields
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg border border-gray-600">
      <div className="space-y-1">
        <div className="text-white font-medium">{header}</div>
        <div className="text-gray-400 text-sm">
          Sample: {String(sampleData[header] || 'N/A')}
        </div>
      </div>
      
      <div className="flex items-center">
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
      
      <div>
        <Select
          value={mapping[header] || ''}
          onValueChange={(value) => onMappingChange(header, value)}
        >
          <SelectTrigger className="bg-black border-gray-600 text-white">
            <SelectValue placeholder="Select field..." />
          </SelectTrigger>
          <SelectContent className="bg-black border-gray-600">
            {fieldOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                <div className="flex items-center gap-2">
                  {option.required && <span className="text-red-400">*</span>}
                  {option.label}
                  {Object.values(mapping).includes(option.value) && option.value !== mapping[header] && (
                    <Badge variant="outline" className="text-xs">Used</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
            {newFields.includes(header) && (
              <SelectItem value={`custom_${header.toLowerCase().replace(/\s+/g, '_')}`} className="text-purple-300 hover:bg-purple-500/10">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">+</span>
                  Add as custom field
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default MappingRow;
