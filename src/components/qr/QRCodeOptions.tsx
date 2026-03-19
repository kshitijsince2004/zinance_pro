
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QRCodeOptions {
  size: 'small' | 'medium' | 'large';
  includeAssetDetails: boolean;
  includeCompanyLogo: boolean;
  format: 'png' | 'svg' | 'pdf';
}

interface QRCodeOptionsProps {
  options: QRCodeOptions;
  onOptionsChange: (options: QRCodeOptions) => void;
}

const QRCodeOptions: React.FC<QRCodeOptionsProps> = ({ options, onOptionsChange }) => {
  const updateOption = (key: keyof QRCodeOptions, value: any) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Size</Label>
          <Select 
            value={options.size} 
            onValueChange={(value: any) => updateOption('size', value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-green-500/30">
              <SelectItem value="small" className="text-white">Small (128px)</SelectItem>
              <SelectItem value="medium" className="text-white">Medium (200px)</SelectItem>
              <SelectItem value="large" className="text-white">Large (300px)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Format</Label>
          <Select 
            value={options.format} 
            onValueChange={(value: any) => updateOption('format', value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-green-500/30">
              <SelectItem value="png" className="text-white">PNG</SelectItem>
              <SelectItem value="svg" className="text-white">SVG</SelectItem>
              <SelectItem value="pdf" className="text-white">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="asset-details"
          checked={options.includeAssetDetails}
          onCheckedChange={(checked) => updateOption('includeAssetDetails', checked)}
        />
        <Label htmlFor="asset-details" className="text-white">Include asset details</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="company-logo"
          checked={options.includeCompanyLogo}
          onCheckedChange={(checked) => updateOption('includeCompanyLogo', checked)}
        />
        <Label htmlFor="company-logo" className="text-white">Include company logo</Label>
      </div>
    </div>
  );
};

export default QRCodeOptions;
export type { QRCodeOptions };
