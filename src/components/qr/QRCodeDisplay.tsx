
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Printer, Download, Settings, RotateCcw } from 'lucide-react';
import { Asset } from '@/lib/assets';

interface QRCodeDisplayProps {
  value: string;
  size: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  asset?: Asset;
  showPrintControls?: boolean;
}

interface PrintSettings {
  stickerSize: 'small' | 'medium' | 'large';
  includeAssetName: boolean;
  includeSerialNumber: boolean;
  includeDepartment: boolean;
  includeLocation: boolean;
  customDescription: string;
  orientation: 'horizontal' | 'vertical';
  copies: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  value, 
  size,
  bgColor = '#ffffff', 
  fgColor = '#000000',
  level = 'M',
  asset,
  showPrintControls = false
}) => {
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    stickerSize: 'medium',
    includeAssetName: true,
    includeSerialNumber: true,
    includeDepartment: false,
    includeLocation: false,
    customDescription: '',
    orientation: 'horizontal',
    copies: 1
  });

  const getStickerDimensions = () => {
    switch (printSettings.stickerSize) {
      case 'small': return { qrSize: 80, width: '200px', height: '100px' };
      case 'medium': return { qrSize: 120, width: '300px', height: '150px' };
      case 'large': return { qrSize: 160, width: '400px', height: '200px' };
      default: return { qrSize: 120, width: '300px', height: '150px' };
    }
  };

  const stickerDims = getStickerDimensions();

  const resetSettings = () => {
    setPrintSettings({
      stickerSize: 'medium',
      includeAssetName: true,
      includeSerialNumber: true,
      includeDepartment: false,
      includeLocation: false,
      customDescription: '',
      orientation: 'horizontal',
      copies: 1
    });
  };

  const generateStickerLayout = () => {
    const details = [];
    if (asset) {
      if (printSettings.includeAssetName && asset.name) details.push(asset.name);
      if (printSettings.includeSerialNumber && asset.serialNumber) details.push(`SN: ${asset.serialNumber}`);
      if (printSettings.includeDepartment && asset.department) details.push(asset.department);
      if (printSettings.includeLocation && asset.location) details.push(asset.location);
    }
    if (printSettings.customDescription.trim()) details.push(printSettings.customDescription);
    
    return details;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const details = generateStickerLayout();
    const stickerDims = getStickerDimensions();
    
    const stickersHtml = Array.from({ length: printSettings.copies }, (_, index) => `
      <div class="sticker" style="
        width: ${stickerDims.width}; 
        height: ${stickerDims.height}; 
        border: 1px solid #ccc; 
        margin: 10px; 
        padding: 8px; 
        display: ${printSettings.orientation === 'horizontal' ? 'flex' : 'block'}; 
        align-items: center; 
        page-break-inside: avoid;
        background: white;
        font-family: Arial, sans-serif;
      ">
        <div style="
          ${printSettings.orientation === 'horizontal' ? 'flex-shrink: 0; margin-right: 10px;' : 'text-align: center; margin-bottom: 8px;'}
        ">
          <div style="padding: 4px; background: white; display: inline-block;">
            <svg width="${stickerDims.qrSize}" height="${stickerDims.qrSize}" xmlns="http://www.w3.org/2000/svg">
              ${document.querySelector('.qr-code-svg')?.innerHTML || ''}
            </svg>
          </div>
        </div>
        <div style="
          flex: 1; 
          ${printSettings.orientation === 'horizontal' ? '' : 'text-align: center;'}
        ">
          ${details.map(detail => `
            <div style="
              font-size: ${printSettings.stickerSize === 'small' ? '10px' : printSettings.stickerSize === 'medium' ? '12px' : '14px'}; 
              margin-bottom: 2px; 
              font-weight: ${detail === asset?.name ? 'bold' : 'normal'};
              color: #333;
            ">${detail}</div>
          `).join('')}
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Asset QR Code Stickers</title>
        <style>
          @media print {
            body { margin: 0; padding: 10px; }
            .sticker { break-inside: avoid; }
          }
          body { font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        ${stickersHtml}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const exportAsPDF = () => {
    // For now, trigger print - in production, you might use a PDF library
    handlePrint();
  };

  if (!showPrintControls) {
    return (
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG
            value={value}
            size={size}
            level={level}
            includeMargin={true}
            fgColor={fgColor}
            bgColor={bgColor}
            className="qr-code-svg"
          />
        </div>
      </div>
    );
  }

  const details = generateStickerLayout();

  return (
    <div className="space-y-6">
      {/* Print Settings */}
      <Card className="bg-black/60 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Print Management & Sticker Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sticker Size */}
            <div className="space-y-2">
              <Label className="text-gray-300">Sticker Size</Label>
              <Select 
                value={printSettings.stickerSize} 
                onValueChange={(value: 'small' | 'medium' | 'large') => 
                  setPrintSettings({...printSettings, stickerSize: value})
                }
              >
                <SelectTrigger className="bg-black/60 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (2" x 1")</SelectItem>
                  <SelectItem value="medium">Medium (3" x 1.5")</SelectItem>
                  <SelectItem value="large">Large (4" x 2")</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orientation */}
            <div className="space-y-2">
              <Label className="text-gray-300">Layout</Label>
              <Select 
                value={printSettings.orientation} 
                onValueChange={(value: 'horizontal' | 'vertical') => 
                  setPrintSettings({...printSettings, orientation: value})
                }
              >
                <SelectTrigger className="bg-black/60 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">QR + Text Side by Side</SelectItem>
                  <SelectItem value="vertical">QR Top, Text Below</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Number of Copies */}
            <div className="space-y-2">
              <Label className="text-gray-300">Number of Copies</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={printSettings.copies}
                onChange={(e) => setPrintSettings({...printSettings, copies: parseInt(e.target.value) || 1})}
                className="bg-black/60 border-gray-600 text-white"
              />
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* Content Options */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Include on Sticker:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={printSettings.includeAssetName}
                  onChange={(e) => setPrintSettings({...printSettings, includeAssetName: e.target.checked})}
                  className="rounded border-gray-600"
                />
                <span className="text-gray-300">Asset Name</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={printSettings.includeSerialNumber}
                  onChange={(e) => setPrintSettings({...printSettings, includeSerialNumber: e.target.checked})}
                  className="rounded border-gray-600"
                />
                <span className="text-gray-300">Serial Number</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={printSettings.includeDepartment}
                  onChange={(e) => setPrintSettings({...printSettings, includeDepartment: e.target.checked})}
                  className="rounded border-gray-600"
                />
                <span className="text-gray-300">Department</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={printSettings.includeLocation}
                  onChange={(e) => setPrintSettings({...printSettings, includeLocation: e.target.checked})}
                  className="rounded border-gray-600"
                />
                <span className="text-gray-300">Location</span>
              </label>
            </div>
          </div>

          {/* Custom Description */}
          <div className="space-y-2">
            <Label className="text-gray-300">Custom Description (Optional)</Label>
            <Textarea
              value={printSettings.customDescription}
              onChange={(e) => setPrintSettings({...printSettings, customDescription: e.target.value})}
              placeholder="Add custom text to appear on sticker..."
              className="bg-black/60 border-gray-600 text-white"
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handlePrint} className="bg-purple-500 hover:bg-purple-600 text-white">
              <Printer className="w-4 h-4 mr-2" />
              Print {printSettings.copies} Sticker{printSettings.copies > 1 ? 's' : ''}
            </Button>
            <Button onClick={exportAsPDF} variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-500/20">
              <Download className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
            <Button onClick={resetSettings} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="bg-black/60 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white">Sticker Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div 
              className="border-2 border-dashed border-gray-400 bg-white p-2"
              style={{
                width: stickerDims.width,
                height: stickerDims.height,
                display: printSettings.orientation === 'horizontal' ? 'flex' : 'block',
                alignItems: 'center'
              }}
            >
              <div style={{
                flexShrink: 0,
                marginRight: printSettings.orientation === 'horizontal' ? '10px' : '0',
                textAlign: printSettings.orientation === 'vertical' ? 'center' : 'left',
                marginBottom: printSettings.orientation === 'vertical' ? '8px' : '0'
              }}>
                <QRCodeSVG
                  value={value}
                  size={stickerDims.qrSize}
                  level={level}
                  includeMargin={true}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  className="qr-code-svg"
                />
              </div>
              <div style={{
                flex: 1,
                textAlign: printSettings.orientation === 'vertical' ? 'center' : 'left'
              }}>
                {details.map((detail, index) => (
                  <div 
                    key={index}
                    style={{
                      fontSize: printSettings.stickerSize === 'small' ? '10px' : 
                               printSettings.stickerSize === 'medium' ? '12px' : '14px',
                      marginBottom: '2px',
                      color: '#333',
                      fontWeight: detail === asset?.name ? 'bold' : 'normal'
                    }}
                  >
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeDisplay;
