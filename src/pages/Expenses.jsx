import React, { useState } from 'react';
import {
    Wallet,
    Plus,
    Search,
    Trash2,
    Edit,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    X,
    Check,
    AlertCircle,
    Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../contexts/InventoryContext';
import { useShop } from '../contexts/ShopContext';
import '../styles/Expenses.css';

const STAFF_CATEGORIES = ['Tea/Snacks', 'Transportation', 'Stationery', 'Shop Maintenance', 'Other'];
const ADMIN_CATEGORIES = ['Rent', 'Electricity', 'Water Bill', 'Salaries', 'Staff Welfare', 'Shop Maintenance', 'Marketing', 'Stock Purchase', 'Taxes', 'Other'];

const Expenses = () => {
    const { userRole, currentUser } = useAuth();
    const { selectedShop, currentShop } = useShop();
    const { expenses, recordExpense, deleteExpense, updateExpense } = useInventory();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const getTodayStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [selectedDate, setSelectedDate] = useState(getTodayStr());
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        category: userRole === 'admin' ? ADMIN_CATEGORIES[0] : STAFF_CATEGORIES[0],
        description: '',
        isBusinessExpense: userRole === 'admin' // Admin can mark items as Business vs Staff welfare
    });

    // Filter logic
    const filteredExpenses = expenses.filter(exp => {
        // Shared constraints
        const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
        const matchesShop = exp.shopId === selectedShop;
        const matchesDate = exp.timestamp.startsWith(selectedDate);

        if (userRole === 'admin') {
            return matchesSearch && matchesCategory && matchesShop && matchesDate;
        } else {
            // Staff only sees their own contributions
            return matchesSearch && matchesCategory && matchesShop && matchesDate && exp.createdBy === currentUser?.email;
        }
    });

    const totalExpense = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.description) return alert("Please fill all fields");

        const data = {
            ...formData,
            amount: parseFloat(formData.amount),
            shopId: selectedShop,
            createdBy: currentUser?.email || 'staff',
            creatorName: currentUser?.displayName || 'Staff',
            role: userRole
        };

        if (editingExpense) {
            updateExpense(editingExpense.id, data);
        } else {
            recordExpense(data);
            setFilterCategory('All'); // Reset filter so they see the new data
            setSelectedDate(getTodayStr()); // Reset to today
        }

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        handleCloseModal();
    };

    const handleEdit = (exp) => {
        setEditingExpense(exp);
        setFormData({
            amount: exp.amount,
            category: exp.category,
            description: exp.description,
            isBusinessExpense: exp.isBusinessExpense
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this expense record?")) {
            deleteExpense(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
        setFormData({
            amount: '',
            category: userRole === 'admin' ? ADMIN_CATEGORIES[0] : STAFF_CATEGORIES[0],
            description: '',
            isBusinessExpense: userRole === 'admin'
        });
    };

    const categories = userRole === 'admin' ? ADMIN_CATEGORIES : STAFF_CATEGORIES;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Expenses</h1>
                    <p className="page-subtitle">Track shop and business spending</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    <span>Add Expense</span>
                </button>
            </div>

            <div className="expenses-overview">
                <div className="expense-stat-card">
                    <div className="stat-icon">
                        <ArrowDownRight size={24} color="#EF4444" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Spent on {new Date(selectedDate).toLocaleDateString()}</span>
                        <div className="stat-value">₹{totalExpense.toLocaleString()}</div>
                    </div>
                </div>
                {userRole === 'admin' && (
                    <div className="admin-info-box">
                        <Info size={20} />
                        <p>Showing all expenses for {currentShop.name}. Staff only see their own entries.</p>
                    </div>
                )}
            </div>

            <div className="control-bar">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters-group">
                    <div className="date-input-wrapper">
                        <Calendar size={18} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="category-select"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            <div className="expenses-list">
                {filteredExpenses.length === 0 ? (
                    <div className="empty-state">
                        <Wallet size={48} />
                        <p>No expenses found for this date.</p>
                    </div>
                ) : (
                    <div className="table-card" style={{ boxShadow: 'none', border: 'none', padding: 0 }}>
                        <table className="responsive-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Created By</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td data-label="Description">
                                            <div style={{ fontWeight: '600', color: '#111827' }}>{exp.description}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{new Date(exp.timestamp).toLocaleTimeString()}</div>
                                        </td>
                                        <td data-label="Category">
                                            <span className="category-chip">{exp.category}</span>
                                        </td>
                                        <td data-label="Amount" style={{ fontWeight: '700', color: '#EF4444' }}>
                                            ₹{exp.amount.toLocaleString()}
                                        </td>
                                        <td data-label="Staff">
                                            <div style={{ fontSize: '0.85rem' }}>{exp.creatorName}</div>
                                            {userRole === 'admin' && <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{exp.createdBy}</div>}
                                        </td>
                                        <td data-label="Actions" style={{ textAlign: 'right' }}>
                                            <div className="action-btns">
                                                <button onClick={() => handleEdit(exp)} title="Edit" className="action-btn" style={{ color: '#2563EB' }}>
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(exp.id)} title="Delete" className="action-btn" style={{ color: '#EF4444' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal-card">
                        <div className="modal-title-row">
                            <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
                            <button className="close-modal-btn" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-form-group">
                                <label>Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="modal-form-group">
                                <label>Description</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter details (e.g. Tea for staff, Electricity bill Jan)"
                                />
                            </div>
                            {userRole === 'admin' && (
                                <div className="modal-form-group checkbox">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isBusinessExpense}
                                            onChange={e => setFormData({ ...formData, isBusinessExpense: e.target.checked })}
                                        />
                                        <span>Mark as Business Ownership Expense (Rent, Bills, etc)</span>
                                    </label>
                                </div>
                            )}
                            <div className="modal-actions">
                                <button type="button" className="btn-card btn-outline" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                    <Check size={20} />
                                    {editingExpense ? 'Save Changes' : 'Record Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
