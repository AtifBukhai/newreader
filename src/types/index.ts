export type UserRole = 'super_admin' | 'partner_admin' | 'support_agent' | 'student';

export type UserStatus = 'active' | 'suspended' | 'deactivated';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  partnerId?: string;
  status: UserStatus;
  emailVerified?: boolean;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  passwordResetToken?: string;
  passwordResetExpiry?: string;
}

export interface LearningPartner {
  id: string;
  name: string;
  description: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  status: 'active' | 'suspended' | 'archived';
  adminId: string;
  studentCount: number;
  classroomCount: number;
  bookCount: number;
  codeQuota: number;
  codesUsed: number;
  canGenerateCodes: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PartnerEmail {
  id: string;
  partnerId: string;
  email: string;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
}

export type PermissionModule = 'users' | 'partners' | 'orders' | 'codes' | 'reports' | 'audit' | 'settings' | 'books';
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'export';

export interface RolePermission {
  id: string;
  role: UserRole;
  module: PermissionModule;
  action: PermissionAction;
  enabled: boolean;
}

export interface Classroom {
  id: string;
  name: string;
  partnerId: string;
  instructorIds: string[];
  studentIds: string[];
  bookIds: string[];
  status: 'active' | 'archived';
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  publisher?: string;
  isbn?: string;
  description: string;
  coverUrl: string;
  language: string;
  edition?: string;
  pageCount: number;
  categories: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  version: string;
  approvedPartners: string[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'draft' | 'submitted' | 'approved' | 'processing' | 'fulfilled' | 'cancelled';
export type ValidityPreset = 30 | 90 | 180 | 365 | 'custom';
export type ValidityType = 'upon_activation' | 'valid_until_date';
export type DurationUnit = 'days' | 'months' | 'years';

export interface Order {
  id: string;
  orderId: string; // LP-entered order ID
  partnerId: string;
  bookId: string;
  quantity: number;
  validityDays: number;
  maxDevices: number;
  status: OrderStatus;
  requestedBy: string;
  orderDate: string;
  fulfilledAt?: string;
  fulfilledBy?: string;
  fulfillmentNotes?: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
  // New validity fields
  validityType: ValidityType;
  validityDuration?: number; // For 'upon_activation' type
  validityDurationUnit?: DurationUnit; // For 'upon_activation' type
  validUntilDate?: string; // For 'valid_until_date' type (ISO date string)
}

export type CodeStatus = 'generated' | 'distributed' | 'redeemed' | 'expired' | 'revoked' | 'exhausted';

export interface AccessCode {
  id: string;
  code: string;
  orderId: string;
  batchId?: string;
  bookId: string;
  partnerId: string;
  classroomId?: string;
  status: CodeStatus;
  validityDays: number;
  maxDevices: number;
  redeemedBy?: string;
  redeemedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokeReason?: string;
  createdAt: string;
  createdBy?: string;
}

export interface AccessCodeBatch {
  id: string;
  name: string;
  orderId?: string;
  partnerId?: string;
  bookId: string;
  codeCount: number;
  codesGenerated: number;
  codesRedeemed: number;
  status: 'active' | 'exhausted' | 'expired';
  expirationDate?: string;
  createdAt: string;
}

export interface BookEntitlement {
  id: string;
  userId: string;
  bookId: string;
  codeId?: string;
  grantedAt: string;
  expiresAt?: string;
  revoked: boolean;
  maxDevices: number;
  registeredDevices: string[];
}

export interface RegisteredDevice {
  id: string;
  userId: string;
  deviceFingerprint: string;
  deviceName: string;
  registeredAt: string;
  lastUsedAt: string;
}

export interface ReadingProgress {
  userId: string;
  bookId: string;
  currentChapter: number;
  currentPage: number;
  percentComplete: number;
  lastReadAt: string;
  totalReadTime: number;
}

export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  chapter: number;
  page: number;
  label?: string;
  createdAt: string;
}

export interface Highlight {
  id: string;
  userId: string;
  bookId: string;
  chapter: number;
  page: number;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ExportRecord {
  id: string;
  orderId: string;
  exportedBy: string;
  exportedAt: string;
  format: 'csv';
  recordCount: number;
  downloadUrl?: string;
}

export interface DashboardStats {
  totalPartners: number;
  activePartners: number;
  totalBooks: number;
  publishedBooks: number;
  totalStudents: number;
  activeStudents: number;
  totalCodes: number;
  redeemedCodes: number;
  totalClassrooms: number;
  activeClassrooms: number;
  totalOrders: number;
  pendingOrders: number;
  fulfilledOrders: number;
}
