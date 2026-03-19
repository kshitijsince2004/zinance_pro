
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, CheckCircle, AlertCircle, Settings } from 'lucide-react';

interface FieldMapping {
  source: string;
  target: string;
  mapped: boolean;
}

interface FieldMapperProps {
  sourceSystem: string;
  mappings: FieldMapping[];
}

export const FieldMapper: React.FC<FieldMapperProps> = ({ sourceSystem, mappings }) => {
  const [fieldMappings, setFieldMappings] = useState(mappings);
  const [previewMode, setPreviewMode] = useState(false);

  const targetFields = [
    'name', 'category', 'purchaseDate', 'purchasePrice', 'serialNumber',
    'company', 'department', 'location', 'vendor', 'model', 'manufacturer'
  ];

  const handleMappingChange = (sourceField: string, targetField: string) => {
    setFieldMappings(prev => prev.map(mapping => 
      mapping.source === sourceField 
        ? { ...mapping, target: targetField, mapped: targetField !== 'no_mapping' }
        : mapping
    ));
  };

  const saveMappings = () => {
    // Save mappings to localStorage for persistence
    localStorage.setItem(`${sourceSystem.toLowerCase()}-field-mappings`, JSON.stringify(fieldMappings));
    console.log(`Saved ${sourceSystem} field mappings:`, fieldMappings);
  };

  const loadSuggestions = () => {
    // Auto-suggest mappings based on field names
    const suggestions = fieldMappings.map(mapping => {
      const source = mapping.source.toLowerCase();
      let suggestedTarget = 'no_mapping';
      
      if (source.includes('name') || source.includes('txt50')) suggestedTarget = 'name';
      else if (source.includes('date') || source.includes('aktiv')) suggestedTarget = 'purchaseDate';
      else if (source.includes('price') || source.includes('cost') || source.includes('kansw')) suggestedTarget = 'purchasePrice';
      else if (source.includes('number') || source.includes('anln1')) suggestedTarget = 'serialNumber';
      else if (source.includes('company')) suggestedTarget = 'company';
      else if (source.includes('department') || source.includes('kostl')) suggestedTarget = 'department';
      else if (source.includes('location')) suggestedTarget = 'location';
      else if (source.includes('category') || source.includes('group') || source.includes('anlkl')) suggestedTarget = 'category';
      
      return { ...mapping, target: suggestedTarget, mapped: suggestedTarget !== 'no_mapping' };
    });
    
    setFieldMappings(suggestions);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Field Mapping - {sourceSystem}
        </CardTitle>
        <CardDescription>
          Map {sourceSystem} fields to system fields for accurate data import
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Button onClick={loadSuggestions} variant="outline" size="sm">
            Auto-Suggest Mappings
          </Button>
          <Button onClick={saveMappings} size="sm">
            Save Mappings
          </Button>
          <Button 
            onClick={() => setPreviewMode(!previewMode)} 
            variant="outline" 
            size="sm"
          >
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
        </div>

        <div className="space-y-3">
          {fieldMappings.map((mapping, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-sm">{mapping.source}</div>
                <div className="text-xs text-muted-foreground">{sourceSystem} Field</div>
              </div>
              
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              
              <div className="flex-1">
                {previewMode ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{mapping.target === 'no_mapping' ? 'Not mapped' : mapping.target}</span>
                    {mapping.mapped ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                ) : (
                  <Select 
                    value={mapping.target} 
                    onValueChange={(value) => handleMappingChange(mapping.source, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select target field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_mapping">No mapping</SelectItem>
                      {targetFields.map(field => (
                        <SelectItem key={field} value={field}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="w-20">
                <Badge variant={mapping.mapped ? 'default' : 'destructive'}>
                  {mapping.mapped ? 'Mapped' : 'Unmapped'}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Mapping Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Mapped Fields: {fieldMappings.filter(m => m.mapped).length}</div>
            <div>Unmapped Fields: {fieldMappings.filter(m => !m.mapped).length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
