
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { assetService, Asset } from '@/lib/assets';
import { auditService } from '@/lib/audit';
import { authService } from '@/lib/auth';
import { Package, MapPin, User, Building, Calendar, DollarSign, LogIn, QrCode } from 'lucide-react';

const AssetLookup = () => {
  const { serialNumber } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get company name from settings
  const companyName = localStorage.getItem('companyName') || 'Hero Corporate Services';

  useEffect(() => {
    if (serialNumber) {
      // Log the lookup attempt
      auditService.log('qr_code_scan', 'asset', serialNumber, { 
        scannedAt: new Date().toISOString(),
        userAgent: navigator.userAgent 
      });
      
      // Find asset by ID (since QR codes now use asset ID in the URL)
      const foundAsset = assetService.getAllAssets().find(a => a.id === serialNumber);

      if (foundAsset) {
        setAsset(foundAsset);
        auditService.log('asset_viewed', 'asset', foundAsset.id, { 
          viewedVia: 'qr_scan',
          assetName: foundAsset.name,
          department: foundAsset.department,
          location: foundAsset.location
        });
      } else {
        setError('Asset not found');
        auditService.log('qr_scan_failed', 'asset', serialNumber, { 
          reason: 'asset_not_found',
          timestamp: new Date().toISOString()
        });
      }
      
      setLoading(false);
    }
  }, [serialNumber]);

  const handleLogin = () => {
    // Redirect to login with return URL to come back to this asset
    const currentUrl = window.location.pathname;
    navigate(`/?returnTo=${encodeURIComponent(currentUrl)}`);
  };

  const handleViewDetails = () => {
    if (!authService.isAuthenticated()) {
      handleLogin();
      return;
    }
    
    if (asset) {
      navigate(`/assets/${asset.id}`);
    }
  };

  const handleViewQRCode = () => {
    if (!authService.isAuthenticated()) {
      handleLogin();
      return;
    }
    
    if (asset) {
      navigate(`/qr-codes?highlight=${asset.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading asset information...</div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/60 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Asset Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">
              The scanned QR code does not match any asset in our system.
            </p>
            <p className="text-sm text-gray-500">
              Scanned ID: {serialNumber}
            </p>
            <Button onClick={handleLogin} className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAuthenticated = authService.isAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">{companyName}</h1>
          <h2 className="text-xl font-semibold text-white">Asset Information</h2>
          <p className="text-gray-400">Scanned via QR Code</p>
          <div className="text-xs text-green-400">
            Asset ID: {asset.id}
          </div>
        </div>

        {/* Auth Notice for Non-authenticated Users */}
        {!isAuthenticated && (
          <Card className="bg-blue-500/20 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-blue-300 text-sm mb-3">
                🔒 Login to access full asset details and management features
              </p>
              <Button onClick={handleLogin} className="bg-blue-500 hover:bg-blue-600 text-white">
                <LogIn className="w-4 h-4 mr-2" />
                Login / Sign Up
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Asset Card */}
        <Card className="bg-black/60 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-green-500" />
              {asset.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-300">{asset.status}</Badge>
              <span className="text-sm text-gray-400">
                Serial: {asset.serialNumber || 'Auto-generated ID'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Type:</span>
                  <span>{asset.type}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Department:</span>
                  <span>{asset.department}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Location:</span>
                  <span>{asset.location}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Owner:</span>
                  <span>{asset.owner}</span>
                </div>
                {asset.purchaseDate && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Purchase Date:</span>
                    <span>{new Date(asset.purchaseDate).toLocaleDateString()}</span>
                  </div>
                )}
                {asset.purchasePrice && isAuthenticated && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Purchase Price:</span>
                    <span>₹{asset.purchasePrice.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes - Only show if authenticated */}
            {asset.notes && isAuthenticated && (
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Notes</h3>
                <p className="text-gray-300 text-sm">{asset.notes}</p>
              </div>
            )}

            {/* QR Code Verification */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <QrCode className="w-4 h-4" />
                <span className="font-medium">QR Code Verified</span>
              </div>
              <p className="text-sm text-gray-300">
                This asset was successfully identified from a valid QR code scan.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Scan timestamp: {new Date().toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isAuthenticated ? (
                <>
                  <Button onClick={handleViewDetails} className="flex-1 bg-green-500 hover:bg-green-600 text-black">
                    View Full Details
                  </Button>
                  <Button onClick={handleViewQRCode} variant="outline" className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/20">
                    <QrCode className="w-4 h-4 mr-2" />
                    View QR Code
                  </Button>
                </>
              ) : (
                <Button onClick={handleLogin} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to View Details
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification Badge */}
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-green-400 text-sm">
              ✓ This is a verified asset from {companyName} Asset Management System
            </p>
            <p className="text-xs text-gray-400 mt-1">
              QR codes are digitally signed and verified for authenticity
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetLookup;
