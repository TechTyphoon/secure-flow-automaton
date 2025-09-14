import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MobileOptimizationProps {
  children: React.ReactNode;
  title?: string;
}

const MobileOptimization: React.FC<MobileOptimizationProps> = ({
  children,
  title = "Mobile Preview"
}) => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Detect actual device type
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
        setOrientation('portrait');
      } else if (width < 1024) {
        setDeviceType('tablet');
        setOrientation('landscape');
      } else {
        setDeviceType('desktop');
        setOrientation('landscape');
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  const getDeviceDimensions = () => {
    switch (deviceType) {
      case 'mobile':
        return orientation === 'portrait'
          ? { width: 375, height: 667 }
          : { width: 667, height: 375 };
      case 'tablet':
        return orientation === 'portrait'
          ? { width: 768, height: 1024 }
          : { width: 1024, height: 768 };
      default:
        return { width: 1200, height: 800 };
    }
  };

  const dimensions = getDeviceDimensions();
  const scale = Math.min(1, 600 / dimensions.width);

  const toggleOrientation = () => {
    setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={isFullscreen ? 'fixed inset-4 z-50' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {deviceType === 'mobile' && <Smartphone className="h-5 w-5" />}
              {deviceType === 'tablet' && <Tablet className="h-5 w-5" />}
              {deviceType === 'desktop' && <Monitor className="h-5 w-5" />}
              {title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Responsive design preview and testing
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleOrientation}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Rotate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? 'Exit Full' : 'Fullscreen'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant={deviceType === 'mobile' ? 'default' : 'secondary'}>
            Mobile ({orientation})
          </Badge>
          <Badge variant={deviceType === 'tablet' ? 'default' : 'secondary'}>
            Tablet ({orientation})
          </Badge>
          <Badge variant={deviceType === 'desktop' ? 'default' : 'secondary'}>
            Desktop
          </Badge>
          <Badge variant="outline">
            {dimensions.width} × {dimensions.height}px
          </Badge>
          <Badge variant="outline">
            Scale: {(scale * 100).toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex justify-center">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white"
            style={{
              width: dimensions.width * scale,
              height: dimensions.height * scale,
              maxWidth: '100%',
              maxHeight: '70vh'
            }}
          >
            <div
              className="transform origin-top-left"
              style={{
                transform: `scale(${scale})`,
                width: dimensions.width,
                height: dimensions.height,
                transformOrigin: 'top left'
              }}
            >
              <div className="w-full h-full overflow-auto bg-white">
                {children}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Mobile Optimization Tips:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Touch targets should be at least 44px</li>
            <li>• Text should be readable at small sizes</li>
            <li>• Forms should work well on mobile keyboards</li>
            <li>• Navigation should be thumb-friendly</li>
            <li>• Content should reflow properly on rotation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileOptimization;
