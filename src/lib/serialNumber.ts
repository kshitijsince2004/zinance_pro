
import { assetService } from './assets';

export interface SerialNumberFormat {
  id: string;
  company: string;
  department: string;
  prefix: string;
  format: string; // e.g., "HERO-IT-{YYYY}-{####}"
  lastUsedNumber: number;
  isActive: boolean;
}

class SerialNumberService {
  private storageKey = 'serial_number_formats';

  getFormats(): SerialNumberFormat[] {
    const formats = localStorage.getItem(this.storageKey);
    return formats ? JSON.parse(formats) : [];
  }

  saveFormats(formats: SerialNumberFormat[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(formats));
  }

  generateSerialNumber(company: string, department: string): string {
    const formats = this.getFormats();
    const format = formats.find(f => 
      f.company === company && 
      f.department === department && 
      f.isActive
    );

    if (!format) {
      // Generate a simple fallback serial number
      const fallbackSerial = `${company.substring(0, 3).toUpperCase()}-${department.substring(0, 3).toUpperCase()}-${Date.now()}`;
      return fallbackSerial;
    }

    // Increment the last used number
    format.lastUsedNumber += 1;
    
    // Replace placeholders in format
    let serialNumber = format.format;
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    // Replace year placeholders
    serialNumber = serialNumber.replace('{YYYY}', currentYear.toString());
    serialNumber = serialNumber.replace('{YY}', currentYear.toString().slice(-2));
    serialNumber = serialNumber.replace('{MM}', currentMonth);
    
    // Replace number placeholders
    const numberMatch = serialNumber.match(/\{#+\}/);
    if (numberMatch) {
      const placeholder = numberMatch[0];
      const digits = placeholder.length - 2; // Remove { and }
      const paddedNumber = format.lastUsedNumber.toString().padStart(digits, '0');
      serialNumber = serialNumber.replace(placeholder, paddedNumber);
    }
    
    // Save updated format
    this.saveFormats(formats);
    
    return serialNumber;
  }

  getNextSerialNumber(company: string, department: string): string {
    return this.generateSerialNumber(company, department);
  }

  addFormat(format: Omit<SerialNumberFormat, 'id'>): void {
    const formats = this.getFormats();
    const newFormat: SerialNumberFormat = {
      ...format,
      id: Date.now().toString()
    };
    formats.push(newFormat);
    this.saveFormats(formats);
  }

  updateFormat(id: string, updatedFormat: Partial<SerialNumberFormat>): void {
    const formats = this.getFormats();
    const index = formats.findIndex(f => f.id === id);
    if (index !== -1) {
      formats[index] = { ...formats[index], ...updatedFormat };
      this.saveFormats(formats);
    }
  }

  deleteFormat(id: string): void {
    const formats = this.getFormats();
    const filteredFormats = formats.filter(f => f.id !== id);
    this.saveFormats(filteredFormats);
  }
}

export const serialNumberService = new SerialNumberService();
