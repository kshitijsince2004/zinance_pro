
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Calculator, Calendar, Percent, Clock, Save, RotateCcw } from 'lucide-react';

interface CalculationSettings {
  // General Settings
  defaultMethod: string;
  precision: number;
  roundingMode: 'round' | 'floor' | 'ceil';
  currencyFormat: string;
  dateFormat: string;
  
  // Calculation Parameters
  daysInYear: number;
  financialYearStart: string;
  useBusinessDays: boolean;
  excludeWeekends: boolean;
  excludeHolidays: boolean;
  
  // WDV Settings
  wdvMinimumRate: number;
  wdvMaximumRate: number;
  wdvResidualValueLimit: number;
  
  // Company Act Settings
  companyActCompliance: boolean;
  allowNegativeDepreciation: boolean;
  proRataCalculation: boolean;
  
  // Display Settings
  showStepByStep: boolean;
  showFormulas: boolean;
  showWarnings: boolean;
  detailedReports: boolean;
  
  // Timeline Settings
  defaultTimelineInterval: number;
  maxTimelineYears: number;
  showDailyBreakdown: boolean;
  
  // Validation Settings
  validateInputs: boolean;
  strictValidation: boolean;
  allowZeroValues: boolean;
}

interface AdvancedSettingsSectionProps {
  dayInterval: number;
  onDayIntervalChange: (interval: number) => void;
}

export const AdvancedSettingsSection: React.FC<AdvancedSettingsSectionProps> = ({
  dayInterval,
  onDayIntervalChange
}) => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<CalculationSettings>({
    // General Settings
    defaultMethod: 'SLM',
    precision: 2,
    roundingMode: 'round',
    currencyFormat: 'INR',
    dateFormat: 'DD/MM/YYYY',
    
    // Calculation Parameters
    daysInYear: 365.25,
    financialYearStart: '01/04',
    useBusinessDays: false,
    excludeWeekends: false,
    excludeHolidays: false,
    
    // WDV Settings
    wdvMinimumRate: 1,
    wdvMaximumRate: 100,
    wdvResidualValueLimit: 95,
    
    // Company Act Settings
    companyActCompliance: true,
    allowNegativeDepreciation: false,
    proRataCalculation: true,
    
    // Display Settings
    showStepByStep: true,
    showFormulas: true,
    showWarnings: true,
    detailedReports: true,
    
    // Timeline Settings
    defaultTimelineInterval: dayInterval,
    maxTimelineYears: 50,
    showDailyBreakdown: true,
    
    // Validation Settings
    validateInputs: true,
    strictValidation: false,
    allowZeroValues: false
  });

  const handleSettingChange = <K extends keyof CalculationSettings>(
    key: K,
    value: CalculationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'defaultTimelineInterval') {
      onDayIntervalChange(value as number);
    }
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('depreciationSettings', JSON.stringify(settings));
    
    toast({
      title: 'Settings Saved',
      description: 'All calculation settings have been saved successfully.'
    });
  };

  const handleResetSettings = () => {
    const defaultSettings: CalculationSettings = {
      defaultMethod: 'SLM',
      precision: 2,
      roundingMode: 'round',
      currencyFormat: 'INR',
      dateFormat: 'DD/MM/YYYY',
      daysInYear: 365.25,
      financialYearStart: '01/04',
      useBusinessDays: false,
      excludeWeekends: false,
      excludeHolidays: false,
      wdvMinimumRate: 1,
      wdvMaximumRate: 100,
      wdvResidualValueLimit: 95,
      companyActCompliance: true,
      allowNegativeDepreciation: false,
      proRataCalculation: true,
      showStepByStep: true,
      showFormulas: true,
      showWarnings: true,
      detailedReports: true,
      defaultTimelineInterval: 30,
      maxTimelineYears: 50,
      showDailyBreakdown: true,
      validateInputs: true,
      strictValidation: false,
      allowZeroValues: false
    };
    
    setSettings(defaultSettings);
    onDayIntervalChange(30);
    
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to default values.'
    });
  };

  return (
    <Card className="bg-card border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Advanced Calculation Settings
            </CardTitle>
            <CardDescription>
              Configure calculation parameters, display preferences, and compliance settings
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="calculation">Calculation</TabsTrigger>
            <TabsTrigger value="methods">Methods</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Default Preferences
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="defaultMethod">Default Depreciation Method</Label>
                    <Select
                      value={settings.defaultMethod}
                      onValueChange={(value) => handleSettingChange('defaultMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SLM">Straight Line Method</SelectItem>
                        <SelectItem value="WDV">Written Down Value</SelectItem>
                        <SelectItem value="WDV_FIXED_SLAB">WDV Fixed Slab</SelectItem>
                        <SelectItem value="UNITS">Production Unit Method</SelectItem>
                        <SelectItem value="DOUBLE_DECLINING">Double Declining Balance</SelectItem>
                        <SelectItem value="SUM_OF_YEARS">Sum of Years Digits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="precision">Decimal Precision</Label>
                    <Select
                      value={settings.precision.toString()}
                      onValueChange={(value) => handleSettingChange('precision', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 decimal places</SelectItem>
                        <SelectItem value="2">2 decimal places</SelectItem>
                        <SelectItem value="4">4 decimal places</SelectItem>
                        <SelectItem value="6">6 decimal places</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="roundingMode">Rounding Mode</Label>
                    <Select
                      value={settings.roundingMode}
                      onValueChange={(value) => handleSettingChange('roundingMode', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round">Round to nearest</SelectItem>
                        <SelectItem value="floor">Round down (floor)</SelectItem>
                        <SelectItem value="ceil">Round up (ceiling)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Format Settings</h4>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="currencyFormat">Currency Format</Label>
                    <Select
                      value={settings.currencyFormat}
                      onValueChange={(value) => handleSettingChange('currencyFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">Indian Rupees (₹)</SelectItem>
                        <SelectItem value="USD">US Dollars ($)</SelectItem>
                        <SelectItem value="EUR">Euros (€)</SelectItem>
                        <SelectItem value="GBP">British Pounds (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) => handleSettingChange('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calculation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Time Calculation
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="daysInYear">Days in Year</Label>
                    <Input
                      id="daysInYear"
                      type="number"
                      step="0.25"
                      value={settings.daysInYear}
                      onChange={(e) => handleSettingChange('daysInYear', parseFloat(e.target.value) || 365.25)}
                    />
                    <p className="text-xs text-muted-foreground">Standard: 365.25 (accounting for leap years)</p>
                  </div>

                  <div>
                    <Label htmlFor="financialYearStart">Financial Year Start (DD/MM)</Label>
                    <Input
                      id="financialYearStart"
                      value={settings.financialYearStart}
                      onChange={(e) => handleSettingChange('financialYearStart', e.target.value)}
                      placeholder="01/04"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useBusinessDays"
                        checked={settings.useBusinessDays}
                        onCheckedChange={(checked) => handleSettingChange('useBusinessDays', checked)}
                      />
                      <Label htmlFor="useBusinessDays">Use Business Days Only</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="excludeWeekends"
                        checked={settings.excludeWeekends}
                        onCheckedChange={(checked) => handleSettingChange('excludeWeekends', checked)}
                      />
                      <Label htmlFor="excludeWeekends">Exclude Weekends</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timeline Settings
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="timelineInterval">Default Timeline Interval (days)</Label>
                    <Input
                      id="timelineInterval"
                      type="number"
                      min="1"
                      max="365"
                      value={settings.defaultTimelineInterval}
                      onChange={(e) => handleSettingChange('defaultTimelineInterval', parseInt(e.target.value) || 30)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxTimelineYears">Maximum Timeline Years</Label>
                    <Input
                      id="maxTimelineYears"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.maxTimelineYears}
                      onChange={(e) => handleSettingChange('maxTimelineYears', parseInt(e.target.value) || 50)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showDailyBreakdown"
                      checked={settings.showDailyBreakdown}
                      onCheckedChange={(checked) => handleSettingChange('showDailyBreakdown', checked)}
                    />
                    <Label htmlFor="showDailyBreakdown">Show Daily Breakdown</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="methods" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  WDV Method Settings
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="wdvMinRate">Minimum WDV Rate (%)</Label>
                    <Input
                      id="wdvMinRate"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.wdvMinimumRate}
                      onChange={(e) => handleSettingChange('wdvMinimumRate', parseFloat(e.target.value) || 1)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="wdvMaxRate">Maximum WDV Rate (%)</Label>
                    <Input
                      id="wdvMaxRate"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.wdvMaximumRate}
                      onChange={(e) => handleSettingChange('wdvMaximumRate', parseFloat(e.target.value) || 100)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="residualLimit">Residual Value Limit (% of cost)</Label>
                    <Input
                      id="residualLimit"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.wdvResidualValueLimit}
                      onChange={(e) => handleSettingChange('wdvResidualValueLimit', parseFloat(e.target.value) || 95)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Company Act Compliance</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="companyActCompliance"
                      checked={settings.companyActCompliance}
                      onCheckedChange={(checked) => handleSettingChange('companyActCompliance', checked)}
                    />
                    <Label htmlFor="companyActCompliance">Enforce Company Act Compliance</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowNegative"
                      checked={settings.allowNegativeDepreciation}
                      onCheckedChange={(checked) => handleSettingChange('allowNegativeDepreciation', checked)}
                    />
                    <Label htmlFor="allowNegative">Allow Negative Depreciation</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="proRata"
                      checked={settings.proRataCalculation}
                      onCheckedChange={(checked) => handleSettingChange('proRataCalculation', checked)}
                    />
                    <Label htmlFor="proRata">Pro-rata Calculation</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Calculation Display</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showStepByStep"
                      checked={settings.showStepByStep}
                      onCheckedChange={(checked) => handleSettingChange('showStepByStep', checked)}
                    />
                    <Label htmlFor="showStepByStep">Show Step-by-Step Calculations</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showFormulas"
                      checked={settings.showFormulas}
                      onCheckedChange={(checked) => handleSettingChange('showFormulas', checked)}
                    />
                    <Label htmlFor="showFormulas">Show Formulas</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showWarnings"
                      checked={settings.showWarnings}
                      onCheckedChange={(checked) => handleSettingChange('showWarnings', checked)}
                    />
                    <Label htmlFor="showWarnings">Show Calculation Warnings</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="detailedReports"
                      checked={settings.detailedReports}
                      onCheckedChange={(checked) => handleSettingChange('detailedReports', checked)}
                    />
                    <Label htmlFor="detailedReports">Generate Detailed Reports</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Input Validation</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="validateInputs"
                      checked={settings.validateInputs}
                      onCheckedChange={(checked) => handleSettingChange('validateInputs', checked)}
                    />
                    <Label htmlFor="validateInputs">Enable Input Validation</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="strictValidation"
                      checked={settings.strictValidation}
                      onCheckedChange={(checked) => handleSettingChange('strictValidation', checked)}
                    />
                    <Label htmlFor="strictValidation">Strict Validation Mode</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowZeroValues"
                      checked={settings.allowZeroValues}
                      onCheckedChange={(checked) => handleSettingChange('allowZeroValues', checked)}
                    />
                    <Label htmlFor="allowZeroValues">Allow Zero Values</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
