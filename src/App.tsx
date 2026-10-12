import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';
import type { UserRole, Order, OrderStatus, CodeStatus, Book, User, AccessCode, BookEntitlement } from './types';
import { AdminDashboard, UserManagement, PartnerManagement, PartnerEmails } from './pages/AdminPages';
import { RolesPermissions } from './pages/RolesPermissions';
import {
  BookOpen, Users, GraduationCap, Shield, Settings, LogOut, Home, Library,
  Key, BarChart3, FileText, Search, Plus, Edit, Trash2, Eye,
  ChevronRight, ChevronLeft, Bookmark, Highlighter, Volume2, VolumeX,
  Menu, X, Bell, User as UserIcon, BookMarked, Clock, TrendingUp, AlertCircle,
  Check, Download, ArrowRight, Layers, Globe,
  Zap, ShoppingCart, Package, RefreshCw,
  ClipboardList, FileDown, Smartphone, AlertTriangle, History, Mail
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// ==================== AUTH PAGE ====================
function AuthPage() {
  console.log('[AuthPage] Rendering login page');
  const { signIn, signUp, state } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const result = await signIn(email, password);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        if (!name || !email) { setError('Please fill all fields'); setLoading(false); return; }
        const result = await signUp(email, password, name);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error || 'Signup failed');
        }
      }
    } finally { setLoading(false); }
  };

  const demoAccounts = [
    { email: 'admin@kitabo.io', label: 'Super Admin', role: 'super_admin' },
    { email: 'support@kitabo.io', label: 'Support Agent', role: 'support_agent' },
    { email: 'admin@stanford.edu', label: 'Partner Admin', role: 'partner_admin' },
    { email: 'alice@student.edu', label: 'Student', role: 'student' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-helix-bg via-helix-surface to-helix-bg" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-helix-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-helix-accent/10 rounded-full blur-3xl" />
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Kitabo</h1>
          </div>
          <p className="text-helix-muted">Corporate eBook Distribution Platform</p>
        </div>
        <div className="glass rounded-2xl p-8 glow">
          <h2 className="text-xl font-semibold mb-6">{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm text-helix-muted mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-helix-bg border border-helix-border rounded-xl text-helix-text focus:border-helix-primary focus:outline-none" placeholder="Enter your name" />
              </div>
            )}
            <div>
              <label className="block text-sm text-helix-muted mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-helix-bg border border-helix-border rounded-xl text-helix-text focus:border-helix-primary focus:outline-none" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-helix-muted mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-helix-bg border border-helix-border rounded-xl text-helix-text focus:border-helix-primary focus:outline-none" placeholder="••••••••" />
            </div>
            {error && <div className="flex items-center gap-2 text-helix-danger text-sm bg-helix-danger/10 rounded-lg px-3 py-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="w-full mt-4 text-sm text-helix-muted hover:text-helix-primary transition-colors">
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
        <div className="mt-6 glass rounded-2xl p-6">
          <p className="text-sm text-helix-muted mb-3 font-medium">Demo Accounts (click to fill):</p>
          <div className="space-y-2">
            {demoAccounts.map(acc => (
              <button key={acc.email} onClick={() => { setEmail(acc.email); setPassword('demo'); }} className="w-full flex items-center justify-between px-4 py-2.5 bg-helix-bg/50 rounded-lg hover:bg-helix-card transition-colors text-left group">
                <div><span className="text-sm font-medium">{acc.label}</span><span className="block text-xs text-helix-muted">{acc.email}</span></div>
                <ChevronRight className="w-4 h-4 text-helix-muted group-hover:text-helix-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SHARED COMPONENTS ====================
function Sidebar({ role }: { role: string }) {
  const { signOut } = useApp();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const links: Record<string, { to: string; icon: any; label: string }[]> = {
    super_admin: [
      { to: '/admin', icon: Home, label: 'Dashboard' },
      { to: '/admin/users', icon: Users, label: 'User Management' },
      { to: '/admin/roles', icon: Shield, label: 'Roles & Permissions' },
      { to: '/admin/partners', icon: Globe, label: 'Partner Management' },
      { to: '/admin/emails', icon: Mail, label: 'Partner Emails' },
      { to: '/admin/orders', icon: ShoppingCart, label: 'Orders & Codes' },
      { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
      { to: '/admin/audit', icon: FileText, label: 'Audit Logs' },
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
    support_agent: [
      { to: '/support', icon: Home, label: 'Dashboard' }, { to: '/support/orders', icon: ShoppingCart, label: 'Orders' },
      { to: '/support/codes', icon: Key, label: 'Access Codes' }, { to: '/support/exports', icon: FileDown, label: 'Exports' },
    ],
    partner_admin: [
      { to: '/partner', icon: Home, label: 'Dashboard' }, { to: '/partner/orders', icon: ShoppingCart, label: 'Orders' },
      { to: '/partner/classrooms', icon: GraduationCap, label: 'Classrooms' }, { to: '/partner/students', icon: Users, label: 'Students' },
      { to: '/partner/books', icon: Library, label: 'Books' }, { to: '/partner/codes', icon: Key, label: 'My Codes' },
      { to: '/partner/reports', icon: BarChart3, label: 'Reports' },
    ],
    student: [
      { to: '/student', icon: Home, label: 'My Bookshelf' }, { to: '/student/redeem', icon: Key, label: 'Redeem Code' },
      { to: '/student/progress', icon: TrendingUp, label: 'My Progress' }, { to: '/student/devices', icon: Smartphone, label: 'Devices' },
      { to: '/student/bookmarks', icon: Bookmark, label: 'Bookmarks & Notes' },
    ],
  };
  const navLinks = links[role] || [];
  return (
    <aside className={`fixed left-0 top-0 h-full bg-helix-surface border-r border-helix-border z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} hidden lg:flex flex-col`}>
      <div className="p-4 flex items-center justify-between border-b border-helix-border">
        {!collapsed && <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div><span className="font-bold gradient-text">Kitabo</span></div>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-helix-card transition-colors">{collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}</button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navLinks.map(link => (
          <Link key={link.to} to={link.to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-helix-muted hover:text-helix-text hover:bg-helix-card transition-all group">
            <link.icon className="w-5 h-5 group-hover:text-helix-primary transition-colors" />
            {!collapsed && <span className="text-sm font-medium">{link.label}</span>}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-helix-border">
        <button onClick={async () => { await signOut(); navigate('/'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-helix-muted hover:text-helix-danger hover:bg-helix-danger/10 transition-all w-full">
          <LogOut className="w-5 h-5" />{!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

function MobileNav({ role }: { role: string }) {
  const { signOut } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = role === 'super_admin'
    ? [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/orders', label: 'Orders' }, { to: '/admin/codes', label: 'Codes' }, { to: '/admin/users', label: 'Users' }]
    : role === 'support_agent'
    ? [{ to: '/support', label: 'Dashboard' }, { to: '/support/orders', label: 'Orders' }, { to: '/support/codes', label: 'Codes' }]
    : role === 'partner_admin'
    ? [{ to: '/partner', label: 'Dashboard' }, { to: '/partner/orders', label: 'Orders' }, { to: '/partner/codes', label: 'Codes' }]
    : [{ to: '/student', label: 'Bookshelf' }, { to: '/student/redeem', label: 'Redeem' }];
  return (
    <div className="lg:hidden">
      <div className="fixed top-0 left-0 right-0 h-14 bg-helix-surface border-b border-helix-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center"><BookOpen className="w-4 h-4 text-white" /></div><span className="font-bold text-sm gradient-text">Kitabo</span></div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-helix-card">{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>
      {open && (
        <div className="fixed inset-0 top-14 bg-helix-bg/95 z-40 p-4 animate-fade-in">
          <nav className="space-y-2">
            {links.map(l => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl bg-helix-card text-helix-text hover:bg-helix-primary/20 font-medium">{l.label}</Link>)}
            <button onClick={async () => { await signOut(); navigate('/'); }} className="block w-full text-left px-4 py-3 rounded-xl text-helix-danger hover:bg-helix-danger/10 font-medium">Sign Out</button>
          </nav>
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const { state, dispatch } = useApp();
  if (state.notifications.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {state.notifications.map(n => (
        <div key={n.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl glass animate-slide-in ${n.type === 'success' ? 'border-helix-success/30' : n.type === 'error' ? 'border-helix-danger/30' : 'border-helix-primary/30'}`}>
          {n.type === 'success' ? <Check className="w-5 h-5 text-helix-success" /> : n.type === 'error' ? <AlertCircle className="w-5 h-5 text-helix-danger" /> : <Bell className="w-5 h-5 text-helix-primary" />}
          <span className="text-sm flex-1">{n.message}</span>
          <button onClick={() => dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id })} className="text-helix-muted hover:text-helix-text"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color = 'primary' }: { icon: any; label: string; value: string | number; trend?: string; color?: string }) {
  const colors: Record<string, string> = { primary: 'from-helix-primary/20 to-helix-primary/5 border-helix-primary/20', accent: 'from-helix-accent/20 to-helix-accent/5 border-helix-accent/20', success: 'from-helix-success/20 to-helix-success/5 border-helix-success/20', warning: 'from-helix-warning/20 to-helix-warning/5 border-helix-warning/20' };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5 card-hover`}>
      <div className="flex items-start justify-between">
        <div><p className="text-sm text-helix-muted mb-1">{label}</p><p className="text-2xl font-bold">{value}</p>{trend && <p className="text-xs text-helix-success mt-1">{trend}</p>}</div>
        <div className="p-2 rounded-lg bg-helix-bg/50"><Icon className="w-5 h-5 text-helix-muted" /></div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-helix-success/20 text-helix-success', suspended: 'bg-helix-danger/20 text-helix-danger', archived: 'bg-helix-muted/20 text-helix-muted', deactivated: 'bg-helix-danger/20 text-helix-danger',
    draft: 'bg-helix-muted/20 text-helix-muted', submitted: 'bg-helix-primary/20 text-helix-primary-light', approved: 'bg-helix-accent/20 text-helix-accent',
    processing: 'bg-helix-warning/20 text-helix-warning', fulfilled: 'bg-helix-success/20 text-helix-success', cancelled: 'bg-helix-danger/20 text-helix-danger',
    generated: 'bg-helix-primary/20 text-helix-primary-light', distributed: 'bg-helix-accent/20 text-helix-accent', redeemed: 'bg-helix-success/20 text-helix-success',
    expired: 'bg-helix-warning/20 text-helix-warning', revoked: 'bg-helix-danger/20 text-helix-danger', exhausted: 'bg-helix-muted/20 text-helix-muted',
    published: 'bg-helix-success/20 text-helix-success',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-helix-muted/20 text-helix-muted'}`}>{status}</span>;
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="glass rounded-xl p-6 max-w-md w-full animate-fade-in" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3><p className="text-sm text-helix-muted mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-helix-card rounded-lg text-sm">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${danger ? 'bg-helix-danger hover:opacity-90' : 'bg-helix-primary hover:opacity-90'}`}>Confirm</button>
        </div>
      </div>
    </div>
  );
}





// ==================== SUPPORT AGENT PAGES ====================
function SupportDashboard() {
  const { state } = useApp();
  const pendingOrders = state.orders.filter(o => ['submitted', 'approved', 'processing'].includes(o.status));
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Support Dashboard</h1><p className="text-helix-muted mt-1">Order fulfillment and code operations</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Clock} label="Pending Orders" value={pendingOrders.length} color="warning" />
        <StatCard icon={Check} label="Fulfilled" value={state.orders.filter(o => o.status === 'fulfilled').length} color="success" />
        <StatCard icon={Key} label="Total Codes" value={state.codes.length} color="primary" />
      </div>
    </div>
  );
}

function SupportOrders() {
  const { state, dispatch, fulfillOrder, exportCodesCSV } = useApp();
  const [fulfillingOrder, setFulfillingOrder] = useState<Order | null>(null);
  const [confirmFulfill, setConfirmFulfill] = useState(false);
  const handleFulfill = async () => {
    if (!fulfillingOrder) return;
    const result = await fulfillOrder(fulfillingOrder.id);
    if (result.success) dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Order ${fulfillingOrder.orderId} fulfilled`, type: 'success' } });
    else dispatch({ type: 'ADD_NOTIFICATION', payload: { message: result.error || 'Failed', type: 'error' } });
    setFulfillingOrder(null); setConfirmFulfill(false);
  };
  const handleExport = (orderId: string) => {
    const result = exportCodesCSV(orderId);
    if (result.success && result.data) {
      const blob = new Blob([result.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `codes-${state.orders.find(o => o.id === orderId)?.orderId}.csv`; a.click();
      URL.revokeObjectURL(url);
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Codes exported', type: 'success' } });
    }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Order Fulfillment</h1><p className="text-helix-muted mt-1">Process orders and generate codes</p></div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Order ID</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Partner</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Book</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Qty</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Actions</th></tr></thead>
            <tbody>{state.orders.map(o => (
              <tr key={o.id} className="border-t border-helix-border hover:bg-helix-bg/30">
                <td className="px-4 py-3 font-mono text-xs font-medium">{o.orderId}</td>
                <td className="px-4 py-3 text-xs text-helix-muted">{state.partners.find(p => p.id === o.partnerId)?.name}</td>
                <td className="px-4 py-3 text-xs">{state.books.find(b => b.id === o.bookId)?.title}</td>
                <td className="px-4 py-3">{o.quantity}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3"><div className="flex gap-2">
                  {(o.status === 'submitted' || o.status === 'approved' || o.status === 'processing') && <button onClick={() => setFulfillingOrder(o)} className="px-2 py-1 bg-helix-primary/20 text-helix-primary-light rounded text-xs">Fulfill</button>}
                  {o.status === 'fulfilled' && <button onClick={() => handleExport(o.id)} className="flex items-center gap-1 px-2 py-1 bg-helix-accent/20 text-helix-accent rounded text-xs"><FileDown className="w-3 h-3" /> Export</button>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      {fulfillingOrder && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={() => { setFulfillingOrder(null); setConfirmFulfill(false); }}>
          <div className="glass rounded-xl p-6 max-w-lg w-full animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Fulfill: {fulfillingOrder.orderId}</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-helix-muted">Partner:</span><span>{state.partners.find(p => p.id === fulfillingOrder.partnerId)?.name}</span></div>
              <div className="flex justify-between"><span className="text-helix-muted">Codes to generate:</span><span className="font-bold text-helix-primary">{fulfillingOrder.quantity}</span></div>
              <div className="flex justify-between"><span className="text-helix-muted">Validity:</span><span>{fulfillingOrder.validityDays} days</span></div>
            </div>
            {!confirmFulfill ? (
              <div className="flex gap-3 justify-end"><button onClick={() => setFulfillingOrder(null)} className="px-4 py-2 bg-helix-card rounded-lg text-sm">Cancel</button><button onClick={() => setConfirmFulfill(true)} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium">Generate Codes</button></div>
            ) : (
              <div><div className="bg-helix-warning/10 border border-helix-warning/20 rounded-lg p-3 mb-4 text-xs text-helix-warning">This will generate {fulfillingOrder.quantity} unique codes. This cannot be undone.</div><div className="flex gap-3 justify-end"><button onClick={() => setConfirmFulfill(false)} className="px-4 py-2 bg-helix-card rounded-lg text-sm">Back</button><button onClick={handleFulfill} className="px-4 py-2 bg-helix-success text-white rounded-lg text-sm font-medium">Confirm</button></div></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SupportCodes() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const filtered = state.codes.filter(c => { const q = search.toLowerCase().trim(); if (!q) return true; return c.code.toLowerCase().includes(q) || state.orders.find(o => o.id === c.orderId)?.orderId.toLowerCase().includes(q) || state.books.find(b => b.id === c.bookId)?.title.toLowerCase().includes(q); });
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Access Code Operations</h1><p className="text-helix-muted mt-1">Search and track codes</p></div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-helix-muted" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code, order ID, book..." className="w-full pl-10 pr-4 py-3 bg-helix-surface border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /></div>
      <div className="glass rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Code</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Order</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Book</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Validity</th></tr></thead><tbody>{filtered.slice(0, 50).map(c => (<tr key={c.id} className="border-t border-helix-border hover:bg-helix-bg/30"><td className="px-4 py-3 font-mono text-xs">{c.code}</td><td className="px-4 py-3 font-mono text-xs text-helix-muted">{state.orders.find(o => o.id === c.orderId)?.orderId || '-'}</td><td className="px-4 py-3 text-xs">{state.books.find(b => b.id === c.bookId)?.title || '-'}</td><td className="px-4 py-3"><StatusBadge status={c.status} /></td><td className="px-4 py-3 text-xs text-helix-muted">{c.validityDays}d</td></tr>))}</tbody></table></div></div>
    </div>
  );
}

function SupportExports() {
  const { state } = useApp();
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Export History</h1><p className="text-helix-muted mt-1">Previous code exports</p></div>
      <div className="glass rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Order</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Exported By</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Records</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Date</th></tr></thead><tbody>{state.exports.map(exp => (<tr key={exp.id} className="border-t border-helix-border"><td className="px-4 py-3 font-mono text-xs">{state.orders.find(o => o.id === exp.orderId)?.orderId || '-'}</td><td className="px-4 py-3 text-xs">{state.users.find(u => u.id === exp.exportedBy)?.name || '-'}</td><td className="px-4 py-3">{exp.recordCount}</td><td className="px-4 py-3 text-xs text-helix-muted">{new Date(exp.exportedAt).toLocaleString()}</td></tr>))}</tbody></table></div></div>
    </div>
  );
}

// ==================== PARTNER ADMIN PAGES ====================
function PartnerDashboard() {
  const { state } = useApp();
  const user = state.currentUser!;
  const partnerOrders = state.orders.filter(o => o.partnerId === user.partnerId);
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Welcome, {user.name}</h1><p className="text-helix-muted mt-1">{state.partners.find(p => p.id === user.partnerId)?.name}</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={ShoppingCart} label="My Orders" value={partnerOrders.length} color="primary" />
        <StatCard icon={Clock} label="Pending" value={partnerOrders.filter(o => ['submitted', 'approved'].includes(o.status)).length} color="warning" />
        <StatCard icon={Key} label="Codes" value={state.codes.filter(c => c.partnerId === user.partnerId).length} color="accent" />
      </div>
    </div>
  );
}

function PartnerOrders() {
  const { state, dispatch, createOrder } = useApp();
  const user = state.currentUser!;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: '', bookId: '', quantity: 10, validityDays: 90, maxDevices: 2 });
  const partnerOrders = state.orders.filter(o => o.partnerId === user.partnerId);
  const approvedBooks = state.books.filter(b => b.approvedPartners.includes(user.partnerId!) && b.status === 'published');
  const handleSubmit = async () => {
    if (!form.orderId || !form.bookId) { dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Fill all required fields', type: 'error' } }); return; }
    const result = await createOrder({ orderId: form.orderId, partnerId: user.partnerId!, bookId: form.bookId, quantity: form.quantity, validityDays: form.validityDays, maxDevices: form.maxDevices, status: 'submitted', requestedBy: user.id, orderDate: new Date().toISOString() });
    if (result.success) { dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Order ${form.orderId} submitted`, type: 'success' } }); setShowForm(false); setForm({ orderId: '', bookId: '', quantity: 10, validityDays: 90, maxDevices: 2 }); }
    else dispatch({ type: 'ADD_NOTIFICATION', payload: { message: result.error || 'Failed', type: 'error' } });
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">My Orders</h1><p className="text-helix-muted mt-1">Place and track orders</p></div><button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" /> New Order</button></div>
      {showForm && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <h3 className="font-semibold mb-4">Place New Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-xs text-helix-muted mb-1">Order ID *</label><input value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} placeholder="e.g., SDA-2024-005" className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm focus:border-helix-primary focus:outline-none" /></div>
            <div><label className="block text-xs text-helix-muted mb-1">Book *</label><select value={form.bookId} onChange={e => setForm({ ...form, bookId: e.target.value })} className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm text-helix-text"><option value="">Select book</option>{approvedBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}</select></div>
            <div><label className="block text-xs text-helix-muted mb-1">Codes *</label><input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} min={1} max={500} className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm focus:border-helix-primary focus:outline-none" /></div>
            <div><label className="block text-xs text-helix-muted mb-1">Validity</label><select value={form.validityDays} onChange={e => setForm({ ...form, validityDays: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm text-helix-text"><option value={30}>30 days</option><option value={90}>90 days</option><option value={180}>180 days</option><option value={365}>365 days</option></select></div>
            <div><label className="block text-xs text-helix-muted mb-1">Max Devices</label><select value={form.maxDevices} onChange={e => setForm({ ...form, maxDevices: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm text-helix-text"><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></div>
          </div>
          <div className="flex gap-2 mt-4"><button onClick={handleSubmit} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium">Submit</button><button onClick={() => setShowForm(false)} className="px-4 py-2 bg-helix-card text-helix-muted rounded-lg text-sm">Cancel</button></div>
        </div>
      )}
      <div className="glass rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Order ID</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Book</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Qty</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Validity</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Date</th></tr></thead><tbody>{partnerOrders.map(o => (<tr key={o.id} className="border-t border-helix-border hover:bg-helix-bg/30"><td className="px-4 py-3 font-mono text-xs font-medium">{o.orderId}</td><td className="px-4 py-3 text-xs">{state.books.find(b => b.id === o.bookId)?.title}</td><td className="px-4 py-3">{o.quantity}</td><td className="px-4 py-3 text-helix-muted">{o.validityDays}d</td><td className="px-4 py-3"><StatusBadge status={o.status} /></td><td className="px-4 py-3 text-helix-muted text-xs">{new Date(o.orderDate).toLocaleDateString()}</td></tr>))}</tbody></table></div></div>
    </div>
  );
}

function PartnerClassrooms() {
  const { state, addClassroom, dispatch } = useApp();
  const user = state.currentUser!;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '' });
  const classrooms = state.classrooms.filter(c => c.partnerId === user.partnerId);
  const handleCreate = async () => {
    if (!form.name) return;
    await addClassroom({ id: uuidv4(), name: form.name, partnerId: user.partnerId!, instructorIds: [user.id], studentIds: [], bookIds: [], status: 'active', startDate: form.startDate || new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Classroom created', type: 'success' } });
    setShowForm(false); setForm({ name: '', startDate: '' });
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Classrooms</h1></div><button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" /> New</button></div>
      {showForm && <div className="glass rounded-xl p-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm text-helix-text" /></div><div className="flex gap-2 mt-4"><button onClick={handleCreate} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium">Create</button><button onClick={() => setShowForm(false)} className="px-4 py-2 bg-helix-card text-helix-muted rounded-lg text-sm">Cancel</button></div></div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{classrooms.map(c => (<div key={c.id} className="glass rounded-xl p-5 card-hover"><h3 className="font-semibold">{c.name}</h3><p className="text-xs text-helix-muted mt-1">{c.startDate}</p><div className="flex items-center gap-4 mt-3 text-xs text-helix-muted"><span>{c.studentIds.length} students</span><span>{c.bookIds.length} books</span></div></div>))}</div>
    </div>
  );
}

function PartnerStudents() {
  const { state } = useApp();
  const user = state.currentUser!;
  const students = state.users.filter(u => u.partnerId === user.partnerId && u.role === 'student');
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Students</h1><p className="text-helix-muted mt-1">{students.length} students</p></div>
      <div className="glass rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Student</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Email</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th></tr></thead><tbody>{students.map(s => (<tr key={s.id} className="border-t border-helix-border"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center text-xs font-bold text-white">{s.name.charAt(0)}</div><span className="font-medium">{s.name}</span></div></td><td className="px-4 py-3 text-helix-muted text-xs">{s.email}</td><td className="px-4 py-3"><StatusBadge status={s.status} /></td></tr>))}</tbody></table></div></div>
    </div>
  );
}

function PartnerBooks() {
  const { state } = useApp();
  const user = state.currentUser!;
  const books = state.books.filter(b => b.approvedPartners.includes(user.partnerId!));
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Approved Books</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{books.map(book => (<div key={book.id} className="glass rounded-xl p-5 card-hover"><h3 className="font-semibold">{book.title}</h3><p className="text-sm text-helix-muted mt-1">{book.author}</p></div>))}</div>
    </div>
  );
}

function PartnerCodes() {
  const { state } = useApp();
  const user = state.currentUser!;
  const codes = state.codes.filter(c => c.partnerId === user.partnerId);
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">My Access Codes</h1></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={Key} label="Total" value={codes.length} color="primary" />
        <StatCard icon={Check} label="Redeemed" value={codes.filter(c => c.status === 'redeemed').length} color="success" />
        <StatCard icon={Package} label="Available" value={codes.filter(c => c.status === 'generated' || c.status === 'distributed').length} color="accent" />
      </div>
      <div className="glass rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Code</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Book</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th></tr></thead><tbody>{codes.slice(0, 30).map(c => (<tr key={c.id} className="border-t border-helix-border"><td className="px-4 py-3 font-mono text-xs">{c.code}</td><td className="px-4 py-3 text-xs">{state.books.find(b => b.id === c.bookId)?.title || '-'}</td><td className="px-4 py-3"><StatusBadge status={c.status} /></td></tr>))}</tbody></table></div></div>
    </div>
  );
}

function PartnerReports() {
  const { state } = useApp();
  const user = state.currentUser!;
  const partnerCodes = state.codes.filter(c => c.partnerId === user.partnerId);
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Reports</h1></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={Key} label="Total Codes" value={partnerCodes.length} color="primary" />
        <StatCard icon={Check} label="Redeemed" value={partnerCodes.filter(c => c.status === 'redeemed').length} color="success" />
        <StatCard icon={Package} label="Available" value={partnerCodes.filter(c => c.status === 'generated' || c.status === 'distributed').length} color="accent" />
      </div>
    </div>
  );
}

// ==================== STUDENT PAGES ====================
function StudentBookshelf() {
  const { state } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser!;
  const entitlements = state.entitlements.filter(e => e.userId === user.id && !e.revoked && (!e.expiresAt || new Date(e.expiresAt) > new Date()));
  const books = entitlements.map(e => state.books.find(b => b.id === e.bookId)).filter(Boolean) as Book[];
  const bookColors = ['from-purple-600/30 to-blue-600/30', 'from-emerald-600/30 to-teal-600/30', 'from-orange-600/30 to-red-600/30'];
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">My Bookshelf</h1><p className="text-helix-muted mt-1">{books.length} books</p></div>
      {books.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center"><BookOpen className="w-16 h-16 text-helix-muted mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No books yet</h3><p className="text-helix-muted mb-4">Redeem an access code to get started</p><button onClick={() => navigate('/student/redeem')} className="px-6 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium">Redeem Code</button></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{books.map((book, i) => { const progress = state.progress.find(p => p.userId === user.id && p.bookId === book.id); return (<div key={book.id} onClick={() => navigate(`/reader/${book.id}`)} className="glass rounded-xl overflow-hidden card-hover cursor-pointer group"><div className={`h-40 bg-gradient-to-br ${bookColors[i % bookColors.length]} flex items-center justify-center`}><BookMarked className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform" /></div><div className="p-5"><h3 className="font-semibold group-hover:text-helix-primary transition-colors">{book.title}</h3><p className="text-sm text-helix-muted mt-1">{book.author}</p>{progress && <div className="mt-3 flex items-center gap-2"><div className="flex-1 h-1.5 bg-helix-bg rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-helix-primary to-helix-accent rounded-full" style={{ width: `${progress.percentComplete}%` }} /></div><span className="text-xs text-helix-muted">{progress.percentComplete}%</span></div>}</div></div>); })}</div>
      )}
    </div>
  );
}

function StudentRedeem() {
  const { state, dispatch, redeemCode } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const handleRedeem = async () => {
    setError(''); setSuccess('');
    const result = await redeemCode(code);
    if (result.success) { setSuccess('Code redeemed successfully! Book added to your shelf.'); setCode(''); }
    else setError(result.error || 'Redemption failed');
  };
  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="text-center"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-helix-primary/20 to-helix-accent/20 flex items-center justify-center mx-auto mb-4"><Key className="w-8 h-8 text-helix-primary" /></div><h1 className="text-2xl font-bold">Redeem Access Code</h1><p className="text-helix-muted mt-2">Enter your code to unlock a book</p></div>
      <div className="glass rounded-xl p-6 glow">
        <div className="space-y-4">
          <input value={code} onChange={e => { setCode(e.target.value); setError(''); setSuccess(''); }} placeholder="XXXX-XXXX-XXXX" className="w-full px-4 py-3 bg-helix-bg border border-helix-border rounded-xl text-center font-mono text-lg tracking-wider focus:border-helix-primary focus:outline-none" />
          {error && <div className="flex items-center gap-2 text-helix-danger text-sm bg-helix-danger/10 rounded-lg px-3 py-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
          {success && <div className="flex items-center gap-2 text-helix-success text-sm bg-helix-success/10 rounded-lg px-3 py-2"><Check className="w-4 h-4" /> {success}</div>}
          <button onClick={handleRedeem} disabled={!code.trim()} className="w-full py-3 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50">Redeem</button>
        </div>
      </div>
      <div className="glass rounded-xl p-5"><h3 className="font-medium text-sm mb-2">Available codes:</h3><div className="space-y-1">{state.codes.filter(c => c.status === 'generated' || c.status === 'distributed').slice(0, 3).map(c => (<button key={c.id} onClick={() => setCode(c.code)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-helix-bg/50 text-sm font-mono text-helix-accent">{c.code}</button>))}</div></div>
    </div>
  );
}

function StudentDevices() {
  const { state } = useApp();
  const user = state.currentUser!;
  const devices = state.devices.filter(d => d.userId === user.id);
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Registered Devices</h1><p className="text-helix-muted mt-1">{devices.length} device{devices.length !== 1 ? 's' : ''} registered</p></div>
      <div className="glass rounded-xl p-6">
        <div className="bg-helix-bg/50 rounded-lg p-3 mb-4 text-xs text-helix-muted"><Smartphone className="w-4 h-4 inline mr-1" /> Browser-based device identification cannot guarantee physical-device identity. Limits are enforced using authenticated sessions and registered fingerprints.</div>
        {devices.length === 0 ? <p className="text-sm text-helix-muted">No devices registered yet. Devices are registered when you read a book.</p> : <div className="space-y-3">{devices.map(d => (<div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-helix-bg/50"><div><p className="text-sm font-medium">{d.deviceName}</p><p className="text-xs text-helix-muted">Registered: {new Date(d.registeredAt).toLocaleDateString()} · Last used: {new Date(d.lastUsedAt).toLocaleDateString()}</p></div><Smartphone className="w-5 h-5 text-helix-muted" /></div>))}</div>}
      </div>
    </div>
  );
}

function StudentProgress() {
  const { state } = useApp();
  const user = state.currentUser!;
  const progress = state.progress.filter(p => p.userId === user.id);
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">My Progress</h1></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Books" value={progress.length} color="primary" />
        <StatCard icon={Clock} label="Total Time" value={`${Math.round(progress.reduce((a, p) => a + p.totalReadTime, 0) / 60)} min`} color="accent" />
        <StatCard icon={TrendingUp} label="Avg Progress" value={`${progress.length ? Math.round(progress.reduce((a, p) => a + p.percentComplete, 0) / progress.length) : 0}%`} color="success" />
      </div>
      <div className="space-y-4">{progress.map(p => { const book = state.books.find(b => b.id === p.bookId); if (!book) return null; return (<div key={p.bookId} className="glass rounded-xl p-5"><div className="flex items-start justify-between"><div><h3 className="font-semibold">{book.title}</h3><p className="text-sm text-helix-muted mt-1">Ch. {p.currentChapter + 1}</p></div><span className="text-lg font-bold text-helix-primary">{p.percentComplete}%</span></div><div className="mt-3 h-2 bg-helix-bg rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-helix-primary to-helix-accent rounded-full" style={{ width: `${p.percentComplete}%` }} /></div></div>); })}</div>
    </div>
  );
}

function StudentBookmarks() {
  const { state, dispatch, deleteBookmark, deleteHighlight } = useApp();
  const user = state.currentUser!;
  const bookmarks = state.bookmarks.filter(b => b.userId === user.id);
  const highlights = state.highlights.filter(h => h.userId === user.id);
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Bookmarks & Notes</h1></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Bookmark className="w-5 h-5 text-helix-primary" /> Bookmarks ({bookmarks.length})</h3>{bookmarks.length === 0 ? <p className="text-sm text-helix-muted">No bookmarks yet.</p> : <div className="space-y-3">{bookmarks.map(bm => (<div key={bm.id} className="flex items-start justify-between p-3 rounded-lg bg-helix-bg/50"><div><p className="text-sm font-medium">{state.books.find(b => b.id === bm.bookId)?.title}</p><p className="text-xs text-helix-muted">Ch. {bm.chapter + 1}</p></div><button onClick={() => deleteBookmark(bm.id)} className="text-helix-muted hover:text-helix-danger"><Trash2 className="w-4 h-4" /></button></div>))}</div>}</div>
        <div className="glass rounded-xl p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Highlighter className="w-5 h-5 text-helix-accent" /> Highlights ({highlights.length})</h3>{highlights.length === 0 ? <p className="text-sm text-helix-muted">No highlights yet.</p> : <div className="space-y-3">{highlights.map(hl => (<div key={hl.id} className="p-3 rounded-lg border-l-2 border-helix-primary/50 bg-helix-primary/5"><p className="text-sm italic">"{hl.text}"</p><div className="flex items-center justify-between mt-2"><p className="text-xs text-helix-muted">Ch. {hl.chapter + 1}</p><button onClick={() => deleteHighlight(hl.id)} className="text-helix-muted hover:text-helix-danger"><Trash2 className="w-3.5 h-3.5" /></button></div></div>))}</div>}</div>
      </div>
    </div>
  );
}

// ==================== EBOOK READER ====================
function EbookReader() {
  const { bookId } = useParams();
  const { state, dispatch, getBookContent, updateProgress, addBookmark, registerDevice } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser!;
  const book = state.books.find(b => b.id === bookId);
  const content = getBookContent(bookId || '');
  const entitlement = state.entitlements.find(e => e.userId === user.id && e.bookId === bookId && !e.revoked && (!e.expiresAt || new Date(e.expiresAt) > new Date()));
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => { const p = state.progress.find(p => p.userId === user.id && p.bookId === bookId); if (p) setCurrentChapter(p.currentChapter); }, [bookId]);
  useEffect(() => {
    if (!bookId) return;
    const pct = Math.round(((currentChapter + 1) / content.chapters.length) * 100);
    updateProgress({ userId: user.id, bookId, currentChapter, currentPage: 1, percentComplete: Math.min(pct, 100), lastReadAt: new Date().toISOString(), totalReadTime: (state.progress.find(p => p.userId === user.id && p.bookId === bookId)?.totalReadTime || 0) + 60 });
  }, [currentChapter, bookId]);

  // Device registration
  useEffect(() => {
    if (!entitlement || !bookId) return;
    const fp = 'device-fp-' + (navigator.userAgent || 'unknown').slice(0, 20).replace(/\s/g, '-').toLowerCase();
    const existing = state.devices.find(d => d.deviceFingerprint === fp && d.userId === user.id);
    if (!existing && entitlement.registeredDevices.length < entitlement.maxDevices) {
      registerDevice({ id: uuidv4(), userId: user.id, deviceFingerprint: fp, deviceName: `${navigator.platform || 'Unknown'} browser`, registeredAt: new Date().toISOString(), lastUsedAt: new Date().toISOString() });
    }
  }, [bookId]);

  // Print/download protection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'P' || e.key === 'S')) e.preventDefault(); };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => { document.removeEventListener('keydown', handleKeyDown); document.removeEventListener('contextmenu', handleContextMenu); };
  }, []);

  if (!book || !entitlement) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="text-center"><AlertCircle className="w-16 h-16 text-helix-danger mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">Access Denied</h2><p className="text-helix-muted mb-4">No valid entitlement.</p><button onClick={() => navigate('/student')} className="px-6 py-2.5 bg-helix-primary text-white rounded-xl text-sm font-medium">Back</button></div></div>);
  }

  const toggleSpeech = () => { if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); } else { const text = content.chapters[currentChapter]?.content || ''; const u = new SpeechSynthesisUtterance(text); u.rate = 0.9; u.onend = () => setIsSpeaking(false); window.speechSynthesis.speak(u); setIsSpeaking(true); } };
  const handleBookmark = () => { addBookmark({ id: uuidv4(), userId: user.id, bookId: bookId!, chapter: currentChapter, page: 1, createdAt: new Date().toISOString() }); dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Bookmark added', type: 'success' } }); };
  const chapter = content.chapters[currentChapter];
  const paragraphs = chapter?.content.split('\n\n').filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-helix-bg flex flex-col" onCopy={e => e.preventDefault()} onCut={e => e.preventDefault()}>
      <header className="fixed top-0 left-0 right-0 h-14 bg-helix-surface/95 backdrop-blur-sm border-b border-helix-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3"><button onClick={() => navigate('/student')} className="p-2 rounded-lg hover:bg-helix-card"><ChevronLeft className="w-5 h-5" /></button><div className="hidden sm:block"><h1 className="text-sm font-semibold truncate max-w-[200px]">{book.title}</h1><p className="text-xs text-helix-muted">{chapter?.title}</p></div></div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowToc(!showToc)} className="p-2 rounded-lg hover:bg-helix-card" title="Contents"><Layers className="w-4 h-4" /></button>
          <button onClick={handleBookmark} className="p-2 rounded-lg hover:bg-helix-card" title="Bookmark"><Bookmark className="w-4 h-4" /></button>
          <button onClick={toggleSpeech} className={`p-2 rounded-lg ${isSpeaking ? 'bg-helix-primary/20 text-helix-primary' : 'hover:bg-helix-card'}`} title="Read Aloud">{isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}</button>
          <div className="flex items-center gap-1 ml-2"><button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="px-2 py-1 bg-helix-card rounded text-xs">A-</button><button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="px-2 py-1 bg-helix-card rounded text-xs">A+</button></div>
        </div>
      </header>
      {showToc && (<div className="fixed top-14 left-0 bottom-0 w-72 bg-helix-surface border-r border-helix-border z-40 overflow-y-auto animate-slide-in"><div className="p-4 border-b border-helix-border flex items-center justify-between"><h3 className="font-semibold text-sm">Contents</h3><button onClick={() => setShowToc(false)} className="p-1 rounded hover:bg-helix-card"><X className="w-4 h-4" /></button></div><nav className="p-3 space-y-1">{content.chapters.map((ch, i) => (<button key={i} onClick={() => { setCurrentChapter(i); setShowToc(false); }} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm ${i === currentChapter ? 'bg-helix-primary/20 text-helix-primary-light font-medium' : 'text-helix-muted hover:text-helix-text hover:bg-helix-card'}`}>{ch.title}</button>))}</nav></div>)}
      <main className="flex-1 pt-14 pb-20">
        <article className="max-w-2xl mx-auto px-6 py-10 select-none reader-protected" style={{ fontSize: `${fontSize}px`, userSelect: 'none' }}>
          <div className="mb-8"><p className="text-xs text-helix-primary font-medium uppercase tracking-wider mb-2">Chapter {currentChapter + 1} of {content.chapters.length}</p><h1 className="text-2xl sm:text-3xl font-bold">{chapter?.title}</h1></div>
          <div className="reader-content">{paragraphs.map((para, i) => {
            const isHeading = para.startsWith('**') && para.endsWith('**');
            const isList = para.startsWith('- ');
            const isNumbered = para.match(/^\d+\./);
            if (isHeading) return <h2 key={i} className="text-xl font-bold mt-8 mb-4 gradient-text">{para.replace(/\*\*/g, '')}</h2>;
            if (isList) { const items = para.split('\n').filter(l => l.startsWith('- ')); return <ul key={i} className="space-y-2 my-4">{items.map((item, j) => <li key={j} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-helix-primary mt-2.5 flex-shrink-0" /><span className="text-helix-text/90">{item.replace('- ', '').replace(/\*\*/g, '')}</span></li>)}</ul>; }
            if (isNumbered) { const items = para.split('\n').filter(l => l.match(/^\d+\./)); return <ol key={i} className="space-y-2 my-4">{items.map((item, j) => <li key={j} className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-helix-primary/20 text-helix-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{j + 1}</span><span className="text-helix-text/90">{item.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}</span></li>)}</ol>; }
            return <p key={i} className="text-helix-text/85 mb-4 leading-relaxed">{para.replace(/\*\*/g, '')}</p>;
          })}</div>
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-helix-border">
            <button onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))} disabled={currentChapter === 0} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-helix-card text-sm font-medium disabled:opacity-30"><ChevronLeft className="w-4 h-4" /> Previous</button>
            <span className="text-sm text-helix-muted">{currentChapter + 1} / {content.chapters.length}</span>
            <button onClick={() => setCurrentChapter(Math.min(content.chapters.length - 1, currentChapter + 1))} disabled={currentChapter === content.chapters.length - 1} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-helix-card text-sm font-medium disabled:opacity-30">Next <ChevronRight className="w-4 h-4" /></button>
          </div>
        </article>
      </main>
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-helix-surface"><div className="h-full bg-gradient-to-r from-helix-primary to-helix-accent transition-all duration-500" style={{ width: `${((currentChapter + 1) / content.chapters.length) * 100}%` }} /></div>
    </div>
  );
}

// ==================== LAYOUT & ROUTING ====================
function AppLayout({ children, role }: { children: React.ReactNode; role: string }) {
  return (<div className="min-h-screen bg-helix-bg"><Sidebar role={role} /><MobileNav role={role} /><main className="lg:ml-64 pt-14 lg:pt-0"><div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div></main><Notifications /></div>);
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: UserRole[] }) {
  const { state } = useApp();
  if (state.isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="text-helix-muted">Loading...</div></div>;
  if (!state.currentUser) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(state.currentUser.role)) return <Navigate to="/" replace />;
  if (state.currentUser.status !== 'active') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { state, signOut } = useApp();
  const navigate = useNavigate();
  console.log('[AuthRoute] Rendering, isLoading:', state.isLoading, 'currentUser:', state.currentUser?.email || 'null');
  if (state.isLoading) {
    console.log('[AuthRoute] Showing loading state');
    return <div className="min-h-screen flex items-center justify-center"><div className="text-helix-muted">Loading...</div></div>;
  }
  if (state.currentUser) {
    console.log('[AuthRoute] User logged in, redirecting to dashboard');
    if (state.currentUser.status !== 'active') {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-helix-bg via-helix-surface to-helix-bg" />
          <div className="relative text-center glass rounded-2xl p-8 max-w-md w-full glow animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-helix-warning/20 flex items-center justify-center mx-auto mb-5"><AlertTriangle className="w-8 h-8 text-helix-warning" /></div>
            <h2 className="text-2xl font-bold mb-2">Account {state.currentUser.status === 'suspended' ? 'Suspended' : 'Deactivated'}</h2>
            <p className="text-helix-muted mb-2">Your account <span className="text-helix-text font-medium">{state.currentUser.email}</span> has been {state.currentUser.status}.</p>
            <p className="text-sm text-helix-muted mb-6">Contact your administrator or platform support.</p>
            <button onClick={async () => { await signOut(); navigate('/', { replace: true }); }} className="w-full px-6 py-3 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90">Sign Out & Return to Login</button>
          </div>
        </div>
      );
    }
    const routes: Record<string, string> = { super_admin: '/admin', support_agent: '/support', partner_admin: '/partner', student: '/student' };
    return <Navigate to={routes[state.currentUser.role] || '/'} replace />;
  }
  return <AuthPage />;
}

// Placeholder components for admin pages not yet migrated
function AdminOrdersPlaceholder() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Orders & Access Codes</h1><p className="text-helix-muted mt-1">Manage orders and access codes</p></div>
      <div className="glass rounded-xl p-12 text-center">
        <ShoppingCart className="w-16 h-16 text-helix-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Orders Management</h3>
        <p className="text-helix-muted">Order management functionality is available through the Support Agent interface.</p>
      </div>
    </div>
  );
}

function AdminCodesPlaceholder() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Access Codes</h1><p className="text-helix-muted mt-1">View and manage access codes</p></div>
      <div className="glass rounded-xl p-12 text-center">
        <Key className="w-16 h-16 text-helix-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Code Management</h3>
        <p className="text-helix-muted">Access code management is available through the Support Agent interface.</p>
      </div>
    </div>
  );
}

function AdminBooksPlaceholder() {
  const { state } = useApp();
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Book Catalog</h1><p className="text-helix-muted mt-1">Manage the global book library</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.books.map(book => (
          <div key={book.id} className="glass rounded-xl p-5 card-hover">
            <h3 className="font-semibold">{book.title}</h3>
            <p className="text-sm text-helix-muted mt-1">{book.author}</p>
            <p className="text-xs text-helix-muted mt-2 line-clamp-2">{book.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <StatusBadge status={book.status} />
              <span className="text-xs text-helix-muted">{book.pageCount} pages</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminReportsPlaceholder() {
  const { state } = useApp();
  const totalCodes = state.codes.length;
  const redeemed = state.codes.filter(c => c.status === 'redeemed').length;
  const redemptionRate = totalCodes > 0 ? Math.round((redeemed / totalCodes) * 100) : 0;
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Reports & Analytics</h1><p className="text-helix-muted mt-1">Platform analytics and metrics</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Key} label="Total Codes" value={totalCodes} color="primary" />
        <StatCard icon={Check} label="Redeemed" value={redeemed} color="success" />
        <StatCard icon={TrendingUp} label="Redemption Rate" value={`${redemptionRate}%`} color="accent" />
        <StatCard icon={ShoppingCart} label="Orders" value={state.orders.length} color="warning" />
      </div>
    </div>
  );
}

function AdminAuditPlaceholder() {
  const { state } = useApp();
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Audit Logs</h1><p className="text-helix-muted mt-1">Platform activity and security events</p></div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50">
              <tr>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Time</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Action</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {state.auditLogs.map(log => (
                <tr key={log.id} className="border-t border-helix-border hover:bg-helix-bg/30">
                  <td className="px-4 py-3 text-helix-muted text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3"><code className="px-2 py-0.5 bg-helix-bg rounded text-xs text-helix-accent">{log.action}</code></td>
                  <td className="px-4 py-3 text-helix-muted text-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminSettingsPlaceholder() {
  const { state } = useApp();
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">System Settings</h1><p className="text-helix-muted mt-1">Configure platform policies</p></div>
      <div className="glass rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-helix-primary" /> Security</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <div><p className="font-medium">MFA for Admins</p><p className="text-xs text-helix-muted">Require MFA for super administrators</p></div>
            <div className="w-10 h-6 bg-helix-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Content Protection</p><p className="text-xs text-helix-muted">Disable right-click and copy in reader</p></div>
            <div className="w-10 h-6 bg-helix-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  console.log('[App] Rendering App component');
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthRoute />} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><UserManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><RolesPermissions /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/partners" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><PartnerManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/emails" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><PartnerEmails /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminOrdersPlaceholder /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/codes" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminCodesPlaceholder /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/books" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminBooksPlaceholder /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminReportsPlaceholder /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminAuditPlaceholder /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminSettingsPlaceholder /></AppLayout></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute allowedRoles={['support_agent']}><AppLayout role="support_agent"><SupportDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/support/orders" element={<ProtectedRoute allowedRoles={['support_agent']}><AppLayout role="support_agent"><SupportOrders /></AppLayout></ProtectedRoute>} />
          <Route path="/support/codes" element={<ProtectedRoute allowedRoles={['support_agent']}><AppLayout role="support_agent"><SupportCodes /></AppLayout></ProtectedRoute>} />
          <Route path="/support/exports" element={<ProtectedRoute allowedRoles={['support_agent']}><AppLayout role="support_agent"><SupportExports /></AppLayout></ProtectedRoute>} />
          <Route path="/partner" element={<ProtectedRoute allowedRoles={['partner_admin']}><AppLayout role="partner_admin"><PartnerDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/partner/orders" element={<ProtectedRoute allowedRoles={['partner_admin']}><AppLayout role="partner_admin"><PartnerOrders /></AppLayout></ProtectedRoute>} />
          <Route path="/partner/classrooms" element={<ProtectedRoute allowedRoles={['partner_admin']}><AppLayout role="partner_admin"><PartnerClassrooms /></AppLayout></ProtectedRoute>} />
          <Route path="/partner/students" element={<ProtectedRoute allowedRoles={['partner_admin']}><AppLayout role="partner_admin"><PartnerStudents /></AppLayout></ProtectedRoute>} />
          <Route path="/partner/books" element={<ProtectedRoute allowedRoles={['partner_admin']}><AppLayout role="partner_admin"><PartnerBooks /></AppLayout></ProtectedRoute>} />
          <Route path="/partner/codes" element={<ProtectedRoute allowedRoles={['partner_admin']}><AppLayout role="partner_admin"><PartnerCodes /></AppLayout></ProtectedRoute>} />
          <Route path="/partner/reports" element={<ProtectedRoute allowedRoles={['partner_admin']}><AppLayout role="partner_admin"><PartnerReports /></AppLayout></ProtectedRoute>} />
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><AppLayout role="student"><StudentBookshelf /></AppLayout></ProtectedRoute>} />
          <Route path="/student/redeem" element={<ProtectedRoute allowedRoles={['student']}><AppLayout role="student"><StudentRedeem /></AppLayout></ProtectedRoute>} />
          <Route path="/student/progress" element={<ProtectedRoute allowedRoles={['student']}><AppLayout role="student"><StudentProgress /></AppLayout></ProtectedRoute>} />
          <Route path="/student/devices" element={<ProtectedRoute allowedRoles={['student']}><AppLayout role="student"><StudentDevices /></AppLayout></ProtectedRoute>} />
          <Route path="/student/bookmarks" element={<ProtectedRoute allowedRoles={['student']}><AppLayout role="student"><StudentBookmarks /></AppLayout></ProtectedRoute>} />
          <Route path="/reader/:bookId" element={<ProtectedRoute allowedRoles={['student']}><EbookReader /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
