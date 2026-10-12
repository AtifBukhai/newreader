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

export type PermissionModule = 'users' | 'partners' | 'orders' | 'codes' | 'reports' | 'audit' | 'settings' | 'books' | 'courseware';
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'export' | 'upload' | 'publish';

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

// ============================================
// COURSEWARE MANAGEMENT TYPES
// ============================================

export type PublisherStatus = 'active' | 'inactive' | 'suspended';
export type FileFormat = 'epub' | 'pdf' | 'unknown';
export type RightsStatus = 'pending' | 'approved' | 'expired' | 'rejected';
export type UploadStatus = 
  | 'selected' 
  | 'uploading' 
  | 'uploaded' 
  | 'validating' 
  | 'validation_failed' 
  | 'extracting_metadata' 
  | 'processing' 
  | 'available' 
  | 'awaiting_review' 
  | 'ready_to_publish' 
  | 'published' 
  | 'processing_failed' 
  | 'quarantined' 
  | 'archived';

export interface Publisher {
  id: string;
  name: string;
  identifier?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: PublisherStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Courseware {
  id: string;
  bookId?: string;
  
  // Publisher
  publisherId?: string;
  
  // File info
  fileFormat: FileFormat;
  fileSize: number;
  fileHash: string;
  storagePath: string;
  originalFilename: string;
  
  // Metadata
  title: string;
  subtitle?: string;
  author: string;
  isbn10?: string;
  isbn13?: string;
  edition?: string;
  publicationYear?: number;
  language: string;
  description?: string;
  pageCount?: number;
  coverUrl?: string;
  
  // Classification
  categoryId?: string;
  subjectId?: string;
  courseName?: string;
  certification?: string;
  level?: string;
  tags: string[];
  
  // Version
  version: string;
  isLatestVersion: boolean;
  previousVersionId?: string;
  
  // Status
  status: UploadStatus;
  
  // Rights
  rightsHolder?: string;
  licenseReference?: string;
  rightsStatus: RightsStatus;
  rightsApprovedBy?: string;
  rightsApprovedAt?: string;
  rightsExpiryDate?: string;
  rightsNotes?: string;
  
  // Processing
  uploadedBy: string;
  uploadedAt: string;
  validatedAt?: string;
  metadataExtractedAt?: string;
  publishedAt?: string;
  publishedBy?: string;
  
  // Metadata quality
  metadataComplete: boolean;
  metadataReviewNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface UploadBatch {
  id: string;
  name: string;
  description?: string;
  publisherId?: string;
  totalFiles: number;
  successfulUploads: number;
  failedUploads: number;
  status: UploadStatus;
  initiatedBy: string;
  startedAt?: string;
  completedAt?: string;
  errorReportUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadJob {
  id: string;
  batchId?: string;
  coursewareId?: string;
  
  // Job tracking
  status: UploadStatus;
  progress: number;
  retryCount: number;
  maxRetries: number;
  
  // File info
  originalFilename: string;
  fileSize: number;
  fileFormat?: FileFormat;
  
  // Processing results
  validationResult?: any;
  metadataResult?: any;
  errorMessage?: string;
  errorDetails?: any;
  
  // Timestamps
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublisherRights {
  id: string;
  publisherId: string;
  coursewareId?: string;
  
  // Authorization
  rightsHolder: string;
  licenseType?: string;
  licenseReference?: string;
  agreementDocumentUrl?: string;
  
  // Scope
  distributionScope?: string;
  allowedPartners: string[];
  
  // Duration
  startDate: string;
  expiryDate?: string;
  isPerpetual: boolean;
  
  // Status
  status: RightsStatus;
  approvedBy?: string;
  approvedAt?: string;
  reviewNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface CoursewareAuditLog {
  id: string;
  coursewareId?: string;
  batchId?: string;
  
  actorId: string;
  action: string;
  details?: any;
  previousStatus?: UploadStatus;
  newStatus?: UploadStatus;
  
  ipAddress?: string;
  userAgent?: string;
  
  createdAt: string;
}

export interface DuplicateDetectionLog {
  id: string;
  coursewareId: string;
  duplicateOf?: string;
  
  detectionMethod: 'file_hash' | 'isbn' | 'title_edition';
  confidence: 'exact' | 'high' | 'medium' | 'low';
  details?: any;
  
  resolution?: 'skipped' | 'new_version' | 'replaced' | 'reviewed';
  resolvedBy?: string;
  resolvedAt?: string;
  
  createdAt: string;
}

export interface CoursewareManifestRow {
  filename: string;
  title?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  edition?: string;
  publicationYear?: number;
  language?: string;
  category?: string;
  subject?: string;
  tags?: string[];
  // Validation
  isValid?: boolean;
  errors?: string[];
  warnings?: string[];
}
