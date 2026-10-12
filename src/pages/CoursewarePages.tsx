import { useState } from 'react';
import { useApp } from '../store';
import {
  Upload, FileText, BookOpen, Users, Tag, Clock, AlertCircle, CheckCircle2,
  XCircle, Download, Search, Filter, Eye, Edit, Trash2, Plus, RefreshCw
} from 'lucide-react';
import type { Courseware, Publisher, UploadStatus } from '../types';

// ============================================
// COURSEWARE LIBRARY
// ============================================
export function CoursewareLibrary() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  // In demo mode, show empty state
  const courseware: Courseware[] = [];

  const filtered = courseware.filter(c => {
    const matchSearch = !search || 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.author.toLowerCase().includes(search.toLowerCase()) ||
      c.originalFilename.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchFormat = formatFilter === 'all' || c.fileFormat === formatFilter;
    return matchSearch && matchStatus && matchFormat;
  });

  const getStatusBadge = (status: UploadStatus) => {
    const badges: Record<UploadStatus, { color: string; icon: any }> = {
      selected: { color: 'bg-helix-muted/20 text-helix-muted', icon: Clock },
      uploading: { color: 'bg-helix-primary/20 text-helix-primary', icon: Upload },
      uploaded: { color: 'bg-helix-accent/20 text-helix-accent', icon: CheckCircle2 },
      validating: { color: 'bg-helix-primary/20 text-helix-primary', icon: RefreshCw },
      validation_failed: { color: 'bg-helix-danger/20 text-helix-danger', icon: XCircle },
      extracting_metadata: { color: 'bg-helix-primary/20 text-helix-primary', icon: RefreshCw },
      awaiting_review: { color: 'bg-helix-warning/20 text-helix-warning', icon: Clock },
      ready_to_publish: { color: 'bg-helix-success/20 text-helix-success', icon: CheckCircle2 },
      published: { color: 'bg-helix-success/20 text-helix-success', icon: CheckCircle2 },
      processing_failed: { color: 'bg-helix-danger/20 text-helix-danger', icon: XCircle },
      quarantined: { color: 'bg-helix-danger/20 text-helix-danger', icon: AlertCircle },
      archived: { color: 'bg-helix-muted/20 text-helix-muted', icon: Clock }
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courseware Library</h1>
          <p className="text-helix-muted mt-1">Manage all uploaded courseware</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-helix-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, author, or filename..."
              className="w-full pl-10 pr-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="awaiting_review">Awaiting Review</option>
            <option value="ready_to_publish">Ready to Publish</option>
            <option value="published">Published</option>
            <option value="validation_failed">Validation Failed</option>
            <option value="processing_failed">Processing Failed</option>
          </select>
          <select
            value={formatFilter}
            onChange={e => setFormatFilter(e.target.value)}
            className="px-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
          >
            <option value="all">All Formats</option>
            <option value="epub">EPUB</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
      </div>

      {/* Courseware Grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-helix-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Courseware Yet</h3>
          <p className="text-helix-muted mb-4">Start by uploading courseware files</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="glass rounded-xl p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-helix-primary/20 to-helix-accent/20 flex items-center justify-center">
                  {item.fileFormat === 'epub' ? (
                    <BookOpen className="w-6 h-6 text-helix-primary" />
                  ) : (
                    <FileText className="w-6 h-6 text-helix-accent" />
                  )}
                </div>
                {getStatusBadge(item.status)}
              </div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-helix-muted mb-2">{item.author}</p>
              <div className="flex items-center gap-2 text-xs text-helix-muted">
                <span className="uppercase">{item.fileFormat}</span>
                <span>•</span>
                <span>{(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// BULK UPLOAD
// ============================================
export function BulkUpload() {
  const { state, dispatch } = useApp();
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Map<string, number>>(new Map());

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(new Map());

    // Simulate upload progress for demo
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      for (let p = 0; p <= 100; p += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setProgress(prev => new Map(prev).set(file.name, p));
      }
    }

    setUploading(false);
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        message: `Successfully uploaded ${files.length} file(s)`,
        type: 'success'
      }
    });

    // Clear files after upload
    setFiles([]);
    setProgress(new Map());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Bulk Upload</h1>
        <p className="text-helix-muted mt-1">Upload multiple courseware files at once</p>
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`glass rounded-xl p-12 text-center transition-colors ${
          dragActive ? 'border-helix-primary bg-helix-primary/5' : 'border-helix-border'
        }`}
      >
        <Upload className="w-16 h-16 text-helix-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {dragActive ? 'Drop files here' : 'Drag & drop files here'}
        </h3>
        <p className="text-helix-muted mb-4">or</p>
        <label className="inline-block">
          <input
            type="file"
            multiple
            accept=".epub,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <span className="px-6 py-3 bg-helix-primary text-white rounded-xl cursor-pointer hover:opacity-90 transition-opacity">
            Browse Files
          </span>
        </label>
        <p className="text-xs text-helix-muted mt-4">
          Supported formats: EPUB, PDF • Max file size: 500MB
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Selected Files ({files.length})</h3>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-helix-bg/50">
                <div className="flex items-center gap-3 flex-1">
                  {file.name.endsWith('.epub') ? (
                    <BookOpen className="w-5 h-5 text-helix-primary" />
                  ) : (
                    <FileText className="w-5 h-5 text-helix-accent" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-helix-muted">{formatFileSize(file.size)}</p>
                  </div>
                  {progress.has(file.name) && (
                    <div className="w-32">
                      <div className="h-2 bg-helix-bg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-helix-primary transition-all"
                          style={{ width: `${progress.get(file.name)}%` }}
                        />
                      </div>
                      <p className="text-xs text-helix-muted mt-1 text-center">
                        {progress.get(file.name)}%
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 rounded-lg hover:bg-helix-danger/20 text-helix-muted hover:text-helix-danger transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setFiles([])}
              className="px-4 py-2 bg-helix-card rounded-lg text-sm hover:bg-helix-border transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {files.length} File{files.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PUBLISHERS MANAGEMENT
// ============================================
export function PublishersManagement() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // In demo mode, show empty state
  const publishers: Publisher[] = [];

  const filtered = publishers.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Publishers</h1>
          <p className="text-helix-muted mt-1">Manage content publishers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Publisher
        </button>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-helix-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search publishers..."
            className="w-full pl-10 pr-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Publishers Grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-helix-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Publishers Yet</h3>
          <p className="text-helix-muted mb-4">Add your first publisher to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(publisher => (
            <div key={publisher.id} className="glass rounded-xl p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center text-white font-bold text-lg">
                  {publisher.name.charAt(0)}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  publisher.status === 'active' ? 'bg-helix-success/20 text-helix-success' :
                  publisher.status === 'inactive' ? 'bg-helix-muted/20 text-helix-muted' :
                  'bg-helix-danger/20 text-helix-danger'
                }`}>
                  {publisher.status}
                </span>
              </div>
              <h3 className="font-semibold mb-1">{publisher.name}</h3>
              {publisher.description && (
                <p className="text-sm text-helix-muted line-clamp-2 mb-2">{publisher.description}</p>
              )}
              {publisher.website && (
                <p className="text-xs text-helix-primary truncate">{publisher.website}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
