// Mock data toggle for development
// Set to true to use mock data instead of backend APIs

export const USE_MOCK_DATA = false;

// Mock user profiles for different roles
export const MOCK_PROFILES = {
  issuer: {
    id: 'mock-issuer-1',
    email: 'issuer@demo.com',
    username: 'issuer_demo',
    full_name: 'Demo Issuer User',
    role: 'ISSUER',
    company_id: 'mock-company-1',
    company_role: 'CEO',
    is_active: true
  },
  ib_advisor: {
    id: 'mock-ib-1',
    email: 'ib@demo.com',
    username: 'ib_demo',
    full_name: 'Demo IB Advisor',
    role: 'IB_ADVISOR',
    company_id: null,
    company_role: null,
    is_active: true
  },
  cma_regulator: {
    id: 'mock-cma-1',
    email: 'cma@demo.com',
    username: 'cma_demo',
    full_name: 'Demo CMA Regulator',
    role: 'CMA_REGULATOR',
    company_id: null,
    company_role: null,
    is_active: true
  }
};

// Mock applications data
export const MOCK_APPLICATIONS = [
  {
    id: 'mock-app-1',
    company_id: 'mock-company-1',
    application_number: 'CMA-IPO-2024-0001',
    status: 'SUBMITTED',
    current_phase: 'IB_REVIEW',
    completion_percentage: 85,
    target_amount: 500000000,
    securities_count: 1000000,
    price_per_security: 500,
    assigned_ib_advisor: null,
    assigned_cma_officer: null,
    priority: 'MEDIUM',
    expected_listing_date: '2024-12-31',
    submitted_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: 'mock-company-1',
      legal_name: 'Rwanda Tech Solutions Ltd',
      trading_name: 'RTS',
      registration_number: 'RW-001-2020',
      industry_sector: 'Technology',
      status: 'ACTIVE'
    }
  },
  {
    id: 'mock-app-2',
    company_id: 'mock-company-2',
    application_number: 'CMA-IPO-2024-0002',
    status: 'IB_REVIEW',
    current_phase: 'IB_REVIEW',
    completion_percentage: 92,
    target_amount: 750000000,
    securities_count: 1500000,
    price_per_security: 500,
    assigned_ib_advisor: 'mock-ib-1',
    assigned_cma_officer: null,
    priority: 'HIGH',
    expected_listing_date: '2025-01-31',
    submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: 'mock-company-2',
      legal_name: 'Green Energy Rwanda PLC',
      trading_name: 'GER',
      registration_number: 'RW-002-2021',
      industry_sector: 'Renewable Energy',
      status: 'ACTIVE'
    }
  },
  {
    id: 'mock-app-3',
    company_id: 'mock-company-3',
    application_number: 'CMA-IPO-2024-0003',
    status: 'IB_APPROVED',
    current_phase: 'CMA_REVIEW',
    completion_percentage: 100,
    target_amount: 1200000000,
    securities_count: 2000000,
    price_per_security: 600,
    assigned_ib_advisor: 'mock-ib-1',
    assigned_cma_officer: 'mock-cma-1',
    priority: 'HIGH',
    expected_listing_date: '2025-02-28',
    submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: 'mock-company-3',
      legal_name: 'Rwanda Financial Services Ltd',
      trading_name: 'RFS',
      registration_number: 'RW-003-2019',
      industry_sector: 'Financial Services',
      status: 'ACTIVE'
    }
  }
];

// Mock sections data
export const MOCK_SECTIONS = [
  {
    id: 'mock-section-1',
    application_id: 'mock-app-1',
    section_number: 1,
    section_title: 'Company Identity & Background',
    status: 'COMPLETED',
    data: {
      company_name: 'Rwanda Tech Solutions Ltd',
      registration_number: 'RW-001-2020',
      incorporation_date: '2020-01-15',
      business_description: 'Leading technology solutions provider in Rwanda'
    },
    completion_percentage: 100,
    completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-section-2',
    application_id: 'mock-app-1',
    section_number: 2,
    section_title: 'Share Ownership Structure',
    status: 'COMPLETED',
    data: {
      total_shares: 5000000,
      shares_to_offer: 1000000,
      public_float_percentage: 20
    },
    completion_percentage: 100,
    completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-section-3',
    application_id: 'mock-app-1',
    section_number: 3,
    section_title: 'Financial Information',
    status: 'IN_PROGRESS',
    data: {
      revenue_2023: 2500000000,
      profit_2023: 450000000,
      assets_2023: 1800000000
    },
    completion_percentage: 75,
    completed_at: null
  }
];

// Mock documents data
export const MOCK_DOCUMENTS = [
  {
    id: 'mock-doc-1',
    application_id: 'mock-app-1',
    section_id: 'mock-section-1',
    filename: 'certificate_of_incorporation.pdf',
    original_name: 'Certificate of Incorporation.pdf',
    file_path: '/mock/documents/cert_inc.pdf',
    file_size: 1024000,
    mime_type: 'application/pdf',
    category: 'LEGAL',
    description: 'Certificate of Incorporation',
    version: 1,
    uploaded_by: 'mock-issuer-1',
    uploaded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    is_confidential: false
  },
  {
    id: 'mock-doc-2',
    application_id: 'mock-app-1',
    section_id: 'mock-section-2',
    filename: 'audited_financials_2023.pdf',
    original_name: 'Audited Financial Statements 2023.pdf',
    file_path: '/mock/documents/financials_2023.pdf',
    file_size: 2048000,
    mime_type: 'application/pdf',
    category: 'FINANCIAL',
    description: 'Audited Financial Statements for 2023',
    version: 1,
    uploaded_by: 'mock-issuer-1',
    uploaded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    is_confidential: true
  }
];

// Mock comments data
export const MOCK_COMMENTS = [
  {
    id: 'mock-comment-1',
    application_id: 'mock-app-1',
    section_id: 'mock-section-1',
    author_id: 'mock-ib-1',
    content: 'Company registration documents look good. Please provide additional details on the business model.',
    comment_type: 'FEEDBACK',
    is_internal: false,
    is_resolved: false,
    priority: 'MEDIUM',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-comment-2',
    application_id: 'mock-app-1',
    section_id: 'mock-section-2',
    author_id: 'mock-cma-1',
    content: 'Share ownership structure needs clarification on post-IPO dilution effects.',
    comment_type: 'QUERY',
    is_internal: false,
    is_resolved: false,
    priority: 'HIGH',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

// Helper function to get mock profile based on role
export const getMockProfile = (role: string) => {
  switch (role) {
    case 'ISSUER':
      return MOCK_PROFILES.issuer;
    case 'IB_ADVISOR':
      return MOCK_PROFILES.ib_advisor;
    case 'CMA_REGULATOR':
    case 'CMA_ADMIN':
      return MOCK_PROFILES.cma_regulator;
    default:
      return null;
  }
};