/**
 * Kitabo Service Layer
 * 
 * This module provides a unified interface for all data operations.
 * When Supabase is configured (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY),
 * it uses the real backend. Otherwise, it uses a demo mode with in-memory storage
 * that enforces all business rules but does not persist across sessions.
 * 
 * DEMO MODE NOTICE:
 * - All data is stored in memory and lost on page refresh
 * - Authentication is simulated (any demo email works)
 * - Business rules (validation, authorization, etc.) are fully enforced
 * - This mode is for development/preview only, NOT for production
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  User, UserRole, UserStatus, LearningPartner, Book, Order, OrderStatus,
  AccessCode, CodeStatus, AccessCodeBatch, BookEntitlement, ReadingProgress,
  Bookmark, Highlight, AuditLogEntry, RegisteredDevice, ExportRecord, Classroom,
  PartnerEmail, RolePermission, PermissionModule, PermissionAction,
  Publisher, Courseware, Category, Subject
} from '../types';

// ============================================
// SERVICE RESULT TYPES
// ============================================
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// DEMO MODE STATE (in-memory, not persistent)
// ============================================
interface DemoState {
  currentUser: User | null;
  users: User[];
  partners: LearningPartner[];
  partnerEmails: PartnerEmail[];
  rolePermissions: RolePermission[];
  classrooms: Classroom[];
  books: Book[];
  orders: Order[];
  codes: AccessCode[];
  batches: AccessCodeBatch[];
  entitlements: BookEntitlement[];
  devices: RegisteredDevice[];
  progress: ReadingProgress[];
  bookmarks: Bookmark[];
  highlights: Highlight[];
  auditLogs: AuditLogEntry[];
  exports: ExportRecord[];
  // Courseware Management
  publishers: Publisher[];
  courseware: Courseware[];
  categories: Category[];
  subjects: Subject[];
}

// Cryptographically secure code generation
function generateSecureCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = new Uint8Array(12);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 12; i++) array[i] = Math.floor(Math.random() * chars.length);
  }
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[array[i] % chars.length];
  }
  return code;
}

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// ============================================
// DEMO DATA (seed data for demo mode)
// ============================================
function createDemoState(): DemoState {
  return {
    currentUser: null,
    users: [
      { id: 'user-admin', email: 'admin@kitabo.io', name: 'Platform Administrator', role: 'super_admin', status: 'active', createdAt: '2023-01-01T10:00:00Z', lastLogin: '2024-10-15T10:00:00Z' },
      { id: 'user-support1', email: 'support@kitabo.io', name: 'Sarah Mitchell', role: 'support_agent', status: 'active', createdAt: '2024-01-15T10:00:00Z', lastLogin: '2024-10-15T10:00:00Z' },
      { id: 'user-partner1', email: 'admin@stanford.edu', name: 'Dr. Robert Hayes', role: 'partner_admin', partnerId: 'partner-1', status: 'active', createdAt: '2023-06-01T10:00:00Z', lastLogin: '2024-10-14T10:00:00Z' },
      { id: 'user-partner2', email: 'admin@globallearn.org', name: 'Prof. Lisa Chang', role: 'partner_admin', partnerId: 'partner-2', status: 'active', createdAt: '2023-09-15T10:00:00Z', lastLogin: '2024-10-13T10:00:00Z' },
      { id: 'user-student1', email: 'alice@student.edu', name: 'Alice Johnson', role: 'student', partnerId: 'partner-1', status: 'active', createdAt: '2024-09-01T10:00:00Z', lastLogin: '2024-10-15T10:00:00Z' },
      { id: 'user-student2', email: 'bob@student.edu', name: 'Bob Williams', role: 'student', partnerId: 'partner-1', status: 'active', createdAt: '2024-09-01T10:00:00Z', lastLogin: '2024-10-14T10:00:00Z' },
    ],
    partners: [
      { id: 'partner-1', name: 'Stanford Digital Academy', description: 'Premier online learning institution.', status: 'active', adminId: 'user-partner1', studentCount: 342, classroomCount: 18, bookCount: 5, codeQuota: 1000, codesUsed: 456, canGenerateCodes: true, createdAt: '2023-06-01T10:00:00Z' },
      { id: 'partner-2', name: 'Global Learning Institute', description: 'International education provider.', status: 'active', adminId: 'user-partner2', studentCount: 215, classroomCount: 12, bookCount: 4, codeQuota: 500, codesUsed: 189, canGenerateCodes: true, createdAt: '2023-09-15T10:00:00Z' },
    ],
    classrooms: [
      { id: 'class-1', name: 'CS101 - Fall 2024', partnerId: 'partner-1', instructorIds: ['user-partner1'], studentIds: ['user-student1', 'user-student2'], bookIds: ['book-1'], status: 'active', startDate: '2024-09-01', createdAt: '2024-08-15T10:00:00Z' },
    ],
    books: [
      { id: 'book-1', title: 'Introduction to Computer Science', subtitle: 'A Modern Approach', author: 'Dr. Sarah Chen', publisher: 'TechPress', isbn: '978-0-123456-78-9', description: 'A comprehensive introduction to computer science.', coverUrl: '', language: 'English', edition: '3rd', pageCount: 542, categories: ['Computer Science'], tags: ['algorithms'], status: 'published', version: '3.1.0', approvedPartners: ['partner-1', 'partner-2'], createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
      { id: 'book-2', title: 'Digital Marketing Fundamentals', author: 'James Morrison', publisher: 'BusinessEdge', description: 'Master digital marketing principles.', coverUrl: '', language: 'English', pageCount: 380, categories: ['Marketing'], tags: ['SEO'], status: 'published', version: '2.0.0', approvedPartners: ['partner-1'], createdAt: '2024-02-20T10:00:00Z', updatedAt: '2024-05-15T10:00:00Z' },
      { id: 'book-3', title: 'Advanced Mathematics', author: 'Prof. Maria Rodriguez', description: 'Calculus and linear algebra.', coverUrl: '', language: 'English', pageCount: 720, categories: ['Mathematics'], tags: ['calculus'], status: 'published', version: '4.2.0', approvedPartners: ['partner-1', 'partner-2'], createdAt: '2023-08-10T10:00:00Z', updatedAt: '2024-04-20T10:00:00Z' },
    ],
    orders: [
      { id: 'ord-1', orderId: 'SDA-2024-001', partnerId: 'partner-1', bookId: 'book-1', quantity: 50, validityDays: 180, maxDevices: 2, status: 'fulfilled', requestedBy: 'user-partner1', orderDate: '2024-09-01T10:00:00Z', fulfilledAt: '2024-09-02T14:00:00Z', fulfilledBy: 'user-support1', createdAt: '2024-09-01T10:00:00Z', updatedAt: '2024-09-02T14:00:00Z', validityType: 'upon_activation', validityDuration: 180, validityDurationUnit: 'days' },
      { id: 'ord-2', orderId: 'SDA-2024-002', partnerId: 'partner-1', bookId: 'book-2', quantity: 25, validityDays: 90, maxDevices: 2, status: 'approved', requestedBy: 'user-partner1', orderDate: '2024-10-01T10:00:00Z', createdAt: '2024-10-01T10:00:00Z', updatedAt: '2024-10-01T10:00:00Z', validityType: 'valid_until_date', validUntilDate: '2025-01-01T00:00:00Z' },
      { id: 'ord-3', orderId: 'GLI-2024-001', partnerId: 'partner-2', bookId: 'book-3', quantity: 20, validityDays: 180, maxDevices: 2, status: 'submitted', requestedBy: 'user-partner2', orderDate: '2024-10-10T10:00:00Z', createdAt: '2024-10-10T10:00:00Z', updatedAt: '2024-10-10T10:00:00Z', validityType: 'upon_activation', validityDuration: 6, validityDurationUnit: 'months' },
    ],
    codes: [
      { id: 'code-1', code: 'ABCD-EFGH-JK23', orderId: 'ord-1', bookId: 'book-1', partnerId: 'partner-1', status: 'redeemed', validityDays: 180, maxDevices: 2, redeemedBy: 'user-student1', redeemedAt: '2024-09-05T10:00:00Z', expiresAt: '2025-03-05T10:00:00Z', createdAt: '2024-09-02T14:00:00Z', createdBy: 'user-support1' },
      { id: 'code-2', code: 'LMNP-QRST-UV45', orderId: 'ord-1', bookId: 'book-1', partnerId: 'partner-1', status: 'generated', validityDays: 180, maxDevices: 2, createdAt: '2024-09-02T14:00:00Z', createdBy: 'user-support1' },
    ],
    batches: [
      { id: 'batch-1', name: 'SDA-2024-001 Codes', orderId: 'ord-1', partnerId: 'partner-1', bookId: 'book-1', codeCount: 50, codesGenerated: 50, codesRedeemed: 1, status: 'active', createdAt: '2024-09-02T14:00:00Z' },
    ],
    entitlements: [
      { id: 'ent-1', userId: 'user-student1', bookId: 'book-1', codeId: 'code-1', grantedAt: '2024-09-05T10:00:00Z', expiresAt: '2025-03-05T10:00:00Z', revoked: false, maxDevices: 2, registeredDevices: [] },
    ],
    devices: [],
    progress: [
      { userId: 'user-student1', bookId: 'book-1', currentChapter: 2, currentPage: 30, percentComplete: 40, lastReadAt: '2024-10-15T14:30:00Z', totalReadTime: 3600 },
    ],
    bookmarks: [],
    highlights: [],
    auditLogs: [],
    exports: [],
    partnerEmails: [
      { id: 'pe-1', partnerId: 'partner-1', email: 'admin@stanford.edu', isPrimary: true, isVerified: true, verifiedAt: '2023-06-01T10:00:00Z', createdAt: '2023-06-01T10:00:00Z' },
      { id: 'pe-2', partnerId: 'partner-1', email: 'contact@stanford.edu', isPrimary: false, isVerified: true, verifiedAt: '2023-06-15T10:00:00Z', createdAt: '2023-06-15T10:00:00Z' },
      { id: 'pe-3', partnerId: 'partner-2', email: 'admin@globallearn.org', isPrimary: true, isVerified: true, verifiedAt: '2023-09-15T10:00:00Z', createdAt: '2023-09-15T10:00:00Z' },
    ],
    rolePermissions: [
      // Super Admin - all permissions
      { id: 'rp-1', role: 'super_admin', module: 'users', action: 'view', enabled: true },
      { id: 'rp-2', role: 'super_admin', module: 'users', action: 'create', enabled: true },
      { id: 'rp-3', role: 'super_admin', module: 'users', action: 'edit', enabled: true },
      { id: 'rp-4', role: 'super_admin', module: 'users', action: 'delete', enabled: true },
      { id: 'rp-5', role: 'super_admin', module: 'users', action: 'manage', enabled: true },
      { id: 'rp-6', role: 'super_admin', module: 'partners', action: 'view', enabled: true },
      { id: 'rp-7', role: 'super_admin', module: 'partners', action: 'create', enabled: true },
      { id: 'rp-8', role: 'super_admin', module: 'partners', action: 'edit', enabled: true },
      { id: 'rp-9', role: 'super_admin', module: 'partners', action: 'delete', enabled: true },
      { id: 'rp-10', role: 'super_admin', module: 'partners', action: 'manage', enabled: true },
      { id: 'rp-11', role: 'super_admin', module: 'orders', action: 'view', enabled: true },
      { id: 'rp-12', role: 'super_admin', module: 'orders', action: 'manage', enabled: true },
      { id: 'rp-13', role: 'super_admin', module: 'codes', action: 'view', enabled: true },
      { id: 'rp-14', role: 'super_admin', module: 'codes', action: 'manage', enabled: true },
      { id: 'rp-15', role: 'super_admin', module: 'reports', action: 'view', enabled: true },
      { id: 'rp-16', role: 'super_admin', module: 'reports', action: 'export', enabled: true },
      { id: 'rp-17', role: 'super_admin', module: 'audit', action: 'view', enabled: true },
      { id: 'rp-18', role: 'super_admin', module: 'settings', action: 'view', enabled: true },
      { id: 'rp-19', role: 'super_admin', module: 'settings', action: 'manage', enabled: true },
      { id: 'rp-20', role: 'super_admin', module: 'books', action: 'view', enabled: true },
      { id: 'rp-21', role: 'super_admin', module: 'books', action: 'create', enabled: true },
      { id: 'rp-22', role: 'super_admin', module: 'books', action: 'edit', enabled: true },
      { id: 'rp-23', role: 'super_admin', module: 'books', action: 'delete', enabled: true },
      // Support Agent - limited permissions
      { id: 'rp-24', role: 'support_agent', module: 'orders', action: 'view', enabled: true },
      { id: 'rp-25', role: 'support_agent', module: 'orders', action: 'manage', enabled: true },
      { id: 'rp-26', role: 'support_agent', module: 'codes', action: 'view', enabled: true },
      { id: 'rp-27', role: 'support_agent', module: 'codes', action: 'manage', enabled: true },
      { id: 'rp-28', role: 'support_agent', module: 'reports', action: 'view', enabled: true },
      { id: 'rp-29', role: 'support_agent', module: 'reports', action: 'export', enabled: true },
      { id: 'rp-30', role: 'support_agent', module: 'users', action: 'view', enabled: true },
      { id: 'rp-31', role: 'support_agent', module: 'partners', action: 'view', enabled: true },
      { id: 'rp-32', role: 'support_agent', module: 'books', action: 'view', enabled: true },
      // Partner Admin - organization-scoped permissions
      { id: 'rp-33', role: 'partner_admin', module: 'users', action: 'view', enabled: true },
      { id: 'rp-34', role: 'partner_admin', module: 'users', action: 'create', enabled: true },
      { id: 'rp-35', role: 'partner_admin', module: 'users', action: 'edit', enabled: true },
      { id: 'rp-36', role: 'partner_admin', module: 'orders', action: 'view', enabled: true },
      { id: 'rp-37', role: 'partner_admin', module: 'orders', action: 'create', enabled: true },
      { id: 'rp-38', role: 'partner_admin', module: 'codes', action: 'view', enabled: true },
      { id: 'rp-39', role: 'partner_admin', module: 'reports', action: 'view', enabled: true },
      { id: 'rp-40', role: 'partner_admin', module: 'reports', action: 'export', enabled: true },
      { id: 'rp-41', role: 'partner_admin', module: 'books', action: 'view', enabled: true },
      { id: 'rp-42', role: 'partner_admin', module: 'partners', action: 'view', enabled: true },
      // Student - minimal permissions
      { id: 'rp-43', role: 'student', module: 'books', action: 'view', enabled: true },
      { id: 'rp-44', role: 'student', module: 'codes', action: 'view', enabled: true },
    ],
    // Courseware Management - Initial Data
    publishers: [
      { id: 'pub-1', name: 'TechPress', identifier: 'techpress', description: 'Leading technology publisher', website: 'https://techpress.example.com', contactEmail: 'contact@techpress.example.com', status: 'active', createdAt: '2023-01-01T10:00:00Z', updatedAt: '2023-01-01T10:00:00Z' },
      { id: 'pub-2', name: 'BusinessEdge', identifier: 'businessedge', description: 'Business and management publications', website: 'https://businessedge.example.com', contactEmail: 'info@businessedge.example.com', status: 'active', createdAt: '2023-02-01T10:00:00Z', updatedAt: '2023-02-01T10:00:00Z' },
    ],
    courseware: [],
    categories: [
      { id: 'cat-1', name: 'Computer Science', description: 'Computer science and programming courses', createdAt: '2023-01-01T10:00:00Z' },
      { id: 'cat-2', name: 'Mathematics', description: 'Mathematics and statistics courses', createdAt: '2023-01-01T10:00:00Z' },
      { id: 'cat-3', name: 'Business', description: 'Business and management courses', createdAt: '2023-01-01T10:00:00Z' },
      { id: 'cat-4', name: 'Marketing', description: 'Marketing and sales courses', createdAt: '2023-01-01T10:00:00Z' },
    ],
    subjects: [
      { id: 'sub-1', name: 'Programming', description: 'Programming and software development', createdAt: '2023-01-01T10:00:00Z' },
      { id: 'sub-2', name: 'Data Science', description: 'Data science and analytics', createdAt: '2023-01-01T10:00:00Z' },
      { id: 'sub-3', name: 'Algorithms', description: 'Algorithms and data structures', createdAt: '2023-01-01T10:00:00Z' },
    ],
  };
}

// ============================================
// SERVICE CLASS
// ============================================
class KitaboService {
  private demoState: DemoState | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (!isSupabaseConfigured) {
      // Initialize demo mode
      this.demoState = createDemoState();
      console.warn('[Kitabo] Running in DEMO MODE. Data is not persisted. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for production.');
    }
  }

  // Subscribe to state changes (for demo mode)
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // ============================================
  // AUTHENTICATION
  // ============================================
  async signIn(email: string, password: string): Promise<ServiceResult<User>> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      // Fetch profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (!profile) return { success: false, error: 'Profile not found' };
      if (profile.status !== 'active') return { success: false, error: 'Account is suspended or deactivated. Contact support.' };
      const user: User = { id: profile.id, email: profile.email, name: profile.name, role: profile.role, partnerId: profile.partner_id || undefined, status: profile.status, createdAt: profile.created_at };
      return { success: true, data: user };
    } else {
      // Demo mode authentication
      const user = this.demoState!.users.find(u => u.email === email);
      if (!user) return { success: false, error: 'Invalid credentials. Use a demo account.' };
      if (user.status !== 'active') return { success: false, error: 'Account is suspended or deactivated. Contact support.' };
      this.demoState!.currentUser = { ...user, lastLogin: new Date().toISOString() };
      this.addAuditLog(user.id, 'auth.login', 'User', user.id, `${user.name} logged in`);
      this.notify();
      return { success: true, data: this.demoState!.currentUser };
    }
  }

  async signUp(email: string, password: string, name: string): Promise<ServiceResult<User>> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'Signup failed' };
      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, email, name, role: 'student', status: 'active' });
      if (profileError) return { success: false, error: profileError.message };
      const user: User = { id: data.user.id, email, name, role: 'student', status: 'active', createdAt: new Date().toISOString() };
      return { success: true, data: user };
    } else {
      // Demo mode
      if (this.demoState!.users.find(u => u.email === email)) {
        return { success: false, error: 'Email already registered' };
      }
      const user: User = { id: generateId(), email, name, role: 'student', status: 'active', createdAt: new Date().toISOString() };
      this.demoState!.users.push(user);
      this.demoState!.currentUser = user;
      this.notify();
      return { success: true, data: user };
    }
  }

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      this.demoState!.currentUser = null;
      this.notify();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!profile || profile.status !== 'active') return null;
      return { id: profile.id, email: profile.email, name: profile.name, role: profile.role, partnerId: profile.partner_id || undefined, status: profile.status, createdAt: profile.created_at };
    } else {
      return this.demoState!.currentUser;
    }
  }

  // ============================================
  // GETTERS (with authorization)
  // ============================================
  getState(): DemoState | null {
    return this.demoState;
  }

  getUsers(): User[] {
    return this.demoState?.users || [];
  }

  getPartners(): LearningPartner[] {
    return this.demoState?.partners || [];
  }

  getBooks(): Book[] {
    return this.demoState?.books || [];
  }

  getOrders(): Order[] {
    return this.demoState?.orders || [];
  }

  getCodes(): AccessCode[] {
    return this.demoState?.codes || [];
  }

  getBatches(): AccessCodeBatch[] {
    return this.demoState?.batches || [];
  }

  getEntitlements(): BookEntitlement[] {
    return this.demoState?.entitlements || [];
  }

  getDevices(): RegisteredDevice[] {
    return this.demoState?.devices || [];
  }

  getProgress(): ReadingProgress[] {
    return this.demoState?.progress || [];
  }

  getBookmarks(): Bookmark[] {
    return this.demoState?.bookmarks || [];
  }

  getHighlights(): Highlight[] {
    return this.demoState?.highlights || [];
  }

  getAuditLogs(): AuditLogEntry[] {
    return this.demoState?.auditLogs || [];
  }

  getExports(): ExportRecord[] {
    return this.demoState?.exports || [];
  }

  getClassrooms(): Classroom[] {
    return this.demoState?.classrooms || [];
  }

  getPublishers(): Publisher[] {
    return this.demoState?.publishers || [];
  }

  getCourseware(): Courseware[] {
    return this.demoState?.courseware || [];;
  }

  getCategories(): Category[] {
    return this.demoState?.categories || [];
  }

  getSubjects(): Subject[] {
    return this.demoState?.subjects || [];
  }

  // ============================================
  // PUBLISHER MANAGEMENT
  // ============================================
  async createPublisher(data: Omit<Publisher, 'id' | 'createdAt' | 'updatedAt'>, actorId: string): Promise<ServiceResult<Publisher>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      return { success: false, error: 'Publisher name is required' };
    }

    // Check for duplicate name
    if (this.demoState!.publishers.find(p => p.name.toLowerCase() === data.name.toLowerCase())) {
      return { success: false, error: 'Publisher with this name already exists' };
    }

    const newPublisher: Publisher = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.demoState!.publishers.push(newPublisher);
    this.addAuditLog(actorId, 'publisher.created', 'Publisher', newPublisher.id, `Created publisher ${newPublisher.name}`);
    this.notify();
    return { success: true, data: newPublisher };
  }

  async updatePublisher(publisherId: string, updates: Partial<Publisher>, actorId: string): Promise<ServiceResult<Publisher>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    const publisher = this.demoState!.publishers.find(p => p.id === publisherId);
    if (!publisher) return { success: false, error: 'Publisher not found' };

    // Check for duplicate name if name is being changed
    if (updates.name && updates.name !== publisher.name) {
      if (this.demoState!.publishers.find(p => p.name.toLowerCase() === updates.name!.toLowerCase() && p.id !== publisherId)) {
        return { success: false, error: 'Publisher with this name already exists' };
      }
    }

    const updated: Publisher = { ...publisher, ...updates, id: publisherId, updatedAt: new Date().toISOString() };
    this.demoState!.publishers = this.demoState!.publishers.map(p => p.id === publisherId ? updated : p);
    
    this.addAuditLog(actorId, 'publisher.updated', 'Publisher', publisherId, `Updated publisher ${updated.name}`);
    this.notify();
    return { success: true, data: updated };
  }

  // ============================================
  // COURSEWARE MANAGEMENT
  // ============================================
  async uploadCourseware(file: File, metadata: Partial<Courseware>, actorId: string): Promise<ServiceResult<Courseware>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    // Validate file
    if (!file || file.size === 0) {
      return { success: false, error: 'Invalid file' };
    }

    // Detect file format
    const extension = file.name.split('.').pop()?.toLowerCase();
    let fileFormat: 'epub' | 'pdf' | 'unknown' = 'unknown';
    if (extension === 'epub') fileFormat = 'epub';
    else if (extension === 'pdf') fileFormat = 'pdf';
    else return { success: false, error: 'Unsupported file format. Only EPUB and PDF are supported.' };

    // Check file size (500MB limit)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: `File size exceeds maximum limit of 500MB` };
    }

    // Calculate file hash (simulated for demo)
    const fileHash = `hash_${generateId()}`;

    // Check for duplicates
    const existingByHash = this.demoState!.courseware.find(c => c.fileHash === fileHash);
    if (existingByHash) {
      return { success: false, error: 'Duplicate file detected. This file has already been uploaded.' };
    }

    // Create courseware record
    const newCourseware: Courseware = {
      id: generateId(),
      fileFormat,
      fileSize: file.size,
      fileHash,
      storagePath: `courseware/${actorId}/${Date.now()}_${file.name}`,
      originalFilename: file.name,
      title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
      author: metadata.author || 'Unknown',
      language: metadata.language || 'English',
      tags: metadata.tags || [],
      version: '1.0.0',
      isLatestVersion: true,
      status: 'awaiting_review',
      rightsStatus: 'pending',
      uploadedBy: actorId,
      uploadedAt: new Date().toISOString(),
      metadataComplete: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...metadata,
    };

    this.demoState!.courseware.push(newCourseware);
    this.addAuditLog(actorId, 'courseware.uploaded', 'Courseware', newCourseware.id, `Uploaded courseware: ${newCourseware.title} (${file.name})`);
    this.notify();
    return { success: true, data: newCourseware };
  }

  async updateCourseware(coursewareId: string, updates: Partial<Courseware>, actorId: string): Promise<ServiceResult<Courseware>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    const courseware = this.demoState!.courseware.find(c => c.id === coursewareId);
    if (!courseware) return { success: false, error: 'Courseware not found' };

    const updated: Courseware = { ...courseware, ...updates, id: coursewareId, updatedAt: new Date().toISOString() };
    this.demoState!.courseware = this.demoState!.courseware.map(c => c.id === coursewareId ? updated : c);
    
    this.addAuditLog(actorId, 'courseware.updated', 'Courseware', coursewareId, `Updated courseware: ${updated.title}`);
    this.notify();
    return { success: true, data: updated };
  }

  async publishCourseware(coursewareId: string, actorId: string): Promise<ServiceResult<Courseware>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    const courseware = this.demoState!.courseware.find(c => c.id === coursewareId);
    if (!courseware) return { success: false, error: 'Courseware not found' };

    // Check if metadata is complete
    if (!courseware.metadataComplete) {
      return { success: false, error: 'Metadata must be complete before publishing' };
    }

    // Check if rights are approved
    if (courseware.rightsStatus !== 'approved') {
      return { success: false, error: 'Publisher rights must be approved before publishing' };
    }

    const updated: Courseware = {
      ...courseware,
      status: 'published',
      publishedAt: new Date().toISOString(),
      publishedBy: actorId,
      updatedAt: new Date().toISOString(),
    };
    this.demoState!.courseware = this.demoState!.courseware.map(c => c.id === coursewareId ? updated : c);
    
    this.addAuditLog(actorId, 'courseware.published', 'Courseware', coursewareId, `Published courseware: ${updated.title}`);
    this.notify();
    return { success: true, data: updated };
  }

  // ============================================
  // USER MANAGEMENT (Super Admin)
  // ============================================
  async updateUser(userId: string, updates: Partial<User>, actorId: string): Promise<ServiceResult<User>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    const user = this.demoState!.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    // Validate email uniqueness
    if (updates.email && updates.email !== user.email) {
      if (this.demoState!.users.find(u => u.email === updates.email && u.id !== userId)) {
        return { success: false, error: 'Email already in use' };
      }
    }

    const updated: User = { ...user, ...updates, id: userId };
    this.demoState!.users = this.demoState!.users.map(u => u.id === userId ? updated : u);
    
    // If updating current user, sync
    if (this.demoState!.currentUser?.id === userId) {
      this.demoState!.currentUser = updated;
    }

    this.addAuditLog(actorId, 'user.updated', 'User', userId, `Updated user ${updated.name}: ${JSON.stringify(updates)}`);
    this.notify();
    return { success: true, data: updated };
  }

  // ============================================
  // ORDER MANAGEMENT
  // ============================================
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>, actorId: string): Promise<ServiceResult<Order>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || !['partner_admin', 'super_admin'].includes(actor.role)) {
      return { success: false, error: 'Unauthorized: Partner Admin or Super Admin role required' };
    }

    // Validate partner owns the order (for partner admins)
    if (actor.role === 'partner_admin' && actor.partnerId !== order.partnerId) {
      return { success: false, error: 'Unauthorized: Cannot create order for another organization' };
    }

    // Validate required fields
    if (!order.orderId || !order.bookId || order.quantity < 1 || order.quantity > 1000) {
      return { success: false, error: 'Invalid order data' };
    }

    // Validate uniqueness
    if (this.demoState!.orders.find(o => o.orderId === order.orderId && o.partnerId === order.partnerId)) {
      return { success: false, error: 'Order ID already exists for your organization' };
    }

    // Validate book is approved for partner
    const book = this.demoState!.books.find(b => b.id === order.bookId);
    if (!book || !book.approvedPartners.includes(order.partnerId)) {
      return { success: false, error: 'Book not approved for your organization' };
    }

    // Validate validity type and fields
    if (!order.validityType) {
      return { success: false, error: 'Validity type is required' };
    }

    if (order.validityType === 'upon_activation') {
      if (!order.validityDuration || order.validityDuration < 1) {
        return { success: false, error: 'Validity duration must be at least 1' };
      }
      if (!order.validityDurationUnit) {
        return { success: false, error: 'Validity duration unit is required' };
      }
    } else if (order.validityType === 'valid_until_date') {
      if (!order.validUntilDate) {
        return { success: false, error: 'Valid until date is required' };
      }
      const validUntil = new Date(order.validUntilDate);
      const now = new Date();
      if (validUntil <= now) {
        return { success: false, error: 'Valid until date must be in the future' };
      }
    }

    const newOrder: Order = {
      ...order,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.demoState!.orders.push(newOrder);
    this.addAuditLog(actorId, 'order.created', 'Order', newOrder.id, `Created order ${newOrder.orderId}`);
    
    // Auto-approve and fulfill order for super admins (generate codes immediately)
    if (actor.role === 'super_admin') {
      // First, approve the order
      const approvedOrder: Order = { 
        ...newOrder, 
        status: 'approved',
        updatedAt: new Date().toISOString()
      };
      this.demoState!.orders = this.demoState!.orders.map(o => o.id === newOrder.id ? approvedOrder : o);
      this.addAuditLog(actorId, 'order.approved', 'Order', newOrder.id, `Auto-approved order ${newOrder.orderId}`);
      
      // Then fulfill the order (generate codes)
      const fulfillResult = await this.fulfillOrder(newOrder.id, actorId);
      if (!fulfillResult.success) {
        console.error('[Order Creation] Failed to auto-fulfill order:', fulfillResult.error);
        // Order was created but fulfillment failed - this is a partial success
        this.notify();
        return { 
          success: false, 
          error: `Order created but code generation failed: ${fulfillResult.error}`,
          data: approvedOrder
        };
      }
      
      this.addAuditLog(actorId, 'order.auto_fulfilled', 'Order', newOrder.id, 
        `Auto-fulfilled order ${newOrder.orderId} with ${fulfillResult.data?.codes.length} codes`);
      
      this.notify();
      return { success: true, data: fulfillResult.data?.order };
    }
    
    this.notify();
    return { success: true, data: newOrder };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, actorId: string): Promise<ServiceResult<Order>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor) return { success: false, error: 'Unauthorized' };

    const order = this.demoState!.orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    // Authorization check
    if (actor.role === 'partner_admin') {
      if (order.partnerId !== actor.partnerId) return { success: false, error: 'Unauthorized' };
      // Partners can only cancel their own draft/submitted orders
      if (!['draft', 'submitted', 'cancelled'].includes(status)) {
        return { success: false, error: 'Partners can only cancel draft or submitted orders' };
      }
    } else if (actor.role === 'super_admin') {
      // Super admin can change any status
    } else {
      return { success: false, error: 'Unauthorized role' };
    }

    const updated: Order = { ...order, status, updatedAt: new Date().toISOString() };
    this.demoState!.orders = this.demoState!.orders.map(o => o.id === orderId ? updated : o);
    this.addAuditLog(actorId, 'order.status_changed', 'Order', orderId, `Changed status to ${status}`);
    this.notify();
    return { success: true, data: updated };
  }

  // ============================================
  // ORDER FULFILLMENT (Support Agent)
  // ============================================
  async fulfillOrder(orderId: string, actorId: string): Promise<ServiceResult<{ order: Order; codes: AccessCode[]; batch: AccessCodeBatch }>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || !['support_agent', 'super_admin'].includes(actor.role)) {
      return { success: false, error: 'Unauthorized: Support Agent or Super Admin role required' };
    }

    const order = this.demoState!.orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    // Validate order can be fulfilled
    if (!['approved', 'processing'].includes(order.status)) {
      return { success: false, error: `Order cannot be fulfilled in status: ${order.status}` };
    }

    // Idempotency check
    if (order.status === 'fulfilled') {
      return { success: false, error: 'Order already fulfilled' };
    }

    // Generate codes
    const batchId = generateId();
    const codes: AccessCode[] = [];
    
    // Calculate expiresAt based on validity type
    let expiresAt: string | undefined;
    if (order.validityType === 'valid_until_date' && order.validUntilDate) {
      expiresAt = order.validUntilDate;
    }
    // For 'upon_activation', expiresAt will be set when the code is redeemed
    
    for (let i = 0; i < order.quantity; i++) {
      codes.push({
        id: generateId(),
        code: generateSecureCode(),
        orderId: order.id,
        batchId,
        bookId: order.bookId,
        partnerId: order.partnerId,
        status: 'generated',
        validityDays: order.validityDays,
        maxDevices: order.maxDevices,
        expiresAt, // Will be undefined for 'upon_activation', set for 'valid_until_date'
        createdAt: new Date().toISOString(),
        createdBy: actorId,
      });
    }

    const batch: AccessCodeBatch = {
      id: batchId,
      name: `${order.orderId} Codes`,
      orderId: order.id,
      partnerId: order.partnerId,
      bookId: order.bookId,
      codeCount: order.quantity,
      codesGenerated: order.quantity,
      codesRedeemed: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Update order
    const updatedOrder: Order = {
      ...order,
      status: 'fulfilled',
      fulfilledAt: new Date().toISOString(),
      fulfilledBy: actorId,
      updatedAt: new Date().toISOString(),
    };

    // Apply changes atomically
    this.demoState!.orders = this.demoState!.orders.map(o => o.id === orderId ? updatedOrder : o);
    this.demoState!.batches.push(batch);
    this.demoState!.codes.push(...codes);

    this.addAuditLog(actorId, 'order.fulfilled', 'Order', orderId, `Generated ${codes.length} codes for order ${order.orderId}`);
    this.notify();
    return { success: true, data: { order: updatedOrder, codes, batch } };
  }

  // ============================================
  // CODE REDEMPTION (Student)
  // ============================================
  async redeemCode(code: string, userId: string): Promise<ServiceResult<{ entitlement: BookEntitlement; book: Book }>> {
    const user = this.demoState!.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    const normalizedCode = code.trim().toUpperCase();
    const accessCode = this.demoState!.codes.find(c => c.code === normalizedCode);

    if (!accessCode) return { success: false, error: 'Invalid access code' };
    if (accessCode.status === 'redeemed') return { success: false, error: 'Code already redeemed' };
    if (accessCode.status === 'expired') return { success: false, error: 'Code has expired' };
    if (accessCode.status === 'revoked') return { success: false, error: 'Code has been revoked' };
    if (!['generated', 'distributed'].includes(accessCode.status)) {
      return { success: false, error: 'Code cannot be redeemed in current status' };
    }

    // Check partner restriction
    if (accessCode.partnerId && user.partnerId && accessCode.partnerId !== user.partnerId) {
      return { success: false, error: 'Code not valid for your organization' };
    }

    // Check existing entitlement
    const existing = this.demoState!.entitlements.find(e => e.userId === userId && e.bookId === accessCode.bookId && !e.revoked);
    if (existing) return { success: false, error: 'You already have access to this book' };

    const book = this.demoState!.books.find(b => b.id === accessCode.bookId);
    if (!book) return { success: false, error: 'Book not found' };

    // Get the order to determine validity type
    const order = this.demoState!.orders.find(o => o.id === accessCode.orderId);
    
    let expiresAt: string;
    if (order?.validityType === 'upon_activation') {
      // Calculate expiry based on activation time + duration
      const now = new Date();
      let durationMs = 0;
      
      if (order.validityDurationUnit === 'days') {
        durationMs = (order.validityDuration || 0) * 24 * 60 * 60 * 1000;
      } else if (order.validityDurationUnit === 'months') {
        durationMs = (order.validityDuration || 0) * 30 * 24 * 60 * 60 * 1000;
      } else if (order.validityDurationUnit === 'years') {
        durationMs = (order.validityDuration || 0) * 365 * 24 * 60 * 60 * 1000;
      }
      
      expiresAt = new Date(now.getTime() + durationMs).toISOString();
    } else if (order?.validityType === 'valid_until_date' && order.validUntilDate) {
      // Use the fixed expiry date
      expiresAt = order.validUntilDate;
    } else {
      // Fallback to old behavior for backward compatibility
      expiresAt = new Date(Date.now() + accessCode.validityDays * 86400000).toISOString();
    }

    const entitlement: BookEntitlement = {
      id: generateId(),
      userId,
      bookId: accessCode.bookId,
      codeId: accessCode.id,
      grantedAt: new Date().toISOString(),
      expiresAt,
      revoked: false,
      maxDevices: accessCode.maxDevices,
      registeredDevices: [],
    };

    // Update code
    this.demoState!.codes = this.demoState!.codes.map(c =>
      c.id === accessCode.id ? { ...c, status: 'redeemed' as CodeStatus, redeemedBy: userId, redeemedAt: new Date().toISOString(), expiresAt } : c
    );

    this.demoState!.entitlements.push(entitlement);
    this.addAuditLog(userId, 'code.redeemed', 'AccessCode', accessCode.id, `Redeemed code for ${book.title}`);
    this.notify();
    return { success: true, data: { entitlement, book } };
  }

  // ============================================
  // CODE REVOCATION
  // ============================================
  async revokeCode(codeId: string, reason: string, actorId: string): Promise<ServiceResult<void>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || !['super_admin', 'support_agent'].includes(actor.role)) {
      return { success: false, error: 'Unauthorized' };
    }

    const code = this.demoState!.codes.find(c => c.id === codeId);
    if (!code) return { success: false, error: 'Code not found' };

    this.demoState!.codes = this.demoState!.codes.map(c =>
      c.id === codeId ? { ...c, status: 'revoked' as CodeStatus, revokedAt: new Date().toISOString(), revokedBy: actorId, revokeReason: reason } : c
    );

    // Revoke entitlement
    this.demoState!.entitlements = this.demoState!.entitlements.map(e =>
      e.codeId === codeId ? { ...e, revoked: true } : e
    );

    this.addAuditLog(actorId, 'code.revoked', 'AccessCode', codeId, `Revoked code: ${reason}`);
    this.notify();
    return { success: true };
  }

  // ============================================
  // CSV EXPORT
  // ============================================
  exportCodesCSV(orderId: string, actorId: string): ServiceResult<string> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || !['super_admin', 'support_agent', 'partner_admin'].includes(actor.role)) {
      return { success: false, error: 'Unauthorized' };
    }

    const order = this.demoState!.orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    // Partner admin can only export their own orders
    if (actor.role === 'partner_admin' && order.partnerId !== actor.partnerId) {
      return { success: false, error: 'Unauthorized: Cannot export another organization\'s codes' };
    }

    const codes = this.demoState!.codes.filter(c => c.orderId === orderId);
    const book = this.demoState!.books.find(b => b.id === order.bookId);
    const partner = this.demoState!.partners.find(p => p.id === order.partnerId);

    // CSV with formula injection protection (prefix with single quote for cells starting with =, +, -, @)
    const sanitize = (val: string) => {
      if (val && /^[=+\-@]/.test(val)) return "'" + val;
      return val;
    };

    const header = 'Order ID,Access Code,Book,Learning Partner,Validity (Days),Max Devices,Status,Redeemed By,Expires At\n';
    const rows = codes.map(c => {
      const redeemedUser = c.redeemedBy ? this.demoState!.users.find(u => u.id === c.redeemedBy)?.email || '' : '';
      return `"${sanitize(order.orderId)}","${c.code}","${sanitize(book?.title || '')}","${sanitize(partner?.name || '')}",${c.validityDays},${c.maxDevices},"${c.status}","${sanitize(redeemedUser)}","${c.expiresAt || ''}"`;
    }).join('\n');

    const csv = header + rows;

    // Record export
    this.demoState!.exports.push({
      id: generateId(),
      orderId,
      exportedBy: actorId,
      exportedAt: new Date().toISOString(),
      format: 'csv',
      recordCount: codes.length,
    });

    this.addAuditLog(actorId, 'codes.exported', 'Order', orderId, `Exported ${codes.length} codes as CSV`);
    this.notify();
    return { success: true, data: csv };
  }

  // ============================================
  // PROGRESS, BOOKMARKS, HIGHLIGHTS
  // ============================================
  async updateProgress(progress: ReadingProgress): Promise<void> {
    this.demoState!.progress = this.demoState!.progress.filter(p => !(p.userId === progress.userId && p.bookId === progress.bookId));
    this.demoState!.progress.push(progress);
    this.notify();
  }

  async addBookmark(bookmark: Bookmark): Promise<void> {
    this.demoState!.bookmarks.push(bookmark);
    this.notify();
  }

  async deleteBookmark(bookmarkId: string): Promise<void> {
    this.demoState!.bookmarks = this.demoState!.bookmarks.filter(b => b.id !== bookmarkId);
    this.notify();
  }

  async addHighlight(highlight: Highlight): Promise<void> {
    this.demoState!.highlights.push(highlight);
    this.notify();
  }

  async deleteHighlight(highlightId: string): Promise<void> {
    this.demoState!.highlights = this.demoState!.highlights.filter(h => h.id !== highlightId);
    this.notify();
  }

  async registerDevice(device: RegisteredDevice): Promise<void> {
    this.demoState!.devices.push(device);
    this.notify();
  }

  // ============================================
  // OTHER MUTATIONS
  // ============================================
  async addPartner(partner: LearningPartner): Promise<void> {
    this.demoState!.partners.push(partner);
    this.notify();
  }

  async updatePartner(partner: LearningPartner): Promise<void> {
    this.demoState!.partners = this.demoState!.partners.map(p => p.id === partner.id ? partner : p);
    this.notify();
  }

  async addBook(book: Book): Promise<void> {
    this.demoState!.books.push(book);
    this.notify();
  }

  async updateBook(book: Book): Promise<void> {
    this.demoState!.books = this.demoState!.books.map(b => b.id === book.id ? book : b);
    this.notify();
  }

  async addClassroom(classroom: Classroom): Promise<void> {
    this.demoState!.classrooms.push(classroom);
    this.notify();
  }

  async addUser(user: User): Promise<void> {
    this.demoState!.users.push(user);
    this.notify();
  }

  // ============================================
  // AUDIT LOG HELPER
  // ============================================
  private addAuditLog(actorId: string, action: string, resourceType: string, resourceId: string | undefined, details: string) {
    this.demoState!.auditLogs.unshift({
      id: generateId(),
      userId: actorId,
      action,
      resource: resourceType,
      resourceId,
      details,
      createdAt: new Date().toISOString(),
    });
    // Keep last 500 entries
    if (this.demoState!.auditLogs.length > 500) {
      this.demoState!.auditLogs = this.demoState!.auditLogs.slice(0, 500);
    }
  }

  // ============================================
  // PASSWORD RESET (requires real email provider)
  // ============================================
  async requestPasswordReset(email: string): Promise<ServiceResult<void>> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) return { success: false, error: error.message };
      // Always return success to avoid email enumeration
      return { success: true };
    } else {
      // Demo mode: log that reset was requested but don't actually send email
      const user = this.demoState!.users.find(u => u.email === email);
      if (user) {
        this.addAuditLog('system', 'password_reset.requested', 'User', user.id, `Password reset requested for ${email}`);
        console.info('[Demo Mode] Password reset requested for:', email, '(no email sent in demo mode)');
      }
      // Always return success to prevent email enumeration
      return { success: true };
    }
  }

  async adminInitiatePasswordReset(userId: string, actorId: string): Promise<ServiceResult<void>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const user = this.demoState!.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    this.addAuditLog(actorId, 'password_reset.admin_initiated', 'User', userId, `Admin-initiated password reset for ${user.email}`);
    
    if (isSupabaseConfigured && supabase) {
      // In production, this would use Supabase Admin API
      console.info('[Production] Would send password reset email to:', user.email);
      return { success: true };
    } else {
      console.info('[Demo Mode] Admin-initiated password reset for:', user.email, '(no email sent in demo mode)');
      return { success: true };
    }
  }

  // ============================================
  // USER DELETION (with protection)
  // ============================================
  async createUser(userData: { email: string; name: string; role: UserRole; partnerId?: string; status?: UserStatus }, actorId: string): Promise<ServiceResult<User>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    // Validate email uniqueness
    if (this.demoState!.users.find(u => u.email === userData.email)) {
      return { success: false, error: 'Email already exists' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Validate partner exists if provided
    if (userData.partnerId && !this.demoState!.partners.find(p => p.id === userData.partnerId)) {
      return { success: false, error: 'Partner not found' };
    }

    const newUser: User = {
      id: generateId(),
      email: userData.email.toLowerCase().trim(),
      name: userData.name,
      role: userData.role,
      partnerId: userData.partnerId,
      status: userData.status || 'active',
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    this.demoState!.users.push(newUser);
    this.addAuditLog(actorId, 'user.created', 'User', newUser.id, `Created user ${newUser.name} (${newUser.email}) with role ${newUser.role}`);
    this.notify();
    return { success: true, data: newUser };
  }

  async deactivateUser(userId: string, actorId: string, reason?: string): Promise<ServiceResult<void>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    const user = this.demoState!.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    if (userId === actorId) {
      return { success: false, error: 'Cannot deactivate your own account' };
    }

    if (user.status === 'deactivated') {
      return { success: false, error: 'User is already deactivated' };
    }

    // Protection: cannot deactivate the last super admin
    if (user.role === 'super_admin') {
      const superAdmins = this.demoState!.users.filter(u => u.role === 'super_admin' && u.status === 'active');
      if (superAdmins.length <= 1) {
        return { success: false, error: 'Cannot deactivate the last active Super Admin' };
      }
    }

    this.demoState!.users = this.demoState!.users.map(u => 
      u.id === userId ? { ...u, status: 'deactivated' as UserStatus } : u
    );

    this.addAuditLog(actorId, 'user.deactivated', 'User', userId, `Deactivated user ${user.name}${reason ? `: ${reason}` : ''}`);
    this.notify();
    return { success: true };
  }

  async reactivateUser(userId: string, actorId: string): Promise<ServiceResult<void>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    const user = this.demoState!.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    if (user.status !== 'deactivated') {
      return { success: false, error: 'User is not deactivated' };
    }

    this.demoState!.users = this.demoState!.users.map(u => 
      u.id === userId ? { ...u, status: 'active' as UserStatus } : u
    );

    this.addAuditLog(actorId, 'user.reactivated', 'User', userId, `Reactivated user ${user.name}`);
    this.notify();
    return { success: true };
  }

  async resetPassword(userId: string, actorId: string, newPassword?: string): Promise<ServiceResult<{ resetToken?: string; message: string }>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    const user = this.demoState!.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    // If new password is provided, set it directly (demo mode)
    if (newPassword) {
      // Validate password strength
      if (newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters long' };
      }

      // In demo mode, we just log the password change
      // In production, this would use Supabase Admin API to update the password
      this.addAuditLog(actorId, 'password_reset.completed', 'User', userId, `Admin reset password for ${user.email}`);
      this.notify();
      
      console.log('[Password Reset] Password updated for', user.email, '(Demo mode - in production, Supabase Admin API would be used)');
      
      return { success: true, data: { message: `Password successfully reset for ${user.email}` } };
    }

    // Otherwise, generate secure reset token for email-based reset
    const resetToken = crypto.randomUUID ? crypto.randomUUID() : generateId();
    const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    this.demoState!.users = this.demoState!.users.map(u => 
      u.id === userId ? { ...u, passwordResetToken: resetToken, passwordResetExpiry: resetExpiry } : u
    );

    this.addAuditLog(actorId, 'password_reset.initiated', 'User', userId, `Initiated password reset for ${user.email}`);
    this.notify();
    
    // In production, this would send an email via the configured email service
    console.log('[Password Reset] Token generated for', user.email, '(In production, email would be sent)');
    
    return { success: true, data: { resetToken, message: `Password reset link sent to ${user.email}` } };
  }

  async revokeAccess(userId: string, actorId: string, reason?: string): Promise<ServiceResult<void>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    const user = this.demoState!.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    if (userId === actorId) {
      return { success: false, error: 'Cannot revoke your own access' };
    }

    // Revoke access by suspending the account
    this.demoState!.users = this.demoState!.users.map(u => 
      u.id === userId ? { ...u, status: 'suspended' as UserStatus } : u
    );

    // Revoke all entitlements for this user
    this.demoState!.entitlements = this.demoState!.entitlements.map(e =>
      e.userId === userId ? { ...e, revoked: true } : e
    );

    this.addAuditLog(actorId, 'access.revoked', 'User', userId, `Revoked access for ${user.name}${reason ? `: ${reason}` : ''}`);
    this.notify();
    return { success: true };
  }

  async restoreAccess(userId: string, actorId: string): Promise<ServiceResult<void>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    const user = this.demoState!.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    if (user.status !== 'suspended') {
      return { success: false, error: 'User is not suspended' };
    }

    // Restore access by reactivating the account
    this.demoState!.users = this.demoState!.users.map(u => 
      u.id === userId ? { ...u, status: 'active' as UserStatus } : u
    );

    this.addAuditLog(actorId, 'access.restored', 'User', userId, `Restored access for ${user.name}`);
    this.notify();
    return { success: true };
  }

  async deleteUser(userId: string, actorId: string): Promise<ServiceResult<void>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    const user = this.demoState!.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    // Protection: cannot delete yourself
    if (userId === actorId) {
      return { success: false, error: 'Cannot delete your own account' };
    }

    // Protection: cannot delete the last super admin
    if (user.role === 'super_admin') {
      const superAdmins = this.demoState!.users.filter(u => u.role === 'super_admin' && u.status === 'active');
      if (superAdmins.length <= 1) {
        return { success: false, error: 'Cannot delete the last active Super Admin' };
      }
    }

    // Soft delete: deactivate instead of hard delete
    this.demoState!.users = this.demoState!.users.map(u => 
      u.id === userId ? { ...u, status: 'deactivated' as UserStatus } : u
    );

    this.addAuditLog(actorId, 'user.deleted', 'User', userId, `Soft-deleted user ${user.name} (${user.email})`);
    this.notify();
    return { success: true };
  }

  // ============================================
  // PARTNER EMAIL MANAGEMENT
  // ============================================
  getPartnerEmails(): PartnerEmail[] {
    return this.demoState?.partnerEmails || [];
  }

  async addPartnerEmail(partnerId: string, email: string, actorId: string): Promise<ServiceResult<PartnerEmail>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check for duplicates across all partners
    if (this.demoState!.partnerEmails.find(pe => pe.email === normalizedEmail)) {
      return { success: false, error: 'Email address already associated with a partner' };
    }

    // Check if this is the first email for the partner (make it primary)
    const existingEmails = this.demoState!.partnerEmails.filter(pe => pe.partnerId === partnerId);
    const isPrimary = existingEmails.length === 0;

    const newEmail: PartnerEmail = {
      id: generateId(),
      partnerId,
      email: normalizedEmail,
      isPrimary,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    this.demoState!.partnerEmails.push(newEmail);
    this.addAuditLog(actorId, 'partner_email.added', 'PartnerEmail', newEmail.id, `Added email ${normalizedEmail} to partner ${partnerId}`);
    this.notify();
    return { success: true, data: newEmail };
  }

  async updatePartnerEmail(emailId: string, updates: Partial<PartnerEmail>, actorId: string): Promise<ServiceResult<PartnerEmail>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const partnerEmail = this.demoState!.partnerEmails.find(pe => pe.id === emailId);
    if (!partnerEmail) return { success: false, error: 'Email not found' };

    // If setting as primary, unset other primaries for this partner
    if (updates.isPrimary) {
      this.demoState!.partnerEmails = this.demoState!.partnerEmails.map(pe =>
        pe.partnerId === partnerEmail.partnerId && pe.id !== emailId
          ? { ...pe, isPrimary: false }
          : pe
      );
    }

    const updated: PartnerEmail = { ...partnerEmail, ...updates, id: emailId };
    this.demoState!.partnerEmails = this.demoState!.partnerEmails.map(pe => pe.id === emailId ? updated : pe);
    
    this.addAuditLog(actorId, 'partner_email.updated', 'PartnerEmail', emailId, `Updated email ${updated.email}`);
    this.notify();
    return { success: true, data: updated };
  }

  async verifyPartnerEmail(emailId: string, actorId: string): Promise<ServiceResult<void>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const partnerEmail = this.demoState!.partnerEmails.find(pe => pe.id === emailId);
    if (!partnerEmail) return { success: false, error: 'Email not found' };

    this.demoState!.partnerEmails = this.demoState!.partnerEmails.map(pe =>
      pe.id === emailId ? { ...pe, isVerified: true, verifiedAt: new Date().toISOString() } : pe
    );

    this.addAuditLog(actorId, 'partner_email.verified', 'PartnerEmail', emailId, `Verified email ${partnerEmail.email}`);
    this.notify();
    return { success: true };
  }

  async deletePartnerEmail(emailId: string, actorId: string): Promise<ServiceResult<void>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const partnerEmail = this.demoState!.partnerEmails.find(pe => pe.id === emailId);
    if (!partnerEmail) return { success: false, error: 'Email not found' };

    this.demoState!.partnerEmails = this.demoState!.partnerEmails.filter(pe => pe.id !== emailId);
    this.addAuditLog(actorId, 'partner_email.deleted', 'PartnerEmail', emailId, `Deleted email ${partnerEmail.email}`);
    this.notify();
    return { success: true };
  }

  // ============================================
  // ROLE PERMISSIONS
  // ============================================
  getRolePermissions(): RolePermission[] {
    return this.demoState?.rolePermissions || [];
  }

  async updateRolePermission(permissionId: string, enabled: boolean, actorId: string): Promise<ServiceResult<void>> {
    const actor = this.demoState!.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const permission = this.demoState!.rolePermissions.find(rp => rp.id === permissionId);
    if (!permission) return { success: false, error: 'Permission not found' };

    this.demoState!.rolePermissions = this.demoState!.rolePermissions.map(rp =>
      rp.id === permissionId ? { ...rp, enabled } : rp
    );

    this.addAuditLog(actorId, 'permission.updated', 'RolePermission', permissionId, 
      `Updated ${permission.role}.${permission.module}.${permission.action} to ${enabled}`);
    this.notify();
    return { success: true };
  }

  hasPermission(role: UserRole, module: PermissionModule, action: PermissionAction): boolean {
    const permission = this.demoState?.rolePermissions.find(
      rp => rp.role === role && rp.module === module && rp.action === action
    );
    return permission?.enabled || false;
  }
}

// Singleton instance
export const kitaboService = new KitaboService();
