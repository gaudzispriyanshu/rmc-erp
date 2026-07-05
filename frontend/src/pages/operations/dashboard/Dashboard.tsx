import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import './Dashboard.css';

interface RecentOrder {
    id: number;
    customer_name?: string;
    concrete_grade?: string;
    quantity?: number | string;
    status: string;
}

interface BoardTrip {
    id: number;
    state_name?: string;
    state_slug?: string;
    state_color?: string;
    customer_name?: string;
    plate_number?: string;
    eta?: string;
}

interface LowStock { id: number; name: string; current_stock: number; unit?: string; }

const badgeClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (['pending', 'confirmed'].includes(s)) return 'badge-warning';
    if (['delivered', 'closed', 'completed'].includes(s)) return 'badge-success';
    if (s === 'cancelled') return 'badge-danger';
    return 'badge-info';
};

const label = (s: string) => !s ? '—' : s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Rough progress by trip state, for the live-trip bars.
const progressFor = (slug?: string) =>
    slug === 'assigned' ? 25 : slug === 'started' ? 60 : slug === 'delivered' ? 90 : slug === 'completed' ? 100 : 10;

const ACTIVE = new Set(['assigned', 'started', 'delivered']);

const Dashboard = () => {
    const { user, API_URL } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({ total: 0, pending: 0, completedToday: 0 });
    const [recent, setRecent] = useState<RecentOrder[]>([]);
    const [board, setBoard] = useState<BoardTrip[]>([]);
    const [lowStock, setLowStock] = useState<LowStock[]>([]);

    const load = useCallback(async () => {
        try {
            const [s, r, b, l] = await Promise.all([
                axios.get(`${API_URL}/orders/stats`),
                axios.get(`${API_URL}/orders/recent`, { params: { limit: 5 } }),
                axios.get(`${API_URL}/dispatch/board`),
                axios.get(`${API_URL}/inventory/low-stock`),
            ]);
            setStats(s.data);
            setRecent(r.data ?? []);
            setBoard(b.data ?? []);
            setLowStock(l.data ?? []);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        }
    }, [API_URL]);

    useEffect(() => { load(); }, [load]);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const activeTrips = board.filter((t) => ACTIVE.has(t.state_slug || ''));
    const liveTrips = activeTrips.slice(0, 5);

    return (
        <div>
            <div className="dashboard-header">
                <div className="dashboard-welcome">
                    <h1>Welcome back, {user?.name || 'Admin'}</h1>
                    <p>Here is the daily overview of RMC operations for {today}.</p>
                </div>
                <div className="dashboard-actions">
                    <button className="btn btn-primary" onClick={() => navigate('/orders/new')}>+ New Order</button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div>
                        <div className="stat-card-label">Total Orders</div>
                        <div className="stat-card-value">{stats.total}</div>
                        <div className="stat-card-sub">{stats.completedToday} completed today</div>
                    </div>
                    <div className="stat-card-icon blue">📋</div>
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-card-label">Active Trips</div>
                        <div className="stat-card-value">{activeTrips.length}</div>
                        <div className="stat-card-sub">{stats.pending} orders pending</div>
                    </div>
                    <div className="stat-card-icon green">🚛</div>
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-card-label">Low Stock Alerts</div>
                        <div className="stat-card-value" style={{ color: lowStock.length ? 'var(--danger)' : undefined }}>{lowStock.length}</div>
                        <div className="stat-card-sub">
                            {lowStock.length ? lowStock.slice(0, 2).map((i) => i.name).join(', ') : 'All stock healthy'}
                        </div>
                    </div>
                    <div className="stat-card-icon red">⚠️</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="recent-orders">
                    <div className="section-header">
                        <div className="section-title">📋 Recent Orders</div>
                        <span className="section-link" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>View All</span>
                    </div>
                    <table className="orders-table">
                        <thead>
                            <tr><th>Order ID</th><th>Client</th><th>Mix Type</th><th>Volume</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {recent.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>No recent orders.</td></tr>
                            ) : recent.map((o) => (
                                <tr key={o.id}>
                                    <td className="order-id">#ORD-{String(o.id).padStart(4, '0')}</td>
                                    <td>{o.customer_name || '—'}</td>
                                    <td>{o.concrete_grade || '—'}</td>
                                    <td>{o.quantity ?? '—'} m³</td>
                                    <td><span className={`badge ${badgeClass(o.status)}`}>{label(o.status)}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="trip-status">
                    <div className="section-header">
                        <div className="section-title">📡 Live Trip Status</div>
                    </div>
                    {liveTrips.length === 0 ? (
                        <div style={{ padding: 24, color: 'var(--gray-400)', fontSize: 14 }}>No active trips right now.</div>
                    ) : liveTrips.map((t) => (
                        <div className="trip-item" key={t.id}>
                            <div className="trip-icon">🚛</div>
                            <div className="trip-info">
                                <div className="trip-name">
                                    #TRP-{String(t.id).padStart(4, '0')} – {t.plate_number || 'Vehicle'}
                                    <span className="badge badge-info">{t.state_name || '—'}</span>
                                </div>
                                <div className="trip-detail">
                                    {t.customer_name || 'Customer'} {t.eta ? `• ETA ${new Date(t.eta).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : ''}
                                </div>
                                <div className="trip-progress">
                                    <div className="trip-progress-bar" style={{ width: `${progressFor(t.state_slug)}%`, background: t.state_color || 'var(--primary-500)' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="section-footer">
                        <span className="section-link" onClick={() => navigate('/dispatch')} style={{ cursor: 'pointer' }}>View Dispatch</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
