/**
 * Kitabo Courseware Management Service
 * 
 * Handles bulk courseware upload, validation, metadata extraction,
 * publisher management, and content lifecycle management.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  Publisher, Category, Subject, Courseware, UploadBatch, UploadJob,
  PublisherRights, CoursewareAuditLog, DuplicateDetectionLog,
  CoursewareManifestRow, FileFormat, UploadStatus, RightsStatus
} from '../types';
import { ServiceResult } from './kitabo';

// ============================================
// FILE VALIDATION
// ============================================

const ALLOWED_MIME_TYPES = {
  'epub': ['application/epub+zip', 'application/octet-stream'],
  'pdf': ['application/pdf']
};

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export async function validateFile(file: File): Promise<{
  valid: boolean;
  format: FileFormat;
  errors: string[];
}> {
  const errors: string[] = [];
  let format: FileFormat = 'unknown';

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  if (file.size === 0) {
    errors.push('File is empty');
  }

  // Detect format from extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'epub') {
    format = 'epub';
  } else if (extension === 'pdf') {
    format = 'pdf';
  } else {
    errors.push(`Unsupported file format: ${extension}`);
  }

  // Validate MIME type
  if (format !== 'unknown') {
    const allowedTypes = ALLOWED_MIME_TYPES[format];
    if (!allowedTypes.includes(file.type) && file.type !== '') {
      errors.push(`Invalid MIME type: ${file.type}`);
    }
  }

  // For EPUB files, validate ZIP structure
  if (format === 'epub' && errors.length === 0) {
    try {
      const isValid = await validateEpubStructure(file);
      if (!isValid) {
        errors.push('Invalid EPUB structure: not a valid ZIP archive or missing required files');
      }
    } catch (error) {
      errors.push(`EPUB validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // For PDF files, validate PDF structure
  if (format === 'pdf' && errors.length === 0) {
    try {
      const isValid = await validatePdfStructure(file);
      if (!isValid) {
        errors.push('Invalid PDF structure: file is corrupted or not a valid PDF');
      }
    } catch (error) {
      errors.push(`PDF validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    valid: errors.length === 0,
    format,
    errors
  };
}

async function validateEpubStructure(file: File): Promise<boolean> {
  // Read first few bytes to check for ZIP signature
  const buffer = await file.slice(0, 4).arrayBuffer();
  const view = new DataView(buffer);
  const signature = view.getUint32(0, false);
  
  // ZIP files start with 0x04034b50 (PK\x03\x04)
  return signature === 0x04034b50;
}

async function validatePdfStructure(file: File): Promise<boolean> {
  // Read first few bytes to check for PDF signature
  const buffer = await file.slice(0, 5).arrayBuffer();
  const view = new Uint8Array(buffer);
  
  // PDF files start with %PDF-
  const signature = String.fromCharCode(...view);
  return signature.startsWith('%PDF-');
}

// ============================================
// FILE HASH CALCULATION
// ============================================

export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// ============================================
// METADATA EXTRACTION
// ============================================

export interface ExtractedMetadata {
  title?: string;
  subtitle?: string;
  author?: string;
  publisher?: string;
  isbn10?: string;
  isbn13?: string;
  edition?: string;
  publicationYear?: number;
  language?: string;
  description?: string;
  pageCount?: number;
  coverUrl?: string;
  tags?: string[];
}

export async function extractMetadata(file: File, format: FileFormat): Promise<ExtractedMetadata> {
  if (format === 'epub') {
    return extractEpubMetadata(file);
  } else if (format === 'pdf') {
    return extractPdfMetadata(file);
  }
  return {};
}

async function extractEpubMetadata(file: File): Promise<ExtractedMetadata> {
  // In a real implementation, this would use a library like JSZip to parse the EPUB
  // For now, we'll return a placeholder that indicates metadata needs manual review
  console.log('[Metadata Extraction] EPUB metadata extraction would happen here');
  
  // Placeholder - in production, use JSZip to extract container.xml and content.opf
  return {
    title: file.name.replace(/\.epub$/i, ''),
    language: 'English',
    tags: []
  };
}

async function extractPdfMetadata(file: File): Promise<ExtractedMetadata> {
  // In a real implementation, this would use a library like pdf.js to extract metadata
  // For now, we'll return a placeholder that indicates metadata needs manual review
  console.log('[Metadata Extraction] PDF metadata extraction would happen here');
  
  // Placeholder - in production, use pdf.js to extract document info
  return {
    title: file.name.replace(/\.pdf$/i, ''),
    language: 'English',
    tags: []
  };
}

// ============================================
// DUPLICATE DETECTION
// ============================================

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateId?: string;
  confidence?: 'exact' | 'high' | 'medium' | 'low';
  method?: 'file_hash' | 'isbn' | 'title_edition';
}

export async function checkForDuplicates(
  fileHash: string,
  isbn13?: string,
  title?: string,
  edition?: string
): Promise<DuplicateCheckResult> {
  if (!isSupabaseConfigured || !supabase) {
    // Demo mode - return no duplicates
    return { isDuplicate: false };
  }

  try {
    // Use the database function to check for duplicates
    const { data, error } = await supabase.rpc('check_courseware_duplicate', {
      p_file_hash: fileHash,
      p_isbn_13: isbn13 || null,
      p_title: title || null,
      p_edition: edition || null
    });

    if (error) throw error;

    if (data && data.length > 0 && data[0].is_duplicate) {
      return {
        isDuplicate: true,
        duplicateId: data[0].duplicate_id,
        confidence: data[0].confidence,
        method: data[0].method
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('[Duplicate Detection] Error:', error);
    return { isDuplicate: false };
  }
}

// ============================================
// CSV MANIFEST PARSING
// ============================================

export function parseManifestCSV(csvText: string): CoursewareManifestRow[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows: CoursewareManifestRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: CoursewareManifestRow = {
      filename: values[headers.indexOf('filename')] || '',
      title: values[headers.indexOf('title')] || undefined,
      author: values[headers.indexOf('author')] || undefined,
      publisher: values[headers.indexOf('publisher')] || undefined,
      isbn: values[headers.indexOf('isbn')] || undefined,
      edition: values[headers.indexOf('edition')] || undefined,
      publicationYear: values[headers.indexOf('publication_year')] ? parseInt(values[headers.indexOf('publication_year')]) : undefined,
      language: values[headers.indexOf('language')] || undefined,
      category: values[headers.indexOf('category')] || undefined,
      subject: values[headers.indexOf('subject')] || undefined,
      tags: values[headers.indexOf('tags')] ? values[headers.indexOf('tags')].split(';').map(t => t.trim()) : undefined,
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validate required fields
    if (!row.filename) {
      row.isValid = false;
      row.errors?.push('Filename is required');
    }

    // Check for CSV formula injection
    if (row.title && /^[=+\-@]/.test(row.title)) {
      row.isValid = false;
      row.errors?.push('Title contains potentially unsafe characters');
    }

    rows.push(row);
  }

  return rows;
}

export function validateManifest(
  rows: CoursewareManifestRow[],
  uploadedFiles: string[]
): { valid: CoursewareManifestRow[]; invalid: CoursewareManifestRow[] } {
  const valid: CoursewareManifestRow[] = [];
  const invalid: CoursewareManifestRow[] = [];

  for (const row of rows) {
    if (!row.isValid) {
      invalid.push(row);
      continue;
    }

    // Check if file exists in uploaded files
    if (!uploadedFiles.includes(row.filename)) {
      row.isValid = false;
      row.errors = row.errors || [];
      row.errors.push('File not found in upload batch');
      invalid.push(row);
      continue;
    }

    // Check for duplicate ISBNs
    const duplicateIsbn = rows.find(r => r !== row && r.isbn && r.isbn === row.isbn);
    if (duplicateIsbn) {
      row.warnings = row.warnings || [];
      row.warnings.push(`Duplicate ISBN found: ${row.isbn}`);
    }

    valid.push(row);
  }

  return { valid, invalid };
}

// ============================================
// COURSEWARE SERVICE CLASS
// ============================================

export class CoursewareService {
  // Publisher Management
  async createPublisher(data: Omit<Publisher, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResult<Publisher>> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data: publisher, error } = await supabase
        .from('publishers')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: publisher as Publisher };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create publisher' };
    }
  }

  async getPublishers(): Promise<ServiceResult<Publisher[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('publishers')
        .select('*')
        .order('name');

      if (error) throw error;

      return { success: true, data: data as Publisher[] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch publishers' };
    }
  }

  // Courseware Upload
  async uploadCourseware(
    file: File,
    metadata: Partial<Courseware>,
    userId: string
  ): Promise<ServiceResult<Courseware>> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      // Validate file
      const validation = await validateFile(file);
      if (!validation.valid) {
        return { success: false, error: `File validation failed: ${validation.errors.join(', ')}` };
      }

      // Calculate file hash
      const fileHash = await calculateFileHash(file);

      // Check for duplicates
      const duplicateCheck = await checkForDuplicates(
        fileHash,
        metadata.isbn13,
        metadata.title,
        metadata.edition
      );

      if (duplicateCheck.isDuplicate) {
        return { 
          success: false, 
          error: `Duplicate detected (${duplicateCheck.confidence} confidence via ${duplicateCheck.method}). Existing ID: ${duplicateCheck.duplicateId}` 
        };
      }

      // Upload file to storage
      const storagePath = `courseware/${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('courseware')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Extract metadata
      const extractedMetadata = await extractMetadata(file, validation.format);

      // Create courseware record
      const coursewareData = {
        ...metadata,
        fileFormat: validation.format,
        fileSize: file.size,
        fileHash,
        storagePath,
        originalFilename: file.name,
        status: 'awaiting_review' as UploadStatus,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        metadataExtractedAt: new Date().toISOString(),
        metadataComplete: false,
        ...extractedMetadata
      };

      const { data: courseware, error: insertError } = await supabase
        .from('courseware')
        .insert(coursewareData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Log audit event
      await this.logAuditEvent(courseware.id, userId, 'uploaded', {
        filename: file.name,
        size: file.size,
        format: validation.format
      }, null, 'awaiting_review');

      return { success: true, data: courseware as Courseware };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to upload courseware' };
    }
  }

  // Publish Courseware
  async publishCourseware(
    coursewareId: string,
    userId: string,
    rightsApproved: boolean
  ): Promise<ServiceResult<Courseware>> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      // Check rights approval
      if (!rightsApproved) {
        return { success: false, error: 'Publisher rights must be approved before publishing' };
      }

      // Update courseware status
      const { data: courseware, error } = await supabase
        .from('courseware')
        .update({
          status: 'published',
          publishedAt: new Date().toISOString(),
          publishedBy: userId,
          updatedAt: new Date().toISOString()
        })
        .eq('id', coursewareId)
        .select()
        .single();

      if (error) throw error;

      // If linked to a book, update book status
      if (courseware.bookId) {
        await supabase
          .from('books')
          .update({ status: 'published' })
          .eq('id', courseware.bookId);
      }

      // Log audit event
      await this.logAuditEvent(coursewareId, userId, 'published', null, 'awaiting_review', 'published');

      return { success: true, data: courseware as Courseware };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to publish courseware' };
    }
  }

  // Audit Logging
  private async logAuditEvent(
    coursewareId: string,
    actorId: string,
    action: string,
    details?: any,
    previousStatus?: UploadStatus | null,
    newStatus?: UploadStatus
  ): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase.from('courseware_audit_log').insert({
        courseware_id: coursewareId,
        actor_id: actorId,
        action,
        details,
        previous_status: previousStatus,
        new_status: newStatus,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Audit Log] Failed to log event:', error);
    }
  }

  // Get Categories and Subjects
  async getCategories(): Promise<ServiceResult<Category[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return { success: true, data: data as Category[] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch categories' };
    }
  }

  async getSubjects(): Promise<ServiceResult<Subject[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;

      return { success: true, data: data as Subject[] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch subjects' };
    }
  }
}

export const coursewareService = new CoursewareService();
