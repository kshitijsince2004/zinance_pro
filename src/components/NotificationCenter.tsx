import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { notificationService, Notification } from '@/lib/notifications';
import { assetService } from '@/lib/assets';
import { Bell, Check, CheckCheck, ExternalLink, Calendar, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadNotifications = () => {
      const allNotifications = notificationService.getNotifications();
      const unread = notificationService.getUnreadCount();
      setNotifications(allNotifications);
      setUnreadCount(unread);
    };

    loadNotifications();

    // Check for new notifications every 30 seconds
    const interval = setInterval(() => {
      notificationService.checkAssetReminders();
      loadNotifications();
    }, 30000);

    // Clean up old notifications daily
    const cleanupInterval = setInterval(() => {
      notificationService.cleanupOldNotifications();
      loadNotifications();
    }, 24 * 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getNotifications());
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    setSelectedNotification(notification);
    setShowDetails(true);
    setIsOpen(false);
  };

  const handleNavigateToAsset = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.assetId) {
      navigate(`/assets/${notification.assetId}`);
    } else {
      // Navigate based on notification type
      if (notification.title.toLowerCase().includes('amc')) {
        navigate('/amc');
      } else if (notification.title.toLowerCase().includes('warranty')) {
        navigate('/assets');
      } else if (notification.title.toLowerCase().includes('report')) {
        navigate('/reports');
      } else {
        navigate('/assets');
      }
    }
    setShowDetails(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getAssetDetails = (notification: Notification) => {
    if (notification.assetId) {
      const assets = assetService.getAllAssets();
      return assets.find(a => a.id === notification.assetId);
    }
    return null;
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-green-500/20 text-white hover:text-white glass-effect border border-green-500/20 bg-black/60"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500 text-black border-green-500"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 sm:w-96 p-0 glass-card border-green-500/20 bg-black/90 backdrop-blur-lg z-50" 
          align="end"
          sideOffset={5}
        >
          <Card className="border-0 bg-transparent">
            <CardHeader className="pb-3 border-b border-green-500/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-green-400 hover:text-green-300 hover:bg-green-500/20 text-xs"
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
              {unreadCount > 0 && (
                <CardDescription className="text-zinc-300 text-sm">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-80">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="w-8 h-8 text-zinc-500 mb-2" />
                    <p className="text-zinc-400 text-sm">No notifications</p>
                    <p className="text-zinc-500 text-xs">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 border-b border-green-500/10 hover:bg-green-500/10 transition-colors cursor-pointer",
                          !notification.read && "bg-green-500/5 border-l-2 border-l-green-500"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={cn(
                                "text-sm font-medium truncate",
                                notification.read ? "text-zinc-300" : "text-white"
                              )}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 ml-2" />
                              )}
                            </div>
                            <p className={cn(
                              "text-xs leading-relaxed",
                              notification.read ? "text-zinc-400" : "text-zinc-300"
                            )}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-zinc-500">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-400 hover:text-green-300 text-xs h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="glass-card border-green-500/20 bg-black/90 backdrop-blur-lg text-white max-w-2xl">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {getNotificationIcon(selectedNotification.type)}
                  <DialogTitle className="text-white text-xl">
                    {selectedNotification.title}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-zinc-300 text-base mt-2">
                  {selectedNotification.message}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-effect p-3 rounded-lg border border-green-500/20 bg-black/40">
                    <p className="text-sm text-zinc-300">Type</p>
                    <p className="font-medium text-white capitalize">{selectedNotification.type}</p>
                  </div>
                  <div className="glass-effect p-3 rounded-lg border border-green-500/20 bg-black/40">
                    <p className="text-sm text-zinc-300">Time</p>
                    <p className="font-medium text-white">
                      {new Date(selectedNotification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {getAssetDetails(selectedNotification) && (
                  <div className="glass-effect p-4 rounded-lg border border-green-500/20 bg-black/40">
                    <h4 className="font-medium text-white mb-3">Related Asset</h4>
                    {(() => {
                      const asset = getAssetDetails(selectedNotification);
                      return asset ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Name:</span>
                            <span className="text-white font-medium">{asset.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Department:</span>
                            <span className="text-white">{asset.department}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-300">Current Value:</span>
                            <span className="text-white">₹{asset.currentValue.toLocaleString('en-IN')}</span>
                          </div>
                          {asset.amcEndDate && (
                            <div className="flex justify-between">
                              <span className="text-zinc-300">AMC Expires:</span>
                              <span className="text-white">{new Date(asset.amcEndDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {asset.warrantyEndDate && (
                            <div className="flex justify-between">
                              <span className="text-zinc-300">Warranty Expires:</span>
                              <span className="text-white">{new Date(asset.warrantyEndDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleNavigateToAsset(selectedNotification)}
                    className="bg-green-500 hover:bg-green-600 text-black flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Related Page
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                    className="glass-effect border-green-500/30 text-white hover:bg-green-500/20 bg-black/60"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
