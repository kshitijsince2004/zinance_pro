
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Toaster } from '@/components/ui/toaster';
import { authService } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Props interface for Layout component
 * Defines optional children prop for component composition
 */
interface LayoutProps {
  children?: React.ReactNode;
}

/**
 * Layout Component
 * 
 * Main application layout wrapper that provides the core structure for Zinance.
 * This component handles:
 * 
 * 1. Authentication state management and routing
 * 2. Responsive sidebar navigation with mobile optimization
 * 3. Global loading states and user feedback
 * 4. Session management across browser tabs
 * 5. Proper layout structure for all screen sizes
 * 
 * Key Features:
 * - Fully responsive design that adapts from mobile to desktop
 * - Persistent authentication with automatic session restoration
 * - Cross-tab session synchronization for security
 * - Progressive loading with branded loading screens
 * - Accessible navigation structure with proper ARIA support
 * - Toast notification system for user feedback
 * 
 * Technical Implementation:
 * - Uses React Router for nested routing via Outlet
 * - Implements localStorage event listeners for cross-tab sync
 * - Provides mobile-first responsive design patterns
 * - Maintains authentication state across page refreshes
 * - Handles loading states with branded Zinance interface
 * 
 * Security Features:
 * - Automatic logout detection across browser tabs
 * - Session validation on component mount
 * - Secure authentication flow with proper redirects
 * - Prevention of unauthorized access to protected routes
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  // ==================== STATE MANAGEMENT ====================
  
  /**
   * Authentication state management
   * Controls access to the application based on user authentication
   */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  /**
   * Loading state management
   * Shows branded loading screen during authentication checks
   */
  const [isLoading, setIsLoading] = useState(true);
  
  /**
   * Mobile detection hook
   * Provides responsive behavior based on device type
   */
  const isMobile = useIsMobile();

  // ==================== LIFECYCLE HOOKS ====================
  
  /**
   * Component initialization and authentication setup
   * Handles initial authentication check and cross-tab session monitoring
   */
  useEffect(() => {
    console.log('Layout: Component initializing, checking authentication...');
    
    /**
     * Check current authentication status
     * Validates existing session and updates component state
     */
    const checkAuth = () => {
      console.log('Layout: Performing authentication check...');
      const authenticated = authService.isAuthenticated();
      console.log('Layout: Authentication status:', authenticated);
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    // Perform initial authentication check
    checkAuth();

    /**
     * Cross-tab session synchronization handler
     * Monitors localStorage changes to detect logout from other tabs
     * This ensures consistent authentication state across all browser tabs
     * 
     * @param e - Storage event containing changed key and values
     */
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Layout: Storage change detected:', e.key);
      
      // Only respond to authentication-related storage changes
      if (e.key === 'currentUser') {
        console.log('Layout: User session changed, rechecking authentication...');
        checkAuth();
      }
    };

    // Set up cross-tab session monitoring
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup event listener on component unmount
    return () => {
      console.log('Layout: Cleaning up storage event listener...');
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ==================== EVENT HANDLERS ====================
  
  /**
   * Handle successful login
   * Updates authentication state and provides user feedback
   */
  const handleLogin = () => {
    console.log('Layout: User successfully logged in');
    setIsAuthenticated(true);
  };

  /**
   * Handle user logout
   * Clears session and updates authentication state
   */
  const handleLogout = () => {
    console.log('Layout: User logging out...');
    authService.logout();
    setIsAuthenticated(false);
  };

  // ==================== CONDITIONAL RENDERING ====================
  
  /**
   * Loading State Render
   * Shows branded loading screen during authentication checks
   * Features Zinance branding with animated loading indicator
   */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-4">
          {/* Branded loading spinner with Zinance green theme */}
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
          
          {/* Loading text with brand name */}
          <div className="space-y-2">
            <p className="text-sm sm:text-base text-muted-foreground">Loading Zinance...</p>
            <p className="text-xs text-muted-foreground">Fixed Asset Management System</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Unauthenticated State Render
   * Shows login form for users who are not authenticated
   * Features responsive design with proper mobile optimization
   */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  // ==================== MAIN APPLICATION RENDER ====================
  
  /**
   * Authenticated Application Layout
   * Renders the main application interface with sidebar navigation
   * 
   * Layout Structure:
   * - SidebarProvider: Manages sidebar state and responsive behavior
   * - AppSidebar: Main navigation with logout functionality
   * - Main Content Area: Scrollable content area with proper spacing
   * - Glass Card Container: Branded content wrapper with visual effects
   * - Toast Notifications: Global notification system
   */
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* ==================== NAVIGATION SIDEBAR ==================== */}
        <AppSidebar onLogout={handleLogout} />
        
        {/* ==================== MAIN CONTENT AREA ==================== */}
        <main className="flex-1 overflow-auto">
          {/* Content wrapper with responsive padding */}
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Maximum width container for content */}
            <div className="max-w-7xl mx-auto">
              {/* Glass card container with branded styling */}
              <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-6rem)]">
                {/* 
                  Content rendering priority:
                  1. Children prop (for direct content)
                  2. Outlet (for React Router nested routes)
                */}
                {children || <Outlet />}
              </div>
            </div>
          </div>
        </main>
        
        {/* ==================== GLOBAL NOTIFICATIONS ==================== */}
        {/* Toast notification system for user feedback */}
        <Toaster />
      </div>
    </SidebarProvider>
  );
};
