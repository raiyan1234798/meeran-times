import React, { useState } from 'react';
import { Truck, Plus } from 'lucide-react';
import '../styles/Suppliers.css';
import SupplierModal from '../components/SupplierModal';

const Suppliers = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [suppliers, setSuppliers] = useState([
        { id: 1, name: 'Titan India Ltd.', location: 'Bangalore, KA', due: 45000 },
        { id: 2, name: 'Casio India', location: 'New Delhi, DL', due: 12500 },
        { id: 3, name: 'Fossil Group', location: 'Mumbai, MH', due: 0 }
    ]);

    const handleAddSupplier = (newSupplier) => {
        setSuppliers([...suppliers, { ...newSupplier, id: Date.now() }]);
    };

    return (
        <div className="page-container">
            <SupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddSupplier}
            />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Supplier Directory</h1>
                    <p className="page-subtitle">Manage vendors, credit payments, and stock orders</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Add Supplier
                </button>
            </div>

            {/* Supplier Cards */}
            <div className="suppliers-grid">
                {suppliers.length === 0 ? (
                    <p style={{ color: '#666' }}>No suppliers found. Add one to get started.</p>
                ) : (
                    suppliers.map(supplier => (
                        <div key={supplier.id} className="supplier-card">
                            <div className="card-header">
                                <div className="supplier-info">
                                    <div className="supplier-icon">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <div className="supplier-name">{supplier.name}</div>
                                        <div className="supplier-location">{supplier.location}</div>
                                    </div>
                                </div>
                                <span className="due-amount" style={{ color: supplier.due > 0 ? '#EF4444' : '#10B981' }}>
                                    {supplier.due > 0 ? `Due: ₹${supplier.due.toLocaleString()}` : 'Settled'}
                                </span>
                            </div>

                            <div className="card-actions">
                                <button
                                    className="btn-card btn-outline"
                                    onClick={() => alert(`Showing history for ${supplier.name}\n\n- Invoice #102: ₹50,000 (Paid)\n- Invoice #105: ₹${supplier.due} (Pending)`)}
                                >
                                    View History
                                </button>
                                <button
                                    className="btn-card btn-success"
                                    onClick={() => {
                                        const amount = prompt(`Enter amount to pay for ${supplier.name} (Due: ₹${supplier.due})`);
                                        if (amount && !isNaN(amount)) {
                                            const paid = parseFloat(amount);
                                            setSuppliers(suppliers.map(s =>
                                                s.id === supplier.id ? { ...s, due: Math.max(0, s.due - paid) } : s
                                            ));
                                            alert(`Payment of ₹${paid} recorded! New Due: ₹${Math.max(0, supplier.due - paid)}`);
                                        }
                                    }}
                                >
                                    Pay Balance
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Suppliers;
