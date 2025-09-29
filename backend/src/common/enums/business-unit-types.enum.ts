export enum BusinessUnitType {
  // Core Business Units
  SALES = 'SALES',
  MARKETING = 'MARKETING',
  PRODUCTION = 'PRODUCTION',
  INVENTORY = 'INVENTORY',
  PROCUREMENT = 'PROCUREMENT',
  
  // Support Units
  HR = 'HR',
  FINANCE = 'FINANCE',
  ACCOUNTING = 'ACCOUNTING',
  IT = 'IT',
  LEGAL = 'LEGAL',
  
  // Management Units
  EXECUTIVE = 'EXECUTIVE',
  OPERATIONS = 'OPERATIONS',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
  
  // Regional/Geographic Units
  REGIONAL = 'REGIONAL',
  BRANCH = 'BRANCH',
  
  // Project-based Units
  PROJECT = 'PROJECT',
  RESEARCH_DEVELOPMENT = 'RESEARCH_DEVELOPMENT',
  
  // Other
  GENERAL = 'GENERAL',
  SHARED_SERVICES = 'SHARED_SERVICES'
}

export const BUSINESS_UNIT_DESCRIPTIONS = {
  [BusinessUnitType.SALES]: 'Sales and Customer Relations',
  [BusinessUnitType.MARKETING]: 'Marketing and Brand Management',
  [BusinessUnitType.PRODUCTION]: 'Manufacturing and Production',
  [BusinessUnitType.INVENTORY]: 'Inventory and Warehouse Management',
  [BusinessUnitType.PROCUREMENT]: 'Procurement and Supplier Relations',
  [BusinessUnitType.HR]: 'Human Resources',
  [BusinessUnitType.FINANCE]: 'Financial Management',
  [BusinessUnitType.ACCOUNTING]: 'Accounting and Bookkeeping',
  [BusinessUnitType.IT]: 'Information Technology',
  [BusinessUnitType.LEGAL]: 'Legal and Compliance',
  [BusinessUnitType.EXECUTIVE]: 'Executive Management',
  [BusinessUnitType.OPERATIONS]: 'Operations Management',
  [BusinessUnitType.QUALITY_ASSURANCE]: 'Quality Assurance',
  [BusinessUnitType.REGIONAL]: 'Regional Operations',
  [BusinessUnitType.BRANCH]: 'Branch Operations',
  [BusinessUnitType.PROJECT]: 'Project Management',
  [BusinessUnitType.RESEARCH_DEVELOPMENT]: 'Research and Development',
  [BusinessUnitType.GENERAL]: 'General Department',
  [BusinessUnitType.SHARED_SERVICES]: 'Shared Services'
};