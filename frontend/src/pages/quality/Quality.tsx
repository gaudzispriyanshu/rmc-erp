import { useState } from 'react';
import CrudModule from '../../components/common/CrudModule';
import './Quality.css';

type Tab = 'cube' | 'slump' | 'nc';

const passedRender = (row: any) =>
    row.passed === true ? '✅ Pass' : row.passed === false ? '❌ Fail' : '—';

const Quality = () => {
    const [tab, setTab] = useState<Tab>('cube');

    return (
        <div>
            <div className="crud-header">
                <div>
                    <h1>Quality Control</h1>
                    <p>Cube &amp; slump tests and non-conformance tracking</p>
                </div>
            </div>

            <div className="qc-tabs">
                <button className={`qc-tab${tab === 'cube' ? ' active' : ''}`} onClick={() => setTab('cube')}>Cube Tests</button>
                <button className={`qc-tab${tab === 'slump' ? ' active' : ''}`} onClick={() => setTab('slump')}>Slump Tests</button>
                <button className={`qc-tab${tab === 'nc' ? ' active' : ''}`} onClick={() => setTab('nc')}>Non-Conformance</button>
            </div>

            {tab === 'cube' && (
                <CrudModule
                    key="cube"
                    title="Cube Tests"
                    apiPath="/quality/cube-tests"
                    searchable={false}
                    editable={false}
                    columns={[
                        { key: 'id', label: 'ID' },
                        { key: 'order_id', label: 'Order' },
                        { key: 'sample_id', label: 'Sample' },
                        { key: 'test_date', label: 'Date' },
                        { key: 'age_days', label: 'Age (d)' },
                        { key: 'compressive_strength', label: 'Strength (MPa)' },
                        { key: 'passed', label: 'Result', render: passedRender },
                    ]}
                    fields={[
                        { key: 'order_id', label: 'Order ID', type: 'number' },
                        { key: 'mix_design_id', label: 'Mix Design ID', type: 'number' },
                        { key: 'sample_id', label: 'Sample ID' },
                        { key: 'test_date', label: 'Test Date (YYYY-MM-DD)' },
                        { key: 'age_days', label: 'Age (days)', type: 'number' },
                        { key: 'compressive_strength', label: 'Compressive Strength (MPa)', type: 'number' },
                        { key: 'passed', label: 'Result', type: 'select', options: [{ value: 'true', label: 'Pass' }, { value: 'false', label: 'Fail' }] },
                        { key: 'remarks', label: 'Remarks', type: 'textarea' },
                    ]}
                />
            )}

            {tab === 'slump' && (
                <CrudModule
                    key="slump"
                    title="Slump Tests"
                    apiPath="/quality/slump-tests"
                    searchable={false}
                    editable={false}
                    columns={[
                        { key: 'id', label: 'ID' },
                        { key: 'order_id', label: 'Order' },
                        { key: 'slump_value', label: 'Slump (mm)' },
                        { key: 'test_date', label: 'Date' },
                        { key: 'passed', label: 'Result', render: passedRender },
                    ]}
                    fields={[
                        { key: 'order_id', label: 'Order ID', type: 'number' },
                        { key: 'slump_value', label: 'Slump Value (mm)', type: 'number' },
                        { key: 'test_date', label: 'Test Date (YYYY-MM-DD)' },
                        { key: 'passed', label: 'Result', type: 'select', options: [{ value: 'true', label: 'Pass' }, { value: 'false', label: 'Fail' }] },
                        { key: 'remarks', label: 'Remarks', type: 'textarea' },
                    ]}
                />
            )}

            {tab === 'nc' && (
                <CrudModule
                    key="nc"
                    title="Non-Conformance"
                    apiPath="/quality/non-conformance"
                    searchable={false}
                    deletable={false}
                    columns={[
                        { key: 'id', label: 'ID' },
                        { key: 'order_id', label: 'Order' },
                        { key: 'description', label: 'Description' },
                        {
                            key: 'severity', label: 'Severity', render: (r) => {
                                const cls = r.severity === 'critical' ? 'cancelled' : r.severity === 'major' ? 'pending' : 'completed';
                                return <span className={`status-badge ${cls}`}>{r.severity}</span>;
                            },
                        },
                        {
                            key: 'status', label: 'Status', render: (r) =>
                                <span className={`status-badge ${r.status === 'open' ? 'pending' : 'completed'}`}>{r.status}</span>,
                        },
                    ]}
                    fields={[
                        { key: 'order_id', label: 'Order ID', type: 'number' },
                        { key: 'description', label: 'Description', type: 'textarea', required: true },
                        { key: 'severity', label: 'Severity', type: 'select', options: [{ value: 'minor', label: 'Minor' }, { value: 'major', label: 'Major' }, { value: 'critical', label: 'Critical' }] },
                        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }] },
                    ]}
                />
            )}
        </div>
    );
};

export default Quality;
