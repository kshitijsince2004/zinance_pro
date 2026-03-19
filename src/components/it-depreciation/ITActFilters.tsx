
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, RotateCcw, Search, ArrowUpDown } from 'lucide-react';

interface ITActFiltersProps {
  companyFilter: string;
  setCompanyFilter: (value: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;
  uniqueCompanies: string[];
  uniqueDepartments: string[];
  onRecalculate: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
}

export const ITActFilters: React.FC<ITActFiltersProps> = ({
  companyFilter,
  setCompanyFilter,
  departmentFilter,
  setDepartmentFilter,
  uniqueCompanies,
  uniqueDepartments,
  onRecalculate,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}) => {
  const handleReset = () => {
    setCompanyFilter('all');
    setDepartmentFilter('all');
    setSearchTerm('');
    setSortBy('name');
    setSortOrder('asc');
  };

  // Additional safety filter to ensure no empty strings reach SelectItem
  const safeUniqueCompanies = uniqueCompanies.filter(company => 
    company && 
    typeof company === 'string' && 
    company.trim().length > 0 &&
    company.trim() !== 'null' &&
    company.trim() !== 'undefined'
  );

  const safeUniqueDepartments = uniqueDepartments.filter(dept => 
    dept && 
    typeof dept === 'string' && 
    dept.trim().length > 0 &&
    dept.trim() !== 'null' &&
    dept.trim() !== 'undefined'
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-xs sm:text-sm">Search Assets</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-xs sm:text-sm">Company</Label>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all">All Companies</SelectItem>
                {safeUniqueCompanies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-xs sm:text-sm">Department</Label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all">All Departments</SelectItem>
                {safeUniqueDepartments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortBy" className="text-xs sm:text-sm">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="name">Asset Name</SelectItem>
                <SelectItem value="purchasePrice">Purchase Price</SelectItem>
                <SelectItem value="purchaseDate">Purchase Date</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="depreciationRate">Depreciation Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder" className="text-xs sm:text-sm">Sort Order</Label>
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Actions</Label>
            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Reset
              </Button>
              <Button
                onClick={onRecalculate}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Recalculate
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
