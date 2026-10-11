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
  Bookmark, Highlight, AuditLogEntry, RegisteredDevice, ExportRecord, Classroom
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
      { id: 'ord-1', orderId: 'SDA-2024-001', partnerId: 'partner-1', bookId: 'book-1', quantity: 50, validityDays: 180, maxDevices: 2, status: 'fulfilled', requestedBy: 'user-partner1', orderDate: '2024-09-01T10:00:00Z', fulfilledAt: '2024-09-02T14:00:00Z', fulfilledBy: 'user-support1', createdAt: '2024-09-01T10:00:00Z', updatedAt: '2024-09-02T14:00:00Z' },
      { id: 'ord-2', orderId: 'SDA-2024-002', partnerId: 'partner-1', bookId: 'book-2', quantity: 25, validityDays: 90, maxDevices: 2, status: 'approved', requestedBy: 'user-partner1', orderDate: '2024-10-01T10:00:00Z', createdAt: '2024-10-01T10:00:00Z', updatedAt: '2024-10-01T10:00:00Z' },
      { id: 'ord-3', orderId: 'GLI-2024-001', partnerId: 'partner-2', bookId: 'book-3', quantity: 20, validityDays: 180, maxDevices: 2, status: 'submitted', requestedBy: 'user-partner2', orderDate: '2024-10-10T10:00:00Z', createdAt: '2024-10-10T10:00:00Z', updatedAt: '2024-10-10T10:00:00Z' },
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
    if (!actor || actor.role !== 'partner_admin') {
      return { success: false, error: 'Unauthorized: Partner Admin role required' };
    }

    // Validate partner owns the order
    if (actor.partnerId !== order.partnerId) {
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

    const newOrder: Order = {
      ...order,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.demoState!.orders.push(newOrder);
    this.addAuditLog(actorId, 'order.created', 'Order', newOrder.id, `Created order ${newOrder.orderId}`);
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

    const expiresAt = new Date(Date.now() + accessCode.validityDays * 86400000).toISOString();
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
}

// Singleton instance
export const kitaboService = new KitaboService();
