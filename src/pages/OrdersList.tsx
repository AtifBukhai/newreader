import { useState } from 'react';
import { useApp } from '../store';
import { useNavigate } from 'react-router-dom';
import type { Order, ValidityType, DurationUnit } from '../types';
import {
  ShoppingCart, Plus, Search, Filter, Eye, Download, Calendar,
  CheckCircle2, Clock, XCircle, AlertCircle, BookOpen, Users
} from 'lucide-react';

// ==================== ORDERS LIST ====================
export function OrdersList() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [validityFilter, setValidityFilter] = useState<string>('all');

  const filteredOrders = state.orders.filter(order => {
    const matchesSearch = !search || 
      order.orderId.toLowerCase().includes(search.toLowerCase()) ||
      state.partners.find(p => p.id === order.partnerId)?.name.toLowerCase().includes(search.toLowerCase()) ||
      state.books.find(b => b.id === order.bookId)?.title.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPartner = partnerFilter === 'all' || order.partnerId === partnerFilter;
    const matchesValidity = validityFilter === 'all' || order.validityType === validityFilter;

    return matchesSearch && matchesStatus && matchesPartner && matchesValidity;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fulfilled': return <CheckCircle2 className="w-4 h-4 text-helix-success" />;
      case 'approved': return <Clock className="w-4 h-4 text-helix-accent" />;
      case 'submitted': return <Clock className="w-4 h-4 text-helix-primary" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-helix-danger" />;
      default: return <AlertCircle className="w-4 h-4 text-helix-muted" />;
    }
  };

  const getCodeStats = (orderId: string) => {
    const codes = state.codes.filter(c => c.orderId === orderId);
    return {
      total: codes.length,
      unused: codes.filter(c => c.status === 'generated').length,
      redeemed: codes.filter(c => c.status === 'redeemed').length,
      expired: codes.filter(c => c.status === 'expired').length,
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-helix-muted mt-1">Manage orders and access codes</p>
        </div>
        <button 
          onClick={() => navigate('/admin/orders/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Create Order
        </button>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-helix-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
            value={validityFilter}
            onChange={e => setValidityFilter(e.target.value)}
            className="px-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
          >
            <option value="all">All Validity Types</option>
            <option value="upon_activation">Upon Activation</option>
            <option value="valid_until_date">Valid Until Date</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-helix-bg/50 border-b border-helix-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Partner</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Book</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Codes</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Validity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Created</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-helix-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-helix-border">
              {filteredOrders.map(order => {
                const partner = state.partners.find(p => p.id === order.partnerId);
                const book = state.books.find(b => b.id === order.bookId);
                const stats = getCodeStats(order.id);
                
                return (
                  <tr key={order.id} className="hover:bg-helix-bg/30">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium">{order.orderId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-helix-muted" />
                        <span className="text-sm">{partner?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-helix-muted" />
                        <span className="text-sm">{book?.title || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium">{stats.total} total</div>
                        <div className="text-xs text-helix-muted">
                          {stats.unused} unused · {stats.redeemed} redeemed
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {order.validityType === 'upon_activation' ? (
                          <div>
                            <div className="font-medium">Upon Activation</div>
                            <div className="text-xs text-helix-muted">
                              {order.validityDuration} {order.validityDurationUnit}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">Valid Until</div>
                            <div className="text-xs text-helix-muted">
                              {order.validUntilDate ? new Date(order.validUntilDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="text-sm capitalize">{order.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-helix-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-helix-primary/20 text-helix-primary rounded-lg text-sm hover:bg-helix-primary/30 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-helix-muted mx-auto mb-3" />
            <p className="text-helix-muted">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
