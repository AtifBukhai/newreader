import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';
import type { UserRole, Order, OrderStatus, CodeStatus, Book, User, AccessCode, BookEntitlement } from './types';
import {
  BookOpen, Users, GraduationCap, Shield, Settings, LogOut, Home, Library,
  Key, BarChart3, FileText, Search, Plus, Edit, Trash2, Eye, EyeOff,
  ChevronRight, ChevronLeft, Bookmark, Highlighter, Volume2, VolumeX,
  Menu, X, Bell, User, BookMarked, Clock, TrendingUp, AlertCircle,
  Check, Download, Filter, ArrowRight, Layers, Globe,
  Award, Target, Zap, ShoppingCart, Package, Headphones, RefreshCw,
  ClipboardList, FileDown, Smartphone, Lock, AlertTriangle, History
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// ==================== AUTH PAGE ====================
function AuthPage() {
  const { state, dispatch } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const user = state.users.find(u => u.email === email);
      if (user && user.status === 'active') {
        dispatch({ type: 'LOGIN', payload: user });
        dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: user.id, action: 'auth.login', resource: 'User', details: `${user.name} logged in`, createdAt: new Date().toISOString() } });
      } else if (user && user.status !== 'active') {
        setError('Account is suspended or deactivated. Contact support.');
      } else {
        setError('Invalid credentials. Try demo accounts below.');
      }
    } else {
      if (!name || !email) { setError('Please fill all fields'); return; }
      if (state.users.find(u => u.email === email)) { setError('Email already registered'); return; }
      const newUser: User = { id: uuidv4(), email, name, role: 'student', status: 'active', createdAt: new Date().toISOString() };
      dispatch({ type: 'ADD_USER', payload: newUser });
      dispatch({ type: 'LOGIN', payload: newUser });
    }
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
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-helix-bg border border-helix-border rounded-xl text-helix-text placeholder-helix-muted/50 focus:border-helix-primary focus:outline-none transition-colors" placeholder="Enter your name" />
              </div>
            )}
            <div>
              <label className="block text-sm text-helix-muted mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-helix-bg border border-helix-border rounded-xl text-helix-text placeholder-helix-muted/50 focus:border-helix-primary focus:outline-none transition-colors" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-helix-muted mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-helix-bg border border-helix-border rounded-xl text-helix-text placeholder-helix-muted/50 focus:border-helix-primary focus:outline-none transition-colors" placeholder="••••••••" />
            </div>
            {error && <div className="flex items-center gap-2 text-helix-danger text-sm bg-helix-danger/10 rounded-lg px-3 py-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white font-medium rounded-xl hover:opacity-90 transition-opacity">{isLogin ? 'Sign In' : 'Create Account'}</button>
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
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const links: Record<string, { to: string; icon: any; label: string }[]> = {
    super_admin: [
      { to: '/admin', icon: Home, label: 'Dashboard' }, { to: '/admin/partners', icon: Globe, label: 'Partners' },
      { to: '/admin/books', icon: Library, label: 'Books' }, { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
      { to: '/admin/codes', icon: Key, label: 'Access Codes' }, { to: '/admin/users', icon: Users, label: 'Users' },
      { to: '/admin/reports', icon: BarChart3, label: 'Reports' }, { to: '/admin/audit', icon: FileText, label: 'Audit Log' },
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
        <button onClick={() => { dispatch({ type: 'LOGOUT' }); navigate('/'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-helix-muted hover:text-helix-danger hover:bg-helix-danger/10 transition-all w-full">
          <LogOut className="w-5 h-5" />{!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

function MobileNav({ role }: { role: string }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const labels: Record<string, string> = { super_admin: 'Admin', support_agent: 'Support', partner_admin: 'Partner', student: 'Student' };
  const mainLinks: Record<string, { to: string; label: string }[]> = {
    super_admin: [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/orders', label: 'Orders' }, { to: '/admin/codes', label: 'Codes' }, { to: '/admin/users', label: 'Users' }],
    support_agent: [{ to: '/support', label: 'Dashboard' }, { to: '/support/orders', label: 'Orders' }, { to: '/support/codes', label: 'Codes' }],
    partner_admin: [{ to: '/partner', label: 'Dashboard' }, { to: '/partner/orders', label: 'Orders' }, { to: '/partner/classrooms', label: 'Classes' }, { to: '/partner/codes', label: 'Codes' }],
    student: [{ to: '/student', label: 'Bookshelf' }, { to: '/student/redeem', label: 'Redeem' }, { to: '/student/progress', label: 'Progress' }],
  };
  return (
    <div className="lg:hidden">
      <div className="fixed top-0 left-0 right-0 h-14 bg-helix-surface border-b border-helix-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center"><BookOpen className="w-4 h-4 text-white" /></div><span className="font-bold text-sm gradient-text">Kitabo</span></div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-helix-card">{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>
      {open && (
        <div className="fixed inset-0 top-14 bg-helix-bg/95 z-40 p-4 animate-fade-in">
          <nav className="space-y-2">
            {(mainLinks[role] || []).map(link => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl bg-helix-card text-helix-text hover:bg-helix-primary/20 transition-colors font-medium">{link.label}</Link>
            ))}
            <button onClick={() => { dispatch({ type: 'LOGOUT' }); navigate('/'); }} className="block w-full text-left px-4 py-3 rounded-xl text-helix-danger hover:bg-helix-danger/10 transition-colors font-medium">Sign Out</button>
          </nav>
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const { state, dispatch } = useApp();
  if (!state.notifications.length) return null;
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
      <div className="flex items-start justify-between"><div><p className="text-sm text-helix-muted mb-1">{label}</p><p className="text-2xl font-bold">{value}</p>{trend && <p className="text-xs text-helix-success mt-1">{trend}</p>}</div><div className="p-2 rounded-lg bg-helix-bg/50"><Icon className="w-5 h-5 text-helix-muted" /></div></div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-helix-success/20 text-helix-success', suspended: 'bg-helix-danger/20 text-helix-danger', archived: 'bg-helix-muted/20 text-helix-muted',
    draft: 'bg-helix-muted/20 text-helix-muted', submitted: 'bg-helix-primary/20 text-helix-primary-light', approved: 'bg-helix-accent/20 text-helix-accent',
    processing: 'bg-helix-warning/20 text-helix-warning', fulfilled: 'bg-helix-success/20 text-helix-success', cancelled: 'bg-helix-danger/20 text-helix-danger',
    generated: 'bg-helix-primary/20 text-helix-primary-light', distributed: 'bg-helix-accent/20 text-helix-accent', redeemed: 'bg-helix-success/20 text-helix-success',
    expired: 'bg-helix-warning/20 text-helix-warning', revoked: 'bg-helix-danger/20 text-helix-danger', exhausted: 'bg-helix-muted/20 text-helix-muted',
    deactivated: 'bg-helix-muted/20 text-helix-muted',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-helix-muted/20 text-helix-muted'}`}>{status}</span>;
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="glass rounded-xl p-6 max-w-md w-full animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-helix-danger/20' : 'bg-helix-primary/20'}`}>
            {danger ? <AlertTriangle className="w-5 h-5 text-helix-danger" /> : <AlertCircle className="w-5 h-5 text-helix-primary" />}
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-helix-muted mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-helix-card rounded-lg text-sm hover:text-helix-text">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${danger ? 'bg-helix-danger hover:opacity-90' : 'bg-helix-primary hover:opacity-90'}`}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ==================== SUPER ADMIN PAGES ====================
function SuperAdminDashboard() {
  const { state } = useApp();
  const chartData = [
    { month: 'Jul', orders: 2, codes: 200, redemptions: 10 }, { month: 'Aug', orders: 3, codes: 450, redemptions: 35 },
    { month: 'Sep', orders: 4, codes: 680, redemptions: 85 }, { month: 'Oct', orders: 6, codes: 690, redemptions: 120 },
  ];
  const codeStatusData = [
    { name: 'Redeemed', value: state.codes.filter(c => c.status === 'redeemed').length, color: '#00b894' },
    { name: 'Generated', value: state.codes.filter(c => c.status === 'generated').length, color: '#6c5ce7' },
    { name: 'Distributed', value: state.codes.filter(c => c.status === 'distributed').length, color: '#00cec9' },
    { name: 'Expired', value: state.codes.filter(c => c.status === 'expired').length, color: '#fdcb6e' },
    { name: 'Revoked', value: state.codes.filter(c => c.status === 'revoked').length, color: '#e17055' },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Platform Dashboard</h1><p className="text-helix-muted mt-1">Overview of platform activity and metrics</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Globe} label="Learning Partners" value={state.partners.filter(p => p.status === 'active').length} color="primary" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={state.orders.length} trend={`${state.orders.filter(o => o.status === 'submitted' || o.status === 'approved').length} pending`} color="accent" />
        <StatCard icon={Key} label="Active Codes" value={state.codes.filter(c => c.status === 'generated' || c.status === 'distributed').length} color="success" />
        <StatCard icon={Users} label="Total Users" value={state.users.filter(u => u.status === 'active').length} color="warning" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Platform Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" /><XAxis dataKey="month" stroke="#8888a0" fontSize={12} /><YAxis stroke="#8888a0" fontSize={12} /><Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px' }} /><Area type="monotone" dataKey="codes" stroke="#6c5ce7" fill="#6c5ce7" fillOpacity={0.1} /><Area type="monotone" dataKey="redemptions" stroke="#00cec9" fill="#00cec9" fillOpacity={0.1} /></AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Code Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={codeStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">{codeStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px' }} /></PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">{codeStatusData.map(d => (<div key={d.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-xs text-helix-muted">{d.name}: {d.value}</span></div>))}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Pending Orders</h3>
          <div className="space-y-3">
            {state.orders.filter(o => o.status === 'submitted' || o.status === 'approved' || o.status === 'processing').map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-helix-bg/50">
                <div><p className="text-sm font-medium">{o.orderId}</p><p className="text-xs text-helix-muted">{state.partners.find(p => p.id === o.partnerId)?.name} · {o.quantity} codes</p></div>
                <StatusBadge status={o.status} />
              </div>
            ))}
            {state.orders.filter(o => o.status === 'submitted' || o.status === 'approved' || o.status === 'processing').length === 0 && <p className="text-sm text-helix-muted">No pending orders</p>}
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {state.auditLogs.slice(0, 6).map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-helix-bg/50">
                <div className="w-8 h-8 rounded-full bg-helix-primary/20 flex items-center justify-center flex-shrink-0"><Zap className="w-4 h-4 text-helix-primary" /></div>
                <div className="min-w-0"><p className="text-sm truncate">{log.details}</p><p className="text-xs text-helix-muted mt-0.5">{new Date(log.createdAt).toLocaleDateString()}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminOrders() {
  const { state, dispatch } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const filtered = state.orders.filter(o => (statusFilter === 'all' || o.status === statusFilter) && (o.orderId.toLowerCase().includes(search.toLowerCase()) || state.partners.find(p => p.id === o.partnerId)?.name.toLowerCase().includes(search.toLowerCase()) || state.books.find(b => b.id === o.bookId)?.title.toLowerCase().includes(search.toLowerCase())));
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Orders</h1><p className="text-helix-muted mt-1">Manage all platform orders</p></div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-helix-muted" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Order ID, Partner, Book..." className="w-full pl-10 pr-4 py-2.5 bg-helix-surface border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /></div>
        <div className="flex gap-2 flex-wrap">{['all', 'submitted', 'approved', 'processing', 'fulfilled', 'cancelled'].map(s => (<button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-helix-primary text-white' : 'bg-helix-card text-helix-muted hover:text-helix-text'}`}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>))}</div>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Order ID</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Partner</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Book</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Qty</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Validity</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Devices</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Date</th></tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-t border-helix-border hover:bg-helix-bg/30 cursor-pointer" onClick={() => {}}>
                  <td className="px-4 py-3 font-mono text-xs font-medium">{o.orderId}</td>
                  <td className="px-4 py-3 text-helix-muted">{state.partners.find(p => p.id === o.partnerId)?.name || '-'}</td>
                  <td className="px-4 py-3">{state.books.find(b => b.id === o.bookId)?.title || '-'}</td>
                  <td className="px-4 py-3">{o.quantity}</td>
                  <td className="px-4 py-3 text-helix-muted">{o.validityDays}d</td>
                  <td className="px-4 py-3 text-helix-muted">{o.maxDevices}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-helix-muted">{new Date(o.orderDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminCodes() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const perPage = 15;

  const filtered = state.codes.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.code.toLowerCase().includes(q) || c.orderId.includes(q) || state.users.find(u => u.id === c.redeemedBy)?.email?.toLowerCase().includes(q) || state.partners.find(p => p.id === c.partnerId)?.name.toLowerCase().includes(q) || state.books.find(b => b.id === c.bookId)?.title.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Access Codes</h1><p className="text-helix-muted mt-1">Search, manage, and track all access codes</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard icon={Key} label="Total" value={state.codes.length} color="primary" />
        <StatCard icon={Check} label="Redeemed" value={state.codes.filter(c => c.status === 'redeemed').length} color="success" />
        <StatCard icon={Package} label="Available" value={state.codes.filter(c => c.status === 'generated' || c.status === 'distributed').length} color="accent" />
        <StatCard icon={Clock} label="Expired" value={state.codes.filter(c => c.status === 'expired').length} color="warning" />
        <StatCard icon={AlertTriangle} label="Revoked" value={state.codes.filter(c => c.status === 'revoked').length} color="warning" />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-helix-muted" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search code, order ID, user email, partner, book..." className="w-full pl-10 pr-4 py-2.5 bg-helix-surface border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /></div>
        <div className="flex gap-2 flex-wrap">{['all', 'generated', 'distributed', 'redeemed', 'expired', 'revoked'].map(s => (<button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-helix-primary text-white' : 'bg-helix-card text-helix-muted hover:text-helix-text'}`}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>))}</div>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Code</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Order</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Book</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Partner</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Redeemed By</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Expires</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Actions</th></tr></thead>
            <tbody>
              {paged.map(c => (
                <tr key={c.id} className="border-t border-helix-border hover:bg-helix-bg/30">
                  <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                  <td className="px-4 py-3 font-mono text-xs text-helix-muted">{state.orders.find(o => o.id === c.orderId)?.orderId || '-'}</td>
                  <td className="px-4 py-3 text-xs">{state.books.find(b => b.id === c.bookId)?.title || '-'}</td>
                  <td className="px-4 py-3 text-xs text-helix-muted">{state.partners.find(p => p.id === c.partnerId)?.name || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-xs text-helix-muted">{c.redeemedBy ? state.users.find(u => u.id === c.redeemedBy)?.email || '-' : '-'}</td>
                  <td className="px-4 py-3 text-xs text-helix-muted">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : c.validityDays + 'd'}</td>
                  <td className="px-4 py-3">
                    {(c.status === 'generated' || c.status === 'distributed' || c.status === 'redeemed') && (
                      <button onClick={() => { dispatch({ type: 'REVOKE_CODE', payload: { codeId: c.id, userId: state.currentUser!.id, reason: 'Revoked by admin' } }); dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: state.currentUser!.id, action: 'code.revoked', resource: 'AccessCode', resourceId: c.id, details: `Revoked code ${c.code}`, createdAt: new Date().toISOString() } }); dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Code revoked', type: 'success' } }); }} className="text-helix-danger hover:text-helix-danger/80 text-xs">Revoke</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-helix-border">
            <span className="text-xs text-helix-muted">Showing {(page-1)*perPage+1}-{Math.min(page*perPage, filtered.length)} of {filtered.length}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page-1))} disabled={page === 1} className="px-3 py-1 rounded bg-helix-card text-xs disabled:opacity-30">Prev</button>
              <button onClick={() => setPage(Math.min(totalPages, page+1))} disabled={page === totalPages} className="px-3 py-1 rounded bg-helix-card text-xs disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminUsers() {
  const { state, dispatch } = useApp();
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' as UserRole, partnerId: '', status: '' as string });
  const [confirmAction, setConfirmAction] = useState<{ user: User; action: string } | null>(null);

  const filtered = roleFilter === 'all' ? state.users : state.users.filter(u => u.role === roleFilter);

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, partnerId: user.partnerId || '', status: user.status });
  };

  const saveEdit = () => {
    if (!editingUser) return;
    const emailExists = state.users.find(u => u.email === editForm.email && u.id !== editingUser.id);
    if (emailExists) { dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Email already in use', type: 'error' } }); return; }
    const updated: User = { ...editingUser, name: editForm.name, email: editForm.email, role: editForm.role as UserRole, partnerId: editForm.partnerId || undefined, status: editForm.status as any };
    dispatch({ type: 'UPDATE_USER', payload: updated });
    dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: state.currentUser!.id, action: 'user.updated', resource: 'User', resourceId: editingUser.id, details: `Updated user ${editForm.name}: role=${editForm.role}, status=${editForm.status}`, createdAt: new Date().toISOString() } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `User "${editForm.name}" updated`, type: 'success' } });
    setEditingUser(null);
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    const { user, action } = confirmAction;
    if (action === 'suspend') {
      dispatch({ type: 'UPDATE_USER', payload: { ...user, status: 'suspended' } });
      dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: state.currentUser!.id, action: 'user.suspended', resource: 'User', resourceId: user.id, details: `Suspended user ${user.name}`, createdAt: new Date().toISOString() } });
    } else if (action === 'activate') {
      dispatch({ type: 'UPDATE_USER', payload: { ...user, status: 'active' } });
      dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: state.currentUser!.id, action: 'user.activated', resource: 'User', resourceId: user.id, details: `Reactivated user ${user.name}`, createdAt: new Date().toISOString() } });
    } else if (action === 'reset_password') {
      const token = uuidv4();
      dispatch({ type: 'UPDATE_USER', payload: { ...user, passwordResetToken: token, passwordResetExpiry: new Date(Date.now() + 3600000).toISOString() } });
      dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: state.currentUser!.id, action: 'user.password_reset_initiated', resource: 'User', resourceId: user.id, details: `Password reset initiated for ${user.email}`, createdAt: new Date().toISOString() } });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Password reset link generated for ${user.email}. In production, this would be emailed.`, type: 'info' } });
    }
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Action "${action}" completed for ${user.name}`, type: 'success' } });
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">User Management</h1><p className="text-helix-muted mt-1">Manage all platform users, roles, and access</p></div>
      <div className="flex gap-2 flex-wrap">
        {[{ v: 'all', l: 'All' }, { v: 'super_admin', l: 'Admins' }, { v: 'support_agent', l: 'Support' }, { v: 'partner_admin', l: 'Partners' }, { v: 'student', l: 'Students' }].map(r => (
          <button key={r.v} onClick={() => setRoleFilter(r.v)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${roleFilter === r.v ? 'bg-helix-primary text-white' : 'bg-helix-card text-helix-muted hover:text-helix-text'}`}>{r.l}</button>
        ))}
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">User</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Email</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Role</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Partner</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Actions</th></tr></thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-t border-helix-border hover:bg-helix-bg/30">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center text-xs font-bold text-white">{user.name.charAt(0)}</div><span className="font-medium">{user.name}</span></div></td>
                  <td className="px-4 py-3 text-helix-muted text-xs">{user.email}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'super_admin' ? 'bg-helix-primary/20 text-helix-primary-light' : user.role === 'support_agent' ? 'bg-helix-accent/20 text-helix-accent' : user.role === 'partner_admin' ? 'bg-helix-success/20 text-helix-success' : 'bg-helix-muted/20 text-helix-muted'}`}>{user.role === 'super_admin' ? 'Admin' : user.role === 'support_agent' ? 'Support' : user.role === 'partner_admin' ? 'Partner' : 'Student'}</span></td>
                  <td className="px-4 py-3 text-helix-muted text-xs">{user.partnerId ? state.partners.find(p => p.id === user.partnerId)?.name || '-' : '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(user)} className="text-helix-primary hover:text-helix-primary-light text-xs flex items-center gap-1"><Edit className="w-3 h-3" /> Edit</button>
                      <button onClick={() => setConfirmAction({ user, action: 'reset_password' })} className="text-helix-accent hover:text-helix-accent-light text-xs flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Reset PW</button>
                      {user.status === 'active' ? <button onClick={() => setConfirmAction({ user, action: 'suspend' })} className="text-helix-danger hover:text-helix-danger/80 text-xs">Suspend</button> : <button onClick={() => setConfirmAction({ user, action: 'activate' })} className="text-helix-success hover:text-helix-success/80 text-xs">Activate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <div className="glass rounded-xl p-6 max-w-lg w-full animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Edit className="w-5 h-5 text-helix-primary" /> Edit User</h3>
            <div className="space-y-4">
              <div><label className="block text-sm text-helix-muted mb-1">Name</label><input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /></div>
              <div><label className="block text-sm text-helix-muted mb-1">Email</label><input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /></div>
              <div><label className="block text-sm text-helix-muted mb-1">Role</label><select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value as UserRole })} className="w-full px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm text-helix-text focus:border-helix-primary focus:outline-none"><option value="super_admin">Super Admin</option><option value="support_agent">Support Agent</option><option value="partner_admin">Partner Admin</option><option value="student">Student</option></select></div>
              <div><label className="block text-sm text-helix-muted mb-1">Organization</label><select value={editForm.partnerId} onChange={e => setEditForm({ ...editForm, partnerId: e.target.value })} className="w-full px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm text-helix-text focus:border-helix-primary focus:outline-none"><option value="">None</option>{state.partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div><label className="block text-sm text-helix-muted mb-1">Status</label><select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm text-helix-text focus:border-helix-primary focus:outline-none"><option value="active">Active</option><option value="suspended">Suspended</option><option value="deactivated">Deactivated</option></select></div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 bg-helix-card rounded-lg text-sm">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium hover:opacity-90">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmAction} title={confirmAction?.action === 'suspend' ? 'Suspend User' : confirmAction?.action === 'activate' ? 'Activate User' : 'Reset Password'} message={confirmAction?.action === 'reset_password' ? `Generate a password reset for ${confirmAction?.user.name}? A secure reset link will be created.` : `${confirmAction?.action === 'suspend' ? 'Suspend' : 'Activate'} ${confirmAction?.user.name}?`} onConfirm={handleConfirmAction} onCancel={() => setConfirmAction(null)} danger={confirmAction?.action === 'suspend'} />
    </div>
  );
}

function AdminReports() {
  const { state } = useApp();
  const totalCodes = state.codes.length;
  const redeemed = state.codes.filter(c => c.status === 'redeemed').length;
  const available = state.codes.filter(c => c.status === 'generated' || c.status === 'distributed').length;
  const expired = state.codes.filter(c => c.status === 'expired').length;
  const revoked = state.codes.filter(c => c.status === 'revoked').length;
  const redemptionRate = totalCodes > 0 ? Math.round((redeemed / totalCodes) * 100) : 0;

  const orderReport = state.orders.map(o => ({
    orderId: o.orderId,
    partner: state.partners.find(p => p.id === o.partnerId)?.name || '-',
    book: state.books.find(b => b.id === o.bookId)?.title || '-',
    ordered: o.quantity,
    generated: state.codes.filter(c => c.orderId === o.id).length,
    redeemed: state.codes.filter(c => c.orderId === o.id && c.status === 'redeemed').length,
    validity: o.validityDays,
    maxDevices: o.maxDevices,
    status: o.status,
    date: new Date(o.orderDate).toLocaleDateString(),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Reports & Analytics</h1><p className="text-helix-muted mt-1">Platform-wide metrics and operational reports</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Key} label="Total Codes" value={totalCodes} color="primary" />
        <StatCard icon={Check} label="Redeemed" value={redeemed} color="success" />
        <StatCard icon={Package} label="Available" value={available} color="accent" />
        <StatCard icon={Clock} label="Expired" value={expired} color="warning" />
        <StatCard icon={AlertTriangle} label="Revoked" value={revoked} color="warning" />
        <StatCard icon={TrendingUp} label="Redemption %" value={`${redemptionRate}%`} color="success" />
      </div>
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Order Report</h3>
          <button onClick={() => {
            const header = 'Order ID,Partner,Book,Codes Ordered,Codes Generated,Codes Redeemed,Validity (Days),Max Devices,Status,Date\n';
            const rows = orderReport.map(r => `"${r.orderId}","${r.partner}","${r.book}",${r.ordered},${r.generated},${r.redeemed},${r.validity},${r.maxDevices},"${r.status}","${r.date}"`).join('\n');
            const blob = new Blob([header + rows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'order-report.csv'; a.click();
            URL.revokeObjectURL(url);
            dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: state.currentUser!.id, action: 'report.exported', resource: 'Report', details: 'Exported order report CSV', createdAt: new Date().toISOString() } });
          }} className="flex items-center gap-2 px-3 py-1.5 bg-helix-card rounded-lg text-xs hover:bg-helix-primary/20 transition-colors"><FileDown className="w-3.5 h-3.5" /> Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50"><tr><th className="text-left px-3 py-2 text-helix-muted font-medium text-xs">Order</th><th className="text-left px-3 py-2 text-helix-muted font-medium text-xs">Partner</th><th className="text-left px-3 py-2 text-helix-muted font-medium text-xs">Book</th><th className="text-left px-3 py-2 text-helix-muted font-medium text-xs">Ordered</th><th className="text-left px-3 py-2 text-helix-muted font-medium text-xs">Generated</th><th className="text-left px-3 py-2 text-helix-muted font-medium text-xs">Redeemed</th><th className="text-left px-3 py-2 text-helix-muted font-medium text-xs">Validity</th><th className="text-left px-3 py-2 text-helix-muted font-medium text-xs">Devices</th><th className="text-left px-3 py-2 text-helix-muted font-medium text-xs">Status</th></tr></thead>
            <tbody>{orderReport.map(r => (<tr key={r.orderId} className="border-t border-helix-border"><td className="px-3 py-2 font-mono text-xs">{r.orderId}</td><td className="px-3 py-2 text-xs text-helix-muted">{r.partner}</td><td className="px-3 py-2 text-xs">{r.book}</td><td className="px-3 py-2 text-xs">{r.ordered}</td><td className="px-3 py-2 text-xs">{r.generated}</td><td className="px-3 py-2 text-xs">{r.redeemed}</td><td className="px-3 py-2 text-xs text-helix-muted">{r.validity}d</td><td className="px-3 py-2 text-xs text-helix-muted">{r.maxDevices}</td><td className="px-3 py-2"><StatusBadge status={r.status} /></td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminAudit() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const filtered = state.auditLogs.filter(l => l.details.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Audit Log</h1><p className="text-helix-muted mt-1">Platform activity and security events</p></div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-helix-muted" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search audit log..." className="w-full pl-10 pr-4 py-2.5 bg-helix-surface border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /></div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Time</th><th className="text-left px-4 py-3 text-helix-muted font-medium">User</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Action</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Details</th></tr></thead>
            <tbody>{filtered.map(log => (<tr key={log.id} className="border-t border-helix-border hover:bg-helix-bg/30"><td className="px-4 py-3 text-helix-muted whitespace-nowrap text-xs">{new Date(log.createdAt).toLocaleString()}</td><td className="px-4 py-3 text-xs">{state.users.find(u => u.id === log.userId)?.name || 'System'}</td><td className="px-4 py-3"><code className="px-2 py-0.5 bg-helix-bg rounded text-xs text-helix-accent">{log.action}</code></td><td className="px-4 py-3 text-helix-muted text-xs">{log.details}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminPartners() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const handleCreate = () => {
    if (!formData.name) return;
    const partner = { id: uuidv4(), name: formData.name, description: formData.description, status: 'active' as const, adminId: '', studentCount: 0, classroomCount: 0, bookCount: 0, codeQuota: 500, codesUsed: 0, canGenerateCodes: true, createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_PARTNER', payload: partner });
    dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: state.currentUser!.id, action: 'partner.created', resource: 'LearningPartner', resourceId: partner.id, details: `Created ${partner.name}`, createdAt: new Date().toISOString() } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Partner "${partner.name}" created`, type: 'success' } });
    setShowForm(false); setFormData({ name: '', description: '' });
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Learning Partners</h1><p className="text-helix-muted mt-1">Manage partner organizations</p></div><button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90"><Plus className="w-4 h-4" /> Add Partner</button></div>
      {showForm && (<div className="glass rounded-xl p-6 animate-fade-in"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Organization name" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /><input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Description" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /></div><div className="flex gap-2 mt-4"><button onClick={handleCreate} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium">Create</button><button onClick={() => setShowForm(false)} className="px-4 py-2 bg-helix-card text-helix-muted rounded-lg text-sm">Cancel</button></div></div>)}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.partners.map(p => (
          <div key={p.id} className="glass rounded-xl p-5 card-hover">
            <div className="flex items-start justify-between mb-3"><div className="w-10 h-10 rounded-lg bg-gradient-to-br from-helix-primary/20 to-helix-accent/20 flex items-center justify-center"><Globe className="w-5 h-5 text-helix-primary" /></div><StatusBadge status={p.status} /></div>
            <h3 className="font-semibold">{p.name}</h3><p className="text-sm text-helix-muted mt-1 line-clamp-2">{p.description}</p>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-helix-border"><div className="text-center"><p className="text-lg font-bold">{p.studentCount}</p><p className="text-xs text-helix-muted">Students</p></div><div className="text-center"><p className="text-lg font-bold">{p.classroomCount}</p><p className="text-xs text-helix-muted">Classes</p></div><div className="text-center"><p className="text-lg font-bold">{p.bookCount}</p><p className="text-xs text-helix-muted">Books</p></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminBooks() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const filtered = state.books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));
  const bookColors = ['from-purple-500/20 to-blue-500/20', 'from-emerald-500/20 to-teal-500/20', 'from-orange-500/20 to-red-500/20', 'from-pink-500/20 to-rose-500/20', 'from-cyan-500/20 to-blue-500/20', 'from-amber-500/20 to-yellow-500/20'];
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Book Catalog</h1><p className="text-helix-muted mt-1">Manage the global book library</p></div>
      <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-helix-muted" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books..." className="w-full pl-10 pr-4 py-3 bg-helix-surface border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((book, i) => (
          <div key={book.id} className="glass rounded-xl overflow-hidden card-hover">
            <div className={`h-32 bg-gradient-to-br ${bookColors[i % bookColors.length]} flex items-center justify-center`}><BookMarked className="w-12 h-12 text-white/30" /></div>
            <div className="p-5"><div className="flex items-start justify-between"><div className="min-w-0 flex-1"><h3 className="font-semibold truncate">{book.title}</h3><p className="text-sm text-helix-muted">{book.author}</p></div><StatusBadge status={book.status} /></div><p className="text-xs text-helix-muted mt-2 line-clamp-2">{book.description}</p><div className="flex items-center gap-3 mt-3 text-xs text-helix-muted"><span>{book.pageCount} pages</span><span>·</span><span>v{book.version}</span><span>·</span><span>{book.approvedPartners.length} partners</span></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Platform Settings</h1><p className="text-helix-muted mt-1">Configure global platform policies</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-helix-primary" /> Security</h3><div className="space-y-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">MFA for Admins</p><p className="text-xs text-helix-muted">Require MFA for super administrators</p></div><div className="w-10 h-6 bg-helix-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div></div><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Rate Limiting</p><p className="text-xs text-helix-muted">Limit API requests per minute</p></div><div className="w-10 h-6 bg-helix-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div></div></div></div>
        <div className="glass rounded-xl p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-helix-accent" /> Access Codes</h3><div className="space-y-4"><div><p className="text-sm font-medium mb-1">Default Code Expiration</p><select className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm text-helix-text"><option>30 days</option><option>90 days</option><option>180 days</option><option>365 days</option></select></div><div><p className="text-sm font-medium mb-1">Max Codes Per Batch</p><input type="number" defaultValue={100} className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm text-helix-text" /></div></div></div>
        <div className="glass rounded-xl p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-helix-success" /> Content Protection</h3><div className="space-y-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Disable Print/Download</p><p className="text-xs text-helix-muted">Prevent ordinary downloading and printing</p></div><div className="w-10 h-6 bg-helix-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div></div><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Device Enforcement</p><p className="text-xs text-helix-muted">Enforce max devices per entitlement</p></div><div className="w-10 h-6 bg-helix-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div></div></div></div>
        <div className="glass rounded-xl p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-helix-warning" /> Reader</h3><div className="space-y-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Read Aloud</p><p className="text-xs text-helix-muted">Enable text-to-speech functionality</p></div><div className="w-10 h-6 bg-helix-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div></div></div></div>
      </div>
    </div>
  );
}

// ==================== SUPPORT AGENT PAGES ====================
function SupportDashboard() {
  const { state } = useApp();
  const pendingOrders = state.orders.filter(o => o.status === 'submitted' || o.status === 'approved');
  const processingOrders = state.orders.filter(o => o.status === 'processing');
  const recentFulfilled = state.orders.filter(o => o.status === 'fulfilled').slice(0, 5);
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Support Dashboard</h1><p className="text-helix-muted mt-1">Order fulfillment and code operations</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="Pending Orders" value={pendingOrders.length} color="warning" />
        <StatCard icon={Package} label="Processing" value={processingOrders.length} color="accent" />
        <StatCard icon={Check} label="Fulfilled Today" value={state.orders.filter(o => o.status === 'fulfilled' && o.fulfilledAt && new Date(o.fulfilledAt).toDateString() === new Date().toDateString()).length} color="success" />
        <StatCard icon={Key} label="Codes Generated" value={state.codes.length} color="primary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Orders Awaiting Fulfillment</h3>
          <div className="space-y-3">
            {pendingOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-helix-bg/50">
                <div><p className="text-sm font-medium font-mono">{o.orderId}</p><p className="text-xs text-helix-muted">{state.partners.find(p => p.id === o.partnerId)?.name} · {o.quantity} codes · {state.books.find(b => b.id === o.bookId)?.title}</p></div>
                <StatusBadge status={o.status} />
              </div>
            ))}
            {pendingOrders.length === 0 && <p className="text-sm text-helix-muted">No orders awaiting fulfillment</p>}
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Recently Fulfilled</h3>
          <div className="space-y-3">
            {recentFulfilled.map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-helix-bg/50">
                <div><p className="text-sm font-medium font-mono">{o.orderId}</p><p className="text-xs text-helix-muted">{state.partners.find(p => p.id === o.partnerId)?.name} · {o.quantity} codes</p></div>
                <span className="text-xs text-helix-muted">{o.fulfilledAt ? new Date(o.fulfilledAt).toLocaleDateString() : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportOrders() {
  const { state, dispatch, generateOrderCodes, exportCodesCSV } = useApp();
  const [fulfillingOrder, setFulfillingOrder] = useState<Order | null>(null);
  const [confirmFulfill, setConfirmFulfill] = useState(false);
  const pendingOrders = state.orders.filter(o => o.status === 'approved' || o.status === 'submitted' || o.status === 'processing');

  const handleFulfill = () => {
    if (!fulfillingOrder) return;
    // Check for duplicate fulfillment
    const existingCodes = state.codes.filter(c => c.orderId === fulfillingOrder.id);
    if (existingCodes.length >= fulfillingOrder.quantity && fulfillingOrder.status === 'fulfilled') {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'This order has already been fulfilled.', type: 'error' } });
      setFulfillingOrder(null); return;
    }
    const { batch, codes } = generateOrderCodes(fulfillingOrder);
    const updatedOrder: Order = { ...fulfillingOrder, status: 'fulfilled', fulfilledAt: new Date().toISOString(), fulfilledBy: state.currentUser!.id, updatedAt: new Date().toISOString() };
    dispatch({ type: 'FULFILL_ORDER', payload: { order: updatedOrder, batch, codes } });
    dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: state.currentUser!.id, action: 'order.fulfilled', resource: 'Order', resourceId: fulfillingOrder.id, details: `Fulfilled order ${fulfillingOrder.orderId}, generated ${codes.length} codes`, createdAt: new Date().toISOString() } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Order ${fulfillingOrder.orderId} fulfilled with ${codes.length} codes`, type: 'success' } });
    setFulfillingOrder(null); setConfirmFulfill(false);
  };

  const handleExport = (orderId: string) => {
    const csv = exportCodesCSV(orderId);
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `codes-${state.orders.find(o => o.id === orderId)?.orderId || orderId}.csv`; a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'ADD_EXPORT', payload: { id: uuidv4(), orderId, exportedBy: state.currentUser!.id, exportedAt: new Date().toISOString(), format: 'csv', recordCount: state.codes.filter(c => c.orderId === orderId).length } });
    dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: state.currentUser!.id, action: 'codes.exported', resource: 'Order', resourceId: orderId, details: `Exported codes for order ${state.orders.find(o => o.id === orderId)?.orderId}`, createdAt: new Date().toISOString() } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Codes exported as CSV', type: 'success' } });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Order Fulfillment</h1><p className="text-helix-muted mt-1">Process and fulfill orders, generate and export codes</p></div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-helix-border"><h3 className="font-semibold">Orders Requiring Action</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Order ID</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Partner</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Book</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Qty</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Validity</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Devices</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Actions</th></tr></thead>
            <tbody>
              {state.orders.map(o => (
                <tr key={o.id} className="border-t border-helix-border hover:bg-helix-bg/30">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{o.orderId}</td>
                  <td className="px-4 py-3 text-helix-muted text-xs">{state.partners.find(p => p.id === o.partnerId)?.name}</td>
                  <td className="px-4 py-3 text-xs">{state.books.find(b => b.id === o.bookId)?.title}</td>
                  <td className="px-4 py-3">{o.quantity}</td>
                  <td className="px-4 py-3 text-helix-muted">{o.validityDays}d</td>
                  <td className="px-4 py-3 text-helix-muted">{o.maxDevices}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {(o.status === 'submitted' || o.status === 'approved' || o.status === 'processing') && (
                        <button onClick={() => setFulfillingOrder(o)} className="px-2 py-1 bg-helix-primary/20 text-helix-primary-light rounded text-xs hover:bg-helix-primary/30">Fulfill</button>
                      )}
                      {o.status === 'fulfilled' && (
                        <button onClick={() => handleExport(o.id)} className="flex items-center gap-1 px-2 py-1 bg-helix-accent/20 text-helix-accent rounded text-xs hover:bg-helix-accent/30"><FileDown className="w-3 h-3" /> Export</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fulfillment Modal */}
      {fulfillingOrder && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={() => { setFulfillingOrder(null); setConfirmFulfill(false); }}>
          <div className="glass rounded-xl p-6 max-w-lg w-full animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-helix-primary" /> Fulfill Order: {fulfillingOrder.orderId}</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-helix-muted">Partner:</span><span>{state.partners.find(p => p.id === fulfillingOrder.partnerId)?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-helix-muted">Book:</span><span>{state.books.find(b => b.id === fulfillingOrder.bookId)?.title}</span></div>
              <div className="flex justify-between text-sm"><span className="text-helix-muted">Codes to generate:</span><span className="font-bold text-helix-primary">{fulfillingOrder.quantity}</span></div>
              <div className="flex justify-between text-sm"><span className="text-helix-muted">Validity:</span><span>{fulfillingOrder.validityDays} days</span></div>
              <div className="flex justify-between text-sm"><span className="text-helix-muted">Max devices:</span><span>{fulfillingOrder.maxDevices}</span></div>
            </div>
            {!confirmFulfill ? (
              <div className="flex gap-3 justify-end">
                <button onClick={() => setFulfillingOrder(null)} className="px-4 py-2 bg-helix-card rounded-lg text-sm">Cancel</button>
                <button onClick={() => setConfirmFulfill(true)} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium hover:opacity-90">Proceed to Generate</button>
              </div>
            ) : (
              <div>
                <div className="bg-helix-warning/10 border border-helix-warning/20 rounded-lg p-3 mb-4 flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-helix-warning mt-0.5" /><p className="text-xs text-helix-warning">This will generate {fulfillingOrder.quantity} unique access codes. This action cannot be undone. Verify the quantity matches the approved order.</p></div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setConfirmFulfill(false)} className="px-4 py-2 bg-helix-card rounded-lg text-sm">Back</button>
                  <button onClick={handleFulfill} className="px-4 py-2 bg-helix-success text-white rounded-lg text-sm font-medium hover:opacity-90">Confirm & Generate Codes</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SupportCodes() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const filtered = state.codes.filter(c => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return c.code.toLowerCase().includes(q) || state.orders.find(o => o.id === c.orderId)?.orderId.toLowerCase().includes(q) || state.users.find(u => u.id === c.redeemedBy)?.email?.toLowerCase().includes(q) || state.partners.find(p => p.id === c.partnerId)?.name.toLowerCase().includes(q) || state.books.find(b => b.id === c.bookId)?.title.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Access Code Operations</h1><p className="text-helix-muted mt-1">Search, track, and manage access codes</p></div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-helix-muted" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code, order ID, user email, partner, or book..." className="w-full pl-10 pr-4 py-3 bg-helix-surface border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /></div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Code</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Order</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Book</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Partner</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Validity</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Redeemed By</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Actions</th></tr></thead>
            <tbody>
              {filtered.slice(0, 50).map(c => (
                <tr key={c.id} className="border-t border-helix-border hover:bg-helix-bg/30">
                  <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                  <td className="px-4 py-3 font-mono text-xs text-helix-muted">{state.orders.find(o => o.id === c.orderId)?.orderId || '-'}</td>
                  <td className="px-4 py-3 text-xs">{state.books.find(b => b.id === c.bookId)?.title || '-'}</td>
                  <td className="px-4 py-3 text-xs text-helix-muted">{state.partners.find(p => p.id === c.partnerId)?.name || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-xs text-helix-muted">{c.validityDays}d</td>
                  <td className="px-4 py-3 text-xs text-helix-muted">{c.redeemedBy ? state.users.find(u => u.id === c.redeemedBy)?.email || '-' : '-'}</td>
                  <td className="px-4 py-3">
                    {(c.status === 'generated' || c.status === 'distributed' || c.status === 'redeemed') && (
                      <button onClick={() => { dispatch({ type: 'REVOKE_CODE', payload: { codeId: c.id, userId: state.currentUser!.id, reason: 'Revoked by support agent' } }); dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: state.currentUser!.id, action: 'code.revoked', resource: 'AccessCode', resourceId: c.id, details: `Revoked code ${c.code}`, createdAt: new Date().toISOString() } }); dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Code revoked', type: 'success' } }); }} className="text-helix-danger hover:text-helix-danger/80 text-xs">Revoke</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-helix-border text-xs text-helix-muted">Showing {Math.min(filtered.length, 50)} of {filtered.length} codes</div>
      </div>
    </div>
  );
}

function SupportExports() {
  const { state } = useApp();
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Export History</h1><p className="text-helix-muted mt-1">Track all code file exports</p></div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Order</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Exported By</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Date</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Records</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Format</th></tr></thead>
            <tbody>
              {state.exports.map(exp => (
                <tr key={exp.id} className="border-t border-helix-border hover:bg-helix-bg/30">
                  <td className="px-4 py-3 font-mono text-xs">{state.orders.find(o => o.id === exp.orderId)?.orderId || exp.orderId}</td>
                  <td className="px-4 py-3 text-xs">{state.users.find(u => u.id === exp.exportedBy)?.name || '-'}</td>
                  <td className="px-4 py-3 text-xs text-helix-muted">{new Date(exp.exportedAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{exp.recordCount}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-helix-accent/20 text-helix-accent rounded text-xs font-medium">{exp.format.toUpperCase()}</span></td>
                </tr>
              ))}
              {state.exports.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-helix-muted">No exports yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== PARTNER ADMIN PAGES ====================
function PartnerDashboard() {
  const { state } = useApp();
  const user = state.currentUser!;
  const partner = state.partners.find(p => p.id === user.partnerId);
  const classrooms = state.classrooms.filter(c => c.partnerId === user.partnerId);
  const students = state.users.filter(u => u.partnerId === user.partnerId && u.role === 'student');
  const partnerOrders = state.orders.filter(o => o.partnerId === user.partnerId);
  const partnerCodes = state.codes.filter(c => c.partnerId === user.partnerId);
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Welcome, {user.name}</h1><p className="text-helix-muted mt-1">{partner?.name} — Dashboard</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="My Orders" value={partnerOrders.length} trend={`${partnerOrders.filter(o => o.status === 'fulfilled').length} fulfilled`} color="primary" />
        <StatCard icon={GraduationCap} label="Classrooms" value={classrooms.length} color="accent" />
        <StatCard icon={Users} label="Students" value={students.length} color="success" />
        <StatCard icon={Key} label="My Codes" value={partnerCodes.length} color="warning" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {partnerOrders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-helix-bg/50">
                <div><p className="text-sm font-medium font-mono">{o.orderId}</p><p className="text-xs text-helix-muted">{state.books.find(b => b.id === o.bookId)?.title} · {o.quantity} codes</p></div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Code Status</h3>
          <div className="space-y-3">
            {[{ l: 'Redeemed', v: partnerCodes.filter(c => c.status === 'redeemed').length, c: 'bg-helix-success' }, { l: 'Available', v: partnerCodes.filter(c => c.status === 'generated' || c.status === 'distributed').length, c: 'bg-helix-accent' }, { l: 'Expired', v: partnerCodes.filter(c => c.status === 'expired').length, c: 'bg-helix-warning' }, { l: 'Revoked', v: partnerCodes.filter(c => c.status === 'revoked').length, c: 'bg-helix-danger' }].map(s => (
              <div key={s.l} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${s.c}`} /><span className="text-sm">{s.l}</span></div><span className="font-semibold">{s.v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerOrders() {
  const { state, dispatch } = useApp();
  const user = state.currentUser!;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: '', bookId: '', quantity: 10, validityDays: 90, maxDevices: 2 });
  const partnerOrders = state.orders.filter(o => o.partnerId === user.partnerId);
  const approvedBooks = state.books.filter(b => b.approvedPartners.includes(user.partnerId!) && b.status === 'published');

  const handleSubmit = () => {
    if (!form.orderId || !form.bookId) { dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Please fill all required fields', type: 'error' } }); return; }
    if (state.orders.find(o => o.orderId === form.orderId)) { dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Order ID already exists', type: 'error' } }); return; }
    const order: Order = { id: uuidv4(), orderId: form.orderId, partnerId: user.partnerId!, bookId: form.bookId, quantity: form.quantity, validityDays: form.validityDays, maxDevices: form.maxDevices, status: 'submitted', requestedBy: user.id, orderDate: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    dispatch({ type: 'ADD_ORDER', payload: order });
    dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: user.id, action: 'order.created', resource: 'Order', resourceId: order.id, details: `Created order ${order.orderId} for ${state.books.find(b => b.id === form.bookId)?.title}`, createdAt: new Date().toISOString() } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Order ${order.orderId} submitted`, type: 'success' } });
    setShowForm(false); setForm({ orderId: '', bookId: '', quantity: 10, validityDays: 90, maxDevices: 2 });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">My Orders</h1><p className="text-helix-muted mt-1">Place and track book orders</p></div><button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90"><Plus className="w-4 h-4" /> New Order</button></div>
      {showForm && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <h3 className="font-semibold mb-4">Place New Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-xs text-helix-muted mb-1">Order ID *</label><input value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} placeholder="e.g., SDA-2024-005" className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm focus:border-helix-primary focus:outline-none" /></div>
            <div><label className="block text-xs text-helix-muted mb-1">Book *</label><select value={form.bookId} onChange={e => setForm({ ...form, bookId: e.target.value })} className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm text-helix-text focus:border-helix-primary focus:outline-none"><option value="">Select book</option>{approvedBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}</select></div>
            <div><label className="block text-xs text-helix-muted mb-1">Number of Codes *</label><input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} min={1} max={500} className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm focus:border-helix-primary focus:outline-none" /></div>
            <div><label className="block text-xs text-helix-muted mb-1">Validity Period</label><select value={form.validityDays} onChange={e => setForm({ ...form, validityDays: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm text-helix-text focus:border-helix-primary focus:outline-none"><option value={30}>30 days</option><option value={90}>90 days</option><option value={180}>180 days</option><option value={365}>365 days</option></select></div>
            <div><label className="block text-xs text-helix-muted mb-1">Max Devices</label><select value={form.maxDevices} onChange={e => setForm({ ...form, maxDevices: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm text-helix-text focus:border-helix-primary focus:outline-none"><option value={1}>1 device</option><option value={2}>2 devices</option><option value={3}>3 devices</option><option value={5}>5 devices</option></select></div>
          </div>
          <div className="flex gap-2 mt-4"><button onClick={handleSubmit} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium hover:opacity-90">Submit Order</button><button onClick={() => setShowForm(false)} className="px-4 py-2 bg-helix-card text-helix-muted rounded-lg text-sm">Cancel</button></div>
        </div>
      )}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Order ID</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Book</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Qty</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Validity</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Devices</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Date</th></tr></thead>
            <tbody>{partnerOrders.map(o => (<tr key={o.id} className="border-t border-helix-border hover:bg-helix-bg/30"><td className="px-4 py-3 font-mono text-xs font-medium">{o.orderId}</td><td className="px-4 py-3 text-xs">{state.books.find(b => b.id === o.bookId)?.title}</td><td className="px-4 py-3">{o.quantity}</td><td className="px-4 py-3 text-helix-muted">{o.validityDays}d</td><td className="px-4 py-3 text-helix-muted">{o.maxDevices}</td><td className="px-4 py-3"><StatusBadge status={o.status} /></td><td className="px-4 py-3 text-helix-muted text-xs">{new Date(o.orderDate).toLocaleDateString()}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PartnerClassrooms() {
  const { state, dispatch } = useApp();
  const user = state.currentUser!;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '' });
  const classrooms = state.classrooms.filter(c => c.partnerId === user.partnerId);
  const handleCreate = () => {
    if (!form.name) return;
    const classroom = { id: uuidv4(), name: form.name, partnerId: user.partnerId!, instructorIds: [user.id], studentIds: [], bookIds: [], status: 'active' as const, startDate: form.startDate || new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_CLASSROOM', payload: classroom });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Classroom "${classroom.name}" created`, type: 'success' } });
    setShowForm(false); setForm({ name: '', startDate: '' });
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Classrooms</h1><p className="text-helix-muted mt-1">Manage classrooms and enrollments</p></div><button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90"><Plus className="w-4 h-4" /> New Classroom</button></div>
      {showForm && (<div className="glass rounded-xl p-6 animate-fade-in"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Classroom name" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm text-helix-text focus:border-helix-primary focus:outline-none" /></div><div className="flex gap-2 mt-4"><button onClick={handleCreate} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium">Create</button><button onClick={() => setShowForm(false)} className="px-4 py-2 bg-helix-card text-helix-muted rounded-lg text-sm">Cancel</button></div></div>)}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classrooms.map(c => (<div key={c.id} className="glass rounded-xl p-5 card-hover"><div className="flex items-start justify-between mb-3"><div className="w-10 h-10 rounded-lg bg-gradient-to-br from-helix-accent/20 to-helix-primary/20 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-helix-accent" /></div><StatusBadge status={c.status} /></div><h3 className="font-semibold">{c.name}</h3><p className="text-xs text-helix-muted mt-1">Start: {c.startDate}</p><div className="flex items-center gap-4 mt-4 pt-3 border-t border-helix-border text-xs text-helix-muted"><span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {c.studentIds.length}</span><span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {c.bookIds.length}</span></div></div>))}
      </div>
    </div>
  );
}

function PartnerStudents() {
  const { state } = useApp();
  const user = state.currentUser!;
  const students = state.users.filter(u => u.partnerId === user.partnerId && u.role === 'student');
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Students</h1><p className="text-helix-muted mt-1">{students.length} enrolled students</p></div>
      <div className="glass rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Student</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Email</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Books</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Last Active</th></tr></thead><tbody>{students.map(s => { const ents = state.entitlements.filter(e => e.userId === s.id && !e.revoked); return (<tr key={s.id} className="border-t border-helix-border hover:bg-helix-bg/30"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center text-xs font-bold text-white">{s.name.charAt(0)}</div><span className="font-medium">{s.name}</span></div></td><td className="px-4 py-3 text-helix-muted text-xs">{s.email}</td><td className="px-4 py-3">{ents.length}</td><td className="px-4 py-3"><StatusBadge status={s.status} /></td><td className="px-4 py-3 text-helix-muted text-xs">{s.lastLogin ? new Date(s.lastLogin).toLocaleDateString() : 'Never'}</td></tr>); })}</tbody></table></div></div>
    </div>
  );
}

function PartnerBooks() {
  const { state } = useApp();
  const user = state.currentUser!;
  const books = state.books.filter(b => b.approvedPartners.includes(user.partnerId!));
  const bookColors = ['from-purple-500/20 to-blue-500/20', 'from-emerald-500/20 to-teal-500/20', 'from-orange-500/20 to-red-500/20', 'from-pink-500/20 to-rose-500/20', 'from-cyan-500/20 to-blue-500/20', 'from-amber-500/20 to-yellow-500/20'];
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Approved Books</h1><p className="text-helix-muted mt-1">Books available for your organization</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book, i) => (<div key={book.id} className="glass rounded-xl overflow-hidden card-hover"><div className={`h-28 bg-gradient-to-br ${bookColors[i % bookColors.length]} flex items-center justify-center`}><BookMarked className="w-10 h-10 text-white/30" /></div><div className="p-5"><h3 className="font-semibold">{book.title}</h3><p className="text-sm text-helix-muted mt-1">{book.author}</p><p className="text-xs text-helix-muted mt-2 line-clamp-2">{book.description}</p></div></div>))}
      </div>
    </div>
  );
}

function PartnerCodes() {
  const { state } = useApp();
  const user = state.currentUser!;
  const codes = state.codes.filter(c => c.partnerId === user.partnerId);
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">My Access Codes</h1><p className="text-helix-muted mt-1">Codes issued to your organization</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Key} label="Total" value={codes.length} color="primary" />
        <StatCard icon={Check} label="Redeemed" value={codes.filter(c => c.status === 'redeemed').length} color="success" />
        <StatCard icon={Package} label="Available" value={codes.filter(c => c.status === 'generated' || c.status === 'distributed').length} color="accent" />
        <StatCard icon={AlertTriangle} label="Revoked" value={codes.filter(c => c.status === 'revoked').length} color="warning" />
      </div>
      <div className="glass rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-helix-bg/50"><tr><th className="text-left px-4 py-3 text-helix-muted font-medium">Code</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Order</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Book</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th><th className="text-left px-4 py-3 text-helix-muted font-medium">Redeemed By</th></tr></thead><tbody>{codes.slice(0, 30).map(c => (<tr key={c.id} className="border-t border-helix-border hover:bg-helix-bg/30"><td className="px-4 py-3 font-mono text-xs">{c.code}</td><td className="px-4 py-3 font-mono text-xs text-helix-muted">{state.orders.find(o => o.id === c.orderId)?.orderId || '-'}</td><td className="px-4 py-3 text-xs">{state.books.find(b => b.id === c.bookId)?.title || '-'}</td><td className="px-4 py-3"><StatusBadge status={c.status} /></td><td className="px-4 py-3 text-xs text-helix-muted">{c.redeemedBy ? state.users.find(u => u.id === c.redeemedBy)?.name || '-' : '-'}</td></tr>))}</tbody></table></div></div>
    </div>
  );
}

function PartnerReports() {
  const { state } = useApp();
  const user = state.currentUser!;
  const partnerOrders = state.orders.filter(o => o.partnerId === user.partnerId);
  const partnerCodes = state.codes.filter(c => c.partnerId === user.partnerId);
  const redeemed = partnerCodes.filter(c => c.status === 'redeemed').length;
  const rate = partnerCodes.length > 0 ? Math.round((redeemed / partnerCodes.length) * 100) : 0;
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Reports</h1><p className="text-helix-muted mt-1">Organization analytics</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={ShoppingCart} label="Orders" value={partnerOrders.length} color="primary" />
        <StatCard icon={Key} label="Total Codes" value={partnerCodes.length} color="accent" />
        <StatCard icon={Check} label="Redeemed" value={redeemed} color="success" />
        <StatCard icon={TrendingUp} label="Redemption %" value={`${rate}%`} color="warning" />
      </div>
    </div>
  );
}

// ==================== STUDENT PAGES ====================
function StudentBookshelf() {
  const { state } = useApp();
  const user = state.currentUser!;
  const navigate = useNavigate();
  const entitlements = state.entitlements.filter(e => e.userId === user.id && !e.revoked && (!e.expiresAt || new Date(e.expiresAt) > new Date()));
  const books = entitlements.map(e => state.books.find(b => b.id === e.bookId)).filter(Boolean) as Book[];
  const bookColors = ['from-purple-600/30 to-blue-600/30', 'from-emerald-600/30 to-teal-600/30', 'from-orange-600/30 to-red-600/30', 'from-pink-600/30 to-rose-600/30'];
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">My Bookshelf</h1><p className="text-helix-muted mt-1">{books.length} books available</p></div>
      {books.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center"><BookOpen className="w-16 h-16 text-helix-muted mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No books yet</h3><p className="text-helix-muted mb-4">Redeem an access code to get started</p><button onClick={() => navigate('/student/redeem')} className="px-6 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90">Redeem Code</button></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((book, i) => {
            const progress = state.progress.find(p => p.userId === user.id && p.bookId === book.id);
            return (
              <div key={book.id} onClick={() => navigate(`/reader/${book.id}`)} className="glass rounded-xl overflow-hidden card-hover cursor-pointer group">
                <div className={`h-40 bg-gradient-to-br ${bookColors[i % bookColors.length]} flex items-center justify-center relative`}>
                  <BookMarked className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-2 right-2"><Lock className="w-4 h-4 text-white/30" /></div>
                  {progress && <div className="absolute bottom-0 left-0 right-0 h-1 bg-helix-bg/50"><div className="h-full bg-helix-accent" style={{ width: `${progress.percentComplete}%` }} /></div>}
                </div>
                <div className="p-5"><h3 className="font-semibold group-hover:text-helix-primary transition-colors">{book.title}</h3><p className="text-sm text-helix-muted mt-1">{book.author}</p>
                  {progress && <div className="mt-3 flex items-center gap-2"><div className="flex-1 h-1.5 bg-helix-bg rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-helix-primary to-helix-accent rounded-full" style={{ width: `${progress.percentComplete}%` }} /></div><span className="text-xs text-helix-muted">{progress.percentComplete}%</span></div>}
                  <div className="flex items-center gap-2 mt-3"><Clock className="w-3.5 h-3.5 text-helix-muted" /><span className="text-xs text-helix-muted">{progress ? `Last read ${new Date(progress.lastReadAt).toLocaleDateString()}` : 'Not started'}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentRedeem() {
  const { state, dispatch } = useApp();
  const user = state.currentUser!;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRedeem = () => {
    setError(''); setSuccess('');
    const normalizedCode = code.trim().toUpperCase();
    const found = state.codes.find(c => c.code === normalizedCode);
    if (!found) { setError('Invalid access code.'); return; }
    if (found.status === 'redeemed') { setError('This code has already been redeemed.'); return; }
    if (found.status === 'expired') { setError('This code has expired.'); return; }
    if (found.status === 'revoked') { setError('This code has been revoked.'); return; }
    if (found.partnerId && found.partnerId !== user.partnerId) { setError('This code is not valid for your organization.'); return; }
    const existingEntitlement = state.entitlements.find(e => e.userId === user.id && e.bookId === found.bookId && !e.revoked);
    if (existingEntitlement) { setError('You already have access to this book.'); return; }
    const entitlement: BookEntitlement = { id: uuidv4(), userId: user.id, bookId: found.bookId, codeId: found.id, grantedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + found.validityDays * 86400000).toISOString(), revoked: false, maxDevices: found.maxDevices, registeredDevices: [] };
    dispatch({ type: 'REDEEM_CODE', payload: { codeId: found.id, userId: user.id, entitlement } });
    dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: user.id, action: 'code.redeemed', resource: 'AccessCode', resourceId: found.id, details: `Redeemed code for ${state.books.find(b => b.id === found.bookId)?.title}`, createdAt: new Date().toISOString() } });
    const book = state.books.find(b => b.id === found.bookId);
    setSuccess(`"${book?.title}" added to your bookshelf! Valid for ${found.validityDays} days.`);
    setCode('');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="text-center"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-helix-primary/20 to-helix-accent/20 flex items-center justify-center mx-auto mb-4"><Key className="w-8 h-8 text-helix-primary" /></div><h1 className="text-2xl font-bold">Redeem Access Code</h1><p className="text-helix-muted mt-2">Enter your access code to unlock a book</p></div>
      <div className="glass rounded-xl p-6 glow">
        <div className="space-y-4">
          <div><label className="block text-sm text-helix-muted mb-1.5">Access Code</label><input value={code} onChange={e => { setCode(e.target.value); setError(''); setSuccess(''); }} placeholder="XXXX-XXXX-XXXX" className="w-full px-4 py-3 bg-helix-bg border border-helix-border rounded-xl text-center font-mono text-lg tracking-wider focus:border-helix-primary focus:outline-none" /></div>
          {error && <div className="flex items-center gap-2 text-helix-danger text-sm bg-helix-danger/10 rounded-lg px-3 py-2"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}</div>}
          {success && <div className="flex items-center gap-2 text-helix-success text-sm bg-helix-success/10 rounded-lg px-3 py-2"><Check className="w-4 h-4 flex-shrink-0" /> {success}</div>}
          <button onClick={handleRedeem} disabled={!code.trim()} className="w-full py-3 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">Redeem Code</button>
        </div>
      </div>
      <div className="glass rounded-xl p-5"><h3 className="font-medium text-sm mb-2">Available codes for testing:</h3><div className="space-y-1">{state.codes.filter(c => c.status === 'generated' || c.status === 'distributed').slice(0, 3).map(c => (<button key={c.id} onClick={() => setCode(c.code)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-helix-bg/50 text-sm font-mono text-helix-accent transition-colors">{c.code}</button>))}</div></div>
    </div>
  );
}

function StudentDevices() {
  const { state, dispatch } = useApp();
  const user = state.currentUser!;
  const devices = state.devices.filter(d => d.userId === user.id);
  const entitlements = state.entitlements.filter(e => e.userId === user.id && !e.revoked);
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Registered Devices</h1><p className="text-helix-muted mt-1">Manage devices authorized to access your books</p></div>
      <div className="bg-helix-primary/10 border border-helix-primary/20 rounded-xl p-4 flex items-start gap-3"><Smartphone className="w-5 h-5 text-helix-primary mt-0.5" /><div><p className="text-sm font-medium">Device Limit Enforcement</p><p className="text-xs text-helix-muted mt-1">Each book entitlement has a maximum device limit. Browser-based device identification is imperfect and cannot guarantee physical-device identity in every situation.</p></div></div>
      <div className="space-y-4">
        {entitlements.map(ent => {
          const book = state.books.find(b => b.id === ent.bookId);
          const entDevices = devices.filter(d => ent.registeredDevices.includes(d.deviceFingerprint));
          return (
            <div key={ent.id} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">{book?.title || 'Unknown Book'}</h3><span className="text-xs text-helix-muted">{entDevices.length}/{ent.maxDevices} devices</span></div>
              <div className="h-1.5 bg-helix-bg rounded-full overflow-hidden mb-4"><div className="h-full bg-gradient-to-r from-helix-primary to-helix-accent rounded-full" style={{ width: `${(entDevices.length / ent.maxDevices) * 100}%` }} /></div>
              {entDevices.length === 0 ? <p className="text-sm text-helix-muted">No devices registered yet. Devices are registered when you open the book.</p> : (
                <div className="space-y-2">{entDevices.map(d => (<div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-helix-bg/50"><div className="flex items-center gap-3"><Smartphone className="w-4 h-4 text-helix-muted" /><div><p className="text-sm">{d.deviceName}</p><p className="text-xs text-helix-muted">Last used: {new Date(d.lastUsedAt).toLocaleDateString()}</p></div></div></div>))}</div>
              )}
            </div>
          );
        })}
        {entitlements.length === 0 && <div className="glass rounded-xl p-8 text-center"><p className="text-helix-muted">No active entitlements. Redeem a code to get started.</p></div>}
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
      <div><h1 className="text-2xl font-bold">My Progress</h1><p className="text-helix-muted mt-1">Track your reading activity</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Books Reading" value={progress.length} color="primary" />
        <StatCard icon={Clock} label="Total Time" value={`${Math.round(progress.reduce((a, p) => a + p.totalReadTime, 0) / 60)} min`} color="accent" />
        <StatCard icon={TrendingUp} label="Avg. Progress" value={`${progress.length > 0 ? Math.round(progress.reduce((a, p) => a + p.percentComplete, 0) / progress.length) : 0}%`} color="success" />
      </div>
      <div className="space-y-4">
        {progress.map(p => { const book = state.books.find(b => b.id === p.bookId); if (!book) return null; return (<div key={p.bookId} className="glass rounded-xl p-5"><div className="flex items-start justify-between"><div><h3 className="font-semibold">{book.title}</h3><p className="text-sm text-helix-muted mt-1">Chapter {p.currentChapter + 1} · Page {p.currentPage}</p></div><span className="text-lg font-bold text-helix-primary">{p.percentComplete}%</span></div><div className="mt-3 h-2 bg-helix-bg rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-helix-primary to-helix-accent rounded-full" style={{ width: `${p.percentComplete}%` }} /></div><div className="flex items-center gap-4 mt-3 text-xs text-helix-muted"><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.round(p.totalReadTime / 60)} min read</span><span>Last read: {new Date(p.lastReadAt).toLocaleDateString()}</span></div></div>); })}
      </div>
    </div>
  );
}

function StudentBookmarks() {
  const { state, dispatch } = useApp();
  const user = state.currentUser!;
  const bookmarks = state.bookmarks.filter(b => b.userId === user.id);
  const highlights = state.highlights.filter(h => h.userId === user.id);
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Bookmarks & Notes</h1><p className="text-helix-muted mt-1">Your saved locations and highlights</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Bookmark className="w-5 h-5 text-helix-primary" /> Bookmarks ({bookmarks.length})</h3>{bookmarks.length === 0 ? <p className="text-sm text-helix-muted">No bookmarks yet.</p> : (<div className="space-y-3">{bookmarks.map(bm => { const book = state.books.find(b => b.id === bm.bookId); return (<div key={bm.id} className="flex items-start justify-between p-3 rounded-lg bg-helix-bg/50"><div><p className="text-sm font-medium">{book?.title}</p><p className="text-xs text-helix-muted mt-0.5">Ch. {bm.chapter + 1} {bm.label ? `· ${bm.label}` : ''}</p></div><button onClick={() => dispatch({ type: 'DELETE_BOOKMARK', payload: bm.id })} className="text-helix-muted hover:text-helix-danger"><Trash2 className="w-4 h-4" /></button></div>); })}</div>)}</div>
        <div className="glass rounded-xl p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Highlighter className="w-5 h-5 text-helix-accent" /> Highlights ({highlights.length})</h3>{highlights.length === 0 ? <p className="text-sm text-helix-muted">No highlights yet.</p> : (<div className="space-y-3">{highlights.map(hl => { const book = state.books.find(b => b.id === hl.bookId); const colorClasses: Record<string, string> = { yellow: 'border-yellow-500/50 bg-yellow-500/5', green: 'border-emerald-500/50 bg-emerald-500/5', blue: 'border-blue-500/50 bg-blue-500/5', pink: 'border-pink-500/50 bg-pink-500/5' }; return (<div key={hl.id} className={`p-3 rounded-lg border-l-2 ${colorClasses[hl.color]}`}><p className="text-sm italic">"{hl.text}"</p><div className="flex items-center justify-between mt-2"><p className="text-xs text-helix-muted">{book?.title} · Ch. {hl.chapter + 1}</p><button onClick={() => dispatch({ type: 'DELETE_HIGHLIGHT', payload: hl.id })} className="text-helix-muted hover:text-helix-danger"><Trash2 className="w-3.5 h-3.5" /></button></div>{hl.note && <p className="text-xs text-helix-muted mt-1 italic">Note: {hl.note}</p>}</div>); })}</div>)}</div>
      </div>
    </div>
  );
}

// ==================== SECURE EBOOK READER ====================
function EbookReader() {
  const { bookId } = useParams();
  const { state, dispatch, getBookContent } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser!;
  const book = state.books.find(b => b.id === bookId);
  const content = getBookContent(bookId || '');
  const entitlement = state.entitlements.find(e => e.userId === user.id && e.bookId === bookId && !e.revoked && (!e.expiresAt || new Date(e.expiresAt) > new Date()));
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => { const progress = state.progress.find(p => p.userId === user.id && p.bookId === bookId); if (progress) setCurrentChapter(progress.currentChapter); }, [bookId]);
  useEffect(() => {
    if (!bookId) return;
    const chapterProgress = Math.round(((currentChapter + 1) / content.chapters.length) * 100);
    dispatch({ type: 'UPDATE_PROGRESS', payload: { userId: user.id, bookId, currentChapter, currentPage: 1, percentComplete: Math.min(chapterProgress, 100), lastReadAt: new Date().toISOString(), totalReadTime: (state.progress.find(p => p.userId === user.id && p.bookId === bookId)?.totalReadTime || 0) + 60 } });
  }, [currentChapter, bookId]);

  // Register device on first read
  useEffect(() => {
    if (!entitlement || !bookId) return;
    const fp = 'device-fp-' + (navigator.userAgent || 'unknown').slice(0, 20).replace(/\s/g, '-').toLowerCase();
    const existing = state.devices.find(d => d.deviceFingerprint === fp && d.userId === user.id);
    if (!existing && entitlement.registeredDevices.length < entitlement.maxDevices) {
      const device = { id: uuidv4(), userId: user.id, deviceFingerprint: fp, deviceName: `${navigator.platform || 'Unknown'} browser`, registeredAt: new Date().toISOString(), lastUsedAt: new Date().toISOString() };
      dispatch({ type: 'REGISTER_DEVICE', payload: device });
    }
  }, [bookId]);

  // Prevent print and download
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) { e.preventDefault(); } };
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => { document.removeEventListener('keydown', handleKeyDown); document.removeEventListener('contextmenu', handleContextMenu); };
  }, []);

  if (!book || !entitlement) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="text-center"><AlertCircle className="w-16 h-16 text-helix-danger mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">Access Denied</h2><p className="text-helix-muted mb-4">You don't have access to this book or your entitlement has expired.</p><button onClick={() => navigate('/student')} className="px-6 py-2.5 bg-helix-primary text-white rounded-xl text-sm font-medium">Back to Bookshelf</button></div></div>);
  }

  const bookmarks = state.bookmarks.filter(b => b.userId === user.id && b.bookId === bookId);
  const toggleSpeech = () => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
    else { const text = content.chapters[currentChapter]?.content || ''; const utterance = new SpeechSynthesisUtterance(text); utterance.rate = 0.9; utterance.onend = () => setIsSpeaking(false); window.speechSynthesis.speak(utterance); setIsSpeaking(true); }
  };
  const addBookmark = () => { dispatch({ type: 'ADD_BOOKMARK', payload: { id: uuidv4(), userId: user.id, bookId: bookId!, chapter: currentChapter, page: 1, createdAt: new Date().toISOString() } }); dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Bookmark added', type: 'success' } }); };
  const chapter = content.chapters[currentChapter];
  const paragraphs = chapter?.content.split('\n\n').filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-helix-bg flex flex-col" onCopy={e => e.preventDefault()} onCut={e => e.preventDefault()}>
      <header className="fixed top-0 left-0 right-0 h-14 bg-helix-surface/95 backdrop-blur-sm border-b border-helix-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3"><button onClick={() => navigate('/student')} className="p-2 rounded-lg hover:bg-helix-card transition-colors"><ChevronLeft className="w-5 h-5" /></button><div className="hidden sm:block"><h1 className="text-sm font-semibold truncate max-w-[200px]">{book.title}</h1><p className="text-xs text-helix-muted">{chapter?.title}</p></div></div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-lg hover:bg-helix-card transition-colors" title="Search"><Search className="w-4 h-4" /></button>
          <button onClick={() => setShowToc(!showToc)} className="p-2 rounded-lg hover:bg-helix-card transition-colors" title="Contents"><Layers className="w-4 h-4" /></button>
          <button onClick={addBookmark} className="p-2 rounded-lg hover:bg-helix-card transition-colors" title="Bookmark"><Bookmark className="w-4 h-4" /></button>
          <button onClick={toggleSpeech} className={`p-2 rounded-lg transition-colors ${isSpeaking ? 'bg-helix-primary/20 text-helix-primary' : 'hover:bg-helix-card'}`} title="Read Aloud">{isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}</button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg hover:bg-helix-card transition-colors" title="Settings"><Settings className="w-4 h-4" /></button>
        </div>
      </header>
      {showSearch && <div className="fixed top-14 left-0 right-0 bg-helix-surface border-b border-helix-border z-40 p-3 animate-fade-in"><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search in book..." autoFocus className="w-full px-4 py-2 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" /></div>}
      {showSettings && (
        <div className="fixed top-14 right-4 bg-helix-surface border border-helix-border rounded-xl p-4 z-40 w-64 animate-fade-in shadow-xl">
          <h3 className="font-medium text-sm mb-3">Reading Settings</h3>
          <div className="space-y-4">
            <div><label className="text-xs text-helix-muted block mb-1">Font Size</label><div className="flex items-center gap-2"><button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="px-2 py-1 bg-helix-card rounded text-xs">A-</button><span className="text-sm flex-1 text-center">{fontSize}px</span><button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="px-2 py-1 bg-helix-card rounded text-xs">A+</button></div></div>
          </div>
        </div>
      )}
      {showToc && (
        <div className="fixed top-14 left-0 bottom-0 w-72 bg-helix-surface border-r border-helix-border z-40 overflow-y-auto animate-slide-in">
          <div className="p-4 border-b border-helix-border flex items-center justify-between"><h3 className="font-semibold text-sm">Table of Contents</h3><button onClick={() => setShowToc(false)} className="p-1 rounded hover:bg-helix-card"><X className="w-4 h-4" /></button></div>
          <nav className="p-3 space-y-1">{content.chapters.map((ch, i) => (<button key={i} onClick={() => { setCurrentChapter(i); setShowToc(false); }} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${i === currentChapter ? 'bg-helix-primary/20 text-helix-primary-light font-medium' : 'text-helix-muted hover:text-helix-text hover:bg-helix-card'}`}>{ch.title}</button>))}</nav>
          {bookmarks.length > 0 && <div className="p-3 border-t border-helix-border"><h4 className="text-xs text-helix-muted font-medium mb-2 px-3">Bookmarks</h4>{bookmarks.map(bm => (<button key={bm.id} onClick={() => { setCurrentChapter(bm.chapter); setShowToc(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-helix-muted hover:text-helix-text hover:bg-helix-card flex items-center gap-2"><Bookmark className="w-3.5 h-3.5 text-helix-primary" /><span className="truncate">{bm.label || `Ch. ${bm.chapter + 1}`}</span></button>))}</div>}
        </div>
      )}
      <main className="flex-1 pt-14 pb-20">
        <article className="max-w-2xl mx-auto px-6 py-10 select-none" style={{ userSelect: 'none' }}>
          <div className="mb-8"><p className="text-xs text-helix-primary font-medium uppercase tracking-wider mb-2">Chapter {currentChapter + 1} of {content.chapters.length}</p><h1 className="text-2xl sm:text-3xl font-bold">{chapter?.title}</h1></div>
          <div className="reader-content" style={{ fontSize: `${fontSize}px` }}>
            {paragraphs.map((para, i) => {
              const isHeading = para.startsWith('**') && para.endsWith('**');
              const isList = para.startsWith('- ');
              const isNumberedList = para.match(/^\d+\./);
              if (isHeading) return <h2 key={i} className="text-xl font-bold mt-8 mb-4 gradient-text">{para.replace(/\*\*/g, '')}</h2>;
              if (isList) { const items = para.split('\n').filter(l => l.startsWith('- ')); return (<ul key={i} className="space-y-2 my-4">{items.map((item, j) => (<li key={j} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-helix-primary mt-2.5 flex-shrink-0" /><span className="text-helix-text/90">{item.replace('- ', '').replace(/\*\*/g, '')}</span></li>))}</ul>); }
              if (isNumberedList) { const items = para.split('\n').filter(l => l.match(/^\d+\./)); return (<ol key={i} className="space-y-2 my-4">{items.map((item, j) => (<li key={j} className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-helix-primary/20 text-helix-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{j + 1}</span><span className="text-helix-text/90">{item.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}</span></li>))}</ol>); }
              return <p key={i} className="text-helix-text/85 mb-4 leading-relaxed">{para.replace(/\*\*/g, '')}</p>;
            })}
          </div>
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-helix-border">
            <button onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))} disabled={currentChapter === 0} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-helix-card text-helix-text hover:bg-helix-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"><ChevronLeft className="w-4 h-4" /> Previous</button>
            <span className="text-sm text-helix-muted">{currentChapter + 1} / {content.chapters.length}</span>
            <button onClick={() => setCurrentChapter(Math.min(content.chapters.length - 1, currentChapter + 1))} disabled={currentChapter === content.chapters.length - 1} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-helix-card text-helix-text hover:bg-helix-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium">Next <ChevronRight className="w-4 h-4" /></button>
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
  if (!state.currentUser) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(state.currentUser.role)) return <Navigate to="/" replace />;
  if (state.currentUser.status !== 'active') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { state } = useApp();
  if (state.currentUser) {
    if (state.currentUser.status !== 'active') return <><div className="min-h-screen flex items-center justify-center"><div className="text-center glass rounded-xl p-8"><AlertTriangle className="w-12 h-12 text-helix-warning mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">Account Suspended</h2><p className="text-helix-muted mb-4">Your account has been suspended. Contact support.</p><button onClick={() => window.location.reload()} className="px-4 py-2 bg-helix-card rounded-lg text-sm">Sign out</button></div></div></>;
    const routes: Record<string, string> = { super_admin: '/admin', support_agent: '/support', partner_admin: '/partner', student: '/student' };
    return <Navigate to={routes[state.currentUser.role] || '/'} replace />;
  }
  return <AuthPage />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthRoute />} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><SuperAdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/partners" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminPartners /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/books" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminBooks /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminOrders /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/codes" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminCodes /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminUsers /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminReports /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminAudit /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminSettings /></AppLayout></ProtectedRoute>} />
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
