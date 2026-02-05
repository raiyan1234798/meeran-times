import React from 'react';
import {
    TrendingUp,
    Users,
    Package,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Truck,
    LayoutDashboard
} from 'lucide-react';
import '../styles/Dashboard.css';
import { useShop } from '../contexts/ShopContext';

const Dashboard = () => {
    const { currentShop, selectedShop } = useShop();

    return (
        <div className="dashboard-container">
            <div className="dash-header">
                <div>
                    <h2>{currentShop.name} Dashboard</h2>
                    <p>Overview of {currentShop.type === 'inventory_hub' ? 'Stock & Distribution' : 'Sales & Shop Performance'}.</p>
                </div>
                <div className="date-badge">
                    <Clock size={16} />
                    <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="metrics-grid">
                {selectedShop !== 'wholesale' ? (
                    // RETAIL METRICS
                    <>
                        <div className="metric-card primary">
                            <div className="metric-icon"><TrendingUp size={24} /></div>
                            <div>
                                <div className="metric-label">Sales Today</div>
                                <div className="metric-value">₹24,500</div>
                                <div className="metric-trend positive">
                                    <ArrowUpRight size={16} /> +12% vs yesterday
                                </div>
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon blue"><Users size={24} /></div>
                            <div>
                                <div className="metric-label">Salesmen Active</div>
                                <div className="metric-value">2</div>
                                <div className="metric-sub">Shift 1</div>
                            </div>
                        </div>
                    </>
                ) : (
                    // WHOLESALE METRICS
                    <>
                        <div className="metric-card primary">
                            <div className="metric-icon"><Truck size={24} /></div>
                            <div>
                                <div className="metric-label">Pending Transfers</div>
                                <div className="metric-value">3 Orders</div>
                                <div className="metric-sub">Need Approval</div>
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon blue"><LayoutDashboard size={24} /></div>
                            <div>
                                <div className="metric-label">Total Stock Value</div>
                                <div className="metric-value">₹45.2L</div>
                                <div className="metric-sub">Across all warehouses</div>
                            </div>
                        </div>
                    </>
                )}

                <div className="metric-card">
                    <div className="metric-icon purple"><Package size={24} /></div>
                    <div>
                        <div className="metric-label">{selectedShop === 'wholesale' ? 'Global Inventory' : 'Shop Inventory'}</div>
                        <div className="metric-value">{selectedShop === 'wholesale' ? '3,450' : '845'}</div>
                        <div className="metric-sub">Units Available</div>
                    </div>
                </div>

                <div className="metric-card warning">
                    <div className="metric-icon orange"><AlertTriangle size={24} /></div>
                    <div>
                        <div className="metric-label">Low Stock</div>
                        <div className="metric-value">5 Items</div>
                        <div className="metric-sub text-red">Needs Replenishment</div>
                    </div>
                </div>
            </div>

            {/* Charts & Recent Activity */}
            <div className="dashboard-content">
                <div className="chart-section">
                    <div className="section-header">
                        <h3>{selectedShop === 'wholesale' ? 'Stock Movement Analytics' : 'Revenue Analytics'}</h3>
                        <select className="period-select">
                            <option>This Week</option>
                            <option>This Month</option>
                        </select>
                    </div>

                    {/* Custom CSS Chart implementation */}
                    <div className="custom-chart">
                        <div className="chart-bg-lines">
                            <div></div><div></div><div></div><div></div>
                        </div>
                        <div className="chart-bars">
                            {[65, 45, 75, 50, 85, 95, 60].map((h, i) => (
                                <div key={i} className="bar-group">
                                    <div className="bar" style={{ height: `${h}%`, background: selectedShop === 'wholesale' ? '#8B5CF6' : '#10B981' }}>
                                        <div className="tooltip">{selectedShop === 'wholesale' ? `${h} Units` : `₹${(h * 1000).toLocaleString()}`}</div>
                                    </div>
                                    <span className="label">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="activity-section">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="activity-item">
                                <div className="activity-icon">
                                    {selectedShop === 'wholesale' ? <Truck size={16} /> : <Package size={16} />}
                                </div>
                                <div className="activity-info">
                                    <div className="act-title">
                                        {selectedShop === 'wholesale'
                                            ? (i % 2 === 0 ? 'Stock Dispatched to Retail' : 'New Shipment Arrived')
                                            : 'Stock Update'}
                                    </div>
                                    <div className="act-desc">
                                        {selectedShop === 'wholesale'
                                            ? (i % 2 === 0 ? '50 Units sent to Meeran Times (Retail)' : 'Received 500 Units from Titan India')
                                            : 'Received 25 Units from Meeran Wholesale'}
                                    </div>
                                </div>
                                <div className="act-time">{i * 2}h ago</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
