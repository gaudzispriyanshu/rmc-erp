import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import './SecurityRoles.css';

// Maps action_slug patterns to human-readable action names
const ACTION_MAP = {
    read: 'View',
    write: 'Add',
    update: 'Update',
    delete: 'Delete',
};

const ACTION_ORDER = ['read', 'write', 'update', 'delete'];

// Parse "orders:read" → { module: "Orders", action: "read" }
const parseSlug = (slug) => {
    const [module, action] = slug.split(':');
    return {
        module: module.charAt(0).toUpperCase() + module.slice(1),
        action: action || 'read',
    };
};

// Group permissions by module
const groupPermissions = (permissions) => {
    const groups = {};
    permissions.forEach((p) => {
        const { module, action } = parseSlug(p.action_slug);
        if (!groups[module]) {
            groups[module] = { module, actions: {} };
        }
        groups[module].actions[action] = p.id;
    });
    return Object.values(groups);
};

const SecurityRoles = () => {
    const { API_URL } = useAuth();
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [modules, setModules] = useState([]);
    const [rolePerms, setRolePerms] = useState({}); // { roleId: Set(permissionId) }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchMatrix();
    }, []);

    const fetchMatrix = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/roles/matrix`);
            const { roles, permissions, matrix } = res.data;

            setRoles(roles);
            setPermissions(permissions);
            setModules(groupPermissions(permissions));

            // Build rolePerms map
            const map = {};
            roles.forEach((r) => {
                map[r.id] = new Set();
            });
            matrix.forEach((m) => {
                if (map[m.role_id]) {
                    map[m.role_id].add(m.permission_id);
                }
            });
            setRolePerms(map);
        } catch (err) {
            console.error('Failed to fetch matrix:', err);
            setStatus({ type: 'error', msg: 'Failed to load roles and permissions.' });
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (roleId, permissionId) => {
        setRolePerms((prev) => {
            const updated = { ...prev };
            const set = new Set(updated[roleId]);
            if (set.has(permissionId)) {
                set.delete(permissionId);
            } else {
                set.add(permissionId);
            }
            updated[roleId] = set;
            return updated;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            // Save permissions for each role
            const promises = roles.map((role) =>
                axios.put(`${API_URL}/roles/${role.id}/permissions`, {
                    permissionIds: Array.from(rolePerms[role.id] || []),
                })
            );
            await Promise.all(promises);
            setStatus({ type: 'success', msg: 'Permissions saved successfully!' });
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            console.error('Save failed:', err);
            setStatus({ type: 'error', msg: 'Failed to save permissions.' });
        } finally {
            setSaving(false);
        }
    };

    const handleCreateRole = async () => {
        if (!newRole.name.trim()) return;
        try {
            await axios.post(`${API_URL}/roles`, newRole);
            setNewRole({ name: '', description: '' });
            setShowModal(false);
            fetchMatrix(); // Refresh
            setStatus({ type: 'success', msg: `Role "${newRole.name}" created!` });
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            const errMsg = err.response?.data?.error || 'Failed to create role.';
            setStatus({ type: 'error', msg: errMsg });
        }
    };

    const handleDeleteRole = async (roleId, roleName) => {
        if (!window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) return;
        try {
            await axios.delete(`${API_URL}/roles/${roleId}`);
            fetchMatrix();
            setStatus({ type: 'success', msg: `Role "${roleName}" deleted.` });
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            setStatus({ type: 'error', msg: 'Failed to delete role.' });
        }
    };

    if (loading) {
        return <div className="loading-center">Loading roles & permissions...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="security-roles-header">
                <div>
                    <h1>Security Roles</h1>
                    <p>Manage access permissions for different user roles.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Create New Role
                </button>
            </div>

            {/* Status message */}
            {status && (
                <div className={`status-message ${status.type}`}>{status.msg}</div>
            )}

            {/* Role cards with permission matrix */}
            {roles.map((role) => (
                <div className="role-card" key={role.id}>
                    <div className="role-card-header">
                        <div>
                            <div className="role-card-name">{role.name}</div>
                        </div>
                        <div className="role-card-actions">
                            <span className="role-card-desc">{role.description || ''}</span>
                            <button
                                className="role-delete-btn"
                                onClick={() => handleDeleteRole(role.id, role.name)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    <table className="perm-table">
                        <thead>
                            <tr>
                                <th>Module</th>
                                {ACTION_ORDER.map((a) => (
                                    <th key={a}>{ACTION_MAP[a]}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {modules.map((mod) => (
                                <tr key={mod.module}>
                                    <td>{mod.module}</td>
                                    {ACTION_ORDER.map((action) => {
                                        const permId = mod.actions[action];
                                        if (!permId) {
                                            return <td key={action}>—</td>;
                                        }
                                        return (
                                            <td key={action}>
                                                <input
                                                    type="checkbox"
                                                    className="perm-checkbox"
                                                    checked={rolePerms[role.id]?.has(permId) || false}
                                                    onChange={() => togglePermission(role.id, permId)}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}

            {/* Save bar */}
            <div className="save-bar">
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Create Role Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h2>Create New Role</h2>
                        <div className="modal-field">
                            <label>Role Name</label>
                            <input
                                type="text"
                                value={newRole.name}
                                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                placeholder="e.g. dispatcher"
                            />
                        </div>
                        <div className="modal-field">
                            <label>Description (optional)</label>
                            <input
                                type="text"
                                value={newRole.description}
                                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                placeholder="e.g. Manage orders and fleet assignment"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleCreateRole}>
                                Create Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityRoles;
