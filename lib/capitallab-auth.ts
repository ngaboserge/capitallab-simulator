// CapitalLab Role-Based Authentication System
// Extends existing auth to support institutional roles

export type InstitutionalRole = 
  | 'issuer' 
  | 'ib_advisor' 
  | 'broker' 
  | 'investor' 
  | 'regulator' 
  | 'listing_desk' 
  | 'csd_operator' 
  | 'admin';

export interface InstitutionalUser {
  id: string;
  userId: string; // Links to existing user system
  role: InstitutionalRole;
  roleDisplayName: string;
  institutionName?: string;
  licenseNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  hierarchyLevel: number;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionName: string;
  permissionDescription: string;
  isGranted: boolean;
}

// Role hierarchy levels (1 = highest authority)
export const ROLE_HIERARCHY: Record<InstitutionalRole, number> = {
  regulator: 1,
  listing_desk: 2,
  csd_operator: 3,
  ib_advisor: 4,
  broker: 5,
  investor: 6,
  issuer: 7,
  admin: 0 // Special admin role
};

// Permission definitions
export const PERMISSIONS = {
  // Issuer permissions
  SUBMIT_CAPITAL_RAISE_INTENT: 'submit_capital_raise_intent',
  RESPOND_TO_DUE_DILIGENCE: 'respond_to_due_diligence',
  
  // IB Advisor permissions
  MANAGE_DUE_DILIGENCE: 'manage_due_diligence',
  CREATE_PROSPECTUS: 'create_prospectus',
  MANAGE_ALLOCATIONS: 'manage_allocations',
  CONDUCT_BOOK_BUILDING: 'conduct_book_building',
  
  // Broker permissions
  ACTIVATE_INVESTORS: 'activate_investors',
  EXECUTE_TRADES: 'execute_trades',
  MANAGE_CLIENT_ACCOUNTS: 'manage_client_accounts',
  
  // Investor permissions
  PLACE_ORDERS: 'place_orders',
  VIEW_PORTFOLIO: 'view_portfolio',
  
  // Regulator permissions
  REVIEW_FILINGS: 'review_filings',
  APPROVE_REJECT_SUBMISSIONS: 'approve_reject_submissions',
  ISSUE_COMPLIANCE_NOTICES: 'issue_compliance_notices',
  
  // Listing Desk permissions
  APPROVE_LISTINGS: 'approve_listings',
  CREATE_VIRTUAL_ISIN: 'create_virtual_isin',
  MANAGE_LISTING_CALENDAR: 'manage_listing_calendar',
  
  // CSD Operator permissions
  MANAGE_REGISTRY: 'manage_registry',
  PROCESS_SETTLEMENTS: 'process_settlements',
  MANAGE_CORPORATE_ACTIONS: 'manage_corporate_actions',
  
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  VIEW_AUDIT_TRAIL: 'view_audit_trail'
} as const;

// Role-based access control functions
export class CapitalLabAuth {
  
  static hasPermission(user: InstitutionalUser, permission: string): boolean {
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check specific role permissions (would query database in real implementation)
    const rolePermissions = this.getRolePermissions(user.role);
    return rolePermissions.includes(permission);
  }
  
  static canAccessRole(currentUser: InstitutionalUser, targetRole: InstitutionalRole): boolean {
    // Admin can access all roles
    if (currentUser.role === 'admin') return true;
    
    // Users can only access roles at their level or below in hierarchy
    return ROLE_HIERARCHY[currentUser.role] <= ROLE_HIERARCHY[targetRole];
  }
  
  static canInteractWith(fromUser: InstitutionalUser, toUser: InstitutionalUser): boolean {
    // Check if interaction is allowed based on institutional hierarchy
    const fromLevel = ROLE_HIERARCHY[fromUser.role];
    const toLevel = ROLE_HIERARCHY[toUser.role];
    
    // Define allowed interactions based on CapitalLab spec
    const allowedInteractions: Record<InstitutionalRole, InstitutionalRole[]> = {
      issuer: ['ib_advisor'], // Issuers can only interact with assigned IB
      ib_advisor: ['issuer', 'regulator', 'listing_desk'], // IB interacts with issuers and regulators
      regulator: ['ib_advisor'], // Regulators review IB submissions
      listing_desk: ['ib_advisor', 'csd_operator'], // Listing desk works with IB and CSD
      csd_operator: ['listing_desk', 'broker'], // CSD works with listing and brokers
      broker: ['investor', 'csd_operator'], // Brokers work with investors and CSD
      investor: ['broker'], // Investors only work through brokers
      admin: ['issuer', 'ib_advisor', 'broker', 'investor', 'regulator', 'listing_desk', 'csd_operator'] // Admin can interact with all
    };
    
    return allowedInteractions[fromUser.role]?.includes(toUser.role) || false;
  }
  
  static getRolePermissions(role: InstitutionalRole): string[] {
    // Define permissions for each role
    const rolePermissions: Record<InstitutionalRole, string[]> = {
      issuer: [
        PERMISSIONS.SUBMIT_CAPITAL_RAISE_INTENT,
        PERMISSIONS.RESPOND_TO_DUE_DILIGENCE
      ],
      ib_advisor: [
        PERMISSIONS.MANAGE_DUE_DILIGENCE,
        PERMISSIONS.CREATE_PROSPECTUS,
        PERMISSIONS.MANAGE_ALLOCATIONS,
        PERMISSIONS.CONDUCT_BOOK_BUILDING
      ],
      broker: [
        PERMISSIONS.ACTIVATE_INVESTORS,
        PERMISSIONS.EXECUTE_TRADES,
        PERMISSIONS.MANAGE_CLIENT_ACCOUNTS
      ],
      investor: [
        PERMISSIONS.PLACE_ORDERS,
        PERMISSIONS.VIEW_PORTFOLIO
      ],
      regulator: [
        PERMISSIONS.REVIEW_FILINGS,
        PERMISSIONS.APPROVE_REJECT_SUBMISSIONS,
        PERMISSIONS.ISSUE_COMPLIANCE_NOTICES
      ],
      listing_desk: [
        PERMISSIONS.APPROVE_LISTINGS,
        PERMISSIONS.CREATE_VIRTUAL_ISIN,
        PERMISSIONS.MANAGE_LISTING_CALENDAR
      ],
      csd_operator: [
        PERMISSIONS.MANAGE_REGISTRY,
        PERMISSIONS.PROCESS_SETTLEMENTS,
        PERMISSIONS.MANAGE_CORPORATE_ACTIONS
      ],
      admin: Object.values(PERMISSIONS)
    };
    
    return rolePermissions[role] || [];
  }
  
  static validateTradeAccess(investor: InstitutionalUser, broker: InstitutionalUser): {
    canTrade: boolean;
    reason?: string;
  } {
    // Investors must be activated by a broker to trade
    if (investor.role !== 'investor') {
      return { canTrade: false, reason: 'Only investors can place trades' };
    }
    
    if (broker.role !== 'broker') {
      return { canTrade: false, reason: 'Trades must be executed through a licensed broker' };
    }
    
    // In real implementation, check broker_investor_links table
    // For now, assume relationship exists if both are active
    if (!investor.isActive || !broker.isActive) {
      return { canTrade: false, reason: 'Inactive user account' };
    }
    
    return { canTrade: true };
  }
  
  static generateRuleViolationMessage(violationType: string, details?: any): string {
    const messages: Record<string, string> = {
      'TRADING_NOT_PERMITTED_NO_BROKER_ASSIGNED': 'Activate your account via a licensed Broker to trade.',
      'ORDER_TYPE_NOT_ALLOWED': 'Only LIMIT orders permitted in this simulation.',
      'TICK_SIZE_VIOLATION': `Price must move in steps of ${details?.tickSize || '5'} RWF.`,
      'PRICE_BAND_BREACH': `Order ${details?.price} outside ±${details?.band}% of reference ${details?.ref}.`,
      'CIRCUIT_BREAKER_TRIGGERED': `Instrument halted for ${details?.minutes || 15} minutes after ${details?.swing}% swing.`,
      'SUBMISSION_NOT_ALLOWED_FOR_ISSUER': 'Only IB Advisors file on behalf of issuers.',
      'INSUFFICIENT_HIERARCHY_LEVEL': 'Insufficient authority level for this action.',
      'INVALID_ROLE_INTERACTION': 'This interaction is not permitted between your roles.'
    };
    
    return messages[violationType] || 'Rule violation detected.';
  }
}

// Middleware for role-based route protection
export function requireRole(allowedRoles: InstitutionalRole[]) {
  return (user: InstitutionalUser | null): boolean => {
    if (!user || !user.isActive) return false;
    return allowedRoles.includes(user.role);
  };
}

// Middleware for permission-based action protection
export function requirePermission(permission: string) {
  return (user: InstitutionalUser | null): boolean => {
    if (!user || !user.isActive) return false;
    return CapitalLabAuth.hasPermission(user, permission);
  };
}

// Route definitions for different roles
export const ROLE_ROUTES: Record<InstitutionalRole, string> = {
  issuer: '/capitallab/issuer',
  ib_advisor: '/capitallab/ib-advisor',
  broker: '/capitallab/broker',
  investor: '/capitallab/investor',
  regulator: '/capitallab/regulator',
  listing_desk: '/capitallab/listing-desk',
  csd_operator: '/capitallab/csd',
  admin: '/capitallab/admin'
};

// Dashboard configurations for each role
export const ROLE_DASHBOARDS = {
  issuer: {
    title: 'Issuer Dashboard',
    description: 'Submit capital raise intents and respond to due diligence requests',
    primaryActions: ['Submit Capital Raise Intent', 'View Due Diligence Requests'],
    restrictions: 'You can only express capital raise intent. All structuring and filing is handled by your assigned IB Advisor.'
  },
  ib_advisor: {
    title: 'Investment Bank Advisor Dashboard',
    description: 'Manage due diligence, create prospectus filings, and handle allocations',
    primaryActions: ['Manage Assignments', 'Due Diligence', 'Create Prospectus', 'Book Building'],
    restrictions: 'You control all regulatory-facing actions on behalf of issuers.'
  },
  broker: {
    title: 'Licensed Broker Dashboard',
    description: 'Activate investor accounts and execute trades',
    primaryActions: ['Activate Investors', 'Execute Trades', 'Manage Client Accounts'],
    restrictions: 'You are the gateway for investor market access.'
  },
  investor: {
    title: 'Investor Dashboard',
    description: 'View portfolio and place orders through your broker',
    primaryActions: ['Place Orders', 'View Portfolio', 'View Statements'],
    restrictions: 'You must be activated by a licensed broker to trade.'
  },
  regulator: {
    title: 'CMA Regulator Dashboard',
    description: 'Review filings and issue compliance decisions',
    primaryActions: ['Review Filings', 'Issue Approvals/Rejections', 'Compliance Monitoring'],
    restrictions: 'You review and approve/reject regulatory submissions.'
  },
  listing_desk: {
    title: 'SHORA Exchange Listing Desk Dashboard',
    description: 'Approve listings and create virtual ISINs',
    primaryActions: ['Approve Listings', 'Create Virtual ISINs', 'Manage Listing Calendar'],
    restrictions: 'You control instrument listing and ISIN assignment.'
  },
  csd_operator: {
    title: 'CSD Operator Dashboard',
    description: 'Manage registry and process settlements',
    primaryActions: ['Manage Registry', 'Process Settlements', 'Corporate Actions'],
    restrictions: 'You maintain the authoritative ownership ledger.'
  },
  admin: {
    title: 'System Administrator Dashboard',
    description: 'Manage users, roles, and system configuration',
    primaryActions: ['Manage Users', 'Manage Roles', 'View Audit Trail', 'System Configuration'],
    restrictions: 'Full system access for administration purposes.'
  }
};