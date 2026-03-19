
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface ReportsFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  uniqueCompanies: string[];
  uniqueDepartments: string[];
  uniqueAssetClasses: string[];
}

export const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  filters,
  setFilters,
  uniqueCompanies,
  uniqueDepartments,
  uniqueAssetClasses
}) => {
  const currentYear = new Date().getFullYear();
  const financialYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Ultra-strict validation function to ensure absolutely no empty values
  const ensureValidStringArray = (arr: string[]): string[] => {
    if (!Array.isArray(arr)) {
      console.warn('ReportsFilters - Invalid array received:', arr);
      return [];
    }
    
    return arr.filter(item => {
      // Multiple validation layers
      if (!item) return false;
      if (typeof item !== 'string') return false;
      
      const trimmed = item.trim();
      if (trimmed === '') return false;
      if (trimmed.length === 0) return false;
      
      // Filter out placeholder/default values
      const invalidValues = [
        'Unknown Company', 
        'Unknown Department', 
        'Unknown Type', 
        'Unknown Category',
        'Default Company',
        'Default Department',
        'null',
        'undefined',
        'N/A',
        'n/a'
      ];
      
      if (invalidValues.includes(trimmed)) return false;
      
      return true;
    }).map(item => item.trim());
  };

  // Clean the arrays to ensure no empty values make it to SelectItem
  const validCompanies = ensureValidStringArray(uniqueCompanies);
  const validDepartments = ensureValidStringArray(uniqueDepartments);
  const validAssetClasses = ensureValidStringArray(uniqueAssetClasses);

  console.log('ReportsFilters - Valid companies for Select:', validCompanies);
  console.log('ReportsFilters - Valid departments for Select:', validDepartments);
  console.log('ReportsFilters - Valid asset classes for Select:', validAssetClasses);

  const updateFilter = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: string, value: string) => {
    // Ensure the value is valid before processing
    if (!value || typeof value !== 'string' || value.trim() === '') {
      console.warn('ReportsFilters - Attempted to toggle invalid filter value:', value);
      return;
    }
    
    const currentArray = filters[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item: string) => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    setFilters({
      financialYear: currentYear,
      companies: [],
      departments: [],
      assetStatus: 'all',
      assetClasses: [],
      verificationStatus: 'all',
      serviceStatus: 'all'
    });
  };

  const activeFiltersCount = 
    filters.companies.length + 
    filters.departments.length + 
    filters.assetClasses.length + 
    (filters.assetStatus !== 'all' ? 1 : 0) +
    (filters.verificationStatus !== 'all' ? 1 : 0) +
    (filters.serviceStatus !== 'all' ? 1 : 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Financial Year */}
          <div>
            <label className="text-sm font-medium mb-2 block">Financial Year</label>
            <Select value={filters.financialYear.toString()} onValueChange={(value) => updateFilter('financialYear', parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {financialYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    FY {year}-{(year + 1).toString().slice(-2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asset Status */}
          <div>
            <label className="text-sm font-medium mb-2 block">Asset Status</label>
            <Select value={filters.assetStatus} onValueChange={(value) => updateFilter('assetStatus', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="text-sm font-medium mb-2 block">Verification</label>
            <Select value={filters.verificationStatus} onValueChange={(value) => updateFilter('verificationStatus', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified This FY</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Service Status */}
          <div>
            <label className="text-sm font-medium mb-2 block">Service Status</label>
            <Select value={filters.serviceStatus} onValueChange={(value) => updateFilter('serviceStatus', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active Services</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Multi-select filters */}
        <div className="mt-4 space-y-4">
          {/* Companies */}
          {validCompanies.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Companies</label>
              <div className="flex flex-wrap gap-2">
                {validCompanies.map(company => (
                  <Badge
                    key={company}
                    variant={filters.companies.includes(company) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('companies', company)}
                  >
                    {company}
                    {filters.companies.includes(company) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Departments */}
          {validDepartments.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Departments</label>
              <div className="flex flex-wrap gap-2">
                {validDepartments.map(dept => (
                  <Badge
                    key={dept}
                    variant={filters.departments.includes(dept) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('departments', dept)}
                  >
                    {dept}
                    {filters.departments.includes(dept) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Asset Classes */}
          {validAssetClasses.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Asset Classes</label>
              <div className="flex flex-wrap gap-2">
                {validAssetClasses.map(assetClass => (
                  <Badge
                    key={assetClass}
                    variant={filters.assetClasses.includes(assetClass) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('assetClasses', assetClass)}
                  >
                    {assetClass}
                    {filters.assetClasses.includes(assetClass) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
