import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import './Orders.css';

const STATUSES = ['all', 'pending', 'in_progress', 'completed', 'delivered', 'cancelled'];

const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const statusLabel = (status: string) => {
    if (!status) return 'Unknown';
    return status
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

const PAGE_SIZE = 10;

interface Order {
    id: number;
    customer_id?: number;
    customer_name?: string;
    delivery_address?: string;
    mix_design_id?: number;
    concrete_grade?: string;
    quantity: number | string;
    status: string;
    created_at: string;
}

interface MixDesign {
    id: number;
    grade_name: string;
}

const Orders = () => {
    const { API_URL } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, completedToday: 0 });
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [mixTypeFilter, setMixTypeFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Mix designs for dropdown
    const [mixDesigns, setMixDesigns] = useState<MixDesign[]>([]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    // Fetch mix designs on mount
    useEffect(() => {
        const fetchMixDesigns = async () => {
            try {
                const res = await axios.get(`${API_URL}/orders/mix-designs`);
                setMixDesigns(res.data);
            } catch (err) {
                console.error('Failed to fetch mix designs:', err);
            }
        };
        fetchMixDesigns();
    }, [API_URL]);

    // Fetch orders with filters
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const start = (page - 1) * PAGE_SIZE;
            const end = start + PAGE_SIZE - 1;

            const params: Record<string, any> = { start, end };
            if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
            if (mixTypeFilter) params.mix_type_id = mixTypeFilter;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const res = await axios.get(`${API_URL}/orders`, { params });
            setOrders(res.data.orders);
            setTotal(res.data.total);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    }, [API_URL, page, statusFilter, mixTypeFilter, dateFrom, dateTo]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/orders/stats`);
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setter(e.target.value);
        setPage(1); // Reset to first page on filter change
    };

    const clearFilters = () => {
        setStatusFilter('all');
        setMixTypeFilter('');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    const hasActiveFilters = statusFilter !== 'all' || mixTypeFilter || dateFrom || dateTo;

    // Pagination range
    const startItem = total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
    const endItem = Math.min(page * PAGE_SIZE, total);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div>
            {/* Header */}
            <div className="orders-header">
                <div>
                    <h1>Orders</h1>
                    <p>Monitor and manage all concrete dispatch requests</p>
                </div>
                <button className="btn btn-primary">+ Create New Order</button>
            </div>

            {/* Stat Cards */}
            <div className="orders-stats">
                <div className="stat-card">
                    <div className="stat-card-icon blue">📋</div>
                    <div>
                        <div className="stat-card-label">Total Orders</div>
                        <div className="stat-card-value">{stats.total.toLocaleString()}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon orange">🚚</div>
                    <div>
                        <div className="stat-card-label">Pending Deliveries</div>
                        <div className="stat-card-value">{stats.pending}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon green">✅</div>
                    <div>
                        <div className="stat-card-label">Completed Today</div>
                        <div className="stat-card-value">{stats.completedToday}</div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={handleFilterChange(setStatusFilter)}
                >
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>
                            Status: {s === 'all' ? 'All' : statusLabel(s)}
                        </option>
                    ))}
                </select>

                <select
                    className="filter-select"
                    value={mixTypeFilter}
                    onChange={handleFilterChange(setMixTypeFilter)}
                >
                    <option value="">Mix Type: All</option>
                    {mixDesigns.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.grade_name}
                        </option>
                    ))}
                </select>

                <div className="filter-date-group">
                    <label className="filter-date-label">From</label>
                    <input
                        type="date"
                        className="filter-date"
                        value={dateFrom}
                        onChange={handleFilterChange(setDateFrom)}
                    />
                </div>

                <div className="filter-date-group">
                    <label className="filter-date-label">To</label>
                    <input
                        type="date"
                        className="filter-date"
                        value={dateTo}
                        onChange={handleFilterChange(setDateTo)}
                    />
                </div>

                {hasActiveFilters && (
                    <button className="filter-clear" onClick={clearFilters}>
                        Clear All Filters
                    </button>
                )}
            </div>

            {/* Orders Table */}
            <div className="orders-table-wrap">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer Name</th>
                            <th>Mix Type</th>
                            <th>Quantity (M³)</th>
                            <th>Delivery Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                                    Loading orders...
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    <div className="empty-state">
                                        <span>📦</span>
                                        <p>No orders found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id}>
                                    <td>
                                        <span className="order-id">
                                            #ORD-{String(order.id).padStart(4, '0')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="customer-info">
                                            <span className="customer-name">
                                                {order.customer_name || `Customer #${order.customer_id}`}
                                            </span>
                                            {order.delivery_address && (
                                                <span className="customer-project">{order.delivery_address}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="mix-badge">
                                            {order.concrete_grade || (order.mix_design_id ? `Mix #${order.mix_design_id}` : '—')}
                                        </span>
                                    </td>
                                    <td>{order.quantity}</td>
                                    <td>
                                        <div>
                                            {formatDate(order.created_at)}
                                            <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                                                {formatTime(order.created_at)}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${order.status}`}>
                                            {statusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="actions-btn" title="Actions">⋮</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && total > 0 && (
                    <div className="pagination-bar">
                        <div className="pagination-info">
                            Showing {startItem} to {endItem} of {total.toLocaleString()} orders
                        </div>
                        <div className="pagination-controls">
                            <button
                                className="page-btn"
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </button>
                            {getPageNumbers().map((p) => (
                                <button
                                    key={p}
                                    className={`page-btn${p === page ? ' active' : ''}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                className="page-btn"
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
