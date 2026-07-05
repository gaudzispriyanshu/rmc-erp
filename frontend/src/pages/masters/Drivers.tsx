import CrudModule from '../../components/common/CrudModule';

const Drivers = () => (
    <CrudModule
        title="Drivers"
        subtitle="Manage drivers and payroll rates"
        apiPath="/drivers"
        listKey="drivers"
        columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'phone', label: 'Phone' },
            { key: 'license_number', label: 'License' },
            { key: 'status', label: 'Status' },
            { key: 'per_trip_rate', label: 'Per-Trip ₹' },
        ]}
        fields={[
            { key: 'name', label: 'Name', required: true },
            { key: 'phone', label: 'Phone' },
            { key: 'license_number', label: 'License Number' },
            {
                key: 'status', label: 'Status', type: 'select', options: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                ],
            },
            { key: 'base_salary', label: 'Base Salary', type: 'number' },
            { key: 'per_trip_rate', label: 'Per-Trip Rate', type: 'number' },
        ]}
    />
);

export default Drivers;
