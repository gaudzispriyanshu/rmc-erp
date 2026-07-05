import CrudModule from '../../components/common/CrudModule';

const Vehicles = () => (
    <CrudModule
        title="Vehicles"
        subtitle="Transit mixer fleet"
        apiPath="/vehicles"
        listKey="vehicles"
        columns={[
            { key: 'id', label: 'ID' },
            { key: 'plate_number', label: 'Plate No.' },
            { key: 'model', label: 'Model' },
            { key: 'capacity', label: 'Capacity (m³)' },
            { key: 'status', label: 'Status' },
        ]}
        fields={[
            { key: 'plate_number', label: 'Plate Number', required: true },
            { key: 'model', label: 'Model' },
            { key: 'capacity', label: 'Capacity (m³)', type: 'number' },
            {
                key: 'status', label: 'Status', type: 'select', options: [
                    { value: 'available', label: 'Available' },
                    { value: 'in_use', label: 'In Use' },
                    { value: 'maintenance', label: 'Maintenance' },
                ],
            },
        ]}
    />
);

export default Vehicles;
