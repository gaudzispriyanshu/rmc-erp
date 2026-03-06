import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const recentOrders = [
    { id: '#ORD-0892', client: 'BuildCorp Inc.', mix: 'M30 Grade', volume: '45 m³', status: 'In Progress', statusClass: 'badge-info' },
    { id: '#ORD-0891', client: 'Skyline Developers', mix: 'M25 Grade', volume: '120 m³', status: 'Pending', statusClass: 'badge-warning' },
    { id: '#ORD-0890', client: 'City Metro Proj.', mix: 'M40 High Strength', volume: '200 m³', status: 'Completed', statusClass: 'badge-success' },
    { id: '#ORD-0889', client: 'Apex Construction', mix: 'M20 Grade', volume: '30 m³', status: 'In Progress', statusClass: 'badge-info' },
    { id: '#ORD-0888', client: 'Homecrafters LLC', mix: 'Screed Mix', volume: '15 m³', status: 'Completed', statusClass: 'badge-success' },
];

const liveTrips = [
    { id: '#42', mix: 'M30 Mix', dest: 'BuildCorp Site A', eta: 'ETA: 15 mins', status: 'En Route', statusClass: 'badge-info', progress: 60, color: 'var(--primary-500)' },
    { id: '#18', mix: 'M25 Mix', dest: 'Skyline Tower', eta: 'Arrived: 10 mins ago', status: 'Pouring', statusClass: 'badge-warning', progress: 80, color: 'var(--warning)' },
    { id: '#09', mix: 'Empty', dest: 'City Metro Proj.', eta: 'ETA: 5 mins', status: 'Returning', statusClass: 'badge-success', progress: 45, color: 'var(--success)' },
    { id: '#22', mix: 'M20 Mix', dest: 'Apex Construction', eta: 'ETA: 35 mins', status: 'En Route', statusClass: 'badge-info', progress: 25, color: 'var(--primary-500)' },
];

const Dashboard = () => {
    const { user } = useAuth();

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div>
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-welcome">
                    <h1>Welcome back, {user?.name || 'Admin'}</h1>
                    <p>Here is the daily overview of RMC operations for {today}.</p>
                </div>
                <div className="dashboard-actions">
                    <button className="btn btn-outline">📅 Today</button>
                    <button className="btn btn-primary">+ New Order</button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div>
                        <div className="stat-card-label">Total Orders Today</div>
                        <div className="stat-card-value">45</div>
                        <div className="stat-card-sub positive">↗ 12% vs yesterday</div>
                    </div>
                    <div className="stat-card-icon blue">📋</div>
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-card-label">Active Trips</div>
                        <div className="stat-card-value">12</div>
                        <div className="stat-card-sub">8 En Route, 4 Returning</div>
                    </div>
                    <div className="stat-card-icon green">🚛</div>
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-card-label">Low Stock Alerts</div>
                        <div className="stat-card-value" style={{ color: 'var(--danger)' }}>3</div>
                        <div className="stat-card-sub">Cement (2), Aggregates (1)</div>
                    </div>
                    <div className="stat-card-icon red">⚠️</div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="dashboard-grid">
                {/* Recent Orders */}
                <div className="recent-orders">
                    <div className="section-header">
                        <div className="section-title">📋 Recent Orders</div>
                        <span className="section-link">View All</span>
                    </div>
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Client</th>
                                <th>Mix Type</th>
                                <th>Volume</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="order-id">{order.id}</td>
                                    <td>{order.client}</td>
                                    <td>{order.mix}</td>
                                    <td>{order.volume}</td>
                                    <td>
                                        <span className={`badge ${order.statusClass}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Live Trip Status */}
                <div className="trip-status">
                    <div className="section-header">
                        <div className="section-title">📡 Live Trip Status</div>
                    </div>
                    {liveTrips.map((trip) => (
                        <div className="trip-item" key={trip.id}>
                            <div className="trip-icon">🚛</div>
                            <div className="trip-info">
                                <div className="trip-name">
                                    Truck {trip.id} – {trip.mix}
                                    <span className={`badge ${trip.statusClass}`}>{trip.status}</span>
                                </div>
                                <div className="trip-detail">
                                    Dest: {trip.dest} • {trip.eta}
                                </div>
                                <div className="trip-progress">
                                    <div
                                        className="trip-progress-bar"
                                        style={{ width: `${trip.progress}%`, background: trip.color }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="section-footer">
                        <span className="section-link">View Fleet Map</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
