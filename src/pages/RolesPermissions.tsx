import { useState } from 'react';
import { useApp } from '../store';
import type { UserRole, PermissionModule, PermissionAction } from '../types';
import { Shield, Check, X, Lock, AlertTriangle } from 'lucide-react';

const MODULES: { key: PermissionModule; label: string; description: string }[] = [
  { key: 'users', label: 'Users', description: 'Manage user accounts' },
  { key: 'partners', label: 'Partners', description: 'Manage partner organizations' },
  { key: 'orders', label: 'Orders', description: 'View and manage orders' },
  { key: 'codes', label: 'Access Codes', description: 'Generate and manage codes' },
  { key: 'reports', label: 'Reports', description: 'View and export reports' },
  { key: 'audit', label: 'Audit Logs', description: 'View audit trail' },
  { key: 'settings', label: 'Settings', description: 'Manage system settings' },
  { key: 'books', label: 'Books', description: 'Manage book catalog' },
];

const ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'manage', label: 'Manage' },
  { key: 'export', label: 'Export' },
];

const ROLES: { key: UserRole; label: string; color: string }[] = [
  { key: 'super_admin', label: 'Super Admin', color: 'bg-helix-primary/20 text-helix-primary' },
  { key: 'support_agent', label: 'Support Agent', color: 'bg-helix-success/20 text-helix-success' },
  { key: 'partner_admin', label: 'Partner Admin', color: 'bg-helix-accent/20 text-helix-accent' },
  { key: 'student', label: 'Student', color: 'bg-helix-muted/20 text-helix-muted' },
];

export function RolesPermissions() {
  const { state, dispatch, updateRolePermission } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [showWarning, setShowWarning] = useState(false);

  const permissions = state.rolePermissions.filter(rp => rp.role === selectedRole);

  const hasPermission = (module: PermissionModule, action: PermissionAction) => {
    return permissions.find(rp => rp.module === module && rp.action === action)?.enabled || false;
  };

  const getPermissionId = (module: PermissionModule, action: PermissionAction) => {
    return permissions.find(rp => rp.module === module && rp.action === action)?.id;
  };

  const handleToggle = async (module: PermissionModule, action: PermissionAction, currentEnabled: boolean) => {
    const permId = getPermissionId(module, action);
    if (!permId) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Permission not found', type: 'error' } });
      return;
    }

    // Warn when disabling critical super admin permissions
    if (selectedRole === 'super_admin' && currentEnabled && (module === 'settings' || module === 'users')) {
      setShowWarning(true);
      return;
    }

    const result = await updateRolePermission(permId, !currentEnabled);
    if (result.success) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: 'Permission updated', type: 'success' } });
    } else {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message: result.error || 'Failed', type: 'error' } });
    }
  };

  const confirmDisable = async () => {
    setShowWarning(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <p className="text-helix-muted mt-1">Configure role-based access control</p>
      </div>

      {/* Role Selector */}
      <div className="glass rounded-xl p-4">
        <div className="flex gap-2 flex-wrap">
          {ROLES.map(role => (
            <button
              key={role.key}
              onClick={() => setSelectedRole(role.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRole === role.key
                  ? 'bg-helix-primary text-white'
                  : 'bg-helix-card text-helix-muted hover:text-helix-text'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-helix-border">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-helix-primary" />
            Permission Matrix — {ROLES.find(r => r.key === selectedRole)?.label}
          </h3>
          <p className="text-xs text-helix-muted mt-1">
            Permissions are enforced server-side. Changes are logged in the audit trail.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-helix-bg/50 border-b border-helix-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Module</th>
                {ACTIONS.map(action => (
                  <th key={action.key} className="text-center px-3 py-3 text-xs font-medium text-helix-muted uppercase">
                    {action.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-helix-border">
              {MODULES.map(module => (
                <tr key={module.key} className="hover:bg-helix-bg/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{module.label}</p>
                      <p className="text-xs text-helix-muted">{module.description}</p>
                    </div>
                  </td>
                  {ACTIONS.map(action => {
                    const enabled = hasPermission(module.key, action.key);
                    return (
                      <td key={action.key} className="text-center px-3 py-3">
                        <button
                          onClick={() => handleToggle(module.key, action.key, enabled)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            enabled
                              ? 'bg-helix-success/20 text-helix-success hover:bg-helix-success/30'
                              : 'bg-helix-bg text-helix-muted hover:bg-helix-border'
                          }`}
                          title={`${enabled ? 'Revoke' : 'Grant'} ${module.label} ${action.label}`}
                        >
                          {enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Notes */}
      <div className="glass rounded-xl p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-helix-warning" />
          Security Rules
        </h3>
        <ul className="space-y-2 text-sm text-helix-muted">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-helix-success mt-0.5 flex-shrink-0" />
            <span>All permissions are enforced server-side, not just in the UI.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-helix-success mt-0.5 flex-shrink-0" />
            <span>Access is denied by default when permissions are missing.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-helix-success mt-0.5 flex-shrink-0" />
            <span>Users cannot grant themselves additional privileges.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-helix-success mt-0.5 flex-shrink-0" />
            <span>Partner Admins are restricted to their own organization's data.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-helix-success mt-0.5 flex-shrink-0" />
            <span>All permission changes are recorded in the audit log.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-helix-warning mt-0.5 flex-shrink-0" />
            <span>Critical Super Admin permissions are protected from accidental removal.</span>
          </li>
        </ul>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-helix-warning/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-helix-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Critical Permission</h3>
                <p className="text-sm text-helix-muted">This may affect platform security</p>
              </div>
            </div>
            <p className="text-sm text-helix-muted mb-4">
              You are about to disable a critical Super Admin permission. This could affect platform security and administration capabilities.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowWarning(false)} className="flex-1 px-4 py-2 bg-helix-card rounded-lg hover:bg-helix-border">
                Cancel
              </button>
              <button onClick={confirmDisable} className="flex-1 px-4 py-2 bg-helix-warning text-white rounded-lg hover:opacity-90">
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
