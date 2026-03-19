
import { Company } from '@/types/asset';
import { assetStorage } from '@/lib/asset-storage';

export class CompanyManager {
  getAllCompanies(): Company[] {
    return assetStorage.getAllCompanies();
  }

  createCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Company {
    const companies = this.getAllCompanies();
    const newCompany: Company = {
      ...companyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    companies.push(newCompany);
    assetStorage.saveCompanies(companies);
    return newCompany;
  }

  updateCompanySerialFormat(companyId: string, department: string, assetClass: string, prefix: string): void {
    const companies = this.getAllCompanies();
    const company = companies.find(c => c.id === companyId);
    
    if (!company) return;
    
    if (!company.serialNumberFormat[department]) {
      company.serialNumberFormat[department] = {};
    }
    
    company.serialNumberFormat[department][assetClass] = {
      prefix: prefix,
      nextNumber: 1
    };
    
    const companyIndex = companies.findIndex(c => c.id === companyId);
    companies[companyIndex] = { ...company, updatedAt: new Date().toISOString() };
    assetStorage.saveCompanies(companies);
  }

  generateSerialNumber(companyId: string, department: string, assetClass: string): string {
    const companies = this.getAllCompanies();
    const company = companies.find(c => c.id === companyId);
    
    if (!company) return '';
    
    if (!company.serialNumberFormat[department] || !company.serialNumberFormat[department][assetClass]) {
      this.createAutomaticSerialFormat(companyId, department, assetClass);
    }
    
    const format = company.serialNumberFormat[department][assetClass];
    const serialNumber = `${format.prefix}-${format.nextNumber.toString().padStart(3, '0')}`;
    
    format.nextNumber++;
    
    const companyIndex = companies.findIndex(c => c.id === companyId);
    companies[companyIndex] = { ...company, updatedAt: new Date().toISOString() };
    assetStorage.saveCompanies(companies);
    
    return serialNumber;
  }

  private createAutomaticSerialFormat(companyId: string, department: string, assetClass: string, office = 'OFFICE', location = 'LOCATION'): void {
    const companies = this.getAllCompanies();
    const company = companies.find(c => c.id === companyId);
    
    if (!company) return;
    
    const prefix = `${company.name.toUpperCase().replace(/\s+/g, '_')}/${department.toUpperCase().replace(/\s+/g, '_')}/${office.toUpperCase()}/${location.toUpperCase()}/${assetClass.toUpperCase().replace(/\s+/g, '_')}`;
    
    if (!company.serialNumberFormat[department]) {
      company.serialNumberFormat[department] = {};
    }
    
    company.serialNumberFormat[department][assetClass] = {
      prefix: prefix,
      nextNumber: 1
    };
    
    const companyIndex = companies.findIndex(c => c.id === companyId);
    companies[companyIndex] = { ...company, updatedAt: new Date().toISOString() };
    assetStorage.saveCompanies(companies);
  }

  isSerialNumberFormatSetup(companyName: string, department: string, assetClass: string): boolean {
    const companies = this.getAllCompanies();
    const company = companies.find(c => c.name === companyName);
    
    if (!company) return false;
    
    return !!(company.serialNumberFormat[department] && 
              company.serialNumberFormat[department][assetClass]);
  }
}

export const companyManager = new CompanyManager();
