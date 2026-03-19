
import React from 'react';
import { Calculator, Settings, Users, ArrowRight, BarChart3, FileText } from 'lucide-react';

interface ITActTabsProps {
  activeTab: 'assets' | 'slabs' | 'blocks' | 'assignment' | 'block-reports' | 'reports';
  setActiveTab: (tab: 'assets' | 'slabs' | 'blocks' | 'assignment' | 'block-reports' | 'reports') => void;
}

export const ITActTabs: React.FC<ITActTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'assets' as const, label: 'Asset Calculations', icon: Calculator },
    { id: 'slabs' as const, label: 'Depreciation Slabs', icon: Settings },
    { id: 'blocks' as const, label: 'Block Management', icon: Users },
    { id: 'assignment' as const, label: 'Asset Assignment', icon: ArrowRight },
    { id: 'block-reports' as const, label: 'Block Reports', icon: BarChart3 },
    { id: 'reports' as const, label: 'Traditional Reports', icon: FileText }
  ];

  return (
    <div className="flex space-x-1 sm:space-x-2 border-b border-border overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap text-xs sm:text-sm ${
            activeTab === tab.id
              ? 'bg-primary/20 text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  );
};
