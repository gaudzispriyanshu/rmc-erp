import CrudModule from '../../components/common/CrudModule';

const Inventory = () => (
    <CrudModule
        title="Inventory"
        subtitle="Raw material stock levels"
        apiPath="/inventory"
        listKey="items"
        columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Material' },
            { key: 'current_stock', label: 'Current Stock' },
            { key: 'unit', label: 'Unit' },
            { key: 'min_stock_level', label: 'Min Level' },
            {
                key: '_low', label: 'Status', render: (row) =>
                    Number(row.current_stock) < Number(row.min_stock_level)
                        ? <span className="status-badge cancelled">Low</span>
                        : <span className="status-badge completed">OK</span>,
            },
        ]}
        fields={[
            { key: 'name', label: 'Material Name', required: true },
            { key: 'current_stock', label: 'Current Stock', type: 'number' },
            { key: 'unit', label: 'Unit (kg / litre)' },
            { key: 'min_stock_level', label: 'Minimum Stock Level', type: 'number' },
        ]}
    />
);

export default Inventory;
