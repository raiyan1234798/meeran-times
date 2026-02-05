import React, { useState } from 'react';
import { FileText, Edit, Trash2, Eye, Printer } from 'lucide-react';
import '../styles/ResponsiveTables.css';

const MOCK_BILLS = [
    { id: '10234', date: '04/02/2026', customer: 'Rayan', total: 4500, payment: 'Cash', status: 'Paid' },
    { id: '10235', date: '04/02/2026', customer: 'Walk-in', total: 1200, payment: 'UPI', status: 'Paid' },
    { id: '10236', date: '03/02/2026', customer: 'Priya', total: 8900, payment: 'Card', status: 'Refunded' },
];

const SalesHistory = () => {
    const [bills, setBills] = useState(MOCK_BILLS);
    const [userRole, setUserRole] = useState('admin');

    const [editingBill, setEditingBill] = useState(null);

    const deleteBill = (id) => {
        if (window.confirm('Are you sure you want to delete this bill? This action matches Super Admin privileges.')) {
            setBills(bills.filter(b => b.id !== id));
        }
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        setBills(bills.map(b => b.id === editingBill.id ? editingBill : b));
        setEditingBill(null);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sales History</h1>
                    <p className="page-subtitle">View and manage past transactions</p>
                </div>
            </div>

            <div className="table-card">
                {/* Group transactions by date */}
                {Object.entries(bills.reduce((acc, bill) => {
                    (acc[bill.date] = acc[bill.date] || []).push(bill);
                    return acc;
                }, {})).sort((a, b) => new Date(b[0].split('/').reverse().join('-')) - new Date(a[0].split('/').reverse().join('-'))).map(([date, dateBills]) => (
                    <div key={date} style={{ marginBottom: '2rem' }}>
                        <div style={{ padding: '0.75rem 1rem', background: '#F9FAFB', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{date}</span>
                            <span style={{ fontSize: '0.9em', color: '#6B7280' }}>
                                Total Sales: ₹{dateBills.reduce((sum, b) => b.status === 'Paid' ? sum + parseFloat(b.total) : sum, 0).toLocaleString()}
                            </span>
                        </div>
                        <table className="responsive-table" style={{ marginTop: 0 }}>
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
                                {dateBills.map(bill => (
                                    <tr key={bill.id}>
                                        <td data-label="Bill ID" style={{ fontWeight: '500' }}>#{bill.id}</td>
                                        <td data-label="Customer" style={{ color: '#111827' }}>{bill.customer}</td>
                                        <td data-label="Total" style={{ fontWeight: '600' }}>₹{bill.total}</td>
                                        <td data-label="Payment">
                                            <span style={{
                                                padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
                                                background: bill.payment === 'Cash' ? '#DCFCE7' : '#DBEAFE',
                                                color: bill.payment === 'Cash' ? '#166534' : '#1E40AF',
                                                display: 'inline-block'
                                            }}>
                                                {bill.payment}
                                            </span>
                                        </td>
                                        <td data-label="Status">
                                            <span style={{
                                                color: bill.status === 'Paid' ? '#059669' : '#DC2626',
                                                fontWeight: '500',
                                                fontSize: '0.9rem'
                                            }}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td data-label="Actions" style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button title="Print Bill" className="action-btn" onClick={() => alert(`Printing Bill #${bill.id} for ${bill.customer}...`)}>
                                                    <Printer size={18} />
                                                </button>
                                                <button title="View Details" className="action-btn" onClick={() => alert(`Bill #${bill.id}\nDate: ${bill.date}\nCustomer: ${bill.customer}\nTotal: ₹${bill.total}\nPayment: ${bill.payment}\nStatus: ${bill.status}`)}>
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    title="Edit"
                                                    className="action-btn"
                                                    style={{ color: '#2563EB' }}
                                                    onClick={() => setEditingBill(bill)}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => deleteBill(bill.id)}
                                                    title="Delete"
                                                    className="action-btn"
                                                    style={{ color: '#EF4444' }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingBill && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'white', padding: '1.5rem', borderRadius: '12px',
                        width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Edit Bill #{editingBill.id}</h2>
                            <button onClick={() => setEditingBill(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={20} style={{ transform: 'rotate(45deg)', color: '#6B7280' }} />
                                {/* Using rotated Trash2 as X because X is not imported, or I can update import below */}
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Customer Name</label>
                                <input
                                    type="text"
                                    value={editingBill.customer}
                                    onChange={e => setEditingBill({ ...editingBill, customer: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Total Amount (₹)</label>
                                <input
                                    type="number"
                                    value={editingBill.total}
                                    onChange={e => setEditingBill({ ...editingBill, total: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Payment Method</label>
                                <select
                                    value={editingBill.payment}
                                    onChange={e => setEditingBill({ ...editingBill, payment: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="UPI">UPI</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Status</label>
                                <select
                                    value={editingBill.status}
                                    onChange={e => setEditingBill({ ...editingBill, status: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                                >
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Refunded">Refunded</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" onClick={() => setEditingBill(null)} style={{ padding: '0.5rem 1rem', background: '#F3F4F6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#111827', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesHistory;
