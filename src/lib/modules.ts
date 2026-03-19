
export interface ModuleConfig {
  key: string;
  name: string;
  path: string;
  enabled: boolean;
}

export const getModuleConfig = (): Record<string, boolean> => {
  return {
    integrations: JSON.parse(localStorage.getItem('module_integrations') || 'false'), // Default disabled
    reports: JSON.parse(localStorage.getItem('module_reports') || 'true'),
    blocks: JSON.parse(localStorage.getItem('module_blocks') || 'true'),
    calculations: JSON.parse(localStorage.getItem('module_calculations') || 'true'),
    itActDepreciation: JSON.parse(localStorage.getItem('module_itActDepreciation') || 'true'),
    settings: true // Always enabled
  };
};

export const setModuleEnabled = (moduleKey: string, enabled: boolean): void => {
  localStorage.setItem(`module_${moduleKey}`, JSON.stringify(enabled));
  
  // Dispatch custom event to notify navigation components
  window.dispatchEvent(new CustomEvent('moduleConfigChanged', {
    detail: { moduleKey, enabled }
  }));
};

export const isModuleEnabled = (moduleKey: string): boolean => {
  const config = getModuleConfig();
  return config[moduleKey] !== false;
};

export const getEnabledModules = (): string[] => {
  const config = getModuleConfig();
  return Object.keys(config).filter(key => config[key]);
};
