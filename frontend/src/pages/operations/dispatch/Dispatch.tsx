import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import '../../../components/common/CrudModule.css';
import './Dispatch.css';

interface BoardTrip {
    id: number; order_id?: number; vehicle_id?: number; driver_id?: number;
    state_name?: string; state_slug?: string; state_color?: string;
    customer_name?: string; plate_number?: string; driver_name?: string; eta?: string;
}
interface Challan {
    id: number; challan_no: string; customer_name?: string; plate_number?: string;
    driver_name?: string; quantity?: number; issued_at?: string;
}

const Dispatch = () => {
    const { API_URL } = useAuth();
    const [board, setBoard] = useState<BoardTrip[]>([]);
    const [challans, setChallans] = useState<Challan[]>([]);
    // One idempotency key per trip for this page session, so double-clicking
    // "Generate Challan" on a trip can't produce two challans.
    const challanKeys = useRef<Map<number, string>>(new Map());

    const fetchAll = useCallback(async () => {
        try {
            const [b, c] = await Promise.all([
                axios.get(`${API_URL}/dispatch/board`),
                axios.get(`${API_URL}/dispatch/challans`, { params: { start: 0, end: 49 } }),
            ]);
            setBoard(b.data);
            setChallans(c.data.challans ?? []);
        } catch (err) {
            console.error('Failed to fetch dispatch data:', err);
        }
    }, [API_URL]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const generateChallan = async (t: BoardTrip) => {
        try {
            let key = challanKeys.current.get(t.id);
            if (!key) { key = crypto.randomUUID(); challanKeys.current.set(t.id, key); }
            await axios.post(`${API_URL}/dispatch/challans`, {
                trip_id: t.id, order_id: t.order_id, vehicle_id: t.vehicle_id, driver_id: t.driver_id,
            }, { headers: { 'Idempotency-Key': key } });
            fetchAll();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to generate challan.');
        }
    };

    // Group board trips by state for a simple kanban.
    const groups: Record<string, BoardTrip[]> = {};
    board.forEach((t) => {
        const key = t.state_name || 'Unknown';
        (groups[key] ||= []).push(t);
    });

    return (
        <div>
            <div className="crud-header">
                <div>
                    <h1>Dispatch</h1>
                    <p>Track trips by status and generate delivery challans</p>
                </div>
            </div>

            {/* Board */}
            <div className="dispatch-board">
                {Object.keys(groups).length === 0 ? (
                    <div className="crud-empty" style={{ width: '100%' }}><span>🗺️</span><p>No trips to dispatch.</p></div>
                ) : Object.entries(groups).map(([state, list]) => (
                    <div className="dispatch-col" key={state}>
                        <div className="dispatch-col-head">
                            <span className="dispatch-col-dot" style={{ background: list[0]?.state_color || 'var(--gray-400)' }} />
                            {state} <span className="dispatch-col-count">{list.length}</span>
                        </div>
                        {list.map((t) => (
                            <div className="dispatch-card" key={t.id}>
                                <div className="dispatch-card-title">#TRP-{String(t.id).padStart(4, '0')}</div>
                                <div className="dispatch-card-sub">{t.customer_name || `Order #${t.order_id}`}</div>
                                <div className="dispatch-card-meta">
                                    {t.plate_number && <span>🚛 {t.plate_number}</span>}
                                    {t.driver_name && <span>👤 {t.driver_name}</span>}
                                </div>
                                <button className="crud-action-btn" onClick={() => generateChallan(t)}>Generate Challan</button>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Challans */}
            <div className="crud-header" style={{ marginTop: 32 }}>
                <div><h1 style={{ fontSize: 18 }}>Delivery Challans</h1></div>
            </div>
            <div className="crud-table-wrap">
                <table className="crud-table">
                    <thead>
                        <tr><th>Challan No.</th><th>Customer</th><th>Vehicle</th><th>Driver</th><th>Qty (m³)</th><th>Issued</th></tr>
                    </thead>
                    <tbody>
                        {challans.length === 0 ? (
                            <tr><td colSpan={6}><div className="crud-empty"><span>🧾</span><p>No challans yet.</p></div></td></tr>
                        ) : challans.map((c) => (
                            <tr key={c.id}>
                                <td><b>{c.challan_no}</b></td>
                                <td>{c.customer_name || '—'}</td>
                                <td>{c.plate_number || '—'}</td>
                                <td>{c.driver_name || '—'}</td>
                                <td>{c.quantity ?? '—'}</td>
                                <td>{c.issued_at ? new Date(c.issued_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dispatch;
