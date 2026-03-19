
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown } from 'lucide-react';

interface AssetFiltersProps {
  searchBy: string;
  setSearchBy: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  departments: string[];
  categories: string[];
  onBulkAction: (action: string) => void;
}

const AssetFilters: React.FC<AssetFiltersProps> = ({
  searchBy,
  setSearchBy,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  departments,
  categories,
  onBulkAction
}) => {
  return (
    <Card className="bg-black/60 border-green-500/20">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Search By</label>
            <Select value={searchBy} onValueChange={setSearchBy}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-green-500/30">
                <SelectItem value="name" className="text-white hover:bg-green-500/20">Name/Type/Owner</SelectItem>
                <SelectItem value="serial" className="text-white hover:bg-green-500/20">Serial Number</SelectItem>
                <SelectItem value="qr" className="text-white hover:bg-green-500/20">QR Code/ID</SelectItem>
                <SelectItem value="department" className="text-white hover:bg-green-500/20">Department</SelectItem>
                <SelectItem value="category" className="text-white hover:bg-green-500/20">Category</SelectItem>
                <SelectItem value="nbv" className="text-white hover:bg-green-500/20">Net Book Value</SelectItem>
                <SelectItem value="purchaseDate" className="text-white hover:bg-green-500/20">Purchase Date</SelectItem>
                <SelectItem value="importDate" className="text-white hover:bg-green-500/20">Import Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Search Term</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Enter search term..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-green-500/30">
                <SelectItem value="all" className="text-white hover:bg-green-500/20">All Status</SelectItem>
                <SelectItem value="active" className="text-white hover:bg-green-500/20">Active</SelectItem>
                <SelectItem value="retired" className="text-white hover:bg-green-500/20">Retired</SelectItem>
                <SelectItem value="sold" className="text-white hover:bg-green-500/20">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Department</label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-green-500/30">
                <SelectItem value="all" className="text-white hover:bg-green-500/20">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept} className="text-white hover:bg-green-500/20">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-green-500/30">
                <SelectItem value="all" className="text-white hover:bg-green-500/20">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-white hover:bg-green-500/20">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-green-500/30">
                <SelectItem value="name" className="text-white hover:bg-green-500/20">Name</SelectItem>
                <SelectItem value="purchaseDate" className="text-white hover:bg-green-500/20">Purchase Date</SelectItem>
                <SelectItem value="importDate" className="text-white hover:bg-green-500/20">Import Date</SelectItem>
                <SelectItem value="currentValue" className="text-white hover:bg-green-500/20">Current Value</SelectItem>
                <SelectItem value="purchasePrice" className="text-white hover:bg-green-500/20">Purchase Price</SelectItem>
                <SelectItem value="department" className="text-white hover:bg-green-500/20">Department</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Sort Order</label>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Bulk Actions</label>
            <Select onValueChange={onBulkAction}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-green-500/30">
                <SelectItem value="edit" className="text-white hover:bg-green-500/20">Edit Selected</SelectItem>
                <SelectItem value="delete" className="text-white hover:bg-red-500/20">Delete Selected</SelectItem>
                <SelectItem value="verify" className="text-white hover:bg-green-500/20">Verify Selected</SelectItem>
                <SelectItem value="export" className="text-white hover:bg-blue-500/20">Export Selected</SelectItem>
                <SelectItem value="transfer" className="text-white hover:bg-yellow-500/20">Transfer Selected</SelectItem>
                <SelectItem value="dispose" className="text-white hover:bg-orange-500/20">Dispose Selected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetFilters;
