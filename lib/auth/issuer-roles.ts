// Issuer company role definitions and section permissions

export type IssuerRole = 'CEO' | 'CFO' | 'LEGAL_ADVISOR' | 'SECRETARY';

export interface IssuerRoleDefinition {
  role: IssuerRole;
  title: string;
  description: string;
  sections: number[]; // Which sections they can access (1-10)
  permissions: {
    canView: number[];
    canEdit: number[];
    canSubmit: number[];
    canApprove: number[];
  };
  responsibilities: string[];
}

// Section mapping to CMA requirements (actual 10 sections)
export const CMA_SECTIONS = {
  1: 'Company Identity & Legal Form',
  2: 'Capitalization & Financial Strength', 
  3: 'Share Ownership & Distribution',
  4: 'Governance & Management',
  5: 'Legal & Regulatory Compliance',
  6: 'Offer Details (IPO Information)',
  7: 'Prospectus & Disclosure Checklist',
  8: 'Publication & Advertisement',
  9: 'Post-Approval Undertakings',
  10: 'Declarations & Contacts'
} as const;

// Role definitions with section permissions (optimized for IPO expertise)
export const ISSUER_ROLES: Record<IssuerRole, IssuerRoleDefinition> = {
  CEO: {
    role: 'CEO',
    title: 'Chief Executive Officer',
    description: 'Strategic leadership, company vision, and final approvals',
    sections: [1, 7, 10], // Company identity, prospectus, declarations
    permissions: {
      canView: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Can view all sections
      canEdit: [1, 7, 10],
      canSubmit: [1, 7, 10],
      canApprove: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // Can approve all sections as final authority
    },
    responsibilities: [
      'Company identity and strategic positioning',
      'Prospectus narrative and business overview',
      'Final declarations and CEO certifications',
      'Overall IPO strategy and vision',
      'Final approval authority for all sections'
    ]
  },

  CFO: {
    role: 'CFO',
    title: 'Chief Financial Officer',
    description: 'Financial reporting, capitalization, and offer structuring',
    sections: [2, 3, 6], // Capitalization, share ownership, offer details
    permissions: {
      canView: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Can view all sections
      canEdit: [2, 3, 6],
      canSubmit: [2, 3, 6],
      canApprove: [2, 3, 6]
    },
    responsibilities: [
      'Financial strength and capitalization structure',
      'Share ownership analysis and distribution',
      'IPO offer details, pricing, and financial terms',
      'Financial projections and valuation',
      'Use of proceeds financial planning'
    ]
  },

  LEGAL_ADVISOR: {
    role: 'LEGAL_ADVISOR',
    title: 'Legal Advisor',
    description: 'Legal compliance, regulatory requirements, and risk management',
    sections: [5, 9], // Legal compliance, post-approval undertakings
    permissions: {
      canView: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Can view all sections
      canEdit: [5, 9],
      canSubmit: [5, 9],
      canApprove: [5, 9]
    },
    responsibilities: [
      'Legal and regulatory compliance framework',
      'Risk assessment and mitigation strategies',
      'Post-approval legal undertakings and commitments',
      'Regulatory filing requirements',
      'Legal due diligence and documentation'
    ]
  },

  SECRETARY: {
    role: 'SECRETARY',
    title: 'Company Secretary',
    description: 'Corporate governance, administration, and regulatory coordination',
    sections: [4, 8], // Governance & management, publication & advertisement
    permissions: {
      canView: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Can view all sections
      canEdit: [4, 8],
      canSubmit: [4, 8],
      canApprove: [4, 8]
    },
    responsibilities: [
      'Corporate governance structure and policies',
      'Board composition and management details',
      'Publication and advertisement compliance',
      'Regulatory communication and coordination',
      'Corporate administration and record keeping'
    ]
  }
};

// Helper functions
export const getRoleDefinition = (role: IssuerRole): IssuerRoleDefinition => {
  return ISSUER_ROLES[role];
};

export const canUserAccessSection = (role: IssuerRole, sectionNumber: number, action: 'view' | 'edit' | 'submit' | 'approve'): boolean => {
  const roleDefinition = getRoleDefinition(role);
  const permissionKey = `can${action.charAt(0).toUpperCase() + action.slice(1)}` as keyof IssuerRoleDefinition['permissions'];
  return roleDefinition.permissions[permissionKey].includes(sectionNumber);
};

export const getUserSections = (role: IssuerRole): number[] => {
  return getRoleDefinition(role).sections;
};

export const getSectionTitle = (sectionNumber: number): string => {
  return CMA_SECTIONS[sectionNumber as keyof typeof CMA_SECTIONS] || `Section ${sectionNumber}`;
};

// Section workflow status
export type SectionStatus = 'not_started' | 'in_progress' | 'completed' | 'under_review' | 'approved' | 'rejected';

export interface SectionPermission {
  sectionNumber: number;
  sectionTitle: string;
  canView: boolean;
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  isPrimaryResponsible: boolean;
}

export const getUserSectionPermissions = (role: IssuerRole): SectionPermission[] => {
  const roleDefinition = getRoleDefinition(role);
  
  return Object.keys(CMA_SECTIONS).map(sectionNum => {
    const sectionNumber = parseInt(sectionNum);
    return {
      sectionNumber,
      sectionTitle: getSectionTitle(sectionNumber),
      canView: canUserAccessSection(role, sectionNumber, 'view'),
      canEdit: canUserAccessSection(role, sectionNumber, 'edit'),
      canSubmit: canUserAccessSection(role, sectionNumber, 'submit'),
      canApprove: canUserAccessSection(role, sectionNumber, 'approve'),
      isPrimaryResponsible: roleDefinition.sections.includes(sectionNumber)
    };
  });
};