
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { assetService } from '@/lib/assets';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { AssetOwnershipHistory } from '@/components/AssetOwnershipHistory';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Building,
  Shield,
  FileText,
  QrCode,
  Calculator
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const asset = id ? assetService.getAssetById(id) : null;

  React.useEffect(() => {
    if (asset) {
      generateQRCode();
    }
  }, [asset]);

  const generateQRCode = async () => {
    if (!asset) return;
    
    try {
      // Use consistent QR data format - direct link to asset lookup
      const baseUrl = window.location.origin;
      const qrData = `${baseUrl}/asset-lookup/${asset.id}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl || !asset) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${asset.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handleDelete = () => {
    if (!asset) return;
    
    try {
      assetService.deleteAsset(asset.id);
      toast({
        title: 'Asset Deleted',
        description: 'Asset has been successfully deleted.',
      });
      navigate('/assets');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete asset.',
        variant: 'destructive',
      });
    }
  };

  // Calculate asset age in years with proper date handling
  const calculateAssetAge = () => {
    if (!asset) return 0;
    
    const putToUseDate = new Date(asset.putToUseDate || asset.purchaseDate);
    const currentDate = asset.soldDate ? new Date(asset.soldDate) : new Date();
    const daysElapsed = Math.max(0, differenceInDays(currentDate, putToUseDate));
    return daysElapsed / 365.25;
  };

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">Asset Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested asset could not be found.</p>
          <Link to="/assets">
            <Button className="bg-primary hover:bg-primary/90">
              Back to Assets
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'retired':
        return <Badge className="bg-orange-500 text-white">Retired</Badge>;
      case 'sold':
        return <Badge className="bg-red-500 text-white">Sold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Get real-time calculated values using the correct method from assetService
  const currentValue = assetService.calculateCurrentValueByMethod(asset);
  const depreciationTillDate = asset.purchasePrice - currentValue;
  const assetAgeYears = calculateAssetAge();
  const depreciationPercentage = (depreciationTillDate / asset.purchasePrice) * 100;

  console.log('Asset Detail Page Calculations:', {
    assetName: asset.name,
    method: asset.depreciationMethod,
    purchasePrice: asset.purchasePrice,
    currentValue,
    depreciationTillDate,
    depreciationPercentage,
    assetAge: assetAgeYears
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/assets')}
            className="border-border hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">{asset.name}</h1>
            <p className="text-muted-foreground">{asset.type} • {asset.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(asset.status)}
          <Button
            onClick={() => navigate(`/calculations/${asset.id}`)}
            className="bg-primary hover:bg-primary/90"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Show Calculations
          </Button>
          {authService.hasPermission('write', 'assets') && (
            <div className="flex space-x-2">
              <Link to={`/assets/${asset.id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Package className="w-5 h-5" />
                Asset Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Asset Name</label>
                  <p className="text-foreground font-medium">{asset.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Type</label>
                  <p className="text-foreground font-medium">{asset.type}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Category</label>
                  <p className="text-foreground font-medium">{asset.category}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(asset.status)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Purchase Price</label>
                  <p className="text-foreground font-medium">{formatCurrency(asset.purchasePrice)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Current Value</label>
                  <p className="text-green-600 font-medium text-lg">{formatCurrency(currentValue)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Depreciation Method</label>
                  <p className="text-foreground font-medium">{asset.depreciationMethod}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Depreciation Charged Till Date
                    {asset.depreciationMethod === 'WDV_FIXED_SLAB' && ' (FY Based)'}
                  </label>
                  <p className="text-red-600 font-medium text-lg">{formatCurrency(depreciationTillDate)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Residual Value</label>
                  <p className="text-foreground font-medium">{formatCurrency(asset.residualValue)}</p>
                </div>
                {/* Only show useful life if not WDV_FIXED_SLAB */}
                {asset.depreciationMethod !== 'WDV_FIXED_SLAB' && (
                  <div>
                    <label className="text-sm text-muted-foreground">Useful Life</label>
                    <p className="text-foreground font-medium">{asset.usefulLife} years</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location & Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Department</label>
                  <p className="text-foreground font-medium">{asset.department || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Location</label>
                  <p className="text-foreground font-medium">{asset.location || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Company</label>
                  <p className="text-foreground font-medium">{asset.company || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Office</label>
                  <p className="text-foreground font-medium">{asset.office || 'Not assigned'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Information */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Purchase Date</label>
                  <p className="text-foreground font-medium">
                    {format(new Date(asset.purchaseDate), 'dd MMM yyyy')}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Put to Use Date</label>
                  <p className="text-foreground font-medium">
                    {asset.putToUseDate ? format(new Date(asset.putToUseDate), 'dd MMM yyyy') : 'Same as purchase date'}
                  </p>
                </div>
                {asset.soldDate && (
                  <div>
                    <label className="text-sm text-muted-foreground">Sold Date</label>
                    <p className="text-foreground font-medium">
                      {format(new Date(asset.soldDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-muted-foreground">Last Updated</label>
                  <p className="text-foreground font-medium">
                    {format(new Date(asset.updatedAt), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warranty & AMC */}
          {(asset.warrantyStartDate || asset.amcStartDate) && (
            <Card className="bg-card border">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Warranty & AMC Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {asset.warrantyStartDate && (
                    <>
                      <div>
                        <label className="text-sm text-muted-foreground">Warranty Start</label>
                        <p className="text-foreground font-medium">
                          {format(new Date(asset.warrantyStartDate), 'dd MMMM yyyy')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Warranty End</label>
                        <p className="text-foreground font-medium">
                          {asset.warrantyEndDate ? format(new Date(asset.warrantyEndDate), 'dd MMMM yyyy') : 'N/A'}
                        </p>
                      </div>
                    </>
                  )}
                  {asset.amcStartDate && (
                    <>
                      <div>
                        <label className="text-sm text-muted-foreground">AMC Start</label>
                        <p className="text-foreground font-medium">
                          {format(new Date(asset.amcStartDate), 'dd MMMM yyyy')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">AMC End</label>
                        <p className="text-foreground font-medium">
                          {asset.amcEndDate ? format(new Date(asset.amcEndDate), 'dd MMMM yyyy') : 'N/A'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {asset.notes && (
            <Card className="bg-card border">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{asset.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Asset Image */}
          {(asset as any).assetImage && (
            <Card className="bg-card border">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Asset Image
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <img 
                  src={(asset as any).assetImage} 
                  alt="Asset" 
                  className="max-w-full h-auto max-h-64 mx-auto rounded border"
                />
              </CardContent>
            </Card>
          )}

          {/* Ownership Records */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <User className="w-5 h-5" />
                Ownership History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AssetOwnershipHistory assetId={asset.id} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Asset QR Code
              </CardTitle>
              <CardDescription>
                Scan to quickly access asset information
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {qrCodeUrl && (
                <>
                  <img
                    src={qrCodeUrl}
                    alt="Asset QR Code"
                    className="mx-auto border rounded-lg"
                    width={200}
                    height={200}
                  />
                  <Button
                    onClick={downloadQRCode}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Asset Summary - Updated with real-time calculations */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="text-primary">Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asset Age:</span>
                <span className="font-medium">
                  {assetAgeYears.toFixed(2)} years
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Depreciation %:</span>
                <span className="font-medium">
                  {depreciationPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Value:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(currentValue)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
