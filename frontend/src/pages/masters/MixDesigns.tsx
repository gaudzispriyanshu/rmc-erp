import CrudModule from '../../components/common/CrudModule';

const MixDesigns = () => (
    <CrudModule
        title="Mix Designs"
        subtitle="Concrete grade recipes"
        apiPath="/mix-designs"
        searchable={false}
        columns={[
            { key: 'id', label: 'ID' },
            { key: 'grade_name', label: 'Grade' },
            { key: 'description', label: 'Description' },
            {
                key: 'approval_status', label: 'Approval', render: (row) => {
                    const s = row.approval_status || 'pending';
                    const cls = s === 'approved' ? 'completed' : s === 'rejected' ? 'cancelled' : 'pending';
                    return <span className={`status-badge ${cls}`}>{s}</span>;
                },
            },
        ]}
        fields={[
            { key: 'grade_name', label: 'Grade Name (e.g. M25)', required: true },
            { key: 'description', label: 'Description', type: 'textarea' },
            {
                key: 'approval_status', label: 'Approval Status', type: 'select', options: [
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                ],
            },
        ]}
    />
);

export default MixDesigns;
