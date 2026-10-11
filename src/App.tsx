import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect, useMemo } from 'react';
import type { UserRole, LearningPartner, Book, Classroom, AccessCodeBatch, AccessCode, BookEntitlement } from './types';
import {
  BookOpen, Users, GraduationCap, Shield, Settings, LogOut, Home, Library,
  Key, BarChart3, FileText, Search, Plus, Edit, Trash2, Eye, EyeOff,
  ChevronRight, ChevronLeft, Bookmark, Highlighter, Volume2, VolumeX,
  Menu, X, Bell, User, BookMarked, Clock, TrendingUp, AlertCircle,
  Check, Download, Filter, MoreVertical, ArrowRight, Layers, Globe,
  Award, Target, Zap, Star, MessageSquare, Hash
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
      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
        dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: user.id, action: 'auth.login', resource: 'User', details: `User ${user.name} logged in`, createdAt: new Date().toISOString() } });
      } else {
        setError('Invalid credentials. Try demo accounts below.');
      }
    } else {
      if (!name || !email) { setError('Please fill all fields'); return; }
      const newUser = { id: uuidv4(), email, name, role: 'student' as const, createdAt: new Date().toISOString() };
      dispatch({ type: 'ADD_USER', payload: newUser });
      dispatch({ type: 'LOGIN', payload: newUser });
    }
  };

  const demoAccounts = [
    { email: 'admin@kitabo.io', label: 'Super Admin', role: 'super_admin' },
    { email: 'admin@stanford.edu', label: 'Partner Admin', role: 'partner_admin' },
    { email: 'alice@student.edu', label: 'Student', role: 'student' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-helix-bg via-helix-surface to-helix-bg" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-helix-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-helix-accent/10 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Kitabo</h1>
          </div>
          <p className="text-helix-muted">Digital Learning Platform</p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8 glow">
          <h2 className="text-xl font-semibold mb-6">{isLogin ? 'Sign In' : 'Create Account'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm text-helix-muted mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-helix-bg border border-helix-border rounded-xl text-helix-text placeholder-helix-muted/50 focus:border-helix-primary focus:outline-none transition-colors"
                  placeholder="Enter your name" />
              </div>
            )}
            <div>
              <label className="block text-sm text-helix-muted mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-helix-bg border border-helix-border rounded-xl text-helix-text placeholder-helix-muted/50 focus:border-helix-primary focus:outline-none transition-colors"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-helix-muted mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-helix-bg border border-helix-border rounded-xl text-helix-text placeholder-helix-muted/50 focus:border-helix-primary focus:outline-none transition-colors"
                placeholder="••••••••" />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-helix-danger text-sm bg-helix-danger/10 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white font-medium rounded-xl hover:opacity-90 transition-opacity">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="w-full mt-4 text-sm text-helix-muted hover:text-helix-primary transition-colors">
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 glass rounded-2xl p-6">
          <p className="text-sm text-helix-muted mb-3 font-medium">Demo Accounts (click to login):</p>
          <div className="space-y-2">
            {demoAccounts.map(acc => (
              <button key={acc.email} onClick={() => { setEmail(acc.email); setPassword('demo'); }}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-helix-bg/50 rounded-lg hover:bg-helix-card transition-colors text-left group">
                <div>
                  <span className="text-sm font-medium">{acc.label}</span>
                  <span className="block text-xs text-helix-muted">{acc.email}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-helix-muted group-hover:text-helix-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SIDEBAR NAVIGATION ====================
function Sidebar({ role, partnerId }: { role: string; partnerId?: string }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const adminLinks = [
    { to: '/admin', icon: Home, label: 'Dashboard' },
    { to: '/admin/partners', icon: Globe, label: 'Partners' },
    { to: '/admin/books', icon: Library, label: 'Book Catalog' },
    { to: '/admin/codes', icon: Key, label: 'Access Codes' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/audit', icon: FileText, label: 'Audit Log' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const partnerLinks = [
    { to: '/partner', icon: Home, label: 'Dashboard' },
    { to: '/partner/classrooms', icon: GraduationCap, label: 'Classrooms' },
    { to: '/partner/students', icon: Users, label: 'Students' },
    { to: '/partner/books', icon: Library, label: 'Books' },
    { to: '/partner/codes', icon: Key, label: 'Access Codes' },
    { to: '/partner/reports', icon: BarChart3, label: 'Reports' },
  ];

  const studentLinks = [
    { to: '/student', icon: Home, label: 'My Bookshelf' },
    { to: '/student/redeem', icon: Key, label: 'Redeem Code' },
    { to: '/student/progress', icon: TrendingUp, label: 'My Progress' },
    { to: '/student/bookmarks', icon: Bookmark, label: 'Bookmarks & Notes' },
  ];

  const links = role === 'super_admin' ? adminLinks : role === 'partner_admin' ? partnerLinks : studentLinks;

  return (
    <aside className={`fixed left-0 top-0 h-full bg-helix-surface border-r border-helix-border z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} hidden lg:flex flex-col`}>
      <div className="p-4 flex items-center justify-between border-b border-helix-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold gradient-text">Kitabo</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-helix-card transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(link => (
          <Link key={link.to} to={link.to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-helix-muted hover:text-helix-text hover:bg-helix-card transition-all group">
            <link.icon className="w-5 h-5 group-hover:text-helix-primary transition-colors" />
            {!collapsed && <span className="text-sm font-medium">{link.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-helix-border">
        <button onClick={() => { dispatch({ type: 'LOGOUT' }); navigate('/'); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-helix-muted hover:text-helix-danger hover:bg-helix-danger/10 transition-all w-full">
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

// ==================== MOBILE NAV ====================
function MobileNav({ role }: { role: string }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = role === 'super_admin'
    ? [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/partners', label: 'Partners' }, { to: '/admin/books', label: 'Books' }, { to: '/admin/codes', label: 'Codes' }]
    : role === 'partner_admin'
    ? [{ to: '/partner', label: 'Dashboard' }, { to: '/partner/classrooms', label: 'Classrooms' }, { to: '/partner/students', label: 'Students' }, { to: '/partner/codes', label: 'Codes' }]
    : [{ to: '/student', label: 'Bookshelf' }, { to: '/student/redeem', label: 'Redeem' }, { to: '/student/progress', label: 'Progress' }];

  return (
    <div className="lg:hidden">
      <div className="fixed top-0 left-0 right-0 h-14 bg-helix-surface border-b border-helix-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm gradient-text">Kitabo</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-helix-card">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 top-14 bg-helix-bg/95 z-40 p-4 animate-fade-in">
          <nav className="space-y-2">
            {links.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl bg-helix-card text-helix-text hover:bg-helix-primary/20 transition-colors font-medium">
                {link.label}
              </Link>
            ))}
            <button onClick={() => { dispatch({ type: 'LOGOUT' }); navigate('/'); }}
              className="block w-full text-left px-4 py-3 rounded-xl text-helix-danger hover:bg-helix-danger/10 transition-colors font-medium">
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

// ==================== NOTIFICATIONS ====================
function Notifications() {
  const { state, dispatch } = useApp();
  if (state.notifications.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {state.notifications.map(n => (
        <div key={n.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl glass animate-slide-in ${n.type === 'success' ? 'border-helix-success/30' : n.type === 'error' ? 'border-helix-danger/30' : 'border-helix-primary/30'}`}>
          {n.type === 'success' ? <Check className="w-5 h-5 text-helix-success" /> : n.type === 'error' ? <AlertCircle className="w-5 h-5 text-helix-danger" /> : <Bell className="w-5 h-5 text-helix-primary" />}
          <span className="text-sm flex-1">{n.message}</span>
          <button onClick={() => dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id })} className="text-helix-muted hover:text-helix-text">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ==================== STAT CARD ====================
function StatCard({ icon: Icon, label, value, trend, color = 'primary' }: { icon: any; label: string; value: string | number; trend?: string; color?: string }) {
  const colors: Record<string, string> = {
    primary: 'from-helix-primary/20 to-helix-primary/5 border-helix-primary/20',
    accent: 'from-helix-accent/20 to-helix-accent/5 border-helix-accent/20',
    success: 'from-helix-success/20 to-helix-success/5 border-helix-success/20',
    warning: 'from-helix-warning/20 to-helix-warning/5 border-helix-warning/20',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5 card-hover`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-helix-muted mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && <p className="text-xs text-helix-success mt-1">{trend}</p>}
        </div>
        <div className="p-2 rounded-lg bg-helix-bg/50">
          <Icon className="w-5 h-5 text-helix-muted" />
        </div>
      </div>
    </div>
  );
}

// ==================== SUPER ADMIN DASHBOARD ====================
function SuperAdminDashboard() {
  const { state } = useApp();
  const chartData = [
    { month: 'Jul', partners: 2, students: 120, codes: 200 },
    { month: 'Aug', partners: 2, students: 280, codes: 450 },
    { month: 'Sep', partners: 3, students: 450, codes: 680 },
    { month: 'Oct', partners: 3, students: 557, codes: 690 },
  ];

  const codeStatusData = [
    { name: 'Redeemed', value: state.codes.filter(c => c.status === 'redeemed').length, color: '#00b894' },
    { name: 'Unused', value: state.codes.filter(c => c.status === 'unused').length, color: '#6c5ce7' },
    { name: 'Expired', value: state.codes.filter(c => c.status === 'expired').length, color: '#fdcb6e' },
    { name: 'Revoked', value: state.codes.filter(c => c.status === 'revoked').length, color: '#e17055' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <p className="text-helix-muted mt-1">Overview of platform activity and metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Globe} label="Learning Partners" value={state.partners.length} trend="+1 this month" color="primary" />
        <StatCard icon={Library} label="Published Books" value={state.books.filter(b => b.status === 'published').length} color="accent" />
        <StatCard icon={Users} label="Total Students" value={state.users.filter(u => u.role === 'student').length} trend="+12% growth" color="success" />
        <StatCard icon={Key} label="Active Codes" value={state.codes.filter(c => c.status === 'unused').length} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Platform Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="month" stroke="#8888a0" fontSize={12} />
              <YAxis stroke="#8888a0" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="students" stroke="#6c5ce7" fill="#6c5ce7" fillOpacity={0.1} />
              <Area type="monotone" dataKey="codes" stroke="#00cec9" fill="#00cec9" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Code Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={codeStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {codeStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {codeStatusData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-helix-muted">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {state.auditLogs.slice(0, 6).map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-helix-bg/50">
                <div className="w-8 h-8 rounded-full bg-helix-primary/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-helix-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm truncate">{log.details}</p>
                  <p className="text-xs text-helix-muted mt-0.5">{new Date(log.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Learning Partners</h3>
          <div className="space-y-3">
            {state.partners.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-helix-bg/50">
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-helix-muted">{p.studentCount} students · {p.classroomCount} classrooms</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-helix-success/20 text-helix-success' : p.status === 'suspended' ? 'bg-helix-danger/20 text-helix-danger' : 'bg-helix-muted/20 text-helix-muted'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SUPER ADMIN PAGES ====================
function AdminPartners() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleCreate = () => {
    if (!formData.name) return;
    const partner: LearningPartner = { id: uuidv4(), name: formData.name, description: formData.description, status: 'active', adminId: '', studentCount: 0, classroomCount: 0, bookCount: 0, codeQuota: 500, codesUsed: 0, canGenerateCodes: true, createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_PARTNER', payload: partner });
    dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: state.currentUser!.id, action: 'partner.created', resource: 'LearningPartner', resourceId: partner.id, details: `Created ${partner.name}`, createdAt: new Date().toISOString() } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Partner "${partner.name}" created`, type: 'success' } });
    setShowForm(false);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learning Partners</h1>
          <p className="text-helix-muted mt-1">Manage partner organizations</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Partner
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <h3 className="font-semibold mb-4">New Learning Partner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Organization name" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" />
            <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Description" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium hover:opacity-90">Create</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-helix-card text-helix-muted rounded-lg text-sm hover:text-helix-text">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.partners.map(p => (
          <div key={p.id} className="glass rounded-xl p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-helix-primary/20 to-helix-accent/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-helix-primary" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-helix-success/20 text-helix-success' : p.status === 'suspended' ? 'bg-helix-danger/20 text-helix-danger' : 'bg-helix-muted/20 text-helix-muted'}`}>
                {p.status}
              </span>
            </div>
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-helix-muted mt-1 line-clamp-2">{p.description}</p>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-helix-border">
              <div className="text-center">
                <p className="text-lg font-bold">{p.studentCount}</p>
                <p className="text-xs text-helix-muted">Students</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{p.classroomCount}</p>
                <p className="text-xs text-helix-muted">Classes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{p.bookCount}</p>
                <p className="text-xs text-helix-muted">Books</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminBooks() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ title: '', author: '', description: '', categories: '' });

  const filteredBooks = state.books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    if (!formData.title || !formData.author) return;
    const book: Book = { id: uuidv4(), title: formData.title, author: formData.author, description: formData.description, coverUrl: '', language: 'English', pageCount: 300, categories: formData.categories.split(',').map(c => c.trim()).filter(Boolean), tags: [], status: 'draft', version: '1.0.0', approvedPartners: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    dispatch({ type: 'ADD_BOOK', payload: book });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Book "${book.title}" added`, type: 'success' } });
    setShowForm(false);
    setFormData({ title: '', author: '', description: '', categories: '' });
  };

  const bookColors = ['from-purple-500/20 to-blue-500/20', 'from-emerald-500/20 to-teal-500/20', 'from-orange-500/20 to-red-500/20', 'from-pink-500/20 to-rose-500/20', 'from-cyan-500/20 to-blue-500/20', 'from-amber-500/20 to-yellow-500/20'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Book Catalog</h1>
          <p className="text-helix-muted mt-1">Manage the global book library</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Book
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <h3 className="font-semibold mb-4">Upload New Book</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Book title" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" />
            <input value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} placeholder="Author" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" />
            <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Description" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none md:col-span-2" />
            <input value={formData.categories} onChange={e => setFormData({ ...formData, categories: e.target.value })} placeholder="Categories (comma-separated)" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none md:col-span-2" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium hover:opacity-90">Add Book</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-helix-card text-helix-muted rounded-lg text-sm hover:text-helix-text">Cancel</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-helix-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books..." className="w-full pl-10 pr-4 py-3 bg-helix-surface border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.map((book, i) => (
          <div key={book.id} className="glass rounded-xl overflow-hidden card-hover">
            <div className={`h-32 bg-gradient-to-br ${bookColors[i % bookColors.length]} flex items-center justify-center`}>
              <BookMarked className="w-12 h-12 text-white/30" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{book.title}</h3>
                  <p className="text-sm text-helix-muted">{book.author}</p>
                </div>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${book.status === 'published' ? 'bg-helix-success/20 text-helix-success' : 'bg-helix-warning/20 text-helix-warning'}`}>
                  {book.status}
                </span>
              </div>
              <p className="text-xs text-helix-muted mt-2 line-clamp-2">{book.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-helix-muted">
                <span>{book.pageCount} pages</span>
                <span>·</span>
                <span>v{book.version}</span>
                <span>·</span>
                <span>{book.approvedPartners.length} partners</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCodes() {
  const { state, dispatch } = useApp();
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({ bookId: '', partnerId: '', count: 10, name: '' });

  const handleGenerate = () => {
    if (!genForm.bookId || !genForm.name) return;
    const batchId = uuidv4();
    const batch: AccessCodeBatch = { id: batchId, name: genForm.name, partnerId: genForm.partnerId || undefined, bookId: genForm.bookId, codeCount: genForm.count, codesGenerated: genForm.count, codesRedeemed: 0, status: 'active', createdAt: new Date().toISOString() };
    const codes: AccessCode[] = Array.from({ length: genForm.count }, () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 12; i++) { if (i > 0 && i % 4 === 0) code += '-'; code += chars[Math.floor(Math.random() * chars.length)]; }
      return { id: uuidv4(), code, batchId, bookId: genForm.bookId, partnerId: genForm.partnerId || undefined, status: 'unused' as const, createdAt: new Date().toISOString() };
    });
    dispatch({ type: 'ADD_CODE_BATCH', payload: { batch, codes } });
    dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: state.currentUser!.id, action: 'code.batch_created', resource: 'AccessCodeBatch', resourceId: batchId, details: `Generated ${genForm.count} codes for batch "${genForm.name}"`, createdAt: new Date().toISOString() } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Generated ${genForm.count} access codes`, type: 'success' } });
    setShowGenerate(false);
    setGenForm({ bookId: '', partnerId: '', count: 10, name: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Access Codes</h1>
          <p className="text-helix-muted mt-1">Manage code batches and distribution</p>
        </div>
        <button onClick={() => setShowGenerate(!showGenerate)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> Generate Batch
        </button>
      </div>

      {showGenerate && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <h3 className="font-semibold mb-4">Generate Code Batch</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={genForm.name} onChange={e => setGenForm({ ...genForm, name: e.target.value })} placeholder="Batch name" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" />
            <select value={genForm.bookId} onChange={e => setGenForm({ ...genForm, bookId: e.target.value })} className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none text-helix-text">
              <option value="">Select book</option>
              {state.books.filter(b => b.status === 'published').map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
            <select value={genForm.partnerId} onChange={e => setGenForm({ ...genForm, partnerId: e.target.value })} className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none text-helix-text">
              <option value="">All partners (optional)</option>
              {state.partners.filter(p => p.status === 'active').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" value={genForm.count} onChange={e => setGenForm({ ...genForm, count: parseInt(e.target.value) || 1 })} min={1} max={100} placeholder="Number of codes" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleGenerate} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium hover:opacity-90">Generate</button>
            <button onClick={() => setShowGenerate(false)} className="px-4 py-2 bg-helix-card text-helix-muted rounded-lg text-sm hover:text-helix-text">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard icon={Key} label="Total Codes" value={state.codes.length} color="primary" />
        <StatCard icon={Check} label="Redeemed" value={state.codes.filter(c => c.status === 'redeemed').length} color="success" />
        <StatCard icon={Hash} label="Available" value={state.codes.filter(c => c.status === 'unused').length} color="accent" />
        <StatCard icon={AlertCircle} label="Revoked/Expired" value={state.codes.filter(c => c.status === 'revoked' || c.status === 'expired').length} color="warning" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-helix-border">
          <h3 className="font-semibold">Code Batches</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50">
              <tr>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Batch</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Book</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Generated</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Redeemed</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {state.batches.map(batch => (
                <tr key={batch.id} className="border-t border-helix-border hover:bg-helix-bg/30">
                  <td className="px-4 py-3 font-medium">{batch.name}</td>
                  <td className="px-4 py-3 text-helix-muted">{state.books.find(b => b.id === batch.bookId)?.title || 'Unknown'}</td>
                  <td className="px-4 py-3">{batch.codesGenerated}</td>
                  <td className="px-4 py-3">{batch.codesRedeemed}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${batch.status === 'active' ? 'bg-helix-success/20 text-helix-success' : 'bg-helix-muted/20 text-helix-muted'}`}>
                      {batch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  const { state } = useApp();
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const filtered = roleFilter === 'all' ? state.users : state.users.filter(u => u.role === roleFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-helix-muted mt-1">Manage platform users and roles</p>
      </div>

      <div className="flex gap-2">
        {['all', 'super_admin', 'partner_admin', 'student'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${roleFilter === r ? 'bg-helix-primary text-white' : 'bg-helix-card text-helix-muted hover:text-helix-text'}`}>
            {r === 'all' ? 'All' : r === 'super_admin' ? 'Admins' : r === 'partner_admin' ? 'Partners' : 'Students'}
          </button>
        ))}
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50">
              <tr>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">User</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Email</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Role</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Partner</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-t border-helix-border hover:bg-helix-bg/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center text-xs font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-helix-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'super_admin' ? 'bg-helix-primary/20 text-helix-primary-light' : user.role === 'partner_admin' ? 'bg-helix-accent/20 text-helix-accent' : 'bg-helix-muted/20 text-helix-muted'}`}>
                      {user.role === 'super_admin' ? 'Admin' : user.role === 'partner_admin' ? 'Partner' : 'Student'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-helix-muted">{user.partnerId ? state.partners.find(p => p.id === user.partnerId)?.name || '-' : '-'}</td>
                  <td className="px-4 py-3 text-helix-muted">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminAudit() {
  const { state } = useApp();
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-helix-muted mt-1">Platform activity and security events</p>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50">
              <tr>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Time</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">User</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Action</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {state.auditLogs.map(log => (
                <tr key={log.id} className="border-t border-helix-border hover:bg-helix-bg/30">
                  <td className="px-4 py-3 text-helix-muted whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{state.users.find(u => u.id === log.userId)?.name || 'System'}</td>
                  <td className="px-4 py-3"><code className="px-2 py-0.5 bg-helix-bg rounded text-xs text-helix-accent">{log.action}</code></td>
                  <td className="px-4 py-3 text-helix-muted">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-helix-muted mt-1">Configure global platform policies</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-helix-primary" /> Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">MFA for Admins</p><p className="text-xs text-helix-muted">Require MFA for super administrators</p></div>
              <div className="w-10 h-6 bg-helix-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Rate Limiting</p><p className="text-xs text-helix-muted">Limit API requests per minute</p></div>
              <div className="w-10 h-6 bg-helix-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Session Timeout</p><p className="text-xs text-helix-muted">Auto-logout after inactivity</p></div>
              <select className="px-3 py-1.5 bg-helix-bg border border-helix-border rounded-lg text-xs text-helix-text"><option>30 minutes</option><option>1 hour</option><option>4 hours</option></select>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-helix-accent" /> Access Codes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Partner Code Generation</p><p className="text-xs text-helix-muted">Allow partners to generate own codes</p></div>
              <div className="w-10 h-6 bg-helix-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Default Code Expiration</p>
              <select className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm text-helix-text"><option>30 days</option><option>60 days</option><option>90 days</option><option>Never</option></select>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Max Codes Per Batch</p>
              <input type="number" defaultValue={100} className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm text-helix-text" />
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-helix-success" /> Reader</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Content Protection</p><p className="text-xs text-helix-muted">Disable right-click and copy in reader</p></div>
              <div className="w-10 h-6 bg-helix-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Read Aloud</p><p className="text-xs text-helix-muted">Enable text-to-speech functionality</p></div>
              <div className="w-10 h-6 bg-helix-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Layers className="w-5 h-5 text-helix-warning" /> Storage</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Storage Provider</p>
              <select className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm text-helix-text"><option>S3-Compatible</option><option>Local Filesystem</option></select>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Max Upload Size</p>
              <select className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm text-helix-text"><option>50 MB</option><option>100 MB</option><option>250 MB</option></select>
            </div>
          </div>
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
  const partnerBooks = state.books.filter(b => b.approvedPartners.includes(user.partnerId!));
  const partnerCodes = state.codes.filter(c => c.partnerId === user.partnerId);

  const progressData = [
    { week: 'W1', reading: 45 }, { week: 'W2', reading: 62 }, { week: 'W3', reading: 58 },
    { week: 'W4', reading: 71 }, { week: 'W5', reading: 85 }, { week: 'W6', reading: 78 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="text-helix-muted mt-1">{partner?.name} — Dashboard Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={GraduationCap} label="Classrooms" value={classrooms.length} color="primary" />
        <StatCard icon={Users} label="Students" value={students.length} color="accent" />
        <StatCard icon={Library} label="Books" value={partnerBooks.length} color="success" />
        <StatCard icon={Key} label="Available Codes" value={partnerCodes.filter(c => c.status === 'unused').length} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Reading Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="week" stroke="#8888a0" fontSize={12} />
              <YAxis stroke="#8888a0" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="reading" stroke="#6c5ce7" strokeWidth={2} dot={{ fill: '#6c5ce7' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Recent Classrooms</h3>
          <div className="space-y-3">
            {classrooms.slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-helix-bg/50">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-helix-muted">{c.studentIds.length} students · {c.bookIds.length} books</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'active' ? 'bg-helix-success/20 text-helix-success' : 'bg-helix-muted/20 text-helix-muted'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
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
    const classroom: Classroom = { id: uuidv4(), name: form.name, partnerId: user.partnerId!, instructorIds: [user.id], studentIds: [], bookIds: [], status: 'active', startDate: form.startDate || new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_CLASSROOM', payload: classroom });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Classroom "${classroom.name}" created`, type: 'success' } });
    setShowForm(false);
    setForm({ name: '', startDate: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Classrooms</h1>
          <p className="text-helix-muted mt-1">Manage your classrooms and enrollments</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> New Classroom
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Classroom name" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" />
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none text-helix-text" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium">Create</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-helix-card text-helix-muted rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classrooms.map(c => (
          <div key={c.id} className="glass rounded-xl p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-helix-accent/20 to-helix-primary/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-helix-accent" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'active' ? 'bg-helix-success/20 text-helix-success' : 'bg-helix-muted/20 text-helix-muted'}`}>{c.status}</span>
            </div>
            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-xs text-helix-muted mt-1">Start: {c.startDate}{c.endDate ? ` — End: ${c.endDate}` : ''}</p>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-helix-border text-xs text-helix-muted">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {c.studentIds.length} students</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {c.bookIds.length} books</span>
            </div>
          </div>
        ))}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-helix-muted mt-1">{students.length} enrolled students</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-helix-card border border-helix-border text-helix-text rounded-xl text-sm font-medium hover:border-helix-primary transition-colors">
          <Download className="w-4 h-4" /> Import CSV
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50">
              <tr>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Student</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Email</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Books</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Joined</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const entitlements = state.entitlements.filter(e => e.userId === s.id);
                return (
                  <tr key={s.id} className="border-t border-helix-border hover:bg-helix-bg/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center text-xs font-bold text-white">{s.name.charAt(0)}</div>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-helix-muted">{s.email}</td>
                    <td className="px-4 py-3">{entitlements.length}</td>
                    <td className="px-4 py-3 text-helix-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-helix-muted">{s.lastLogin ? new Date(s.lastLogin).toLocaleDateString() : 'Never'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PartnerBooks() {
  const { state } = useApp();
  const user = state.currentUser!;
  const books = state.books.filter(b => b.approvedPartners.includes(user.partnerId!));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Approved Books</h1>
        <p className="text-helix-muted mt-1">Books available for your organization</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map(book => (
          <div key={book.id} className="glass rounded-xl p-5 card-hover">
            <h3 className="font-semibold">{book.title}</h3>
            <p className="text-sm text-helix-muted mt-1">{book.author}</p>
            <p className="text-xs text-helix-muted mt-2 line-clamp-2">{book.description}</p>
            <div className="flex items-center gap-2 mt-3">
              {book.categories.map(cat => (
                <span key={cat} className="px-2 py-0.5 bg-helix-primary/10 text-helix-primary-light rounded-full text-xs">{cat}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartnerCodes() {
  const { state, dispatch } = useApp();
  const user = state.currentUser!;
  const partner = state.partners.find(p => p.id === user.partnerId);
  const codes = state.codes.filter(c => c.partnerId === user.partnerId);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({ bookId: '', count: 5, name: '' });

  const handleGenerate = () => {
    if (!genForm.bookId || !genForm.name || !partner?.canGenerateCodes) return;
    const batchId = uuidv4();
    const batch: AccessCodeBatch = { id: batchId, name: genForm.name, partnerId: user.partnerId, bookId: genForm.bookId, codeCount: genForm.count, codesGenerated: genForm.count, codesRedeemed: 0, status: 'active', createdAt: new Date().toISOString() };
    const newCodes: AccessCode[] = Array.from({ length: genForm.count }, () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 12; i++) { if (i > 0 && i % 4 === 0) code += '-'; code += chars[Math.floor(Math.random() * chars.length)]; }
      return { id: uuidv4(), code, batchId, bookId: genForm.bookId, partnerId: user.partnerId, status: 'unused' as const, createdAt: new Date().toISOString() };
    });
    dispatch({ type: 'ADD_CODE_BATCH', payload: { batch, codes: newCodes } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Generated ${genForm.count} codes`, type: 'success' } });
    setShowGenerate(false);
    setGenForm({ bookId: '', count: 5, name: '' });
  };

  const approvedBooks = state.books.filter(b => b.approvedPartners.includes(user.partnerId!));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Access Codes</h1>
          <p className="text-helix-muted mt-1">Generate and distribute codes to students</p>
        </div>
        {partner?.canGenerateCodes && (
          <button onClick={() => setShowGenerate(!showGenerate)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Generate Codes
          </button>
        )}
      </div>

      {showGenerate && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input value={genForm.name} onChange={e => setGenForm({ ...genForm, name: e.target.value })} placeholder="Batch name" className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" />
            <select value={genForm.bookId} onChange={e => setGenForm({ ...genForm, bookId: e.target.value })} className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none text-helix-text">
              <option value="">Select book</option>
              {approvedBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
            <input type="number" value={genForm.count} onChange={e => setGenForm({ ...genForm, count: parseInt(e.target.value) || 1 })} min={1} max={50} className="px-4 py-2.5 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" placeholder="Count" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleGenerate} className="px-4 py-2 bg-helix-primary text-white rounded-lg text-sm font-medium">Generate</button>
            <button onClick={() => setShowGenerate(false)} className="px-4 py-2 bg-helix-card text-helix-muted rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Key} label="Total Codes" value={codes.length} color="primary" />
        <StatCard icon={Check} label="Redeemed" value={codes.filter(c => c.status === 'redeemed').length} color="success" />
        <StatCard icon={Hash} label="Available" value={codes.filter(c => c.status === 'unused').length} color="accent" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-helix-bg/50">
              <tr>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Code</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Book</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Status</th>
                <th className="text-left px-4 py-3 text-helix-muted font-medium">Redeemed By</th>
              </tr>
            </thead>
            <tbody>
              {codes.slice(0, 20).map(code => (
                <tr key={code.id} className="border-t border-helix-border hover:bg-helix-bg/30">
                  <td className="px-4 py-3 font-mono text-xs">{code.code}</td>
                  <td className="px-4 py-3 text-helix-muted">{state.books.find(b => b.id === code.bookId)?.title || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${code.status === 'unused' ? 'bg-helix-accent/20 text-helix-accent' : code.status === 'redeemed' ? 'bg-helix-success/20 text-helix-success' : code.status === 'expired' ? 'bg-helix-warning/20 text-helix-warning' : 'bg-helix-danger/20 text-helix-danger'}`}>
                      {code.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-helix-muted">{code.redeemedBy ? state.users.find(u => u.id === code.redeemedBy)?.name || '-' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PartnerReports() {
  const { state } = useApp();
  const user = state.currentUser!;
  const codes = state.codes.filter(c => c.partnerId === user.partnerId);
  const redemptionData = [
    { day: 'Mon', redemptions: 2 }, { day: 'Tue', redemptions: 5 }, { day: 'Wed', redemptions: 3 },
    { day: 'Thu', redemptions: 7 }, { day: 'Fri', redemptions: 4 }, { day: 'Sat', redemptions: 1 }, { day: 'Sun', redemptions: 2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-helix-muted mt-1">Organization analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Weekly Redemptions</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={redemptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="day" stroke="#8888a0" fontSize={12} />
              <YAxis stroke="#8888a0" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px' }} />
              <Bar dataKey="redemptions" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Code Distribution</h3>
          <div className="space-y-4">
            {state.books.filter(b => b.approvedPartners.includes(user.partnerId!)).map(book => {
              const bookCodes = codes.filter(c => c.bookId === book.id);
              const redeemed = bookCodes.filter(c => c.status === 'redeemed').length;
              const total = bookCodes.length;
              const pct = total > 0 ? (redeemed / total) * 100 : 0;
              return (
                <div key={book.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">{book.title}</span>
                    <span className="text-helix-muted">{redeemed}/{total}</span>
                  </div>
                  <div className="h-2 bg-helix-bg rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-helix-primary to-helix-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== STUDENT PAGES ====================
function StudentBookshelf() {
  const { state } = useApp();
  const user = state.currentUser!;
  const navigate = useNavigate();
  const entitlements = state.entitlements.filter(e => e.userId === user.id && !e.revoked);
  const books = entitlements.map(e => state.books.find(b => b.id === e.bookId)).filter(Boolean) as Book[];
  const bookColors = ['from-purple-600/30 to-blue-600/30', 'from-emerald-600/30 to-teal-600/30', 'from-orange-600/30 to-red-600/30', 'from-pink-600/30 to-rose-600/30'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">My Bookshelf</h1>
        <p className="text-helix-muted mt-1">{books.length} books available</p>
      </div>

      {books.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-helix-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No books yet</h3>
          <p className="text-helix-muted mb-4">Redeem an access code to get started</p>
          <button onClick={() => navigate('/student/redeem')} className="px-6 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90">
            Redeem Code
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((book, i) => {
            const progress = state.progress.find(p => p.userId === user.id && p.bookId === book.id);
            return (
              <div key={book.id} onClick={() => navigate(`/reader/${book.id}`)} className="glass rounded-xl overflow-hidden card-hover cursor-pointer group">
                <div className={`h-40 bg-gradient-to-br ${bookColors[i % bookColors.length]} flex items-center justify-center relative`}>
                  <BookMarked className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform" />
                  {progress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-helix-bg/50">
                      <div className="h-full bg-helix-accent" style={{ width: `${progress.percentComplete}%` }} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold group-hover:text-helix-primary transition-colors">{book.title}</h3>
                  <p className="text-sm text-helix-muted mt-1">{book.author}</p>
                  {progress && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-helix-bg rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-helix-primary to-helix-accent rounded-full" style={{ width: `${progress.percentComplete}%` }} />
                      </div>
                      <span className="text-xs text-helix-muted">{progress.percentComplete}%</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Clock className="w-3.5 h-3.5 text-helix-muted" />
                    <span className="text-xs text-helix-muted">{progress ? `Last read ${new Date(progress.lastReadAt).toLocaleDateString()}` : 'Not started'}</span>
                  </div>
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
    setError('');
    setSuccess('');
    const normalizedCode = code.trim().toUpperCase();
    const found = state.codes.find(c => c.code === normalizedCode);

    if (!found) { setError('Invalid access code. Please check and try again.'); return; }
    if (found.status === 'redeemed') { setError('This code has already been redeemed.'); return; }
    if (found.status === 'expired') { setError('This code has expired.'); return; }
    if (found.status === 'revoked') { setError('This code has been revoked.'); return; }
    if (found.partnerId && found.partnerId !== user.partnerId) { setError('This code is not valid for your organization.'); return; }

    const existingEntitlement = state.entitlements.find(e => e.userId === user.id && e.bookId === found.bookId && !e.revoked);
    if (existingEntitlement) { setError('You already have access to this book.'); return; }

    const entitlement: BookEntitlement = { id: uuidv4(), userId: user.id, bookId: found.bookId, codeId: found.id, grantedAt: new Date().toISOString(), revoked: false };
    dispatch({ type: 'REDEEM_CODE', payload: { codeId: found.id, userId: user.id, entitlement } });
    dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: uuidv4(), userId: user.id, action: 'code.redeemed', resource: 'AccessCode', resourceId: found.id, details: `Redeemed code for ${state.books.find(b => b.id === found.bookId)?.title}`, createdAt: new Date().toISOString() } });

    const book = state.books.find(b => b.id === found.bookId);
    setSuccess(`Successfully redeemed! "${book?.title}" has been added to your bookshelf.`);
    setCode('');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-helix-primary/20 to-helix-accent/20 flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-helix-primary" />
        </div>
        <h1 className="text-2xl font-bold">Redeem Access Code</h1>
        <p className="text-helix-muted mt-2">Enter your access code to unlock a book</p>
      </div>

      <div className="glass rounded-xl p-6 glow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-helix-muted mb-1.5">Access Code</label>
            <input value={code} onChange={e => { setCode(e.target.value); setError(''); setSuccess(''); }}
              placeholder="XXXX-XXXX-XXXX"
              className="w-full px-4 py-3 bg-helix-bg border border-helix-border rounded-xl text-center font-mono text-lg tracking-wider focus:border-helix-primary focus:outline-none" />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-helix-danger text-sm bg-helix-danger/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-helix-success text-sm bg-helix-success/10 rounded-lg px-3 py-2">
              <Check className="w-4 h-4 flex-shrink-0" /> {success}
            </div>
          )}

          <button onClick={handleRedeem} disabled={!code.trim()}
            className="w-full py-3 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
            Redeem Code
          </button>
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="font-medium text-sm mb-2">Available codes for testing:</h3>
        <div className="space-y-1">
          {state.codes.filter(c => c.status === 'unused').slice(0, 3).map(c => (
            <button key={c.id} onClick={() => setCode(c.code)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-helix-bg/50 text-sm font-mono text-helix-accent transition-colors">
              {c.code}
            </button>
          ))}
        </div>
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
      <div>
        <h1 className="text-2xl font-bold">My Progress</h1>
        <p className="text-helix-muted mt-1">Track your reading activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Books Reading" value={progress.length} color="primary" />
        <StatCard icon={Clock} label="Total Time" value={`${Math.round(progress.reduce((a, p) => a + p.totalReadTime, 0) / 60)} min`} color="accent" />
        <StatCard icon={TrendingUp} label="Avg. Progress" value={`${progress.length > 0 ? Math.round(progress.reduce((a, p) => a + p.percentComplete, 0) / progress.length) : 0}%`} color="success" />
      </div>

      <div className="space-y-4">
        {progress.map(p => {
          const book = state.books.find(b => b.id === p.bookId);
          if (!book) return null;
          return (
            <div key={p.bookId} className="glass rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{book.title}</h3>
                  <p className="text-sm text-helix-muted mt-1">Chapter {p.currentChapter} · Page {p.currentPage}</p>
                </div>
                <span className="text-lg font-bold text-helix-primary">{p.percentComplete}%</span>
              </div>
              <div className="mt-3 h-2 bg-helix-bg rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-helix-primary to-helix-accent rounded-full transition-all" style={{ width: `${p.percentComplete}%` }} />
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-helix-muted">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.round(p.totalReadTime / 60)} min read</span>
                <span>Last read: {new Date(p.lastReadAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
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
      <div>
        <h1 className="text-2xl font-bold">Bookmarks & Notes</h1>
        <p className="text-helix-muted mt-1">Your saved locations and highlights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Bookmark className="w-5 h-5 text-helix-primary" /> Bookmarks ({bookmarks.length})</h3>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-helix-muted">No bookmarks yet. Add bookmarks while reading.</p>
          ) : (
            <div className="space-y-3">
              {bookmarks.map(bm => {
                const book = state.books.find(b => b.id === bm.bookId);
                return (
                  <div key={bm.id} className="flex items-start justify-between p-3 rounded-lg bg-helix-bg/50">
                    <div>
                      <p className="text-sm font-medium">{book?.title}</p>
                      <p className="text-xs text-helix-muted mt-0.5">Ch. {bm.chapter}, Page {bm.page} {bm.label ? `· ${bm.label}` : ''}</p>
                    </div>
                    <button onClick={() => dispatch({ type: 'DELETE_BOOKMARK', payload: bm.id })} className="text-helix-muted hover:text-helix-danger">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Highlighter className="w-5 h-5 text-helix-accent" /> Highlights ({highlights.length})</h3>
          {highlights.length === 0 ? (
            <p className="text-sm text-helix-muted">No highlights yet. Select text while reading to highlight.</p>
          ) : (
            <div className="space-y-3">
              {highlights.map(hl => {
                const book = state.books.find(b => b.id === hl.bookId);
                const colorClasses: Record<string, string> = { yellow: 'border-yellow-500/50 bg-yellow-500/5', green: 'border-emerald-500/50 bg-emerald-500/5', blue: 'border-blue-500/50 bg-blue-500/5', pink: 'border-pink-500/50 bg-pink-500/5' };
                return (
                  <div key={hl.id} className={`p-3 rounded-lg border-l-2 ${colorClasses[hl.color]}`}>
                    <p className="text-sm italic">"{hl.text}"</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-helix-muted">{book?.title} · Ch. {hl.chapter}</p>
                      <button onClick={() => dispatch({ type: 'DELETE_HIGHLIGHT', payload: hl.id })} className="text-helix-muted hover:text-helix-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {hl.note && <p className="text-xs text-helix-muted mt-1 italic">Note: {hl.note}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== EBOOK READER ====================
function EbookReader() {
  const { bookId } = useParams();
  const { state, dispatch, getBookContent } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser!;
  const book = state.books.find(b => b.id === bookId);
  const content = getBookContent(bookId || '');
  const entitlement = state.entitlements.find(e => e.userId === user.id && e.bookId === bookId && !e.revoked);

  const [currentChapter, setCurrentChapter] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Load saved progress
  useEffect(() => {
    const progress = state.progress.find(p => p.userId === user.id && p.bookId === bookId);
    if (progress) setCurrentChapter(progress.currentChapter);
  }, [bookId]);

  // Save progress
  useEffect(() => {
    if (!bookId) return;
    const chapterProgress = Math.round(((currentChapter + 1) / content.chapters.length) * 100);
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: { userId: user.id, bookId, currentChapter, currentPage: 1, percentComplete: Math.min(chapterProgress, 100), lastReadAt: new Date().toISOString(), totalReadTime: (state.progress.find(p => p.userId === user.id && p.bookId === bookId)?.totalReadTime || 0) + 60 }
    });
  }, [currentChapter, bookId]);

  if (!book || !entitlement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-helix-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-helix-muted mb-4">You don't have access to this book.</p>
          <button onClick={() => navigate('/student')} className="px-6 py-2.5 bg-helix-primary text-white rounded-xl text-sm font-medium">Back to Bookshelf</button>
        </div>
      </div>
    );
  }

  const bookmarks = state.bookmarks.filter(b => b.userId === user.id && b.bookId === bookId);
  const highlights = state.highlights.filter(h => h.userId === user.id && h.bookId === bookId);

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const text = content.chapters[currentChapter]?.content || '';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const addBookmark = () => {
    dispatch({ type: 'ADD_BOOKMARK', payload: { id: uuidv4(), userId: user.id, bookId: bookId!, chapter: currentChapter, page: 1, createdAt: new Date().toISOString() } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Bookmark added', type: 'success' } });
  };

  const chapter = content.chapters[currentChapter];
  const paragraphs = chapter?.content.split('\n\n').filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-helix-bg flex flex-col">
      {/* Reader Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-helix-surface/95 backdrop-blur-sm border-b border-helix-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/student')} className="p-2 rounded-lg hover:bg-helix-card transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold truncate max-w-[200px]">{book.title}</h1>
            <p className="text-xs text-helix-muted">{chapter?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-lg hover:bg-helix-card transition-colors" title="Search">
            <Search className="w-4 h-4" />
          </button>
          <button onClick={() => setShowToc(!showToc)} className="p-2 rounded-lg hover:bg-helix-card transition-colors" title="Table of Contents">
            <Layers className="w-4 h-4" />
          </button>
          <button onClick={addBookmark} className="p-2 rounded-lg hover:bg-helix-card transition-colors" title="Bookmark">
            <Bookmark className="w-4 h-4" />
          </button>
          <button onClick={toggleSpeech} className={`p-2 rounded-lg transition-colors ${isSpeaking ? 'bg-helix-primary/20 text-helix-primary' : 'hover:bg-helix-card'}`} title="Read Aloud">
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg hover:bg-helix-card transition-colors" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="fixed top-14 left-0 right-0 bg-helix-surface border-b border-helix-border z-40 p-3 animate-fade-in">
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search in book..." autoFocus
            className="w-full px-4 py-2 bg-helix-bg border border-helix-border rounded-xl text-sm focus:border-helix-primary focus:outline-none" />
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-14 right-4 bg-helix-surface border border-helix-border rounded-xl p-4 z-40 w-64 animate-fade-in shadow-xl">
          <h3 className="font-medium text-sm mb-3">Reading Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-helix-muted block mb-1">Font Size</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="px-2 py-1 bg-helix-card rounded text-xs">A-</button>
                <span className="text-sm flex-1 text-center">{fontSize}px</span>
                <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="px-2 py-1 bg-helix-card rounded text-xs">A+</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-helix-muted block mb-1">Theme</label>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-lg bg-helix-bg border-2 border-helix-primary" />
                <button className="w-8 h-8 rounded-lg bg-white border-2 border-helix-border" />
                <button className="w-8 h-8 rounded-lg bg-amber-50 border-2 border-helix-border" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table of Contents */}
      {showToc && (
        <div className="fixed top-14 left-0 bottom-0 w-72 bg-helix-surface border-r border-helix-border z-40 overflow-y-auto animate-slide-in">
          <div className="p-4 border-b border-helix-border flex items-center justify-between">
            <h3 className="font-semibold text-sm">Table of Contents</h3>
            <button onClick={() => setShowToc(false)} className="p-1 rounded hover:bg-helix-card"><X className="w-4 h-4" /></button>
          </div>
          <nav className="p-3 space-y-1">
            {content.chapters.map((ch, i) => (
              <button key={i} onClick={() => { setCurrentChapter(i); setShowToc(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${i === currentChapter ? 'bg-helix-primary/20 text-helix-primary-light font-medium' : 'text-helix-muted hover:text-helix-text hover:bg-helix-card'}`}>
                {ch.title}
              </button>
            ))}
          </nav>
          {bookmarks.length > 0 && (
            <div className="p-3 border-t border-helix-border">
              <h4 className="text-xs text-helix-muted font-medium mb-2 px-3">Bookmarks</h4>
              {bookmarks.map(bm => (
                <button key={bm.id} onClick={() => { setCurrentChapter(bm.chapter); setShowToc(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-helix-muted hover:text-helix-text hover:bg-helix-card flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-helix-primary" />
                  <span className="truncate">{bm.label || `Ch. ${bm.chapter + 1}`}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-14 pb-20">
        <article className="max-w-2xl mx-auto px-6 py-10">
          {/* Chapter Title */}
          <div className="mb-8">
            <p className="text-xs text-helix-primary font-medium uppercase tracking-wider mb-2">
              Chapter {currentChapter + 1} of {content.chapters.length}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold">{chapter?.title}</h1>
          </div>

          {/* Chapter Content */}
          <div className="reader-content" style={{ fontSize: `${fontSize}px` }}>
            {paragraphs.map((para, i) => {
              const isBold = para.startsWith('**') || para.startsWith('- **') || para.startsWith('1. ');
              const isHeading = para.startsWith('**') && para.endsWith('**');
              const isList = para.startsWith('- ');
              const isNumberedList = para.match(/^\d+\./);

              if (isHeading) {
                return <h2 key={i} className="text-xl font-bold mt-8 mb-4 gradient-text">{para.replace(/\*\*/g, '')}</h2>;
              }
              if (isList) {
                const items = para.split('\n').filter(l => l.startsWith('- '));
                return (
                  <ul key={i} className="space-y-2 my-4">
                    {items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-helix-primary mt-2.5 flex-shrink-0" />
                        <span className="text-helix-text/90">{item.replace('- ', '').replace(/\*\*/g, '')}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (isNumberedList) {
                const items = para.split('\n').filter(l => l.match(/^\d+\./));
                return (
                  <ol key={i} className="space-y-2 my-4">
                    {items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-helix-primary/20 text-helix-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{j + 1}</span>
                        <span className="text-helix-text/90">{item.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}</span>
                      </li>
                    ))}
                  </ol>
                );
              }
              return <p key={i} className="text-helix-text/85 mb-4 leading-relaxed">{para.replace(/\*\*/g, '')}</p>;
            })}
          </div>

          {/* Chapter Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-helix-border">
            <button onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))} disabled={currentChapter === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-helix-card text-helix-text hover:bg-helix-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-helix-muted">{currentChapter + 1} / {content.chapters.length}</span>
            <button onClick={() => setCurrentChapter(Math.min(content.chapters.length - 1, currentChapter + 1))} disabled={currentChapter === content.chapters.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-helix-card text-helix-text hover:bg-helix-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </article>
      </main>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-helix-surface">
        <div className="h-full bg-gradient-to-r from-helix-primary to-helix-accent transition-all duration-500"
          style={{ width: `${((currentChapter + 1) / content.chapters.length) * 100}%` }} />
      </div>
    </div>
  );
}

// ==================== LAYOUT WRAPPER ====================
function AppLayout({ children, role, partnerId }: { children: React.ReactNode; role: string; partnerId?: string }) {
  return (
    <div className="min-h-screen bg-helix-bg">
      <Sidebar role={role} partnerId={partnerId} />
      <MobileNav role={role} />
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <Notifications />
    </div>
  );
}

// ==================== ROUTE GUARDS ====================
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: UserRole[] }) {
  const { state } = useApp();
  if (!state.currentUser) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(state.currentUser.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ==================== MAIN APP ====================
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthRoute />} />
          {/* Super Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><SuperAdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/partners" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminPartners /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/books" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminBooks /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/codes" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminCodes /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminUsers /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminAudit /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout role="super_admin"><AdminSettings /></AppLayout></ProtectedRoute>} />
          {/* Partner Admin Routes */}
          <Route path="/partner" element={<ProtectedRoute allowedRoles={['partner_admin']}><PartnerLayout><PartnerDashboard /></PartnerLayout></ProtectedRoute>} />
          <Route path="/partner/classrooms" element={<ProtectedRoute allowedRoles={['partner_admin']}><PartnerLayout><PartnerClassrooms /></PartnerLayout></ProtectedRoute>} />
          <Route path="/partner/students" element={<ProtectedRoute allowedRoles={['partner_admin']}><PartnerLayout><PartnerStudents /></PartnerLayout></ProtectedRoute>} />
          <Route path="/partner/books" element={<ProtectedRoute allowedRoles={['partner_admin']}><PartnerLayout><PartnerBooks /></PartnerLayout></ProtectedRoute>} />
          <Route path="/partner/codes" element={<ProtectedRoute allowedRoles={['partner_admin']}><PartnerLayout><PartnerCodes /></PartnerLayout></ProtectedRoute>} />
          <Route path="/partner/reports" element={<ProtectedRoute allowedRoles={['partner_admin']}><PartnerLayout><PartnerReports /></PartnerLayout></ProtectedRoute>} />
          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout><StudentBookshelf /></StudentLayout></ProtectedRoute>} />
          <Route path="/student/redeem" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout><StudentRedeem /></StudentLayout></ProtectedRoute>} />
          <Route path="/student/progress" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout><StudentProgress /></StudentLayout></ProtectedRoute>} />
          <Route path="/student/bookmarks" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout><StudentBookmarks /></StudentLayout></ProtectedRoute>} />
          {/* Reader */}
          <Route path="/reader/:bookId" element={<ProtectedRoute allowedRoles={['student']}><EbookReader /></ProtectedRoute>} />
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

function AuthRoute() {
  const { state } = useApp();
  if (state.currentUser) {
    if (state.currentUser.role === 'super_admin') return <Navigate to="/admin" replace />;
    if (state.currentUser.role === 'partner_admin') return <Navigate to="/partner" replace />;
    return <Navigate to="/student" replace />;
  }
  return <AuthPage />;
}

function PartnerLayout({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  return <AppLayout role="partner_admin" partnerId={state.currentUser?.partnerId}>{children}</AppLayout>;
}

function StudentLayout({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  return <AppLayout role="student" partnerId={state.currentUser?.partnerId}>{children}</AppLayout>;
}
