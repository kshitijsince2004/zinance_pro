
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/NotificationCenter';
import { authService } from '@/lib/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { isModuleEnabled } from '@/lib/modules';
import { LayoutDashboard, Package, Shield, QrCode, Users, Settings, LogOut, UserCheck, Database, Menu, BarChart3, Wrench, Calculator, Building2, CheckCircle, Upload, FileSpreadsheet, TrendingUp, Shuffle } from 'lucide-react';

interface AppSidebarProps {
  onLogout: () => void;
}

export function AppSidebar({
  onLogout
}: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isMobile = useIsMobile();
  const [moduleConfig, setModuleConfig] = useState(() => {
    return {
      integrations: isModuleEnabled('integrations'),
      reports: isModuleEnabled('reports'),
      blocks: isModuleEnabled('blocks'),
      calculations: isModuleEnabled('calculations'),
      itActDepreciation: isModuleEnabled('itActDepreciation')
    };
  });

  useEffect(() => {
    const handleModuleConfigChange = () => {
      setModuleConfig({
        integrations: isModuleEnabled('integrations'),
        reports: isModuleEnabled('reports'),
        blocks: isModuleEnabled('blocks'),
        calculations: isModuleEnabled('calculations'),
        itActDepreciation: isModuleEnabled('itActDepreciation')
      });
    };

    window.addEventListener('moduleConfigChanged', handleModuleConfigChange);
    return () => window.removeEventListener('moduleConfigChanged', handleModuleConfigChange);
  }, []);

  const menuItems = [{
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
    description: "Overview and analytics",
    permission: "read_dashboard"
  }, {
    title: "Assets",
    url: "/assets",
    icon: Package,
    description: "Manage your assets",
    permission: "read_assets"
  }, {
    title: "Import & Export",
    url: "/import",
    icon: Upload,
    description: "Import & Export asset data",
    permission: "create_assets"
  }, {
    title: "QR Codes",
    url: "/qr-codes",
    icon: QrCode,
    description: "Generate QR codes",
    permission: "read_assets"
  }];

  // Conditionally add modules based on their enabled state
  if (moduleConfig.calculations) {
    menuItems.push({
      title: "Calculations",
      url: "/calculations",
      icon: Calculator,
      description: "Depreciation calculations",
      permission: "read_calculations"
    });
  }

  if (moduleConfig.itActDepreciation) {
    menuItems.push({
      title: "IT Act Depreciation",
      url: "/it-act-depreciation",
      icon: TrendingUp,
      description: "IT Act compliance",
      permission: "read_it_act"
    });
  }

  if (moduleConfig.reports) {
    menuItems.push({
      title: "Reports",
      url: "/reports",
      icon: FileSpreadsheet,
      description: "Generate reports",
      permission: "read_reports"
    });
  }

  if (moduleConfig.integrations) {
    menuItems.push({
      title: "Integrations",
      url: "/integrations",
      icon: Shuffle,
      description: "Third-party integrations",
      permission: "read_integrations"
    });
  }

  const managementItems = [{
    title: "Companies",
    url: "/companies",
    icon: Building2,
    description: "Manage companies",
    permission: "read_companies"
  }, {
    title: "Verification",
    url: "/verification",
    icon: CheckCircle,
    description: "Asset verification",
    permission: "read_verification"
  }, {
    title: "AMC Management",
    url: "/amc",
    icon: Wrench,
    description: "Maintenance contracts",
    permission: "read_amc"
  }];

  const adminItems = [{
    title: "Roles & Permissions",
    url: "/roles",
    icon: Shield,
    description: "Manage user roles",
    permission: "admin"
  }, {
    title: "Admin Panel",
    url: "/admin",
    icon: UserCheck,
    description: "System administration",
    permission: "admin"
  }, {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    description: "Application settings",
    permission: "read_settings"
  }];

  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') return true;
    // For now, we'll use a simple role-based approach since permissions array doesn't exist
    const rolePermissions = {
      'super_admin': ['*'],
      'admin': ['read_dashboard', 'read_assets', 'create_assets', 'read_calculations', 'read_it_act', 'read_blocks', 'read_reports', 'read_integrations', 'read_companies', 'read_verification', 'read_amc', 'admin', 'read_settings'],
      'manager': ['read_dashboard', 'read_assets', 'create_assets', 'read_calculations', 'read_it_act', 'read_blocks', 'read_reports', 'read_companies', 'read_verification', 'read_amc', 'read_settings'],
      'amc_officer': ['read_dashboard', 'read_assets', 'read_amc', 'read_verification'],
      'viewer': ['read_dashboard', 'read_assets']
    };
    
    const userRolePermissions = rolePermissions[currentUser.role] || [];
    return userRolePermissions.includes('*') || userRolePermissions.includes(permission);
  };

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));
  const filteredManagementItems = managementItems.filter(item => hasPermission(item.permission));
  const filteredAdminItems = adminItems.filter(item => hasPermission(item.permission));

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Zinance Logo" className="w-9 h-9 rounded-lg" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Zinance</h2>
            <p className="text-xs text-muted-foreground">Enterprise Asset Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {filteredMenuItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
              MAIN MENU
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {filteredMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <NavLink 
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredManagementItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
              MANAGEMENT
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {filteredManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <NavLink 
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
              ADMINISTRATION
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {filteredAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <NavLink 
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {currentUser?.role || 'viewer'}
            </p>
          </div>
          <NotificationCenter />
        </div>
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
