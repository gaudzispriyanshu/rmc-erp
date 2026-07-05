import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export interface WfState { id: number; name: string; slug: string; color: string; }
export interface Transition { from_state_id: number | null; to_state_id: number; }

interface Props {
    states: WfState[];
    transitions: Transition[];
    row: { id: number; workflow_state_id?: number | null; status?: string };
    apiPath: string;            // '/orders' | '/trips'
    onChanged: () => void;
}

// Renders the current workflow state as a colored badge, plus a dropdown of only the
// states reachable via a defined transition. Selecting one PATCHes /:id/status — the
// backend re-validates the transition, so an illegal move returns 400.
const WorkflowStatus = ({ states, transitions, row, apiPath, onChanged }: Props) => {
    const { API_URL } = useAuth();
    const [busy, setBusy] = useState(false);

    const current = states.find((s) => s.id === row.workflow_state_id);
    const allowedNext = transitions
        .filter((t) => t.from_state_id === (row.workflow_state_id ?? null))
        .map((t) => states.find((s) => s.id === t.to_state_id))
        .filter((s): s is WfState => !!s);

    const changeTo = async (stateId: number) => {
        try {
            setBusy(true);
            await axios.patch(`${API_URL}${apiPath}/${row.id}/status`, { workflow_state_id: stateId });
            onChanged();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Status change failed.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span
                style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                    color: '#fff', fontSize: 12, fontWeight: 600,
                    background: current?.color || 'var(--gray-400)',
                }}
            >
                {current?.name || row.status || 'Unknown'}
            </span>
            {allowedNext.length > 0 && (
                <select
                    disabled={busy}
                    value=""
                    onChange={(e) => e.target.value && changeTo(Number(e.target.value))}
                    style={{
                        fontSize: 12, padding: '3px 6px', borderRadius: 6,
                        border: '1px solid var(--gray-200)', color: 'var(--gray-600)', cursor: 'pointer',
                    }}
                >
                    <option value="">→ advance…</option>
                    {allowedNext.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            )}
        </div>
    );
};

export default WorkflowStatus;
