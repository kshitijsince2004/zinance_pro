
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface BlockFiltersProps {
  filterCompany: string;
  setFilterCompany: (value: string) => void;
  filterDepartment: string;
  setFilterDepartment: (value: string) => void;
  uniqueCompanies: string[];
  uniqueDepartments: string[];
}

export const BlockFilters: React.FC<BlockFiltersProps> = ({
  filterCompany,
  setFilterCompany,
  filterDepartment,
  setFilterDepartment,
  uniqueCompanies,
  uniqueDepartments
}) => {
  // Comprehensive validation function with extreme filtering
  const ensureValidStringArray = (arr: string[]): string[] => {
    if (!Array.isArray(arr)) {
      console.warn('BlockFilters - Invalid array received:', arr);
      return [];
    }
    
    return arr.filter(item => {
      // Layer 1: Basic null/undefined check
      if (!item) return false;
      
      // Layer 2: Type check
      if (typeof item !== 'string') return false;
      
      // Layer 3: Empty string after trim
      const trimmed = item.trim();
      if (trimmed === '') return false;
      if (trimmed.length === 0) return false;
      
      // Layer 4: Filter out known invalid values
      const invalidValues = [
        'Unknown Company', 
        'Unknown Department', 
        'Default Company',
        'Default Department',
        'null',
        'undefined',
        'N/A',
        'n/a',
        '',
        ' '
      ];
      
      if (invalidValues.includes(trimmed)) return false;
      
      // Layer 5: Minimum length check
      if (trimmed.length < 1) return false;
      
      return true;
    }).map(item => item.trim());
  };

  // Apply ultra-strict filtering to ensure no empty values reach SelectItem
  const validCompanies = ensureValidStringArray(uniqueCompanies);
  const validDepartments = ensureValidStringArray(uniqueDepartments);

  console.log('BlockFilters - Original companies:', uniqueCompanies);
  console.log('BlockFilters - Valid companies after filtering:', validCompanies);
  console.log('BlockFilters - Original departments:', uniqueDepartments);
  console.log('BlockFilters - Valid departments after filtering:', validDepartments);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="bg-background border-input text-foreground text-xs sm:text-sm">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all">All Companies</SelectItem>
                {validCompanies.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="bg-background border-input text-foreground text-xs sm:text-sm">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all">All Departments</SelectItem>
                {validDepartments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
