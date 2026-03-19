
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Camera, XCircle } from 'lucide-react';
import { Asset } from '@/lib/assets';
import jsQR from 'jsqr';

interface QRScanVerificationProps {
  assets: Asset[];
  onAssetFound: (asset: Asset) => void;
}

const QRScanVerification: React.FC<QRScanVerificationProps> = ({
  assets,
  onAssetFound
}) => {
  const [showQRScanDialog, setShowQRScanDialog] = useState(false);
  const [scannedAssetId, setScannedAssetId] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const { toast } = useToast();

  const handleQRScan = () => {
    if (!scannedAssetId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an asset ID.',
        variant: 'destructive',
      });
      return;
    }

    const asset = assets.find(a => a.id === scannedAssetId || a.qrCode === scannedAssetId);
    if (!asset) {
      toast({
        title: 'Asset Not Found',
        description: 'No asset found with the provided ID.',
        variant: 'destructive',
      });
      return;
    }

    onAssetFound(asset);
    setShowQRScanDialog(false);
    setScannedAssetId('');
  };

  const scanQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      const asset = assets.find(a => a.id === code.data || a.qrCode === code.data);
      if (asset) {
        setIsScanning(false);
        onAssetFound(asset);
        setShowQRScanDialog(false);
        stopCamera();
        toast({
          title: 'Asset Found',
          description: `Asset "${asset.name}" detected via QR scan.`,
        });
      } else {
        toast({
          title: 'Asset Not Found',
          description: 'QR code scanned but no matching asset found.',
          variant: 'destructive',
        });
      }
    }

    if (isScanning) {
      animationRef.current = requestAnimationFrame(scanQRCode);
    }
  }, [assets, onAssetFound, isScanning, toast]);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: 'Camera Error',
        description: 'Camera access not supported in this browser.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setIsScanning(true);
        
        toast({
          title: 'Camera Active',
          description: 'Point your camera at a QR code to scan.',
        });
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isCameraActive && isScanning) {
      scanQRCode();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isCameraActive, isScanning, scanQRCode]);

  const handleDialogChange = (open: boolean) => {
    setShowQRScanDialog(open);
    if (!open && isCameraActive) {
      stopCamera();
    }
  };

  return (
    <Dialog open={showQRScanDialog} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-green-500/30 text-white hover:bg-green-500/20 bg-black/80">
          <QrCode className="w-4 h-4 mr-2" />
          QR Scan Verify
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/90 border-green-500/30">
        <DialogHeader>
          <DialogTitle className="text-white">QR Code Verification</DialogTitle>
          <DialogDescription className="text-gray-400">
            Scan or enter asset QR code for verification
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!isCameraActive ? (
            <>
              <Input
                placeholder="Enter Asset ID or QR Code"
                value={scannedAssetId}
                onChange={(e) => setScannedAssetId(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <div className="flex gap-2">
                <Button onClick={handleQRScan} className="flex-1 bg-green-500 hover:bg-green-600 text-black">
                  Verify Asset
                </Button>
                <Button onClick={startCamera} variant="outline" className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Open Scanner
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-gray-800">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-2 border-green-500/50 rounded-md pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-green-400 rounded-lg"></div>
                </div>
                {isScanning && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/60 px-3 py-1 rounded">
                    Scanning for QR codes...
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <Button onClick={stopCamera} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/20">
                  <XCircle className="w-4 h-4 mr-2" />
                  Stop Scanner
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanVerification;
