import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import '../styles/SupplierModal.css';

const SupplierModal = ({ isOpen, onClose, onSave }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        contact: '',
        due: 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        setFormData({ name: '', location: '', contact: '', due: 0 }); // Reset form
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Add New Supplier</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Supplier Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Ex: Titan India Ltd."
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            placeholder="Ex: Bangalore, KA"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contact Person / Number</label>
                        <input
                            type="text"
                            name="contact"
                            placeholder="Ex: Mr. Sharma / 9876543210"
                            value={formData.contact}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Initial Due Amount (₹)</label>
                        <input
                            type="number"
                            name="due"
                            placeholder="0"
                            value={formData.due}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit">
                            <Check size={18} /> Save Supplier
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierModal;
