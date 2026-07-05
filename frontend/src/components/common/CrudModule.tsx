import { useState, useEffect, useCallback, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DataTable, { DTAction } from './DataTable';
import './CrudModule.css';

export interface Column {
    key: string;
    label: string;
    render?: (row: any) => React.ReactNode;
}

export interface Field {
    key: string;
    label: string;
    type?: 'text' | 'number' | 'select' | 'textarea';
    required?: boolean;
    options?: { value: string; label: string }[];
    placeholder?: string;
}

interface CrudModuleProps {
    title: string;
    subtitle?: string;
    apiPath: string;          // e.g. '/customers'
    listKey?: string;         // response key holding the array, e.g. 'customers'
    columns: Column[];
    fields: Field[];
    pageSize?: number;
    searchable?: boolean;
    editable?: boolean;       // show the Edit action (default true)
    deletable?: boolean;      // show the Delete action (default true)
}

const PAGE_SIZE_DEFAULT = 10;

// A generic list + view/create/edit/delete screen. Each master-data page configures it with
// its own columns + form fields — the fetch/pagination/table/modal plumbing is shared here.
const CrudModule = ({
    title, subtitle, apiPath, listKey, columns, fields,
    pageSize = PAGE_SIZE_DEFAULT, searchable = true, editable = true, deletable = true,
}: CrudModuleProps) => {
    const { API_URL } = useAuth();
    const [rows, setRows] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [viewing, setViewing] = useState<any | null>(null);

    const totalPages = Math.ceil(total / pageSize) || 1;

    const fetchRows = useCallback(async () => {
        try {
            setLoading(true);
            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;
            const params: Record<string, any> = { start, end };
            if (search) params.search = search;

            const res = await axios.get(`${API_URL}${apiPath}`, { params });
            const data = Array.isArray(res.data)
                ? res.data
                : (listKey ? res.data[listKey] : undefined) ?? res.data.items ?? [];
            setRows(data);
            setTotal(Array.isArray(res.data) ? data.length : (res.data.total ?? data.length));
        } catch (err) {
            console.error(`Failed to fetch ${apiPath}:`, err);
        } finally {
            setLoading(false);
        }
    }, [API_URL, apiPath, listKey, page, pageSize, search]);

    useEffect(() => { fetchRows(); }, [fetchRows]);

    const openCreate = () => { setEditing(null); setForm({}); setError(''); setModalOpen(true); };

    const openEdit = (row: any) => {
        setEditing(row);
        const initial: Record<string, any> = {};
        fields.forEach((f) => { initial[f.key] = row[f.key] ?? ''; });
        setForm(initial);
        setError('');
        setModalOpen(true);
    };

    const closeModal = () => { setModalOpen(false); setEditing(null); };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        for (const f of fields) {
            if (f.required && (form[f.key] === undefined || form[f.key] === '')) {
                setError(`${f.label} is required.`);
                return;
            }
        }
        const payload: Record<string, any> = {};
        fields.forEach((f) => {
            let v = form[f.key];
            if (v === '') v = undefined;
            if (f.type === 'number' && v !== undefined) v = Number(v);
            if (v !== undefined) payload[f.key] = v;
        });
        try {
            setSaving(true);
            if (editing) await axios.put(`${API_URL}${apiPath}/${editing.id}`, payload);
            else await axios.post(`${API_URL}${apiPath}`, payload);
            closeModal();
            fetchRows();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Save failed.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (row: any) => {
        if (!window.confirm(`Delete this ${title.replace(/s$/, '').toLowerCase()}?`)) return;
        try {
            await axios.delete(`${API_URL}${apiPath}/${row.id}`);
            fetchRows();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Delete failed.');
        }
    };

    const rowActions = (row: any): DTAction[] => {
        const a: DTAction[] = [{ label: 'View', onClick: () => setViewing(row) }];
        if (editable) a.push({ label: 'Edit', onClick: () => openEdit(row) });
        if (deletable) a.push({ label: 'Delete', danger: true, onClick: () => handleDelete(row) });
        return a;
    };

    return (
        <div>
            <div className="crud-header">
                <div>
                    <h1>{title}</h1>
                    {subtitle && <p>{subtitle}</p>}
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ New {title.replace(/s$/, '')}</button>
            </div>

            {searchable && (
                <div className="crud-toolbar">
                    <input
                        className="crud-search"
                        placeholder="Search…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            )}

            <DataTable
                columns={columns}
                rows={rows}
                loading={loading}
                emptyText={`No ${title.toLowerCase()} found.`}
                actions={rowActions}
                page={page}
                totalPages={totalPages}
                total={total}
                onPageChange={setPage}
            />

            {/* Create / Edit modal */}
            {modalOpen && (
                <div className="crud-modal-overlay" onClick={closeModal}>
                    <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editing ? `Edit ${title.replace(/s$/, '')}` : `New ${title.replace(/s$/, '')}`}</h2>
                        <form onSubmit={handleSubmit}>
                            {fields.map((f) => (
                                <div className="crud-field" key={f.key}>
                                    <label>{f.label}{f.required && <span className="req"> *</span>}</label>
                                    {f.type === 'select' ? (
                                        <select value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                                            <option value="">Select…</option>
                                            {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    ) : f.type === 'textarea' ? (
                                        <textarea value={form[f.key] ?? ''} placeholder={f.placeholder}
                                            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                                    ) : (
                                        <input type={f.type === 'number' ? 'number' : 'text'} value={form[f.key] ?? ''} placeholder={f.placeholder}
                                            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                                    )}
                                </div>
                            ))}
                            {error && <div className="crud-error">{error}</div>}
                            <div className="crud-modal-actions">
                                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View (read-only) modal */}
            {viewing && (
                <div className="crud-modal-overlay" onClick={() => setViewing(null)}>
                    <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{title.replace(/s$/, '')} Details</h2>
                        <div className="crud-view">
                            <div className="crud-view-row"><span>ID</span><b>{viewing.id}</b></div>
                            {columns.filter((c) => c.key !== 'id').map((c) => (
                                <div className="crud-view-row" key={c.key}>
                                    <span>{c.label}</span>
                                    <div>{c.render ? c.render(viewing) : (viewing[c.key] ?? '—')}</div>
                                </div>
                            ))}
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

export default CrudModule;
