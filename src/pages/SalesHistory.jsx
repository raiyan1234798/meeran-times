import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Edit, Trash2, Eye, Printer, X, Calendar as CalendarIcon, Info } from 'lucide-react';
import '../styles/SalesHistory.css';
import { useInventory } from '../contexts/InventoryContext';

const SalesHistory = () => {
    const { sales: dynamicSales } = useInventory();

    // Format date to DD/MM/YYYY for comparison
    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const getTodayStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [selectedDateValue, setSelectedDateValue] = useState(getTodayStr());
    const displayDate = formatDate(selectedDateValue);

    // Convert dynamic sales to the view format
    const formattedDynamicSales = dynamicSales.map(s => ({
        id: s.id,
        date: formatDate(s.timestamp),
        customer: s.customerName || 'Walk-in',
        total: s.total,
        payment: s.paymentMethod,
        status: 'Paid'
    }));

    const MOCK_BILLS = [
        { id: '10234', date: '04/02/2026', customer: 'Rayan', total: 4500, payment: 'Cash', status: 'Paid' },
        { id: '10235', date: '04/02/2026', customer: 'Walk-in', total: 1200, payment: 'UPI', status: 'Paid' },
        { id: '10236', date: '03/02/2026', customer: 'Priya', total: 8900, payment: 'Card', status: 'Refunded' },
    ];

    const allBills = [...formattedDynamicSales, ...MOCK_BILLS];
    const filteredBills = allBills.filter(b => b.date === displayDate);

    const [editingBill, setEditingBill] = useState(null);

    const deleteBill = (id) => {
        if (window.confirm('Are you sure you want to delete this bill? This action matches Super Admin privileges.')) {
            alert("Deleted Bill #" + id);
        }
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        setEditingBill(null);
    };

    const dailyTotal = filteredBills.reduce((sum, b) => b.status === 'Paid' ? sum + parseFloat(b.total) : sum, 0);

    const navigate = useNavigate();
    const { sales: rawSales } = useInventory();

    const handlePrintBill = (billId) => {
        // Find the full transaction data from context
        const fullSale = rawSales.find(s => s.id === billId);

        if (fullSale) {
            navigate('/print-bill', {
                state: {
                    billData: {
                        ...fullSale,
                        shopName: 'MEERAN TIMES', // Fallback or global
                        date: formatDate(fullSale.timestamp)
                    }
                }
            });
        } else {
            // If it's mock data, we can create a simplified version for preview
            const mockBill = filteredBills.find(b => b.id === billId);
            const mockData = {
                items: [{ name: 'Handled Transaction', model: 'MOCK', qty: 1, price: mockBill.total }],
                total: mockBill.total,
                subTotal: mockBill.total / 1.18,
                tax: mockBill.total - (mockBill.total / 1.18),
                customerName: mockBill.customer,
                paymentMethod: mockBill.payment,
                billId: mockBill.id,
                date: mockBill.date,
                shopName: 'MEERAN TIMES'
            };
            navigate('/print-bill', { state: { billData: mockData } });
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sales History</h1>
                    <p className="page-subtitle">View and manage past transactions</p>
                </div>
                <div className="header-date-filter" style={{ minWidth: '200px' }}>
                    <div className="date-input-wrapper">
                        <CalendarIcon size={18} />
                        <input
                            type="date"
                            value={selectedDateValue}
                            onChange={(e) => setSelectedDateValue(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.5rem', fontWeight: '600' }}
                        />
                    </div>
                </div>
            </div>

            <div className="sales-list">
                <div className="date-group active">
                    <div className="date-header" style={{ background: '#F9FAFB', borderRadius: '12px 12px 0 0', border: '1px solid #E5E7EB', borderBottom: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{displayDate}</span>
                            {displayDate === getTodayStr().split('-').reverse().join('/') && <span className="today-badge">TODAY</span>}
                        </div>
                        <span className="date-total" style={{ color: '#059669', fontSize: '1.1rem' }}>
                            Total Sales: ₹{dailyTotal.toLocaleString()}
                        </span>
                    </div>

                    <div className="table-card" style={{ boxShadow: 'none', border: '1px solid #E5E7EB', borderRadius: '0 0 12px 12px' }}>
                        {filteredBills.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>
                                <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No transactions found for this date.</p>
                            </div>
                        ) : (
                            <table className="responsive-table">
                                <thead>
                                    <tr>
                                        <th>Bill ID</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBills.map(bill => (
                                        <tr key={bill.id}>
                                            <td data-label="Bill ID" style={{ fontWeight: '500' }}>#{bill.id}</td>
                                            <td data-label="Customer" style={{ color: '#111827' }}>{bill.customer}</td>
                                            <td data-label="Total" style={{ fontWeight: '600' }}>₹{bill.total.toLocaleString()}</td>
                                            <td data-label="Payment">
                                                <span className="status-badge" style={{
                                                    background: bill.payment === 'Cash' ? '#DCFCE7' : '#DBEAFE',
                                                    color: bill.payment === 'Cash' ? '#166534' : '#1E40AF',
                                                }}>
                                                    {bill.payment}
                                                </span>
                                            </td>
                                            <td data-label="Status">
                                                <span style={{
                                                    color: bill.status === 'Paid' ? '#059669' : '#DC2626',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {bill.status}
                                                </span>
                                            </td>
                                            <td data-label="Actions" style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                                    <button title="Print Bill" className="action-btn" onClick={() => handlePrintBill(bill.id)}>
                                                        <Printer size={18} />
                                                    </button>
                                                    <button title="View Details" className="action-btn" onClick={() => alert(`Bill Details for #${bill.id}`)}>
                                                        <Eye size={18} />
                                                    </button>
                                                    <button title="Edit" className="action-btn" style={{ color: '#2563EB' }} onClick={() => setEditingBill(bill)}>
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => deleteBill(bill.id)} title="Delete" className="action-btn" style={{ color: '#EF4444' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingBill && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal-card">
                        <div className="modal-title-row">
                            <h2>Edit Bill #{editingBill.id}</h2>
                            <button className="close-modal-btn" onClick={() => setEditingBill(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit}>
                            <div className="modal-form-group">
                                <label>Customer Name</label>
                                <input
                                    type="text"
                                    value={editingBill.customer}
                                    onChange={e => setEditingBill({ ...editingBill, customer: e.target.value })}
                                />
                            </div>
                            <div className="modal-form-group">
                                <label>Total Amount (₹)</label>
                                <input
                                    type="number"
                                    value={editingBill.total}
                                    onChange={e => setEditingBill({ ...editingBill, total: e.target.value })}
                                />
                            </div>
                            <div className="modal-form-group">
                                <label>Payment Method</label>
                                <select
                                    value={editingBill.payment}
                                    onChange={e => setEditingBill({ ...editingBill, payment: e.target.value })}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="UPI">UPI</option>
                                </select>
                            </div>
                            <div className="modal-form-group">
                                <label>Status</label>
                                <select
                                    value={editingBill.status}
                                    onChange={e => setEditingBill({ ...editingBill, status: e.target.value })}
                                >
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Refunded">Refunded</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-card btn-outline" style={{ padding: '0.75rem 1.5rem', border: 'none', background: '#F3F4F6' }} onClick={() => setEditingBill(null)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesHistory;
