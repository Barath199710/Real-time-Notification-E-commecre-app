import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { ShoppingBag, Calendar, Package, AlertCircle, Ban, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

export const MyOrders = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/orders/my');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setError(err.response?.data?.error || 'Failed to fetch personal orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;

    try {
      await api.put(`/api/orders/${orderId}/cancel`);
      showToast(`Order #${orderId} has been cancelled.`, 'success');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o))
      );
    } catch (err) {
      console.error('Failed to cancel order:', err);
      showToast(err.response?.data?.error || 'Failed to cancel order.', 'error');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to remove Order #${orderId} from history?`)) return;

    try {
      await api.delete(`/api/orders/${orderId}`);
      showToast(`Order #${orderId} removed.`, 'success');
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error('Failed to delete order:', err);
      showToast(err.response?.data?.error || 'Failed to remove order.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading your protected order history...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)',
          }}
        >
          <ShoppingBag size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            My Orders
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '2px 0 0' }}>
            Viewing orders for signed-in user: <strong>{user?.name}</strong> ({user?.email})
          </p>
        </div>
      </div>

      {error ? (
        <div
          style={{
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--error-color)',
            color: 'var(--error-color)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={20} /> {error}
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            background: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px solid var(--border-color)',
            transition: 'var(--theme-transition)',
          }}
        >
          <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 6px' }}>No Orders Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            You haven't placed any orders yet. Explore our product catalog!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'var(--card-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                padding: '20px 24px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                transition: 'var(--theme-transition)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>
                    Order #{order.id}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background:
                        order.status === 'Delivered'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : order.status === 'Shipped'
                          ? 'rgba(99, 102, 241, 0.15)'
                          : order.status === 'Cancelled'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                      color:
                        order.status === 'Delivered'
                          ? 'var(--success-color)'
                          : order.status === 'Shipped'
                          ? 'var(--accent-primary)'
                          : order.status === 'Cancelled'
                          ? 'var(--error-color)'
                          : 'var(--warning-color)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {order.status}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', gap: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {order.created_at || 'Recent'}
                  </span>
                  <span>Items: {order.items_count}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  ${Number(order.total_amount).toFixed(2)}
                </span>

                {/* Cancel & Remove Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      title="Cancel Order"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #ef4444',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Ban size={14} /> Cancel
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    title="Remove Order"
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
