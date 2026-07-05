import { useState, useEffect, useCallback, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import WorkflowStatus, { WfState, Transition } from '../../../components/common/WorkflowStatus';
import DataTable, { DTAction } from '../../../components/common/DataTable';
import '../../../components/common/CrudModule.css';

const PAGE_SIZE = 10;

interface Trip {
    id: number;
    order_id?: number;
    customer_name?: string;
    driver_name?: string;
    delivery_address?: string;
    eta?: string;
    workflow_state_id?: number | null;
    status?: string;
}

const fmt = (s?: string) => (s ? new Date(s).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

const Trips = () => {
    const { API_URL } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [states, setStates] = useState<WfState[]>([]);
    const [transitions, setTransitions] = useState<Transition[]>([]);

    const [orders, setOrders] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [viewing, setViewing] = useState<Trip | null>(null);

    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

    const fetchTrips = useCallback(async () => {
        try {
            setLoading(true);
            const start = (page - 1) * PAGE_SIZE;
            const res = await axios.get(`${API_URL}/trips`, { params: { start, end: start + PAGE_SIZE - 1 } });
            setTrips(res.data.trips);
            setTotal(res.data.total);
        } catch (err) {
            console.error('Failed to fetch trips:', err);
        } finally {
            setLoading(false);
        }
    }, [API_URL, page]);

    const fetchWorkflow = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/workflows`, { params: { entity_type: 'trip' } });
            setStates(res.data.states);
            setTransitions(res.data.transitions);
        } catch (err) { console.error('Failed to fetch trip workflow:', err); }
    }, [API_URL]);

    const fetchRefs = useCallback(async () => {
        try {
            const [o, v, d] = await Promise.all([
                axios.get(`${API_URL}/orders`, { params: { start: 0, end: 99 } }),
                axios.get(`${API_URL}/vehicles`, { params: { start: 0, end: 99 } }),
                axios.get(`${API_URL}/drivers`, { params: { start: 0, end: 99 } }),
            ]);
            setOrders(o.data.orders ?? []);
            setVehicles(v.data.vehicles ?? []);
            setDrivers(d.data.drivers ?? []);
        } catch (err) { console.error('Failed to fetch reference data:', err); }
    }, [API_URL]);

    useEffect(() => { fetchTrips(); }, [fetchTrips]);
    useEffect(() => { fetchWorkflow(); fetchRefs(); }, [fetchWorkflow, fetchRefs]);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.order_id || !form.vehicle_id || !form.driver_id || !form.eta) {
            setError('Order, vehicle, driver and ETA are required.');
            return;
        }
        try {
            setSaving(true);
            await axios.post(`${API_URL}/trips`, {
                order_id: Number(form.order_id),
                vehicle_id: Number(form.vehicle_id),
                driver_id: Number(form.driver_id),
                eta: form.eta,
            });
            setModalOpen(false);
            setForm({});
            fetchTrips();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create trip.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (trip: Trip) => {
        if (!window.confirm('Delete this trip?')) return;
        await axios.delete(`${API_URL}/trips/${trip.id}`);
        fetchTrips();
    };

    const rowActions = (trip: Trip): DTAction[] => [
        { label: 'View', onClick: () => setViewing(trip) },
        { label: 'Delete', danger: true, onClick: () => handleDelete(trip) },
    ];

    const columns = [
        { key: 'id', label: 'Trip ID', render: (t: Trip) => <b>#TRP-{String(t.id).padStart(4, '0')}</b> },
        {
            key: 'customer', label: 'Order / Customer', render: (t: Trip) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{t.customer_name || `Order #${t.order_id}`}</span>
                    {t.delivery_address && <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{t.delivery_address}</span>}
                </div>
            ),
        },
        { key: 'driver_name', label: 'Driver' },
        { key: 'eta', label: 'ETA', render: (t: Trip) => fmt(t.eta) },
        {
            key: 'status', label: 'Status', render: (t: Trip) =>
                <WorkflowStatus states={states} transitions={transitions} row={t} apiPath="/trips" onChanged={fetchTrips} />,
        },
    ];

    return (
        <div>
            <div className="crud-header">
                <div>
                    <h1>Trips</h1>
                    <p>Dispatch trips and track delivery progress</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Create New Trip</button>
            </div>

            <DataTable
                columns={columns}
                rows={trips}
                loading={loading}
                emptyIcon="🚚"
                emptyText="No trips yet."
                actions={rowActions}
                page={page}
                totalPages={totalPages}
                total={total}
                onPageChange={setPage}
            />

            {modalOpen && (
                <div className="crud-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Create New Trip</h2>
                        <form onSubmit={handleCreate}>
                            <div className="crud-field">
                                <label>Order <span className="req">*</span></label>
                                <select value={form.order_id ?? ''} onChange={(e) => setForm({ ...form, order_id: e.target.value })}>
                                    <option value="">Select order…</option>
                                    {orders.map((o) => (
                                        <option key={o.id} value={o.id}>#ORD-{String(o.id).padStart(4, '0')} — {o.customer_name || 'Customer'}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="crud-field">
                                <label>Vehicle <span className="req">*</span></label>
                                <select value={form.vehicle_id ?? ''} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
                                    <option value="">Select vehicle…</option>
                                    {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate_number} ({v.status})</option>)}
                                </select>
                            </div>
                            <div className="crud-field">
                                <label>Driver <span className="req">*</span></label>
                                <select value={form.driver_id ?? ''} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
                                    <option value="">Select driver…</option>
                                    {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="crud-field">
                                <label>ETA <span className="req">*</span></label>
                                <input type="datetime-local" value={form.eta ?? ''} onChange={(e) => setForm({ ...form, eta: e.target.value })} />
                            </div>
                            {error && <div className="crud-error">{error}</div>}
                            <div className="crud-modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Create Trip'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {viewing && (
                <div className="crud-modal-overlay" onClick={() => setViewing(null)}>
                    <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Trip #TRP-{String(viewing.id).padStart(4, '0')}</h2>
                        <div className="crud-view">
                            <div className="crud-view-row"><span>Customer</span><div>{viewing.customer_name || `Order #${viewing.order_id}`}</div></div>
                            <div className="crud-view-row"><span>Driver</span><div>{viewing.driver_name || '—'}</div></div>
                            <div className="crud-view-row"><span>Address</span><div>{viewing.delivery_address || '—'}</div></div>
                            <div className="crud-view-row"><span>ETA</span><div>{fmt(viewing.eta)}</div></div>
                            <div className="crud-view-row"><span>Status</span><div>{viewing.status || '—'}</div></div>
                        </div>
                        <div className="crud-modal-actions">
                            <button className="btn btn-primary" onClick={() => setViewing(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trips;
