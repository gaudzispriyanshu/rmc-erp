import CrudModule from '../../components/common/CrudModule';

const Customers = () => (
    <CrudModule
        title="Customers"
        subtitle="Manage your customer directory"
        apiPath="/customers"
        listKey="customers"
        columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
        ]}
        fields={[
            { key: 'name', label: 'Name', required: true },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
        ]}
    />
);

export default Customers;
