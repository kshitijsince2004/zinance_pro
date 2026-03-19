
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, CheckCircle, XCircle, Filter, Calendar, Users } from 'lucide-react';
import { Asset, assetService } from '@/lib/assets';

const VerificationModule: React.FC = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    company: '',
    location: '',
    status: 'active',
    verificationStatus: 'all' // all, verified, unverified
  });

  // Load assets
  useEffect(() => {
    const allAssets = assetService.getAllAssets();
    setAssets(allAssets);
  }, []);

  // Filter assets
  useEffect(() => {
    let filtered = assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           asset.type.toLowerCase().includes(filters.search.toLowerCase()) ||
                           asset.owner.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesDepartment = !filters.department || asset.department === filters.department;
      const matchesCompany = !filters.company || asset.company === filters.company;
      const matchesLocation = !filters.location || asset.location === filters.location;
      const matchesStatus = !filters.status || asset.status === filters.status;
      
      // Check verification status
      const lastVerified = localStorage.getItem(`asset-verification-${asset.id}`);
      const isVerified = lastVerified && 
        new Date(lastVerified).getTime() > Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days
      
      const matchesVerification = filters.verificationStatus === 'all' ||
        (filters.verificationStatus === 'verified' && isVerified) ||
        (filters.verificationStatus === 'unverified' && !isVerified);

      return matchesSearch && matchesDepartment && matchesCompany && 
             matchesLocation && matchesStatus && matchesVerification;
    });

    setFilteredAssets(filtered);
  }, [assets, filters]);

  // Get unique values for filters
  const departments = [...new Set(assets.map(a => a.department))].filter(Boolean);
  const companies = [...new Set(assets.map(a => a.company))].filter(Boolean);
  const locations = [...new Set(assets.map(a => a.location))].filter(Boolean);

  // Get verification status for an asset
  const getVerificationStatus = (assetId: string) => {
    const lastVerified = localStorage.getItem(`asset-verification-${assetId}`);
    if (!lastVerified) return { verified: false, date: null };
    
    const verificationDate = new Date(lastVerified);
    const isStillValid = verificationDate.getTime() > Date.now() - (90 * 24 * 60 * 60 * 1000);
    
    return { 
      verified: isStillValid, 
      date: verificationDate 
    };
  };

  // Handle asset selection
  const handleAssetSelect = (assetId: string, checked: boolean) => {
    const newSelected = new Set(selectedAssets);
    if (checked) {
      newSelected.add(assetId);
    } else {
      newSelected.delete(assetId);
    }
    setSelectedAssets(newSelected);
  };

  // Select all filtered assets
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredAssets.map(a => a.id));
      setSelectedAssets(allIds);
    } else {
      setSelectedAssets(new Set());
    }
  };

  // Mark selected assets as verified
  const handleVerifySelected = () => {
    const currentDate = new Date().toISOString();
    
    selectedAssets.forEach(assetId => {
      localStorage.setItem(`asset-verification-${assetId}`, currentDate);
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        assetService.addActivity(
          'Asset Verified',
          assetId,
          asset.name,
          'System',
          'success'
        );
      }
    });

    toast({
      title: 'Assets Verified',
      description: `${selectedAssets.size} assets have been marked as verified.`,
    });

    setSelectedAssets(new Set());
    // Refresh the component to show updated verification status
    const allAssets = assetService.getAllAssets();
    setAssets([...allAssets]);
  };

  // Export verification report
  const handleExportReport = () => {
    const reportData = filteredAssets.map(asset => {
      const verification = getVerificationStatus(asset.id);
      return {
        'Asset Name': asset.name,
        'Asset Type': asset.type,
        'Department': asset.department,
        'Location': asset.location,
        'Owner': asset.owner,
        'Status': asset.status,
        'Verified': verification.verified ? 'Yes' : 'No',
        'Last Verification': verification.date ? verification.date.toLocaleDateString() : 'Never',
        'Current Value': `₹${asset.currentValue.toLocaleString()}`
      };
    });

    const csvContent = [
      Object.keys(reportData[0]).join(','),
      ...reportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asset-verification-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Report Exported',
      description: 'Verification report has been downloaded.',
    });
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Asset Verification Module
          </CardTitle>
          <div className="text-sm text-gray-400">
            Verify and track physical asset verification. Verified assets are valid for 90 days.
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="space-y-2">
              <Label className="text-white">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search assets..."
                  className="pl-10 bg-black border-green-500/30 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Department</Label>
              <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                <SelectTrigger className="bg-black border-green-500/30 text-white">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-500/40">
                  <SelectItem value="" className="text-white hover:bg-green-500/20">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept} className="text-white hover:bg-green-500/20">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Company</Label>
              <Select value={filters.company} onValueChange={(value) => setFilters(prev => ({ ...prev, company: value }))}>
                <SelectTrigger className="bg-black border-green-500/30 text-white">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-500/40">
                  <SelectItem value="" className="text-white hover:bg-green-500/20">All Companies</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company} className="text-white hover:bg-green-500/20">
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Location</Label>
              <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                <SelectTrigger className="bg-black border-green-500/30 text-white">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-500/40">
                  <SelectItem value="" className="text-white hover:bg-green-500/20">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location} className="text-white hover:bg-green-500/20">
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-black border-green-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-500/40">
                  <SelectItem value="" className="text-white hover:bg-green-500/20">All Status</SelectItem>
                  <SelectItem value="active" className="text-white hover:bg-green-500/20">Active</SelectItem>
                  <SelectItem value="retired" className="text-white hover:bg-green-500/20">Retired</SelectItem>
                  <SelectItem value="sold" className="text-white hover:bg-green-500/20">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Verification</Label>
              <Select value={filters.verificationStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, verificationStatus: value }))}>
                <SelectTrigger className="bg-black border-green-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-500/40">
                  <SelectItem value="all" className="text-white hover:bg-green-500/20">All Assets</SelectItem>
                  <SelectItem value="verified" className="text-white hover:bg-green-500/20">Verified</SelectItem>
                  <SelectItem value="unverified" className="text-white hover:bg-green-500/20">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between mb-4 p-4 bg-black/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-white">
                <span className="font-semibold">{filteredAssets.length}</span> assets found
              </div>
              <div className="text-green-400">
                <span className="font-semibold">{selectedAssets.size}</span> selected
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleExportReport}
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
              >
                Export Report
              </Button>
              <Button
                onClick={handleVerifySelected}
                disabled={selectedAssets.size === 0}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Selected ({selectedAssets.size})
              </Button>
            </div>
          </div>

          {/* Asset List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {/* Select All */}
            <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg">
              <Checkbox
                checked={filteredAssets.length > 0 && selectedAssets.size === filteredAssets.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-white font-medium">Select All ({filteredAssets.length})</span>
            </div>

            {/* Asset Items */}
            {filteredAssets.map(asset => {
              const verification = getVerificationStatus(asset.id);
              const isSelected = selectedAssets.has(asset.id);
              
              return (
                <div
                  key={asset.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    isSelected 
                      ? 'bg-green-500/20 border-green-500/50' 
                      : 'bg-black/20 border-gray-600/30 hover:bg-black/40'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleAssetSelect(asset.id, checked as boolean)}
                  />
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                    <div>
                      <div className="text-white font-medium">{asset.name}</div>
                      <div className="text-gray-400">{asset.type}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400">Department</div>
                      <div className="text-white">{asset.department}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400">Location</div>
                      <div className="text-white">{asset.location}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400">Owner</div>
                      <div className="text-white">{asset.owner}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={verification.verified 
                          ? 'border-green-400 text-green-400' 
                          : 'border-red-400 text-red-400'
                        }
                      >
                        {verification.verified ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {verification.verified ? 'Verified' : 'Unverified'}
                      </Badge>
                      {verification.date && (
                        <div className="text-xs text-gray-400">
                          {verification.date.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No assets found matching the current filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationModule;
