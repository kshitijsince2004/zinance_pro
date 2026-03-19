
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Asset } from '@/types/asset';
import { auditService } from '@/lib/audit';
import { QrCode, X } from 'lucide-react';
import QRCodeDisplay from './qr/QRCodeDisplay';
import QRCodeOptions, { QRCodeOptions as QRCodeOptionsType } from './qr/QRCodeOptions';
import QRCodeActions from './qr/QRCodeActions';
import AssetDetails from './qr/AssetDetails';

interface EnhancedQRCodeProps {
  asset: Asset;
  onDownload?: (asset: Asset, options: QRCodeOptionsType) => void;
  onPrint?: (asset: Asset, options: QRCodeOptionsType) => void;
  onClose?: () => void;
}

const EnhancedQRCode: React.FC<EnhancedQRCodeProps> = ({ asset, onDownload, onPrint, onClose }) => {
  const [options, setOptions] = useState<QRCodeOptionsType>({
    size: 'medium',
    includeAssetDetails: true,
    includeCompanyLogo: false,
    format: 'png'
  });

  // Ensure consistent QR data generation across the entire application
  const qrData = React.useMemo(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/asset-lookup/${asset.id}`;
  }, [asset.id]);

  const getSizeInPixels = (size: string) => {
    switch (size) {
      case 'small': return 128;
      case 'large': return 300;
      default: return 200;
    }
  };

  const handleDownload = () => {
    auditService.log('download_qr_code', 'asset', asset.id, { assetName: asset.name });
    
    if (onDownload) {
      onDownload(asset, options);
    } else {
      import('qrcode').then((QRCode) => {
        const canvas = document.createElement('canvas');
        const size = getSizeInPixels(options.size);
        
        QRCode.default.toCanvas(canvas, qrData, { 
          width: size,
          margin: 2 
        }, (err) => {
          if (!err) {
            const link = document.createElement('a');
            link.download = `qr-${asset.serialNumber || asset.id}.${options.format}`;
            link.href = canvas.toDataURL(`image/${options.format}`);
            link.click();
          }
        });
      });
    }
  };

  const handlePrint = () => {
    auditService.log('print_qr_code', 'asset', asset.id, { assetName: asset.name });
    
    if (onPrint) {
      onPrint(asset, options);
    } else {
      import('qrcode').then((QRCode) => {
        const canvas = document.createElement('canvas');
        const size = getSizeInPixels(options.size);
        
        QRCode.default.toCanvas(canvas, qrData, { 
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }, (err) => {
          if (!err) {
            const qrImageData = canvas.toDataURL('image/png');
            const companyName = localStorage.getItem('companyName') || 'Hero Corporate Services';
            
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>QR Code - ${asset.serialNumber || asset.name}</title>
                    <style>
                      body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        margin: 20px; 
                        background: white;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                      }
                      .qr-container { 
                        display: inline-block; 
                        padding: 20px; 
                        border: 2px solid #333; 
                        background: white;
                      }
                      .header {
                        margin-bottom: 15px;
                        color: #333;
                      }
                      .company-header {
                        font-size: 20px;
                        font-weight: bold;
                        margin-bottom: 5px;
                      }
                      .asset-details { 
                        margin-top: 15px; 
                        font-size: 12px; 
                        color: #333;
                        line-height: 1.4;
                      }
                      .qr-code-container {
                        background: white;
                        padding: 10px;
                        margin: 10px 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: ${size}px;
                      }
                      .qr-code-container img {
                        border: 1px solid #ddd;
                        max-width: ${size}px;
                        max-height: ${size}px;
                      }
                      @media print {
                        body { 
                          margin: 0; 
                          -webkit-print-color-adjust: exact;
                          color-adjust: exact;
                        }
                        .qr-container { 
                          border: 2px solid #000; 
                        }
                        .qr-code-container img {
                          border: 1px solid #000;
                        }
                      }
                    </style>
                  </head>
                  <body>
                    <div class="qr-container">
                      <div class="header">
                        <div class="company-header">${companyName}</div>
                        <h3>Asset QR Code</h3>
                      </div>
                      <div class="qr-code-container">
                        <img src="${qrImageData}" alt="QR Code for ${asset.name}" />
                      </div>
                      ${options.includeAssetDetails ? `
                        <div class="asset-details">
                          <strong>${asset.name}</strong><br>
                          Asset ID: ${asset.id}<br>
                          Serial: ${asset.serialNumber || 'N/A'}<br>
                          Department: ${asset.department}<br>
                          Location: ${asset.location}<br>
                          Owner: ${asset.owner}
                        </div>
                      ` : ''}
                    </div>
                    <script>
                      window.addEventListener('load', function() {
                        setTimeout(() => window.print(), 500);
                      });
                    </script>
                  </body>
                </html>
              `);
              printWindow.document.close();
            }
          } else {
            console.error('QR generation error:', err);
          }
        });
      });
    }
  };

  const handleShare = async () => {
    auditService.log('share_qr_code', 'asset', asset.id, { assetName: asset.name });
    
    const shareData = {
      title: `Asset QR Code - ${asset.name}`,
      text: `QR Code for asset: ${asset.name} (Serial: ${asset.serialNumber || 'N/A'})`,
      url: qrData
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
        navigator.clipboard.writeText(shareData.url);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-0">
      <Card className="bg-card border border-border">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                <QrCode className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="truncate">QR Code - {asset.name}</span>
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                Asset ID: {asset.id} | Serial: {asset.serialNumber || 'Auto-generated ID'}
              </div>
              <div className="text-xs text-primary mt-1 break-all">
                QR URL: {qrData}
              </div>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground flex-shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <QRCodeDisplay 
            value={qrData} 
            size={Math.min(getSizeInPixels(options.size), 250)}
            asset={asset}
            showPrintControls={true}
          />

          {options.includeAssetDetails && (
            <AssetDetails asset={asset} />
          )}

          <QRCodeOptions 
            options={options} 
            onOptionsChange={setOptions} 
          />

          <QRCodeActions 
            onDownload={handleDownload}
            onPrint={handlePrint}
            onShare={handleShare}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedQRCode;
