
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer, Share } from 'lucide-react';

interface QRCodeActionsProps {
  onDownload: () => void;
  onPrint: () => void;
  onShare: () => void;
  disabled?: boolean;
}

const QRCodeActions: React.FC<QRCodeActionsProps> = ({ 
  onDownload, 
  onPrint, 
  onShare, 
  disabled = false 
}) => {
  return (
    <div className="flex gap-3">
      <Button 
        onClick={onDownload} 
        disabled={disabled}
        className="flex-1 bg-green-500 hover:bg-green-600 text-black"
      >
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
      <Button 
        onClick={onPrint} 
        disabled={disabled}
        variant="outline" 
        className="flex-1 border-green-500/30 text-white hover:bg-green-500/20"
      >
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
      <Button 
        onClick={onShare} 
        disabled={disabled}
        variant="outline" 
        className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
      >
        <Share className="w-4 h-4 mr-2" />
        Share
      </Button>
    </div>
  );
};

export default QRCodeActions;
