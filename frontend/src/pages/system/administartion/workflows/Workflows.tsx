import { useState, useEffect, useCallback, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import '../../../../components/common/CrudModule.css';
import './Workflows.css';

interface Workflow { id: number; name: string; entity_type: string; description?: string; is_active: boolean; }
interface WfState { id: number; workflow_id: number; name: string; slug: string; color: string; sort_order: number; is_initial: boolean; is_terminal: boolean; }
interface Transition { id: number; from_state_id: number | null; to_state_id: number; }
interface Bundle { workflow: Workflow; states: WfState[]; transitions: Transition[]; }

const tKey = (from: number | null, to: number) => `${from ?? 'null'}-${to}`;

const Workflows = () => {
    const { API_URL } = useAuth();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [bundle, setBundle] = useState<Bundle | null>(null);
    const [edges, setEdges] = useState<Set<string>>(new Set());
    const [savingT, setSavingT] = useState(false);
    const [msg, setMsg] = useState('');

    // state add/edit modal
    const [stateModal, setStateModal] = useState(false);
    const [editingState, setEditingState] = useState<WfState | null>(null);
    const [sForm, setSForm] = useState<Record<string, any>>({});

    // create workflow modal
    const [wfModal, setWfModal] = useState(false);
    const [wfForm, setWfForm] = useState({ name: '', entity_type: 'order', description: '' });

    const fetchWorkflows = useCallback(async () => {
        const res = await axios.get(`${API_URL}/workflows`);
        setWorkflows(res.data);
        if (res.data.length && selectedId === null) setSelectedId(res.data[0].id);
    }, [API_URL, selectedId]);

    const fetchBundle = useCallback(async (id: number) => {
        const res = await axios.get(`${API_URL}/workflows/${id}`);
        setBundle(res.data);
        setEdges(new Set(res.data.transitions.map((t: Transition) => tKey(t.from_state_id, t.to_state_id))));
    }, [API_URL]);

    useEffect(() => { fetchWorkflows(); }, [fetchWorkflows]);
    useEffect(() => { if (selectedId !== null) fetchBundle(selectedId); }, [selectedId, fetchBundle]);

    const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

    const toggleEdge = (from: number | null, to: number) => {
        if (from === to) return; // no self-loops
        const key = tKey(from, to);
        const next = new Set(edges);
        next.has(key) ? next.delete(key) : next.add(key);
        setEdges(next);
    };

    const saveTransitions = async () => {
        if (!bundle) return;
        const transitions = Array.from(edges).map((k) => {
            const [from, to] = k.split('-');
            return { from_state_id: from === 'null' ? null : Number(from), to_state_id: Number(to) };
        });
        try {
            setSavingT(true);
            await axios.put(`${API_URL}/workflows/${bundle.workflow.id}/transitions`, { transitions });
            flash('Transitions saved.');
            fetchBundle(bundle.workflow.id);
        } catch {
            flash('Failed to save transitions.');
        } finally { setSavingT(false); }
    };

    // ----- state modal -----
    const openAddState = () => {
        setEditingState(null);
        setSForm({ name: '', slug: '', color: '#64748b', sort_order: (bundle?.states.length ?? 0) + 1, is_initial: false, is_terminal: false });
        setStateModal(true);
    };
    const openEditState = (s: WfState) => {
        setEditingState(s);
        setSForm({ ...s });
        setStateModal(true);
    };
    const submitState = async (e: FormEvent) => {
        e.preventDefault();
        if (!bundle) return;
        const payload = {
            name: sForm.name, slug: sForm.slug, color: sForm.color,
            sort_order: Number(sForm.sort_order) || 0,
            is_initial: !!sForm.is_initial, is_terminal: !!sForm.is_terminal,
        };
        try {
            if (editingState) await axios.put(`${API_URL}/workflows/states/${editingState.id}`, payload);
            else await axios.post(`${API_URL}/workflows/${bundle.workflow.id}/states`, payload);
            setStateModal(false);
            fetchBundle(bundle.workflow.id);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to save state.');
        }
    };
    const deleteState = async (s: WfState) => {
        if (!bundle) return;
        if (!window.confirm(`Delete state "${s.name}"? Its transitions will be removed too.`)) return;
        await axios.delete(`${API_URL}/workflows/states/${s.id}`);
        fetchBundle(bundle.workflow.id);
    };

    const createWorkflow = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/workflows`, wfForm);
            setWfModal(false);
            setWfForm({ name: '', entity_type: 'order', description: '' });
            await fetchWorkflows();
            setSelectedId(res.data.id);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to create workflow.');
        }
    };

    const states = bundle?.states ?? [];

    return (
        <div>
            <div className="crud-header">
                <div>
                    <h1>Workflows</h1>
                    <p>Configure the status lifecycle and allowed transitions for each entity.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setWfModal(true)}>+ New Workflow</button>
            </div>

            {msg && <div className="wf-flash">{msg}</div>}

            <div className="wf-layout">
                {/* Workflow list */}
                <div className="wf-list">
                    {workflows.map((w) => (
                        <div
                            key={w.id}
                            className={`wf-list-item${w.id === selectedId ? ' active' : ''}`}
                            onClick={() => setSelectedId(w.id)}
                        >
                            <div className="wf-list-name">{w.name}</div>
                            <div className="wf-list-entity">{w.entity_type}</div>
                        </div>
                    ))}
                </div>

                {/* Selected workflow detail */}
                <div className="wf-detail">
                    {!bundle ? (
                        <div className="crud-empty"><span>🔀</span><p>Select a workflow.</p></div>
                    ) : (
                        <>
                            {/* States */}
                            <div className="wf-section-head">
                                <h3>States</h3>
                                <button className="btn btn-outline btn-sm" onClick={openAddState}>+ Add State</button>
                            </div>
                            <table className="crud-table wf-states-table">
                                <thead>
                                    <tr><th>Order</th><th>Name</th><th>Slug</th><th>Flags</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {states.map((s) => (
                                        <tr key={s.id}>
                                            <td>{s.sort_order}</td>
                                            <td>
                                                <span className="wf-state-chip" style={{ background: s.color }}>{s.name}</span>
                                            </td>
                                            <td><code>{s.slug}</code></td>
                                            <td>
                                                {s.is_initial && <span className="wf-flag initial">initial</span>}
                                                {s.is_terminal && <span className="wf-flag terminal">terminal</span>}
                                            </td>
                                            <td>
                                                <button className="crud-action-btn" onClick={() => openEditState(s)}>Edit</button>
                                                <button className="crud-action-btn danger" onClick={() => deleteState(s)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Transition matrix */}
                            <div className="wf-section-head" style={{ marginTop: 28 }}>
                                <h3>Allowed Transitions</h3>
                                <button className="btn btn-primary btn-sm" onClick={saveTransitions} disabled={savingT}>
                                    {savingT ? 'Saving…' : 'Save Transitions'}
                                </button>
                            </div>
                            <p className="wf-hint">Row = from-state, Column = to-state. The <b>(start)</b> row marks valid entry points for new records.</p>
                            <div className="wf-matrix-wrap">
                                <table className="wf-matrix">
                                    <thead>
                                        <tr>
                                            <th className="wf-corner">from ↓ / to →</th>
                                            {states.map((c) => <th key={c.id}><span className="wf-col-label">{c.name}</span></th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* entry-point row (from = null) */}
                                        <tr>
                                            <td className="wf-row-label"><b>(start)</b></td>
                                            {states.map((c) => (
                                                <td key={c.id} className="wf-cell">
                                                    <input
                                                        type="checkbox"
                                                        checked={edges.has(tKey(null, c.id))}
                                                        onChange={() => toggleEdge(null, c.id)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                        {states.map((r) => (
                                            <tr key={r.id}>
                                                <td className="wf-row-label">{r.name}</td>
                                                {states.map((c) => (
                                                    <td key={c.id} className="wf-cell">
                                                        {r.id === c.id ? (
                                                            <span className="wf-diag">—</span>
                                                        ) : (
                                                            <input
                                                                type="checkbox"
                                                                checked={edges.has(tKey(r.id, c.id))}
                                                                onChange={() => toggleEdge(r.id, c.id)}
                                                            />
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* State modal */}
            {stateModal && (
                <div className="crud-modal-overlay" onClick={() => setStateModal(false)}>
                    <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingState ? 'Edit State' : 'Add State'}</h2>
                        <form onSubmit={submitState}>
                            <div className="crud-field">
                                <label>Name <span className="req">*</span></label>
                                <input value={sForm.name ?? ''} required onChange={(e) => setSForm({ ...sForm, name: e.target.value })} />
                            </div>
                            <div className="crud-field">
                                <label>Slug <span className="req">*</span></label>
                                <input value={sForm.slug ?? ''} required placeholder="e.g. in_production"
                                    onChange={(e) => setSForm({ ...sForm, slug: e.target.value })} />
                            </div>
                            <div className="crud-field">
                                <label>Color</label>
                                <input type="color" value={sForm.color ?? '#64748b'} onChange={(e) => setSForm({ ...sForm, color: e.target.value })} />
                            </div>
                            <div className="crud-field">
                                <label>Sort Order</label>
                                <input type="number" value={sForm.sort_order ?? 0} onChange={(e) => setSForm({ ...sForm, sort_order: e.target.value })} />
                            </div>
                            <div className="wf-check-row">
                                <label><input type="checkbox" checked={!!sForm.is_initial} onChange={(e) => setSForm({ ...sForm, is_initial: e.target.checked })} /> Initial state</label>
                                <label><input type="checkbox" checked={!!sForm.is_terminal} onChange={(e) => setSForm({ ...sForm, is_terminal: e.target.checked })} /> Terminal state</label>
                            </div>
                            <div className="crud-modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setStateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingState ? 'Save' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Workflow modal */}
            {wfModal && (
                <div className="crud-modal-overlay" onClick={() => setWfModal(false)}>
                    <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>New Workflow</h2>
                        <form onSubmit={createWorkflow}>
                            <div className="crud-field">
                                <label>Name <span className="req">*</span></label>
                                <input value={wfForm.name} required onChange={(e) => setWfForm({ ...wfForm, name: e.target.value })} />
                            </div>
                            <div className="crud-field">
                                <label>Entity Type <span className="req">*</span></label>
                                <select value={wfForm.entity_type} onChange={(e) => setWfForm({ ...wfForm, entity_type: e.target.value })}>
                                    <option value="order">order</option>
                                    <option value="trip">trip</option>
                                    <option value="vehicle">vehicle</option>
                                </select>
                            </div>
                            <div className="crud-field">
                                <label>Description</label>
                                <textarea value={wfForm.description} onChange={(e) => setWfForm({ ...wfForm, description: e.target.value })} />
                            </div>
                            <div className="crud-modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setWfModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workflows;
