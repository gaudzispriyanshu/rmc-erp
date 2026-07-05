import { useState, ReactNode } from 'react';
import './DataTable.css';

export interface DTColumn {
    key: string;
    label: string;
    width?: number | string;
    render?: (row: any) => ReactNode;
}

export interface DTAction {
    label: string;
    onClick: (row: any) => void;
    danger?: boolean;
}

interface DataTableProps {
    columns: DTColumn[];
    rows: any[];
    loading?: boolean;
    emptyIcon?: string;
    emptyText?: string;
    rowKey?: (row: any) => string | number;
    actions?: (row: any) => DTAction[];
    // pagination (all optional)
    page?: number;
    totalPages?: number;
    total?: number;
    onPageChange?: (p: number) => void;
}

// Shared table with an optional kebab (⋮) actions dropdown per row and optional pagination.
// Used by CrudModule and the operations pages so every screen looks and behaves the same.
const DataTable = ({
    columns, rows, loading, emptyIcon = '📭', emptyText = 'No records found.',
    rowKey = (r) => r.id, actions, page, totalPages, total, onPageChange,
}: DataTableProps) => {
    const [openId, setOpenId] = useState<string | number | null>(null);
    const colCount = columns.length + (actions ? 1 : 0);

    return (
        <div className="dt-wrap">
            <table className="dt-table">
                <thead>
                    <tr>
                        {columns.map((c) => <th key={c.key} style={{ width: c.width }}>{c.label}</th>)}
                        {actions && <th style={{ width: 60 }}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={colCount} className="dt-loading">Loading…</td></tr>
                    ) : rows.length === 0 ? (
                        <tr><td colSpan={colCount}>
                            <div className="dt-empty"><span>{emptyIcon}</span><p>{emptyText}</p></div>
                        </td></tr>
                    ) : rows.map((row) => {
                        const key = rowKey(row);
                        const rowActions = actions ? actions(row) : [];
                        return (
                            <tr key={key}>
                                {columns.map((c) => (
                                    <td key={c.key}>{c.render ? c.render(row) : (row[c.key] ?? '—')}</td>
                                ))}
                                {actions && (
                                    <td className="dt-actions-cell">
                                        <button
                                            className="dt-kebab"
                                            onClick={() => setOpenId(openId === key ? null : key)}
                                            aria-label="Row actions"
                                        >⋮</button>
                                        {openId === key && (
                                            <>
                                                <div className="dt-menu-backdrop" onClick={() => setOpenId(null)} />
                                                <div className="dt-menu">
                                                    {rowActions.map((a, i) => (
                                                        <button
                                                            key={i}
                                                            className={`dt-menu-item${a.danger ? ' danger' : ''}`}
                                                            onClick={() => { setOpenId(null); a.onClick(row); }}
                                                        >{a.label}</button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {!loading && onPageChange && (total ?? 0) > 0 && (
                <div className="dt-pagination">
                    <div className="dt-page-info">Page {page} of {totalPages} · {total} total</div>
                    <div className="dt-page-controls">
                        <button className="dt-page-btn" disabled={(page ?? 1) <= 1} onClick={() => onPageChange((page ?? 1) - 1)}>Previous</button>
                        <span className="dt-page-btn active">{page}</span>
                        <button className="dt-page-btn" disabled={(page ?? 1) >= (totalPages ?? 1)} onClick={() => onPageChange((page ?? 1) + 1)}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
