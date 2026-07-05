import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import WorkflowStatus, { WfState, Transition } from '../../../components/common/WorkflowStatus';
import DataTable, { DTAction } from '../../../components/common/DataTable';
import '../../../components/common/CrudModule.css';
import './Orders.css';

const STATUSES = ['all', 'pending', 'confirmed', 'in_production', 'dispatched', 'delivered', 'closed', 'cancelled'];

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const statusLabel = (status: string) =>
    !status ? 'Unknown' : status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

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
    workflow_state_id?: number | null;
    delivery_date?: string;
    created_at: string;
}

interface MixDesign { id: number; grade_name: string; }

const Orders = () => {
    const { API_URL } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, completedToday: 0 });
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState('all');
    const [mixTypeFilter, setMixTypeFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [mixDesigns, setMixDesigns] = useState<MixDesign[]>([]);

    const [states, setStates] = useState<WfState[]>([]);
    const [transitions, setTransitions] = useState<Transition[]>([]);

    const [viewing, setViewing] = useState<Order | null>(null);

    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

    useEffect(() => {
        const run = async () => {
            try {
                const res = await axios.get(`${API_URL}/orders/mix-designs`);
                setMixDesigns(res.data);
            } catch (err) { console.error('Failed to fetch mix designs:', err); }
        };
        run();
    }, [API_URL]);

    useEffect(() => {
        const run = async () => {
            try {
                const res = await axios.get(`${API_URL}/workflows`, { params: { entity_type: 'order' } });
                setStates(res.data.states);
                setTransitions(res.data.transitions);
            } catch (err) { console.error('Failed to fetch order workflow:', err); }
        };
        run();
    }, [API_URL]);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const start = (page - 1) * PAGE_SIZE;
            const params: Record<string, any> = { start, end: start + PAGE_SIZE - 1 };
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
        } catch (err) { console.error('Failed to fetch stats:', err); }
    }, [API_URL]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleFilter = (setter: React.Dispatch<React.SetStateAction<string>>) =>
        (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => { setter(e.target.value); setPage(1); };

    const clearFilters = () => {
        setStatusFilter('all'); setMixTypeFilter(''); setDateFrom(''); setDateTo(''); setPage(1);
    };

    const hasActiveFilters = statusFilter !== 'all' || mixTypeFilter || dateFrom || dateTo;

    const handleDelete = async (order: Order) => {
        if (!window.confirm('Delete this order?')) return;
        try {
            await axios.delete(`${API_URL}/orders/${order.id}`);
            fetchOrders();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Delete failed.');
        }
    };

    const rowActions = (order: Order): DTAction[] => [
        { label: 'View', onClick: () => setViewing(order) },
        { label: 'Edit', onClick: () => navigate(`/orders/${order.id}/edit`) },
        { label: 'Delete', danger: true, onClick: () => handleDelete(order) },
    ];

    const columns = [
        { key: 'id', label: 'Order ID', render: (o: Order) => <span className="order-id">#ORD-{String(o.id).padStart(4, '0')}</span> },
        {
            key: 'customer', label: 'Customer', render: (o: Order) => (
                <div className="customer-info">
                    <span className="customer-name">{o.customer_name || `Customer #${o.customer_id}`}</span>
                    {o.delivery_address && <span className="customer-project">{o.delivery_address}</span>}
                </div>
            ),
        },
        { key: 'concrete_grade', label: 'Mix Type', render: (o: Order) => <span className="mix-badge">{o.concrete_grade || (o.mix_design_id ? `Mix #${o.mix_design_id}` : '—')}</span> },
        { key: 'quantity', label: 'Qty (m³)' },
        { key: 'delivery_date', label: 'Delivery Date', render: (o: Order) => formatDate(o.delivery_date || o.created_at) },
        {
            key: 'status', label: 'Status', render: (o: Order) =>
                states.length > 0
                    ? <WorkflowStatus states={states} transitions={transitions} row={o} apiPath="/orders" onChanged={fetchOrders} />
                    : <span className={`status-badge ${o.status}`}>{statusLabel(o.status)}</span>,
        },
    ];

    return (
        <div>
            <div className="orders-header">
                <div>
                    <h1>Orders</h1>
                    <p>Monitor and manage all concrete dispatch requests</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/orders/new')}>+ Create New Order</button>
            </div>

            <div className="orders-stats">
                <div className="stat-card">
                    <div className="stat-card-icon blue">📋</div>
                    <div><div className="stat-card-label">Total Orders</div><div className="stat-card-value">{stats.total.toLocaleString()}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon orange">🚚</div>
                    <div><div className="stat-card-label">Pending Deliveries</div><div className="stat-card-value">{stats.pending}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon green">✅</div>
                    <div><div className="stat-card-label">Completed Today</div><div className="stat-card-value">{stats.completedToday}</div></div>
                </div>
            </div>

            <div className="filter-bar">
                <select className="filter-select" value={statusFilter} onChange={handleFilter(setStatusFilter)}>
                    {STATUSES.map((s) => <option key={s} value={s}>Status: {s === 'all' ? 'All' : statusLabel(s)}</option>)}
                </select>
                <select className="filter-select" value={mixTypeFilter} onChange={handleFilter(setMixTypeFilter)}>
                    <option value="">Mix Type: All</option>
                    {mixDesigns.map((m) => <option key={m.id} value={m.id}>{m.grade_name}</option>)}
                </select>
                <div className="filter-date-group">
                    <label className="filter-date-label">From</label>
                    <input type="date" className="filter-date" value={dateFrom} onChange={handleFilter(setDateFrom)} />
                </div>
                <div className="filter-date-group">
                    <label className="filter-date-label">To</label>
                    <input type="date" className="filter-date" value={dateTo} onChange={handleFilter(setDateTo)} />
                </div>
                {hasActiveFilters && <button className="filter-clear" onClick={clearFilters}>Clear All Filters</button>}
            </div>

            <DataTable
                columns={columns}
                rows={orders}
                loading={loading}
                emptyIcon="📦"
                emptyText="No orders found."
                actions={rowActions}
                page={page}
                totalPages={totalPages}
                total={total}
                onPageChange={setPage}
            />

            {viewing && (
                <div className="crud-modal-overlay" onClick={() => setViewing(null)}>
                    <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Order #ORD-{String(viewing.id).padStart(4, '0')}</h2>
                        <div className="crud-view">
                            <div className="crud-view-row"><span>Customer</span><div>{viewing.customer_name || `#${viewing.customer_id}`}</div></div>
                            <div className="crud-view-row"><span>Mix Type</span><div>{viewing.concrete_grade || `Mix #${viewing.mix_design_id}`}</div></div>
                            <div className="crud-view-row"><span>Quantity</span><div>{viewing.quantity} m³</div></div>
                            <div className="crud-view-row"><span>Delivery Date</span><div>{formatDate(viewing.delivery_date || viewing.created_at)}</div></div>
                            <div className="crud-view-row"><span>Address</span><div>{viewing.delivery_address || '—'}</div></div>
                            <div className="crud-view-row"><span>Status</span><div>{statusLabel(viewing.status)}</div></div>
                        </div>
                        <div className="crud-modal-actions">
                            <button className="btn btn-outline" onClick={() => { const id = viewing.id; setViewing(null); navigate(`/orders/${id}/edit`); }}>Edit</button>
                            <button className="btn btn-primary" onClick={() => setViewing(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
