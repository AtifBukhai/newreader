export type UserRole = 'super_admin' | 'partner_admin' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  partnerId?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface LearningPartner {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'suspended' | 'archived';
  adminId: string;
  studentCount: number;
  classroomCount: number;
  bookCount: number;
  codeQuota: number;
  codesUsed: number;
  canGenerateCodes: boolean;
  createdAt: string;
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

export interface AccessCodeBatch {
  id: string;
  name: string;
  partnerId?: string;
  bookId: string;
  codeCount: number;
  codesGenerated: number;
  codesRedeemed: number;
  status: 'active' | 'exhausted' | 'expired';
  expirationDate?: string;
  createdAt: string;
}

export interface AccessCode {
  id: string;
  code: string;
  batchId: string;
  bookId: string;
  partnerId?: string;
  classroomId?: string;
  status: 'unused' | 'redeemed' | 'expired' | 'revoked';
  redeemedBy?: string;
  redeemedAt?: string;
  expiresAt?: string;
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
}
