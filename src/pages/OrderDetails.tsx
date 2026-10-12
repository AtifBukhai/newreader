import { useState } from 'react';
import { useApp } from '../store';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Search, Copy, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const { state, dispatch, exportCodesCSV } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const order = state.orders.find(o => o.id === orderId);
  const partner = order ? state.partners.find(p => p.id === order.partnerId) : null;
  const book = order ? state.books.find(b => b.id === order.bookId) : null;
  const codes = state.codes.filter(c => c.orderId === orderId);

  const filteredCodes = codes.filter(code => {
    const matchesSearch = !search || code.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: codes.length,
    unused: codes.filter(c => c.status === 'generated').length,
    redeemed: codes.filter(c => c.status === 'redeemed').length,
    expired: codes.filter(c => c.status === 'expired').length,
    revoked: codes.filter(c => c.status === 'revoked').length,
  };

  const handleExport = () => {
    if (!order) return;
    const result = exportCodesCSV(order.id);
    if (result.success && result.data) {
      // Create and download CSV file
      const blob = new Blob([result.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${order.orderId}-codes.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { message: 'Codes exported successfully', type: 'success' } 
      });
    } else {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { message: result.error || 'Failed to export codes', type: 'error' } 
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: { message: 'Code copied to clipboard', type: 'success' } 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'redeemed': return <CheckCircle2 className="w-4 h-4 text-helix-success" />;
      case 'generated': return <Clock className="w-4 h-4 text-helix-primary" />;
      case 'expired': return <XCircle className="w-4 h-4 text-helix-warning" />;
      case 'revoked': return <XCircle className="w-4 h-4 text-helix-danger" />;
      default: return <AlertCircle className="w-4 h-4 text-helix-muted" />;
    }
  };

  if (!order) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 rounded-lg hover:bg-helix-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Order Not Found</h1>
            <p className="text-helix-muted mt-1">The requested order does not exist</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 rounded-lg hover:bg-helix-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-helix-muted mt-1 font-mono">{order.orderId}</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" /> Export Codes
        </button>
      </div>

      {/* Order Information */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Order Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-helix-muted">Partner</p>
              <p className="font-medium">{partner?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-helix-muted">Book</p>
              <p className="font-medium">{book?.title || 'Unknown'}</p>
              {book?.isbn && <p className="text-xs text-helix-muted">ISBN: {book.isbn}</p>}
            </div>
            <div>
              <p className="text-sm text-helix-muted">Created By</p>
              <p className="font-medium">
                {state.users.find(u => u.id === order.requestedBy)?.name || 'Unknown'}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-helix-muted">Created At</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-helix-muted">Status</p>
              <p className="font-medium capitalize">{order.status}</p>
            </div>
            <div>
              <p className="text-sm text-helix-muted">Max Devices per Code</p>
              <p className="font-medium">{order.maxDevices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Validity Information */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Validity Policy</h2>
        {order.validityType === 'upon_activation' ? (
          <div>
            <p className="text-sm text-helix-muted mb-2">Type</p>
            <p className="font-medium mb-4">Upon Activation</p>
            <p className="text-sm text-helix-muted mb-2">Duration</p>
            <p className="font-medium">
              {order.validityDuration} {order.validityDurationUnit}
            </p>
            <p className="text-xs text-helix-muted mt-2">
              Access starts when the code is first redeemed
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-helix-muted mb-2">Type</p>
            <p className="font-medium mb-4">Valid Until Specific Date</p>
            <p className="text-sm text-helix-muted mb-2">Expires On</p>
            <p className="font-medium">
              {order.validUntilDate ? new Date(order.validUntilDate).toLocaleString() : 'N/A'}
            </p>
            <p className="text-xs text-helix-muted mt-2">
              All codes expire on this date regardless of activation
            </p>
          </div>
        )}
      </div>

      {/* Code Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-helix-muted">Total Codes</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-helix-muted">Unused</p>
          <p className="text-2xl font-bold mt-1 text-helix-primary">{stats.unused}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-helix-muted">Redeemed</p>
          <p className="text-2xl font-bold mt-1 text-helix-success">{stats.redeemed}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-helix-muted">Expired</p>
          <p className="text-2xl font-bold mt-1 text-helix-warning">{stats.expired}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-helix-muted">Revoked</p>
          <p className="text-2xl font-bold mt-1 text-helix-danger">{stats.revoked}</p>
        </div>
      </div>

      {/* Access Codes */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Access Codes</h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-helix-muted" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search codes..."
                className="pl-10 pr-4 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm focus:border-helix-primary focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm focus:border-helix-primary focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="generated">Unused</option>
              <option value="redeemed">Redeemed</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-helix-bg/50 border-b border-helix-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Redeemed By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Expires</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-helix-border">
              {filteredCodes.map(code => {
                const redeemedBy = code.redeemedBy 
                  ? state.users.find(u => u.id === code.redeemedBy)
                  : null;

                return (
                  <tr key={code.id} className="hover:bg-helix-bg/30">
                    <td className="px-4 py-3">
                      <code className="font-mono text-sm">{code.code}</code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(code.status)}
                        <span className="text-sm capitalize">{code.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {redeemedBy ? (
                        <span className="text-sm">{redeemedBy.name}</span>
                      ) : (
                        <span className="text-sm text-helix-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {code.expiresAt ? (
                        <span className="text-sm">
                          {new Date(code.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-helix-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyCode(code.code)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-helix-primary/20 text-helix-primary rounded-lg text-sm hover:bg-helix-primary/30 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredCodes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-helix-muted">No codes found</p>
          </div>
        )}
      </div>
    </div>
  );
}
