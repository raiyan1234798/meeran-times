import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import '../styles/ResponsiveTables.css';

const MOCK_TRANSFERS = [
    { id: 'T-1001', date: '05/02/2026', product: 'Titan Neo Splash', from: 'Meeran Wholesale', to: 'Meeran Times (Retail)', quantity: 50, status: 'Completed' },
    { id: 'T-1002', date: '05/02/2026', product: 'Fastrack Reflex', from: 'Meeran Wholesale', to: 'Daylook (Retail)', quantity: 30, status: 'Completed' },
    { id: 'T-1003', date: '04/02/2026', product: 'Ajanta Quartz Wall', from: 'Meeran Wholesale', to: 'Meeran Times (Retail)', quantity: 100, status: 'Pending' },
];

const StockTransfers = () => {
    const [transfers] = useState(MOCK_TRANSFERS);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Stock Transfer History</h1>
                    <p className="page-subtitle">Track inventory movement between Wholesale and Retail shops</p>
                </div>
            </div>

            <div className="table-card">
                <table className="responsive-table">
                    <thead>
                        <tr>
                            <th>Transfer ID</th>
                            <th>Date</th>
                            <th>Product</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Quantity</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transfers.map(t => (
                            <tr key={t.id}>
                                <td data-label="ID" style={{ fontWeight: '500' }}>#{t.id}</td>
                                <td data-label="Date">{t.date}</td>
                                <td data-label="Product" style={{ fontWeight: '600', color: '#111827' }}>{t.product}</td>
                                <td data-label="From">{t.from}</td>
                                <td data-label="To" style={{ color: '#2563EB' }}>{t.to}</td>
                                <td data-label="Qty" style={{ fontWeight: 'bold' }}>{t.quantity}</td>
                                <td data-label="Status">
                                    <span className={`status-badge ${t.status === 'Completed' ? 'status-active' : 'status-warning'}`}>
                                        {t.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockTransfers;
