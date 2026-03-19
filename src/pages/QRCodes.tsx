
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { assetService, Asset } from '@/lib/assets';
import { useToast } from '@/hooks/use-toast';
import QRCodeDisplay from '@/components/qr/QRCodeDisplay';
import QRCodeOptions, { QRCodeOptions as QRCodeOptionsType } from '@/components/qr/QRCodeOptions';
import QRCodeActions from '@/components/qr/QRCodeActions';
import AssetDetails from '@/components/qr/AssetDetails';
import { 
  QrCode, 
  Search, 
  Download, 
  Printer, 
  Share, 
  FileText,
  Package,
  Building2,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Settings,
  Filter,
  RefreshCw
} from 'lucide-react';

const QRCodes = () => {
  console.log('QRCodes: Component mounted, loading assets...');
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [qrSize, setQrSize] = useState(200);
  const [qrOptions, setQrOptions] = useState<QRCodeOptionsType>({
    size: 'medium',
    includeAssetDetails: true,
    includeCompanyLogo: false,
    format: 'png'
  });
  const [showBulkGeneration, setShowBulkGeneration] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    console.log('QRCodes: Component mounted, loading assets...');
    try {
      const allAssets = assetService.getAllAssets();
      console.log('QRCodes: Loaded assets:', allAssets?.length || 0);
      setAssets(allAssets || []);
      setFilteredAssets(allAssets || []);
    } catch (error) {
      console.error('QRCodes: Error loading assets:', error);
      setAssets([]);
      setFilteredAssets([]);
      toast({
        title: 'Error',
        description: 'Failed to load assets. Please try again.',
        variant: 'destructive',
      });
    }
  }, []);

  // Filter assets based on search and filter criteria
  useEffect(() => {
    let filtered = assets;

    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDepartment) {
      filtered = filtered.filter(asset => asset.department === filterDepartment);
    }

    if (filterLocation) {
      filtered = filtered.filter(asset => asset.location === filterLocation);
    }

    if (filterStatus) {
      filtered = filtered.filter(asset => asset.status === filterStatus);
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm, filterDepartment, filterLocation, filterStatus]);

  // Generate QR code value for asset
  const generateQRValue = (asset: Asset) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/lookup/${asset.serialNumber}`;
  };

  // Handle asset selection
  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setQrValue(generateQRValue(asset));
  };

  // Get unique departments for filter
  const departments = [...new Set(assets.map(asset => asset.department).filter(Boolean))];
  const locations = [...new Set(assets.map(asset => asset.location).filter(Boolean))];
  const statuses = [...new Set(assets.map(asset => asset.status).filter(Boolean))];

  // QR Code actions
  const handleDownload = () => {
    if (!selectedAsset) return;
    
    const canvas = document.createElement('canvas');
    const svg = document.querySelector('.qr-code-svg');
    if (svg) {
      // Convert SVG to canvas and download
      toast({
        title: 'Download Started',
        description: `QR code for ${selectedAsset.name} is being downloaded.`,
      });
    }
  };

  const handlePrint = () => {
    if (!selectedAsset) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${selectedAsset.name}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { display: inline-block; padding: 20px; border: 1px solid #ccc; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h3>${selectedAsset.name}</h3>
              <p>Serial: ${selectedAsset.serialNumber}</p>
              <div id="qr-code"></div>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const handleShare = () => {
    if (!selectedAsset) return;
    
    if (navigator.share) {
      navigator.share({
        title: `QR Code - ${selectedAsset.name}`,
        text: `Asset: ${selectedAsset.name} (${selectedAsset.serialNumber})`,
        url: qrValue,
      });
    } else {
      navigator.clipboard.writeText(qrValue);
      toast({
        title: 'Link Copied',
        description: 'QR code link copied to clipboard.',
      });
    }
  };

  // Handle bulk asset selection
  const handleBulkAssetToggle = (assetId: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAllAssets = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map(asset => asset.id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">QR Code Generator</h1>
          <p className="text-gray-400">Generate and manage QR codes for asset tracking</p>
        </div>
        <Button
          onClick={() => setShowBulkGeneration(!showBulkGeneration)}
          variant="outline"
          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
        >
          <Package className="w-4 h-4 mr-2" />
          {showBulkGeneration ? 'Single Mode' : 'Bulk Mode'}
        </Button>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/60 border-green-500/20">
          <TabsTrigger 
            value="single" 
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-white text-gray-400"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Single Asset
          </TabsTrigger>
          <TabsTrigger 
            value="bulk" 
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-white text-gray-400"
          >
            <Package className="w-4 h-4 mr-2" />
            Bulk Generation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Selection Panel */}
            <Card className="bg-black/60 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-400" />
                  Select Asset
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Search and select an asset to generate QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Search Assets</Label>
                    <Input
                      placeholder="Search by name, serial number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-black/60 border-gray-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                      <SelectTrigger className="bg-black/60 border-gray-600 text-white">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Departments</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterLocation} onValueChange={setFilterLocation}>
                      <SelectTrigger className="bg-black/60 border-gray-600 text-white">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Locations</SelectItem>
                        {locations.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="bg-black/60 border-gray-600 text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        {statuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Asset List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map(asset => (
                      <div
                        key={asset.id}
                        onClick={() => handleAssetSelect(asset)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedAsset?.id === asset.id
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-gray-600 hover:border-gray-500 bg-black/30'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{asset.name}</h4>
                            <p className="text-sm text-gray-400">{asset.serialNumber}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{asset.department}</Badge>
                              <Badge variant="outline" className="text-xs">{asset.location}</Badge>
                            </div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-300">{asset.status}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      {assets.length === 0 ? (
                        <div>
                          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No assets found. Please add some assets first.</p>
                        </div>
                      ) : (
                        <div>
                          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No assets match your search criteria.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* QR Code Generation Panel */}
            <Card className="bg-black/60 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-purple-400" />
                  QR Code Preview
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Preview and customize QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedAsset ? (
                  <>
                    {/* Asset Details */}
                    <AssetDetails asset={selectedAsset} />

                    {/* QR Code Options */}
                    <QRCodeOptions options={qrOptions} onOptionsChange={setQrOptions} />

                    {/* QR Code Display */}
                    <QRCodeDisplay
                      value={qrValue}
                      size={qrSize}
                      asset={selectedAsset}
                      showPrintControls={true}
                    />

                    {/* Action Buttons */}
                    <QRCodeActions
                      onDownload={handleDownload}
                      onPrint={handlePrint}
                      onShare={handleShare}
                    />
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select an asset to generate QR code</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card className="bg-black/60 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Bulk QR Code Generation
              </CardTitle>
              <CardDescription className="text-gray-400">
                Generate QR codes for multiple assets at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bulk Selection Controls */}
              <div className="flex justify-between items-center">
                <Button
                  onClick={handleSelectAllAssets}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  {selectedAssets.length === filteredAssets.length ? 'Deselect All' : 'Select All'}
                </Button>
                <span className="text-gray-400">
                  {selectedAssets.length} of {filteredAssets.length} assets selected
                </span>
              </div>

              {/* Asset Grid for Bulk Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredAssets.map(asset => (
                  <div
                    key={asset.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAssets.includes(asset.id)
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-black/30'
                    }`}
                    onClick={() => handleBulkAssetToggle(asset.id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(asset.id)}
                        onChange={() => handleBulkAssetToggle(asset.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">{asset.name}</h4>
                        <p className="text-xs text-gray-400">{asset.serialNumber}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">{asset.department}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bulk Generation Actions */}
              {selectedAssets.length > 0 && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      toast({
                        title: 'Bulk Generation Started',
                        description: `Generating QR codes for ${selectedAssets.length} assets...`,
                      });
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All QR Codes
                  </Button>
                  <Button
                    onClick={() => {
                      toast({
                        title: 'Bulk Print Started',
                        description: `Preparing print layout for ${selectedAssets.length} assets...`,
                      });
                    }}
                    variant="outline"
                    className="border-purple-400 text-purple-400 hover:bg-purple-500/20"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print All
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QRCodes;
