import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  User, LearningPartner, Classroom, Book, AccessCode, AccessCodeBatch, Order,
  BookEntitlement, ReadingProgress, Bookmark, Highlight, AuditLogEntry,
  RegisteredDevice, ExportRecord, UserRole, OrderStatus, CodeStatus
} from '../types';

// ===== Mock Data =====
const MOCK_BOOKS: Book[] = [
  { id: 'book-1', title: 'Introduction to Computer Science', subtitle: 'A Modern Approach', author: 'Dr. Sarah Chen', publisher: 'TechPress', isbn: '978-0-123456-78-9', description: 'A comprehensive introduction to computer science covering algorithms, data structures, and computational thinking.', coverUrl: '', language: 'English', edition: '3rd', pageCount: 542, categories: ['Computer Science', 'Programming'], tags: ['algorithms', 'data-structures'], status: 'published', version: '3.1.0', approvedPartners: ['partner-1', 'partner-2'], createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
  { id: 'book-2', title: 'Digital Marketing Fundamentals', subtitle: 'Strategy & Practice', author: 'James Morrison', publisher: 'BusinessEdge', isbn: '978-0-987654-32-1', description: 'Master the principles of digital marketing from SEO and content strategy to social media and analytics.', coverUrl: '', language: 'English', edition: '2nd', pageCount: 380, categories: ['Marketing', 'Business'], tags: ['digital-marketing', 'SEO'], status: 'published', version: '2.0.0', approvedPartners: ['partner-1'], createdAt: '2024-02-20T10:00:00Z', updatedAt: '2024-05-15T10:00:00Z' },
  { id: 'book-3', title: 'Advanced Mathematics', subtitle: 'Calculus & Linear Algebra', author: 'Prof. Maria Rodriguez', publisher: 'Academic Press', isbn: '978-0-555555-11-2', description: 'An advanced treatment of calculus and linear algebra for engineering and science students.', coverUrl: '', language: 'English', edition: '4th', pageCount: 720, categories: ['Mathematics', 'Science'], tags: ['calculus', 'linear-algebra'], status: 'published', version: '4.2.0', approvedPartners: ['partner-1', 'partner-2'], createdAt: '2023-08-10T10:00:00Z', updatedAt: '2024-04-20T10:00:00Z' },
  { id: 'book-4', title: 'Creative Writing Workshop', subtitle: 'From Idea to Publication', author: 'Emily Watson', publisher: 'Literary Arts', isbn: '978-0-333333-44-5', description: 'A hands-on guide to creative writing covering fiction, poetry, and non-fiction.', coverUrl: '', language: 'English', edition: '1st', pageCount: 290, categories: ['Writing', 'Arts'], tags: ['creative-writing', 'fiction'], status: 'published', version: '1.0.0', approvedPartners: ['partner-2'], createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-03-01T10:00:00Z' },
  { id: 'book-5', title: 'Data Science with Python', subtitle: 'Machine Learning & Analytics', author: 'Dr. Alex Kumar', publisher: 'TechPress', isbn: '978-0-777777-88-9', description: 'Learn data science fundamentals using Python, pandas, scikit-learn, and TensorFlow.', coverUrl: '', language: 'English', edition: '2nd', pageCount: 485, categories: ['Computer Science', 'Data Science'], tags: ['python', 'machine-learning'], status: 'published', version: '2.1.0', approvedPartners: ['partner-1', 'partner-2'], createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-07-01T10:00:00Z' },
  { id: 'book-6', title: 'World History: Modern Era', subtitle: '1750 to Present', author: 'Prof. David Thompson', publisher: 'Heritage Books', isbn: '978-0-111111-22-3', description: 'A sweeping narrative of world history from the Enlightenment to the digital age.', coverUrl: '', language: 'English', edition: '3rd', pageCount: 620, categories: ['History', 'Social Sciences'], tags: ['world-history', 'modern-era'], status: 'published', version: '3.0.0', approvedPartners: ['partner-1'], createdAt: '2023-11-05T10:00:00Z', updatedAt: '2024-02-10T10:00:00Z' },
];

const MOCK_PARTNERS: LearningPartner[] = [
  { id: 'partner-1', name: 'Stanford Digital Academy', description: 'Premier online learning institution offering technology and business courses.', status: 'active', adminId: 'user-partner1', studentCount: 342, classroomCount: 18, bookCount: 5, codeQuota: 1000, codesUsed: 456, canGenerateCodes: true, createdAt: '2023-06-01T10:00:00Z' },
  { id: 'partner-2', name: 'Global Learning Institute', description: 'International education provider specializing in arts, humanities, and sciences.', status: 'active', adminId: 'user-partner2', studentCount: 215, classroomCount: 12, bookCount: 4, codeQuota: 500, codesUsed: 189, canGenerateCodes: true, createdAt: '2023-09-15T10:00:00Z' },
  { id: 'partner-3', name: 'TechBridge Education', description: 'Vocational training provider for emerging technologies.', status: 'suspended', adminId: 'user-partner3', studentCount: 0, classroomCount: 0, bookCount: 0, codeQuota: 200, codesUsed: 45, canGenerateCodes: false, createdAt: '2024-01-10T10:00:00Z' },
];

const MOCK_CLASSROOMS: Classroom[] = [
  { id: 'class-1', name: 'CS101 - Fall 2024', partnerId: 'partner-1', instructorIds: ['user-partner1'], studentIds: ['user-student1', 'user-student2', 'user-student3'], bookIds: ['book-1', 'book-5'], status: 'active', startDate: '2024-09-01', endDate: '2024-12-15', createdAt: '2024-08-15T10:00:00Z' },
  { id: 'class-2', name: 'MKT200 - Digital Strategy', partnerId: 'partner-1', instructorIds: ['user-partner1'], studentIds: ['user-student1', 'user-student4'], bookIds: ['book-2'], status: 'active', startDate: '2024-09-01', endDate: '2024-12-15', createdAt: '2024-08-15T10:00:00Z' },
  { id: 'class-3', name: 'Creative Writing Workshop', partnerId: 'partner-2', instructorIds: ['user-partner2'], studentIds: ['user-student2', 'user-student5'], bookIds: ['book-4'], status: 'active', startDate: '2024-09-01', createdAt: '2024-08-20T10:00:00Z' },
];

const MOCK_USERS: User[] = [
  { id: 'user-admin', email: 'admin@kitabo.io', name: 'Platform Administrator', role: 'super_admin', status: 'active', createdAt: '2023-01-01T10:00:00Z', lastLogin: '2024-10-15T10:00:00Z' },
  { id: 'user-support1', email: 'support@kitabo.io', name: 'Sarah Mitchell', role: 'support_agent', status: 'active', createdAt: '2024-01-15T10:00:00Z', lastLogin: '2024-10-15T10:00:00Z' },
  { id: 'user-support2', email: 'support2@kitabo.io', name: 'James Park', role: 'support_agent', status: 'active', createdAt: '2024-03-01T10:00:00Z', lastLogin: '2024-10-14T10:00:00Z' },
  { id: 'user-partner1', email: 'admin@stanford.edu', name: 'Dr. Robert Hayes', role: 'partner_admin', partnerId: 'partner-1', status: 'active', createdAt: '2023-06-01T10:00:00Z', lastLogin: '2024-10-14T10:00:00Z' },
  { id: 'user-partner2', email: 'admin@globallearn.org', name: 'Prof. Lisa Chang', role: 'partner_admin', partnerId: 'partner-2', status: 'active', createdAt: '2023-09-15T10:00:00Z', lastLogin: '2024-10-13T10:00:00Z' },
  { id: 'user-partner3', email: 'admin@techbridge.io', name: 'Mark Stevens', role: 'partner_admin', partnerId: 'partner-3', status: 'suspended', createdAt: '2024-01-10T10:00:00Z' },
  { id: 'user-student1', email: 'alice@student.edu', name: 'Alice Johnson', role: 'student', partnerId: 'partner-1', status: 'active', createdAt: '2024-09-01T10:00:00Z', lastLogin: '2024-10-15T10:00:00Z' },
  { id: 'user-student2', email: 'bob@student.edu', name: 'Bob Williams', role: 'student', partnerId: 'partner-1', status: 'active', createdAt: '2024-09-01T10:00:00Z', lastLogin: '2024-10-14T10:00:00Z' },
  { id: 'user-student3', email: 'carol@student.edu', name: 'Carol Davis', role: 'student', partnerId: 'partner-1', status: 'active', createdAt: '2024-09-02T10:00:00Z', lastLogin: '2024-10-12T10:00:00Z' },
  { id: 'user-student4', email: 'dan@student.edu', name: 'Dan Miller', role: 'student', partnerId: 'partner-1', status: 'active', createdAt: '2024-09-03T10:00:00Z' },
  { id: 'user-student5', email: 'eve@student.edu', name: 'Eve Thompson', role: 'student', partnerId: 'partner-2', status: 'active', createdAt: '2024-09-05T10:00:00Z', lastLogin: '2024-10-10T10:00:00Z' },
];

const MOCK_ORDERS: Order[] = [
  { id: 'ord-1', orderId: 'SDA-2024-001', partnerId: 'partner-1', bookId: 'book-1', quantity: 50, validityDays: 180, maxDevices: 2, status: 'fulfilled', requestedBy: 'user-partner1', orderDate: '2024-09-01T10:00:00Z', fulfilledAt: '2024-09-02T14:00:00Z', fulfilledBy: 'user-support1', fulfillmentNotes: 'Codes generated and distributed via CSV.', createdAt: '2024-09-01T10:00:00Z', updatedAt: '2024-09-02T14:00:00Z' },
  { id: 'ord-2', orderId: 'SDA-2024-002', partnerId: 'partner-1', bookId: 'book-5', quantity: 30, validityDays: 90, maxDevices: 1, status: 'fulfilled', requestedBy: 'user-partner1', orderDate: '2024-09-05T10:00:00Z', fulfilledAt: '2024-09-06T10:00:00Z', fulfilledBy: 'user-support1', createdAt: '2024-09-05T10:00:00Z', updatedAt: '2024-09-06T10:00:00Z' },
  { id: 'ord-3', orderId: 'SDA-2024-003', partnerId: 'partner-1', bookId: 'book-2', quantity: 25, validityDays: 365, maxDevices: 3, status: 'approved', requestedBy: 'user-partner1', orderDate: '2024-10-01T10:00:00Z', createdAt: '2024-10-01T10:00:00Z', updatedAt: '2024-10-02T10:00:00Z' },
  { id: 'ord-4', orderId: 'GLI-2024-001', partnerId: 'partner-2', bookId: 'book-4', quantity: 20, validityDays: 180, maxDevices: 2, status: 'submitted', requestedBy: 'user-partner2', orderDate: '2024-10-10T10:00:00Z', createdAt: '2024-10-10T10:00:00Z', updatedAt: '2024-10-10T10:00:00Z' },
  { id: 'ord-5', orderId: 'SDA-2024-004', partnerId: 'partner-1', bookId: 'book-3', quantity: 40, validityDays: 90, maxDevices: 2, status: 'draft', requestedBy: 'user-partner1', orderDate: '2024-10-14T10:00:00Z', createdAt: '2024-10-14T10:00:00Z', updatedAt: '2024-10-14T10:00:00Z' },
  { id: 'ord-6', orderId: 'GLI-2024-002', partnerId: 'partner-2', bookId: 'book-3', quantity: 15, validityDays: 30, maxDevices: 1, status: 'processing', requestedBy: 'user-partner2', orderDate: '2024-10-12T10:00:00Z', createdAt: '2024-10-12T10:00:00Z', updatedAt: '2024-10-13T10:00:00Z' },
];

const generateSecureCode = (): string => {
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
};

const MOCK_CODES: AccessCode[] = [
  { id: 'code-1', code: 'ABCD-EFGH-JK23', orderId: 'ord-1', batchId: 'batch-1', bookId: 'book-1', partnerId: 'partner-1', classroomId: 'class-1', status: 'redeemed', validityDays: 180, maxDevices: 2, redeemedBy: 'user-student1', redeemedAt: '2024-09-05T10:00:00Z', expiresAt: '2025-03-05T10:00:00Z', createdAt: '2024-09-02T14:00:00Z', createdBy: 'user-support1' },
  { id: 'code-2', code: 'LMNP-QRST-UV45', orderId: 'ord-1', batchId: 'batch-1', bookId: 'book-1', partnerId: 'partner-1', classroomId: 'class-1', status: 'redeemed', validityDays: 180, maxDevices: 2, redeemedBy: 'user-student2', redeemedAt: '2024-09-06T10:00:00Z', expiresAt: '2025-03-06T10:00:00Z', createdAt: '2024-09-02T14:00:00Z', createdBy: 'user-support1' },
  { id: 'code-3', code: 'WXYZ-ABCD-EF67', orderId: 'ord-1', batchId: 'batch-1', bookId: 'book-1', partnerId: 'partner-1', classroomId: 'class-1', status: 'distributed', validityDays: 180, maxDevices: 2, createdAt: '2024-09-02T14:00:00Z', createdBy: 'user-support1' },
  { id: 'code-4', code: 'GHJK-LMNP-QR89', orderId: 'ord-2', batchId: 'batch-2', bookId: 'book-5', partnerId: 'partner-1', classroomId: 'class-1', status: 'redeemed', validityDays: 90, maxDevices: 1, redeemedBy: 'user-student1', redeemedAt: '2024-09-07T10:00:00Z', expiresAt: '2024-12-07T10:00:00Z', createdAt: '2024-09-06T10:00:00Z', createdBy: 'user-support1' },
  { id: 'code-5', code: 'STUV-WXYZ-AB12', orderId: 'ord-3', batchId: 'batch-3', bookId: 'book-2', partnerId: 'partner-1', classroomId: 'class-2', status: 'generated', validityDays: 365, maxDevices: 3, createdAt: '2024-10-02T10:00:00Z', createdBy: 'user-support1' },
  { id: 'code-6', code: 'CDEF-GHIJ-KL34', orderId: 'ord-4', batchId: 'batch-4', bookId: 'book-4', partnerId: 'partner-2', classroomId: 'class-3', status: 'generated', validityDays: 180, maxDevices: 2, createdAt: '2024-10-11T10:00:00Z', createdBy: 'user-support2' },
  { id: 'code-7', code: 'MNOP-QRST-UW56', orderId: 'ord-1', batchId: 'batch-1', bookId: 'book-1', partnerId: 'partner-1', status: 'expired', validityDays: 180, maxDevices: 2, expiresAt: '2024-08-01T00:00:00Z', createdAt: '2024-02-01T10:00:00Z', createdBy: 'user-support1' },
  { id: 'code-8', code: 'YXWV-UTSR-QP78', orderId: 'ord-1', batchId: 'batch-1', bookId: 'book-1', partnerId: 'partner-1', status: 'revoked', validityDays: 180, maxDevices: 2, revokedAt: '2024-10-01T10:00:00Z', revokedBy: 'user-admin', revokeReason: 'Requested by partner for reassignment.', createdAt: '2024-09-02T14:00:00Z', createdBy: 'user-support1' },
];

const MOCK_BATCHES: AccessCodeBatch[] = [
  { id: 'batch-1', name: 'SDA-2024-001 CS101 Codes', orderId: 'ord-1', partnerId: 'partner-1', bookId: 'book-1', codeCount: 50, codesGenerated: 50, codesRedeemed: 2, status: 'active', createdAt: '2024-09-02T14:00:00Z' },
  { id: 'batch-2', name: 'SDA-2024-002 Data Science', orderId: 'ord-2', partnerId: 'partner-1', bookId: 'book-5', codeCount: 30, codesGenerated: 30, codesRedeemed: 1, status: 'active', createdAt: '2024-09-06T10:00:00Z' },
  { id: 'batch-3', name: 'SDA-2024-003 Marketing', orderId: 'ord-3', partnerId: 'partner-1', bookId: 'book-2', codeCount: 25, codesGenerated: 25, codesRedeemed: 0, status: 'active', createdAt: '2024-10-02T10:00:00Z' },
  { id: 'batch-4', name: 'GLI-2024-001 Writing', orderId: 'ord-4', partnerId: 'partner-2', bookId: 'book-4', codeCount: 20, codesGenerated: 20, codesRedeemed: 0, status: 'active', createdAt: '2024-10-11T10:00:00Z' },
];

const MOCK_ENTITLEMENTS: BookEntitlement[] = [
  { id: 'ent-1', userId: 'user-student1', bookId: 'book-1', codeId: 'code-1', grantedAt: '2024-09-05T10:00:00Z', expiresAt: '2025-03-05T10:00:00Z', revoked: false, maxDevices: 2, registeredDevices: ['device-fp-abc123'] },
  { id: 'ent-2', userId: 'user-student1', bookId: 'book-5', codeId: 'code-4', grantedAt: '2024-09-07T10:00:00Z', expiresAt: '2024-12-07T10:00:00Z', revoked: false, maxDevices: 1, registeredDevices: ['device-fp-abc123'] },
  { id: 'ent-3', userId: 'user-student2', bookId: 'book-1', codeId: 'code-2', grantedAt: '2024-09-06T10:00:00Z', expiresAt: '2025-03-06T10:00:00Z', revoked: false, maxDevices: 2, registeredDevices: ['device-fp-def456'] },
];

const MOCK_DEVICES: RegisteredDevice[] = [
  { id: 'dev-1', userId: 'user-student1', deviceFingerprint: 'device-fp-abc123', deviceName: 'Chrome on MacBook Pro', registeredAt: '2024-09-05T10:00:00Z', lastUsedAt: '2024-10-15T14:30:00Z' },
  { id: 'dev-2', userId: 'user-student2', deviceFingerprint: 'device-fp-def456', deviceName: 'Firefox on Windows PC', registeredAt: '2024-09-06T10:00:00Z', lastUsedAt: '2024-10-14T16:00:00Z' },
];

const MOCK_PROGRESS: ReadingProgress[] = [
  { userId: 'user-student1', bookId: 'book-1', currentChapter: 3, currentPage: 45, percentComplete: 32, lastReadAt: '2024-10-15T14:30:00Z', totalReadTime: 4200 },
  { userId: 'user-student1', bookId: 'book-5', currentChapter: 1, currentPage: 12, percentComplete: 8, lastReadAt: '2024-10-14T09:00:00Z', totalReadTime: 1800 },
  { userId: 'user-student2', bookId: 'book-1', currentChapter: 5, currentPage: 78, percentComplete: 55, lastReadAt: '2024-10-14T16:00:00Z', totalReadTime: 6300 },
];

const MOCK_BOOKMARKS: Bookmark[] = [
  { id: 'bm-1', userId: 'user-student1', bookId: 'book-1', chapter: 2, page: 30, label: 'Important definitions', createdAt: '2024-10-10T10:00:00Z' },
  { id: 'bm-2', userId: 'user-student1', bookId: 'book-1', chapter: 3, page: 45, label: 'Quiz review', createdAt: '2024-10-15T10:00:00Z' },
];

const MOCK_HIGHLIGHTS: Highlight[] = [
  { id: 'hl-1', userId: 'user-student1', bookId: 'book-1', chapter: 1, page: 12, text: 'An algorithm is a step-by-step procedure for solving a problem or accomplishing a task.', color: 'yellow', note: 'Key definition for exam', createdAt: '2024-10-08T10:00:00Z', updatedAt: '2024-10-08T10:00:00Z' },
  { id: 'hl-2', userId: 'user-student1', bookId: 'book-1', chapter: 2, page: 28, text: 'Data structures organize and store data efficiently, enabling faster access and modification.', color: 'green', createdAt: '2024-10-10T10:00:00Z', updatedAt: '2024-10-10T10:00:00Z' },
  { id: 'hl-3', userId: 'user-student2', bookId: 'book-1', chapter: 1, page: 15, text: 'Computational thinking involves breaking complex problems into smaller, manageable parts.', color: 'blue', note: 'Chapter 1 main concept', createdAt: '2024-10-09T10:00:00Z', updatedAt: '2024-10-09T10:00:00Z' },
];

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'log-1', userId: 'user-admin', action: 'partner.created', resource: 'LearningPartner', resourceId: 'partner-2', details: 'Created Global Learning Institute', createdAt: '2023-09-15T10:00:00Z' },
  { id: 'log-2', userId: 'user-admin', action: 'book.published', resource: 'Book', resourceId: 'book-5', details: 'Published Data Science with Python v2.1.0', createdAt: '2024-07-01T10:00:00Z' },
  { id: 'log-3', userId: 'user-support1', action: 'order.fulfilled', resource: 'Order', resourceId: 'ord-1', details: 'Fulfilled order SDA-2024-001, generated 50 codes', createdAt: '2024-09-02T14:00:00Z' },
  { id: 'log-4', userId: 'user-student1', action: 'code.redeemed', resource: 'AccessCode', resourceId: 'code-1', details: 'Redeemed code for Introduction to Computer Science', createdAt: '2024-09-05T10:00:00Z' },
  { id: 'log-5', userId: 'user-admin', action: 'partner.suspended', resource: 'LearningPartner', resourceId: 'partner-3', details: 'Suspended TechBridge Education', createdAt: '2024-08-01T10:00:00Z' },
  { id: 'log-6', userId: 'user-partner1', action: 'order.created', resource: 'Order', resourceId: 'ord-3', details: 'Created order SDA-2024-003 for Digital Marketing', createdAt: '2024-10-01T10:00:00Z' },
  { id: 'log-7', userId: 'user-admin', action: 'code.revoked', resource: 'AccessCode', resourceId: 'code-8', details: 'Revoked code YXWV-UTSR-QP78 — requested by partner', createdAt: '2024-10-01T10:00:00Z' },
  { id: 'log-8', userId: 'user-support1', action: 'codes.exported', resource: 'Order', resourceId: 'ord-1', details: 'Exported 50 codes for order SDA-2024-001 as CSV', createdAt: '2024-09-02T14:05:00Z' },
  { id: 'log-9', userId: 'user-admin', action: 'user.role_changed', resource: 'User', resourceId: 'user-partner3', details: 'Suspended user Mark Stevens', createdAt: '2024-08-01T10:00:00Z' },
  { id: 'log-10', userId: 'user-support2', action: 'order.fulfilled', resource: 'Order', resourceId: 'ord-6', details: 'Processing order GLI-2024-002', createdAt: '2024-10-13T10:00:00Z' },
];

const MOCK_EXPORTS: ExportRecord[] = [
  { id: 'exp-1', orderId: 'ord-1', exportedBy: 'user-support1', exportedAt: '2024-09-02T14:05:00Z', format: 'csv', recordCount: 50 },
  { id: 'exp-2', orderId: 'ord-2', exportedBy: 'user-support1', exportedAt: '2024-09-06T10:05:00Z', format: 'csv', recordCount: 30 },
];

// ===== Book Content =====
const BOOK_CONTENT: Record<string, { chapters: { title: string; content: string }[] }> = {
  'book-1': {
    chapters: [
      { title: 'Chapter 1: What is Computer Science?', content: `Computer science is the study of computation, information, and automation. It spans theoretical studies of algorithms, computation, and information to practical approaches for implementing these in computer systems.\n\nAt its core, computer science is about problem-solving. It teaches us to think systematically about complex challenges, breaking them into manageable components.\n\n**The Nature of Computing**\n\nComputing is not just about programming. It encompasses a broad range of activities including:\n\n- Designing algorithms that efficiently solve problems\n- Building systems that process and store information\n- Understanding the theoretical limits of what can be computed\n- Creating software that serves human needs\n\n**Key Principles**\n\nAn algorithm is a step-by-step procedure for solving a problem or accomplishing a task. This fundamental concept underlies all of computer science.\n\nComputational thinking involves breaking complex problems into smaller, manageable parts. This approach — decomposition, pattern recognition, abstraction, and algorithm design — is valuable far beyond computer science itself.\n\n**Why Study Computer Science?**\n\nIn today's world, computing touches virtually every aspect of modern life. Understanding computer science empowers you to:\n\n1. Solve complex problems systematically\n2. Create technology that improves lives\n3. Understand the digital world around you\n4. Contribute to innovation across all industries\n5. Make informed decisions about technology use` },
      { title: 'Chapter 2: Data and Information', content: `Data is the foundation of all computing. Understanding how data is represented, stored, and processed is essential for any computer scientist.\n\n**Binary Representation**\n\nAt the lowest level, computers represent all information using binary digits — bits — that can be either 0 or 1.\n\n**Data Types**\n\nProgramming languages provide various data types:\n\n- **Integers** for whole numbers\n- **Floating-point numbers** for decimal values\n- **Characters and strings** for text\n- **Booleans** for true/false values\n- **Arrays and lists** for collections of data\n\n**Data Structures**\n\nData structures organize and store data efficiently, enabling faster access and modification. Choosing the right data structure for a problem is one of the most important skills in computer science.\n\nCommon data structures include:\n\n- Arrays: Contiguous memory locations for sequential access\n- Linked Lists: Nodes connected by pointers for flexible sizing\n- Stacks: Last-in, first-out (LIFO) organization\n- Queues: First-in, first-out (FIFO) organization\n- Trees: Hierarchical structures for organized data\n- Hash Tables: Key-value pairs for fast lookup` },
      { title: 'Chapter 3: Algorithms and Problem Solving', content: `Algorithms are the heart of computer science. An algorithm is a precise, step-by-step procedure for solving a problem or performing a computation.\n\n**What Makes a Good Algorithm?**\n\nA good algorithm must be:\n1. **Correct** — it produces the right output for every valid input\n2. **Efficient** — it uses resources wisely\n3. **Clear** — it can be understood and verified\n4. **Finite** — it terminates after a bounded number of steps\n\n**Algorithm Design Strategies**\n\n- **Divide and Conquer**: Break a problem into smaller subproblems.\n- **Greedy Approach**: Make the locally optimal choice at each step.\n- **Dynamic Programming**: Store intermediate results for overlapping subproblems.\n- **Backtracking**: Explore possible solutions incrementally.\n\n**Sorting Algorithms**\n\n- Bubble Sort: Simple but slow — O(n²)\n- Merge Sort: Consistent O(n log n) performance\n- Quick Sort: Fast average case, O(n log n)\n\n**Complexity Analysis**\n\nWe measure algorithm efficiency using Big-O notation, which describes how the running time or space requirements grow as the input size increases.` },
      { title: 'Chapter 4: Programming Fundamentals', content: `Programming is the art and science of writing instructions that a computer can execute.\n\n**Programming Paradigms**\n\n- **Imperative Programming**: Sequences of statements that change program state.\n- **Object-Oriented Programming**: Objects that combine data and behavior.\n- **Functional Programming**: Evaluation of mathematical functions.\n\n**Control Flow**\n\nPrograms make decisions and repeat actions using:\n- Conditional statements (if/else)\n- Loops (for, while)\n- Function calls\n- Exception handling\n\n**Testing**\n\nTesting verifies that programs behave correctly:\n- Unit tests: Test individual functions\n- Integration tests: Test component interactions\n- End-to-end tests: Test complete workflows` },
      { title: 'Chapter 5: Systems and Architecture', content: `Understanding computer systems helps us write more efficient programs.\n\n**The Von Neumann Architecture**\n\nMost modern computers follow this architecture:\n- A central processing unit (CPU)\n- Memory (RAM) for programs and data\n- Input/output devices\n- A bus system connecting components\n\n**Operating Systems**\n\nThe OS manages hardware resources:\n- Process management and scheduling\n- Memory management\n- File system organization\n- Security and access control\n\n**Cloud Computing**\n\nCloud computing provides on-demand access to resources:\n- Infrastructure as a Service (IaaS)\n- Platform as a Service (PaaS)\n- Software as a Service (SaaS)` },
    ]
  }
};

const DEFAULT_BOOK_CONTENT = {
  chapters: [
    { title: 'Chapter 1: Introduction', content: `Welcome to this book. This chapter provides an overview of the subject matter and sets the foundation for the topics covered in subsequent chapters.\n\n**What You Will Learn**\n\nThis book covers essential concepts and practical applications. By the end of your reading, you will have a solid understanding of the core principles.\n\n**How to Use This Book**\n\nWe recommend reading the chapters in order for the best learning experience. Each chapter includes:\n\n- Key concepts and definitions\n- Detailed explanations with examples\n- Practice exercises\n- Summary points for review\n\nTake notes, highlight important passages, and use the bookmark feature to mark sections you want to revisit.` },
    { title: 'Chapter 2: Core Concepts', content: `This chapter explores the fundamental concepts that form the backbone of the subject.\n\n**Foundational Principles**\n\nEvery field of study rests on a set of core principles developed through research, practice, and critical analysis.\n\n1. The theoretical framework that underpins the discipline\n2. The practical methodologies used in real-world applications\n3. The analytical tools for evaluating outcomes\n4. The ethical considerations that guide professional practice\n\n**Building Understanding**\n\nLearning is a progressive process. We start with simple concepts and gradually build complexity. As you read, try to connect new information to your existing knowledge.` },
    { title: 'Chapter 3: Applications', content: `Theory becomes meaningful when applied to real-world situations.\n\n**Practical Implementation**\n\nMoving from theory to practice requires careful planning:\n\n1. Define clear objectives and success criteria\n2. Gather relevant data and resources\n3. Apply appropriate methodologies\n4. Monitor progress and adjust as needed\n5. Evaluate outcomes against objectives\n6. Document lessons learned\n\n**Best Practices**\n\n- Start with a clear understanding of the problem\n- Involve stakeholders early and often\n- Iterate and refine rather than seeking perfection\n- Document decisions and rationale\n- Share knowledge and learn from others` },
  ]
};

// ===== State Types =====
interface AppState {
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
  notifications: { id: string; message: string; type: 'success' | 'error' | 'info'; timestamp: number }[];
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_PARTNER'; payload: LearningPartner }
  | { type: 'UPDATE_PARTNER'; payload: LearningPartner }
  | { type: 'ADD_CLASSROOM'; payload: Classroom }
  | { type: 'UPDATE_CLASSROOM'; payload: Classroom }
  | { type: 'DELETE_CLASSROOM'; payload: string }
  | { type: 'ADD_BOOK'; payload: Book }
  | { type: 'UPDATE_BOOK'; payload: Book }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'FULFILL_ORDER'; payload: { order: Order; batch: AccessCodeBatch; codes: AccessCode[] } }
  | { type: 'ADD_CODE_BATCH'; payload: { batch: AccessCodeBatch; codes: AccessCode[] } }
  | { type: 'REDEEM_CODE'; payload: { codeId: string; userId: string; entitlement: BookEntitlement } }
  | { type: 'REVOKE_CODE'; payload: { codeId: string; userId: string; reason: string } }
  | { type: 'UPDATE_CODE_STATUS'; payload: { codeId: string; status: CodeStatus } }
  | { type: 'UPDATE_PROGRESS'; payload: ReadingProgress }
  | { type: 'ADD_BOOKMARK'; payload: Bookmark }
  | { type: 'DELETE_BOOKMARK'; payload: string }
  | { type: 'ADD_HIGHLIGHT'; payload: Highlight }
  | { type: 'UPDATE_HIGHLIGHT'; payload: Highlight }
  | { type: 'DELETE_HIGHLIGHT'; payload: string }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLogEntry }
  | { type: 'ADD_NOTIFICATION'; payload: { message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'REGISTER_DEVICE'; payload: RegisteredDevice }
  | { type: 'ADD_EXPORT'; payload: ExportRecord }
  | { type: 'RESET_STATE' };

function loadState(): AppState {
  try {
    const saved = localStorage.getItem('kitabo-state-v2');
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error('Failed to load state:', e); }
  return {
    currentUser: null, users: MOCK_USERS, partners: MOCK_PARTNERS, classrooms: MOCK_CLASSROOMS,
    books: MOCK_BOOKS, orders: MOCK_ORDERS, codes: MOCK_CODES, batches: MOCK_BATCHES,
    entitlements: MOCK_ENTITLEMENTS, devices: MOCK_DEVICES, progress: MOCK_PROGRESS,
    bookmarks: MOCK_BOOKMARKS, highlights: MOCK_HIGHLIGHTS, auditLogs: MOCK_AUDIT_LOGS,
    exports: MOCK_EXPORTS, notifications: [],
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: { ...action.payload, lastLogin: new Date().toISOString() } };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    case 'ADD_PARTNER':
      return { ...state, partners: [...state.partners, action.payload] };
    case 'UPDATE_PARTNER':
      return { ...state, partners: state.partners.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'ADD_CLASSROOM':
      return { ...state, classrooms: [...state.classrooms, action.payload] };
    case 'UPDATE_CLASSROOM':
      return { ...state, classrooms: state.classrooms.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CLASSROOM':
      return { ...state, classrooms: state.classrooms.filter(c => c.id !== action.payload) };
    case 'ADD_BOOK':
      return { ...state, books: [...state.books, action.payload] };
    case 'UPDATE_BOOK':
      return { ...state, books: state.books.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
      return { ...state, orders: state.orders.map(o => o.id === action.payload.id ? action.payload : o) };
    case 'FULFILL_ORDER':
      return {
        ...state,
        orders: state.orders.map(o => o.id === action.payload.order.id ? action.payload.order : o),
        batches: [...state.batches, action.payload.batch],
        codes: [...state.codes, ...action.payload.codes],
      };
    case 'ADD_CODE_BATCH':
      return { ...state, batches: [...state.batches, action.payload.batch], codes: [...state.codes, ...action.payload.codes] };
    case 'REDEEM_CODE': {
      const code = state.codes.find(c => c.id === action.payload.codeId);
      const expiresAt = code ? new Date(new Date(action.payload.entitlement.grantedAt).getTime() + code.validityDays * 86400000).toISOString() : undefined;
      return {
        ...state,
        codes: state.codes.map(c => c.id === action.payload.codeId ? { ...c, status: 'redeemed' as CodeStatus, redeemedBy: action.payload.userId, redeemedAt: new Date().toISOString(), expiresAt } : c),
        entitlements: [...state.entitlements, { ...action.payload.entitlement, expiresAt }],
        batches: state.batches.map(b => b.id === code?.batchId ? { ...b, codesRedeemed: b.codesRedeemed + 1 } : b),
      };
    }
    case 'REVOKE_CODE':
      return {
        ...state,
        codes: state.codes.map(c => c.id === action.payload.codeId ? { ...c, status: 'revoked' as CodeStatus, revokedAt: new Date().toISOString(), revokedBy: action.payload.userId, revokeReason: action.payload.reason } : c),
        entitlements: state.entitlements.map(e => e.codeId === action.payload.codeId ? { ...e, revoked: true } : e),
      };
    case 'UPDATE_CODE_STATUS':
      return { ...state, codes: state.codes.map(c => c.id === action.payload.codeId ? { ...c, status: action.payload.status } : c) };
    case 'UPDATE_PROGRESS':
      return { ...state, progress: state.progress.filter(p => !(p.userId === action.payload.userId && p.bookId === action.payload.bookId)).concat(action.payload) };
    case 'ADD_BOOKMARK':
      return { ...state, bookmarks: [...state.bookmarks, action.payload] };
    case 'DELETE_BOOKMARK':
      return { ...state, bookmarks: state.bookmarks.filter(b => b.id !== action.payload) };
    case 'ADD_HIGHLIGHT':
      return { ...state, highlights: [...state.highlights, action.payload] };
    case 'UPDATE_HIGHLIGHT':
      return { ...state, highlights: state.highlights.map(h => h.id === action.payload.id ? action.payload : h) };
    case 'DELETE_HIGHLIGHT':
      return { ...state, highlights: state.highlights.filter(h => h.id !== action.payload) };
    case 'ADD_AUDIT_LOG':
      return { ...state, auditLogs: [action.payload, ...state.auditLogs].slice(0, 500) };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, { id: uuidv4(), ...action.payload, timestamp: Date.now() }] };
    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u) };
    case 'REGISTER_DEVICE':
      return { ...state, devices: [...state.devices, action.payload] };
    case 'ADD_EXPORT':
      return { ...state, exports: [...state.exports, action.payload] };
    case 'RESET_STATE':
      localStorage.removeItem('kitabo-state-v2');
      return loadState();
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getBookContent: (bookId: string) => { chapters: { title: string; content: string }[] };
  generateOrderCodes: (order: Order) => { batch: AccessCodeBatch; codes: AccessCode[] };
  exportCodesCSV: (orderId: string) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try { localStorage.setItem('kitabo-state-v2', JSON.stringify(state)); } catch (e) { console.error('Failed to save state:', e); }
  }, [state]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      state.notifications.forEach(n => { if (now - n.timestamp > 5000) dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id }); });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.notifications]);

  const getBookContent = (bookId: string) => BOOK_CONTENT[bookId] || DEFAULT_BOOK_CONTENT;

  const generateOrderCodes = (order: Order) => {
    const batchId = uuidv4();
    const batch: AccessCodeBatch = {
      id: batchId, name: `${order.orderId} Codes`, orderId: order.id, partnerId: order.partnerId,
      bookId: order.bookId, codeCount: order.quantity, codesGenerated: order.quantity, codesRedeemed: 0,
      status: 'active', createdAt: new Date().toISOString()
    };
    const codes: AccessCode[] = Array.from({ length: order.quantity }, () => ({
      id: uuidv4(), code: generateSecureCode(), orderId: order.id, batchId, bookId: order.bookId,
      partnerId: order.partnerId, status: 'generated' as CodeStatus, validityDays: order.validityDays,
      maxDevices: order.maxDevices, createdAt: new Date().toISOString(), createdBy: state.currentUser?.id
    }));
    return { batch, codes };
  };

  const exportCodesCSV = (orderId: string): string => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return '';
    const codes = state.codes.filter(c => c.orderId === orderId);
    const book = state.books.find(b => b.id === order.bookId);
    const partner = state.partners.find(p => p.id === order.partnerId);
    const header = 'Order ID,Access Code,Book,Learning Partner,Validity (Days),Max Devices,Status,Redeemed By,Expires At\n';
    const rows = codes.map(c => {
      const redeemedUser = c.redeemedBy ? state.users.find(u => u.id === c.redeemedBy)?.email || '' : '';
      return `"${order.orderId}","${c.code}","${book?.title || ''}","${partner?.name || ''}",${c.validityDays},${c.maxDevices},"${c.status}","${redeemedUser}","${c.expiresAt || ''}"`;
    }).join('\n');
    return header + rows;
  };

  return (
    <AppContext.Provider value={{ state, dispatch, getBookContent, generateOrderCodes, exportCodesCSV }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
