import { useState, useEffect, useCallback, useRef, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import '../../../components/common/CrudModule.css';
import './CreateOrder.css';

interface Customer { id: number; name: string; }
interface MixDesign { id: number; grade_name: string; }

// Handles both creating a new order (/orders/new) and editing an existing one (/orders/:id/edit).
const CreateOrder = () => {
    const { API_URL } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [mixDesigns, setMixDesigns] = useState<MixDesign[]>([]);
    const [form, setForm] = useState<Record<string, any>>({
        customer_id: '', mix_design_id: '', quantity: '', delivery_address: '', delivery_date: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    // One key per form session: a double-click (or network retry) re-sends the
    // same key, so the backend replays the first response instead of creating
    // a second order. The backend frees the key on failure, so retries work.
    const idempotencyKey = useRef<string>(crypto.randomUUID());

    const loadRefs = useCallback(async () => {
        try {
            const [c, m] = await Promise.all([
                axios.get(`${API_URL}/customers`, { params: { start: 0, end: 199 } }),
                axios.get(`${API_URL}/orders/mix-designs`),
            ]);
            setCustomers(c.data.customers ?? []);
            setMixDesigns(m.data ?? []);
        } catch (err) {
            console.error('Failed to load reference data:', err);
        }
    }, [API_URL]);

    const loadOrder = useCallback(async () => {
        if (!isEdit) return;
        try {
            const res = await axios.get(`${API_URL}/orders/${id}`);
            const o = res.data;
            setForm({
                customer_id: o.customer_id ?? '',
                mix_design_id: o.mix_design_id ?? '',
                quantity: o.quantity ?? '',
                delivery_address: o.delivery_address ?? '',
                delivery_date: o.delivery_date ? o.delivery_date.slice(0, 10) : '',
            });
        } catch (err) {
            console.error('Failed to load order:', err);
        }
    }, [API_URL, id, isEdit]);

    useEffect(() => { loadRefs(); }, [loadRefs]);
    useEffect(() => { loadOrder(); }, [loadOrder]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.mix_design_id || !form.quantity || !form.delivery_date) {
            setError('Mix design, quantity and delivery date are required.');
            return;
        }
        const payload = {
            customer_id: form.customer_id ? Number(form.customer_id) : undefined,
            mix_design_id: Number(form.mix_design_id),
            quantity: Number(form.quantity),
            delivery_address: form.delivery_address || undefined,
            delivery_date: form.delivery_date,
        };
        try {
            setSaving(true);
            if (isEdit) await axios.put(`${API_URL}/orders/${id}`, payload);
            else await axios.post(`${API_URL}/orders`, payload, {
                headers: { 'Idempotency-Key': idempotencyKey.current },
            });
            navigate('/orders');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save order.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="crud-header">
                <div>
                    <h1>{isEdit ? 'Edit Order' : 'Create New Order'}</h1>
                    <p>{isEdit ? 'Update the order details.' : 'Place a new concrete dispatch request.'}</p>
                </div>
                <button className="btn btn-outline" onClick={() => navigate('/orders')}>← Back to Orders</button>
            </div>

            <div className="create-order-card">
                <form onSubmit={handleSubmit}>
                    <div className="create-order-grid">
                        <div className="crud-field">
                            <label>Customer</label>
                            <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                                <option value="">Select customer…</option>
                                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="crud-field">
                            <label>Mix Design <span className="req">*</span></label>
                            <select value={form.mix_design_id} onChange={(e) => setForm({ ...form, mix_design_id: e.target.value })}>
                                <option value="">Select grade…</option>
                                {mixDesigns.map((m) => <option key={m.id} value={m.id}>{m.grade_name}</option>)}
                            </select>
                        </div>

                        <div className="crud-field">
                            <label>Quantity (m³) <span className="req">*</span></label>
                            <input type="number" step="0.5" value={form.quantity}
                                onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                        </div>

                        <div className="crud-field">
                            <label>Delivery Date <span className="req">*</span></label>
                            <input type="date" value={form.delivery_date}
                                onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} />
                        </div>

                        <div className="crud-field create-order-full">
                            <label>Delivery Address</label>
                            <textarea value={form.delivery_address}
                                onChange={(e) => setForm({ ...form, delivery_address: e.target.value })} />
                        </div>
                    </div>

                    {error && <div className="crud-error">{error}</div>}

                    <div className="crud-modal-actions">
                        <button type="button" className="btn btn-outline" onClick={() => navigate('/orders')}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOrder;
