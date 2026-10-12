import { useState } from 'react';
import { useApp } from '../store';
import { v4 as uuidv4 } from 'uuid';
import {
  Users, Building2, Mail, Shield, Key, BarChart3, FileText, Settings,
  Search, Plus, Edit, Trash2, Eye, Check, X, AlertTriangle, RefreshCw,
  ChevronRight, Activity, TrendingUp, Package, Clock, CheckCircle2, XCircle,
  UserCheck, UserX, MailCheck, MailX, Lock, Unlock
} from 'lucide-react';
import type { User, LearningPartner, PartnerEmail, UserRole, UserStatus } from '../types';

// ==================== SUPER ADMIN DASHBOARD ====================
export function AdminDashboard() {
  const { state } = useApp();
  
  const stats = {
    totalUsers: state.users.length,
    activeUsers: state.users.filter(u => u.status === 'active').length,
    suspendedUsers: state.users.filter(u => u.status === 'suspended').length,
    totalPartners: state.partners.length,
    activePartners: state.partners.filter(p => p.status === 'active').length,
    verifiedEmails: state.partnerEmails.filter(pe => pe.isVerified).length,
    pendingOrders: state.orders.filter(o => ['submitted', 'approved'].includes(o.status)).length,
    completedOrders: state.orders.filter(o => o.status === 'fulfilled').length,
    totalCodes: state.codes.length,
    redeemedCodes: state.codes.filter(c => c.status === 'redeemed').length,
    expiredCodes: state.codes.filter(c => c.status === 'expired').length,
    revokedCodes: state.codes.filter(c => c.status === 'revoked').length,
  };

  const recentUsers = [...state.users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const pendingOrders = state.orders.filter(o => ['submitted', 'approved'].includes(o.status)).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="text-helix-muted mt-1">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-helix-primary" />
            <span className="text-2xl font-bold">{stats.totalUsers}</span>
          </div>
          <p className="text-sm text-helix-muted">Total Users</p>
          <p className="text-xs text-helix-success mt-1">{stats.activeUsers} active</p>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-5 h-5 text-helix-accent" />
            <span className="text-2xl font-bold">{stats.totalPartners}</span>
          </div>
          <p className="text-sm text-helix-muted">Partners</p>
          <p className="text-xs text-helix-success mt-1">{stats.activePartners} active</p>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-5 h-5 text-helix-success" />
            <span className="text-2xl font-bold">{stats.verifiedEmails}</span>
          </div>
          <p className="text-sm text-helix-muted">Verified Emails</p>
          <p className="text-xs text-helix-muted mt-1">{state.partnerEmails.length} total</p>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-helix-warning" />
            <span className="text-2xl font-bold">{stats.pendingOrders}</span>
          </div>
          <p className="text-sm text-helix-muted">Pending Orders</p>
          <p className="text-xs text-helix-success mt-1">{stats.completedOrders} completed</p>
        </div>
      </div>

      {/* Access Codes Stats */}
      <div className="glass rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-helix-primary" />
          Access Codes Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-helix-primary">{stats.totalCodes}</p>
            <p className="text-sm text-helix-muted mt-1">Total Generated</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-helix-success">{stats.redeemedCodes}</p>
            <p className="text-sm text-helix-muted mt-1">Redeemed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-helix-warning">{stats.expiredCodes}</p>
            <p className="text-sm text-helix-muted mt-1">Expired</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-helix-danger">{stats.revokedCodes}</p>
            <p className="text-sm text-helix-muted mt-1">Revoked</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-helix-primary" />
            Recently Created Users
          </h3>
          <div className="space-y-3">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-helix-bg/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-helix-muted">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'super_admin' ? 'bg-helix-primary/20 text-helix-primary' : user.role === 'partner_admin' ? 'bg-helix-accent/20 text-helix-accent' : 'bg-helix-muted/20 text-helix-muted'}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-helix-muted mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-helix-warning" />
            Pending Orders
          </h3>
          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-helix-muted text-center py-8">No pending orders</p>
            ) : (
              pendingOrders.map(order => {
                const partner = state.partners.find(p => p.id === order.partnerId);
                const courseware = state.courseware.find(c => c.id === order.bookId);
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-helix-bg/50">
                    <div>
                      <p className="font-medium text-sm">{order.orderId}</p>
                      <p className="text-xs text-helix-muted">{partner?.name} • {courseware?.title}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'submitted' ? 'bg-helix-warning/20 text-helix-warning' : 'bg-helix-accent/20 text-helix-accent'}`}>
                        {order.status}
                      </span>
                      <p className="text-xs text-helix-muted mt-1">{order.quantity} codes</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== USER MANAGEMENT ====================
export function UserManagement() {
  const { state, dispatch, updateUser, deleteUser, adminInitiatePasswordReset, resetPassword } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [resettingPassword, setResettingPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' as UserRole, partnerId: '', status: '' as UserStatus });

  const filteredUsers = state.users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, partnerId: user.partnerId || '', status: user.status });
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    const result = await updateUser(editingUser.id, {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      partnerId: editForm.partnerId || undefined,
      status: editForm.status,
    });
    if (result.success) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'User updated successfully', type: 'success' } });
      setEditingUser(null);
    } else {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: result.error || 'Failed to update user', type: 'error' } });
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    const result = await deleteUser(deletingUser.id);
    if (result.success) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'User deactivated successfully', type: 'success' } });
      setDeletingUser(null);
    } else {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: result.error || 'Failed to delete user', type: 'error' } });
    }
  };

  const handlePasswordReset = async (user: User, password?: string) => {
    if (password) {
      // Direct password set (demo mode)
      const result = await resetPassword(user.id, password);
      if (result.success) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: result.message || `Password reset for ${user.email}`, type: 'success' } });
        setResettingPassword(null);
        setNewPassword('');
      } else {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: result.error || 'Failed to reset password', type: 'error' } });
      }
    } else {
      // Send reset email (production mode)
      const result = await adminInitiatePasswordReset(user.id);
      if (result.success) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: `Password reset email sent to ${user.email}`, type: 'success' } });
      } else {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: result.error || 'Failed to send reset email', type: 'error' } });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-helix-muted mt-1">Manage all platform users</p>
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
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="partner_admin">Partner Admin</option>
            <option value="support_agent">Support Agent</option>
            <option value="student">Student</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-helix-bg/50 border-b border-helix-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Partner</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Created</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-helix-border">
              {filteredUsers.map(user => {
                const partner = state.partners.find(p => p.id === user.partnerId);
                return (
                  <tr key={user.id} className="hover:bg-helix-bg/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-helix-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'super_admin' ? 'bg-helix-primary/20 text-helix-primary' : user.role === 'partner_admin' ? 'bg-helix-accent/20 text-helix-accent' : user.role === 'support_agent' ? 'bg-helix-success/20 text-helix-success' : 'bg-helix-muted/20 text-helix-muted'}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-helix-muted">{partner?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'active' ? 'bg-helix-success/20 text-helix-success' : user.status === 'suspended' ? 'bg-helix-warning/20 text-helix-warning' : 'bg-helix-danger/20 text-helix-danger'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-helix-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-helix-primary/20 text-helix-muted hover:text-helix-primary" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setResettingPassword(user)} className="p-1.5 rounded-lg hover:bg-helix-accent/20 text-helix-muted hover:text-helix-accent" title="Reset Password">
                          <Key className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletingUser(user)} className="p-1.5 rounded-lg hover:bg-helix-danger/20 text-helix-muted hover:text-helix-danger" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-helix-muted mx-auto mb-3" />
            <p className="text-helix-muted">No users found</p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <div className="glass rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-helix-muted mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-helix-muted mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-helix-muted mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="partner_admin">Partner Admin</option>
                  <option value="support_agent">Support Agent</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-helix-muted mb-1">Partner</label>
                <select
                  value={editForm.partnerId}
                  onChange={e => setEditForm({ ...editForm, partnerId: e.target.value })}
                  className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
                >
                  <option value="">No Partner</option>
                  {state.partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-helix-muted mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value as UserStatus })}
                  className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2 bg-helix-card rounded-lg hover:bg-helix-border">
                Cancel
              </button>
              <button onClick={saveEdit} className="flex-1 px-4 py-2 bg-helix-primary text-white rounded-lg hover:opacity-90">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeletingUser(null)}>
          <div className="glass rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-helix-danger/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-helix-danger" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Deactivate User</h3>
                <p className="text-sm text-helix-muted">This action cannot be undone</p>
              </div>
            </div>
            <div className="bg-helix-bg/50 rounded-lg p-4 mb-4">
              <p className="font-medium">{deletingUser.name}</p>
              <p className="text-sm text-helix-muted">{deletingUser.email}</p>
              <p className="text-xs text-helix-muted mt-2">
                The user will be deactivated and lose access to the platform. Associated data will be preserved.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeletingUser(null)} className="flex-1 px-4 py-2 bg-helix-card rounded-lg hover:bg-helix-border">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-helix-danger text-white rounded-lg hover:opacity-90">
                Deactivate User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingPassword && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setResettingPassword(null); setNewPassword(''); }}>
          <div className="glass rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-helix-accent" />
              Reset Password
            </h3>
            <div className="bg-helix-bg/50 rounded-lg p-4 mb-4">
              <p className="font-medium">{resettingPassword.name}</p>
              <p className="text-sm text-helix-muted">{resettingPassword.email}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-helix-muted mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
                  placeholder="Enter new password (min 8 characters)"
                  minLength={8}
                  autoFocus
                />
                <p className="text-xs text-helix-muted mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => { setResettingPassword(null); setNewPassword(''); }} 
                className="flex-1 px-4 py-2 bg-helix-card rounded-lg hover:bg-helix-border"
              >
                Cancel
              </button>
              <button 
                onClick={() => handlePasswordReset(resettingPassword, newPassword)}
                disabled={newPassword.length < 8}
                className="flex-1 px-4 py-2 bg-helix-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== PARTNER MANAGEMENT ====================
export function PartnerManagement() {
  const { state, dispatch, addPartner, updatePartner } = useApp();
  const [search, setSearch] = useState('');
  const [editingPartner, setEditingPartner] = useState<LearningPartner | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', primaryContactName: '', primaryContactEmail: '' });

  const filteredPartners = state.partners.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.name) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Partner name is required', type: 'error' } });
      return;
    }

    const newPartner: LearningPartner = {
      id: uuidv4(),
      name: form.name,
      description: form.description,
      primaryContactName: form.primaryContactName,
      primaryContactEmail: form.primaryContactEmail,
      status: 'active',
      adminId: '',
      studentCount: 0,
      classroomCount: 0,
      bookCount: 0,
      codeQuota: 500,
      codesUsed: 0,
      canGenerateCodes: true,
      createdAt: new Date().toISOString(),
    };

    await addPartner(newPartner);
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Partner created successfully', type: 'success' } });
    setCreating(false);
    setForm({ name: '', description: '', primaryContactName: '', primaryContactEmail: '' });
  };

  const handleUpdate = async () => {
    if (!editingPartner) return;
    await updatePartner({
      ...editingPartner,
      name: form.name,
      description: form.description,
      primaryContactName: form.primaryContactName,
      primaryContactEmail: form.primaryContactEmail,
    });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Partner updated successfully', type: 'success' } });
    setEditingPartner(null);
  };

  const openEdit = (partner: LearningPartner) => {
    setEditingPartner(partner);
    setForm({
      name: partner.name,
      description: partner.description || '',
      primaryContactName: partner.primaryContactName || '',
      primaryContactEmail: partner.primaryContactEmail || '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Partner Management</h1>
          <p className="text-helix-muted mt-1">Manage learning partner organizations</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2 bg-helix-primary text-white rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4" />
          Add Partner
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
            placeholder="Search partners..."
            className="w-full pl-10 pr-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map(partner => {
          const emails = state.partnerEmails.filter(pe => pe.partnerId === partner.id);
          const users = state.users.filter(u => u.partnerId === partner.id);
          return (
            <div key={partner.id} className="glass rounded-xl p-5 hover:border-helix-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-helix-primary to-helix-accent flex items-center justify-center text-white font-bold text-lg">
                  {partner.name.charAt(0)}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${partner.status === 'active' ? 'bg-helix-success/20 text-helix-success' : 'bg-helix-warning/20 text-helix-warning'}`}>
                  {partner.status}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{partner.name}</h3>
              {partner.description && <p className="text-sm text-helix-muted mb-3 line-clamp-2">{partner.description}</p>}
              
              <div className="space-y-2 text-sm mb-4">
                {partner.primaryContactName && (
                  <div className="flex items-center gap-2 text-helix-muted">
                    <Users className="w-4 h-4" />
                    <span>{partner.primaryContactName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-helix-muted">
                  <Mail className="w-4 h-4" />
                  <span>{emails.length} email{emails.length !== 1 ? 's' : ''}</span>
                  {emails.filter(e => e.isVerified).length > 0 && (
                    <MailCheck className="w-4 h-4 text-helix-success" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-helix-muted">
                  <UserCheck className="w-4 h-4" />
                  <span>{users.length} user{users.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openEdit(partner)} className="flex-1 px-3 py-2 bg-helix-card rounded-lg hover:bg-helix-border text-sm">
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPartners.length === 0 && (
        <div className="text-center py-12 glass rounded-xl">
          <Building2 className="w-12 h-12 text-helix-muted mx-auto mb-3" />
          <p className="text-helix-muted">No partners found</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(creating || editingPartner) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setCreating(false); setEditingPartner(null); }}>
          <div className="glass rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{creating ? 'Create Partner' : 'Edit Partner'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-helix-muted mb-1">Partner Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
                  placeholder="Enter partner name"
                />
              </div>
              <div>
                <label className="block text-sm text-helix-muted mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none resize-none"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label className="block text-sm text-helix-muted mb-1">Primary Contact Name</label>
                <input
                  type="text"
                  value={form.primaryContactName}
                  onChange={e => setForm({ ...form, primaryContactName: e.target.value })}
                  className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
                  placeholder="Contact name"
                />
              </div>
              <div>
                <label className="block text-sm text-helix-muted mb-1">Primary Contact Email</label>
                <input
                  type="email"
                  value={form.primaryContactEmail}
                  onChange={e => setForm({ ...form, primaryContactEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
                  placeholder="contact@example.com"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setCreating(false); setEditingPartner(null); }} className="flex-1 px-4 py-2 bg-helix-card rounded-lg hover:bg-helix-border">
                Cancel
              </button>
              <button onClick={creating ? handleCreate : handleUpdate} className="flex-1 px-4 py-2 bg-helix-primary text-white rounded-lg hover:opacity-90">
                {creating ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== PARTNER EMAILS ====================
export function PartnerEmails() {
  const { state, dispatch, addPartnerEmail, updatePartnerEmail, verifyPartnerEmail, deletePartnerEmail } = useApp();
  const [search, setSearch] = useState('');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [addingEmail, setAddingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState({ partnerId: '', email: '' });

  const filteredEmails = state.partnerEmails.filter(pe => {
    const matchSearch = !search || pe.email.toLowerCase().includes(search.toLowerCase());
    const matchPartner = partnerFilter === 'all' || pe.partnerId === partnerFilter;
    const matchVerification = verificationFilter === 'all' || (verificationFilter === 'verified' ? pe.isVerified : !pe.isVerified);
    return matchSearch && matchPartner && matchVerification;
  });

  const handleAdd = async () => {
    if (!newEmail.partnerId || !newEmail.email) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Please fill all fields', type: 'error' } });
      return;
    }

    const result = await addPartnerEmail(newEmail.partnerId, newEmail.email);
    if (result.success) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Email added successfully', type: 'success' } });
      setAddingEmail(false);
      setNewEmail({ partnerId: '', email: '' });
    } else {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: result.error || 'Failed to add email', type: 'error' } });
    }
  };

  const handleVerify = async (emailId: string) => {
    const result = await verifyPartnerEmail(emailId);
    if (result.success) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Email verified', type: 'success' } });
    }
  };

  const handleSetPrimary = async (emailId: string) => {
    const result = await updatePartnerEmail(emailId, { isPrimary: true });
    if (result.success) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Set as primary email', type: 'success' } });
    }
  };

  const handleDelete = async (emailId: string) => {
    const result = await deletePartnerEmail(emailId);
    if (result.success) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Email removed', type: 'success' } });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Partner Email Addresses</h1>
          <p className="text-helix-muted mt-1">Manage email addresses associated with partners</p>
        </div>
        <button onClick={() => setAddingEmail(true)} className="flex items-center gap-2 px-4 py-2 bg-helix-primary text-white rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4" />
          Add Email
        </button>
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
              placeholder="Search emails..."
              className="w-full pl-10 pr-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
            />
          </div>
          <select
            value={partnerFilter}
            onChange={e => setPartnerFilter(e.target.value)}
            className="px-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
          >
            <option value="all">All Partners</option>
            {state.partners.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={verificationFilter}
            onChange={e => setVerificationFilter(e.target.value)}
            className="px-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
          >
            <option value="all">All Verification Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Emails Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-helix-bg/50 border-b border-helix-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Email Address</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Partner</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Primary</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Verified</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-helix-border">
              {filteredEmails.map(pe => {
                const partner = state.partners.find(p => p.id === pe.partnerId);
                return (
                  <tr key={pe.id} className="hover:bg-helix-bg/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-helix-muted" />
                        <span className="font-medium">{pe.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-helix-muted">{partner?.name || '—'}</td>
                    <td className="px-4 py-3">
                      {pe.isPrimary ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-helix-primary/20 text-helix-primary">Primary</span>
                      ) : (
                        <button onClick={() => handleSetPrimary(pe.id)} className="text-xs text-helix-muted hover:text-helix-primary">
                          Set as primary
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {pe.isVerified ? (
                        <span className="flex items-center gap-1 text-helix-success">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs">Verified</span>
                        </span>
                      ) : (
                        <button onClick={() => handleVerify(pe.id)} className="flex items-center gap-1 text-helix-warning hover:text-helix-success">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">Verify</span>
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(pe.id)} className="p-1.5 rounded-lg hover:bg-helix-danger/20 text-helix-muted hover:text-helix-danger" title="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredEmails.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-helix-muted mx-auto mb-3" />
            <p className="text-helix-muted">No emails found</p>
          </div>
        )}
      </div>

      {/* Add Email Modal */}
      {addingEmail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setAddingEmail(false)}>
          <div className="glass rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Add Partner Email</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-helix-muted mb-1">Partner *</label>
                <select
                  value={newEmail.partnerId}
                  onChange={e => setNewEmail({ ...newEmail, partnerId: e.target.value })}
                  className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
                >
                  <option value="">Select partner</option>
                  {state.partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-helix-muted mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newEmail.email}
                  onChange={e => setNewEmail({ ...newEmail, email: e.target.value })}
                  className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAddingEmail(false)} className="flex-1 px-4 py-2 bg-helix-card rounded-lg hover:bg-helix-border">
                Cancel
              </button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-helix-primary text-white rounded-lg hover:opacity-90">
                Add Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
