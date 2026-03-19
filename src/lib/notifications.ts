
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  userId: string;
  assetId?: string;
  actionUrl?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  amcReminders: boolean;
  warrantyReminders: boolean;
  reminderDays: number;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

class NotificationService {
  private notifications: Notification[] = [];
  private settings: NotificationSettings = {
    emailNotifications: true,
    amcReminders: true,
    warrantyReminders: true,
    reminderDays: 30,
    weeklyReports: false,
    monthlyReports: true
  };

  constructor() {
    this.loadSettings();
    this.loadNotifications();
    this.generateRealTimeNotifications();
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('notificationSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  private loadNotifications(): void {
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
    }
  }

  private saveNotifications(): void {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  private generateRealTimeNotifications(): void {
    // Import asset service dynamically to avoid circular dependency
    import('@/lib/assets').then(({ assetService }) => {
      const assets = assetService.getAllAssets();
      const today = new Date();
      const reminderThreshold = new Date(today.getTime() + (this.settings.reminderDays * 24 * 60 * 60 * 1000));

      // Check for AMC expiries
      if (this.settings.amcReminders) {
        assets.forEach(asset => {
          if (asset.amcEndDate) {
            const amcEndDate = new Date(asset.amcEndDate);
            if (amcEndDate <= reminderThreshold && amcEndDate > today) {
              const daysUntilExpiry = Math.ceil((amcEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              // Check if notification already exists
              const existingNotification = this.notifications.find(n => 
                n.assetId === asset.id && 
                n.title.includes('AMC Expiry') && 
                !n.read
              );

              if (!existingNotification) {
                this.addNotification({
                  title: 'AMC Expiry Alert',
                  message: `AMC for ${asset.name} expires in ${daysUntilExpiry} days (${amcEndDate.toLocaleDateString()})`,
                  type: daysUntilExpiry <= 7 ? 'error' : 'warning',
                  userId: 'current',
                  assetId: asset.id,
                  actionUrl: `/assets/${asset.id}`
                });
              }
            }
          }
        });
      }

      // Check for warranty expiries
      if (this.settings.warrantyReminders) {
        assets.forEach(asset => {
          if (asset.warrantyEndDate) {
            const warrantyEndDate = new Date(asset.warrantyEndDate);
            if (warrantyEndDate <= reminderThreshold && warrantyEndDate > today) {
              const daysUntilExpiry = Math.ceil((warrantyEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              // Check if notification already exists
              const existingNotification = this.notifications.find(n => 
                n.assetId === asset.id && 
                n.title.includes('Warranty Expiry') && 
                !n.read
              );

              if (!existingNotification) {
                this.addNotification({
                  title: 'Warranty Expiry Alert',
                  message: `Warranty for ${asset.name} expires in ${daysUntilExpiry} days (${warrantyEndDate.toLocaleDateString()})`,
                  type: daysUntilExpiry <= 7 ? 'error' : 'warning',
                  userId: 'current',
                  assetId: asset.id,
                  actionUrl: `/assets/${asset.id}`
                });
              }
            }
          }
        });
      }

      // Generate weekly reports
      if (this.settings.weeklyReports) {
        const lastWeeklyReport = this.notifications.find(n => 
          n.title === 'Weekly Asset Report' && 
          new Date(n.timestamp).getTime() > (today.getTime() - 7 * 24 * 60 * 60 * 1000)
        );

        if (!lastWeeklyReport) {
          this.addNotification({
            title: 'Weekly Asset Report',
            message: `Weekly report: ${assets.length} total assets, ${assets.filter(a => a.status === 'active').length} active assets`,
            type: 'info',
            userId: 'current',
            actionUrl: '/reports'
          });
        }
      }

      // Generate monthly reports
      if (this.settings.monthlyReports) {
        const lastMonthlyReport = this.notifications.find(n => 
          n.title === 'Monthly Asset Report' && 
          new Date(n.timestamp).getTime() > (today.getTime() - 30 * 24 * 60 * 60 * 1000)
        );

        if (!lastMonthlyReport) {
          this.addNotification({
            title: 'Monthly Asset Report',
            message: `Monthly summary: Total asset value ₹${assets.reduce((sum, a) => sum + a.currentValue, 0).toLocaleString('en-IN')}`,
            type: 'info',
            userId: 'current',
            actionUrl: '/reports'
          });
        }
      }
    }).catch(error => {
      console.error('Error generating notifications:', error);
    });
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Regenerate notifications based on new settings
    this.generateRealTimeNotifications();
  }

  getNotifications(): Notification[] {
    return [...this.notifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    this.notifications.unshift(newNotification);
    this.saveNotifications();
    
    // Send email if enabled
    if (this.settings.emailNotifications) {
      this.sendEmailNotification(newNotification);
    }

    console.log('📧 New notification created:', newNotification);
  }

  private sendEmailNotification(notification: Notification): void {
    // Simulate email sending - in production, this would call an API
    console.log('📧 Email sent:', {
      to: 'user@hero.com',
      subject: notification.title,
      body: notification.message,
      timestamp: notification.timestamp
    });
    
    // Simulate email API call
    setTimeout(() => {
      console.log('✅ Email delivered successfully');
    }, 1000);
  }

  checkAssetReminders(): void {
    if (!this.settings.amcReminders && !this.settings.warrantyReminders) {
      return;
    }

    console.log('🔔 Checking for asset reminders...');
    this.generateRealTimeNotifications();
  }

  generateWeeklyReport(): void {
    if (!this.settings.weeklyReports) return;
    
    this.addNotification({
      title: 'Weekly Asset Report',
      message: 'Your weekly asset management summary is ready',
      type: 'info',
      userId: 'current',
      actionUrl: '/reports'
    });
  }

  generateMonthlyReport(): void {
    if (!this.settings.monthlyReports) return;
    
    this.addNotification({
      title: 'Monthly Asset Report',
      message: 'Your monthly asset management report has been generated',
      type: 'info',
      userId: 'current',
      actionUrl: '/reports'
    });
  }

  // Clean up old notifications (older than 30 days)
  cleanupOldNotifications(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(n => 
      new Date(n.timestamp) > thirtyDaysAgo
    );
    this.saveNotifications();
  }

  // Get notifications for specific asset
  getAssetNotifications(assetId: string): Notification[] {
    return this.notifications.filter(n => n.assetId === assetId);
  }
}

export const notificationService = new NotificationService();
