import React, { useState } from 'react';
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
import { useInventory } from '../contexts/InventoryContext';

const Dashboard = () => {
    const { currentShop, selectedShop } = useShop();
    const { getDashboardStats, sales } = useInventory();
    const [chartPeriod, setChartPeriod] = useState('week');

    // Get real-time stats from context
    const stats = getDashboardStats(selectedShop);

    // Calculate chart data from real sales
    const getChartData = () => {
        const data = [];
        const today = new Date();

        if (chartPeriod === 'week') {
            const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const daySales = sales
                    .filter(s => s.timestamp.startsWith(dateStr) && (selectedShop === 'wholesale' || s.shopId === selectedShop))
                    .reduce((sum, s) => sum + (s.total || 0), 0);

                data.push({
                    label: days[date.getDay()],
                    value: daySales || 0
                });
            }
        } else {
            // Monthly - last 30 days in 5 groups
            for (let i = 28; i >= 0; i -= 7) {
                const date = new Date();
                date.setDate(today.getDate() - i);
                const rangeSales = sales
                    .filter(s => {
                        const sDate = new Date(s.timestamp.split('T')[0]);
                        const dStart = new Date(); dStart.setDate(today.getDate() - i);
                        const dEnd = new Date(); dEnd.setDate(today.getDate() - (i - 6));
                        return sDate >= dStart && sDate <= dEnd && (selectedShop === 'wholesale' || s.shopId === selectedShop);
                    })
                    .reduce((sum, s) => sum + (s.total || 0), 0);

                data.push({
                    label: `${date.getDate()}/${date.getMonth() + 1}`,
                    value: rangeSales || 0
                });
            }
        }
        return data;
    };

    const getMaxValue = () => {
        const values = getChartData().map(d => d.value);
        const max = Math.max(...values);
        return max <= 0 ? 1000 : max;
    };

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
                                <div className="metric-value">₹{stats.todayRevenue.toLocaleString()}</div>
                                <div className="metric-trend positive">
                                    <ArrowUpRight size={16} /> Tracked Sales
                                </div>
                            </div>
                        </div>
                        <div className="metric-card danger" style={{ borderColor: '#FCA5A5' }}>
                            <div className="metric-icon red" style={{ background: '#FEF2F2', color: '#EF4444' }}><ArrowDownRight size={24} /></div>
                            <div>
                                <div className="metric-label">Expenses Today</div>
                                <div className="metric-value">₹{stats.todayExpenses ? stats.todayExpenses.toLocaleString() : 0}</div>
                                <div className="metric-sub">Shop & Staff</div>
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
                                <div className="metric-value">0 Orders</div>
                                <div className="metric-sub">Need Approval</div>
                            </div>
                        </div>
                        <div className="metric-card danger" style={{ borderColor: '#FCA5A5' }}>
                            <div className="metric-icon red" style={{ background: '#FEF2F2', color: '#EF4444' }}><ArrowDownRight size={24} /></div>
                            <div>
                                <div className="metric-label">Expenses Today</div>
                                <div className="metric-value">₹{stats.todayExpenses ? stats.todayExpenses.toLocaleString() : 0}</div>
                                <div className="metric-sub">Admin & Logistics</div>
                            </div>
                        </div>
                    </>
                )}

                <div className="metric-card">
                    <div className="metric-icon purple"><Package size={24} /></div>
                    <div>
                        <div className="metric-label">{selectedShop === 'wholesale' ? 'Global Inventory' : 'Shop Inventory'}</div>
                        <div className="metric-value">{stats.totalUnits ? stats.totalUnits.toLocaleString() : 0}</div>
                        <div className="metric-sub">Units Available</div>
                    </div>
                </div>

                <div className="metric-card warning">
                    <div className="metric-icon orange"><AlertTriangle size={24} /></div>
                    <div>
                        <div className="metric-label">Low Stock</div>
                        <div className="metric-value">{stats.lowStockCount || 0} Items</div>
                        <div className="metric-sub text-red">Needs Replenishment</div>
                    </div>
                </div>
            </div>

            {/* Charts & Recent Activity */}
            <div className="dashboard-content">
                <div className="chart-section">
                    <div className="section-header">
                        <h3>{selectedShop === 'wholesale' ? 'Stock Movement Analytics' : 'Revenue Analytics'}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                className="period-select"
                                value={chartPeriod}
                                onChange={(e) => setChartPeriod(e.target.value)}
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                    </div>

                    {/* Custom CSS Chart implementation with Real Data */}
                    <div className="custom-chart">
                        <div className="chart-bg-lines">
                            <div></div><div></div><div></div><div></div>
                        </div>
                        <div className="chart-bars">
                            {getChartData().map((item, i) => (
                                <div key={i} className="bar-group">
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${Math.max(10, (item.value / getMaxValue()) * 100)}%`,
                                            background: selectedShop === 'wholesale' ? '#8B5CF6' : '#10B981'
                                        }}
                                    >
                                        <div className="tooltip">
                                            {selectedShop === 'wholesale'
                                                ? `${item.value} Units`
                                                : `₹${item.value.toLocaleString()}`}
                                        </div>
                                    </div>
                                    <span className="label" style={{ fontSize: chartPeriod === 'month' ? '0.65rem' : '0.8rem' }}>
                                        {item.label}
                                    </span>
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
