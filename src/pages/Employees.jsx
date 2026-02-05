import React, { useState } from 'react';
import { Users, UserPlus, Phone, CheckCircle, XCircle, MoreHorizontal, Edit, Trash2, Calendar, X } from 'lucide-react';
import '../styles/ResponsiveTables.css';
import '../styles/Employees.css';

const MOCK_EMPLOYEES = [
    { id: 1, name: 'Rahul Sharma', role: 'Salesman', shop: 'Meeran Times (Retail)', phone: '9876543210', status: 'Active', todayAttendance: 'Present', attendance: [] },
    { id: 2, name: 'Priya Verma', role: 'Cashier', shop: 'Daylook (Retail)', phone: '9123456780', status: 'Active', todayAttendance: 'Half Day', attendance: [] },
    { id: 3, name: 'Ahmed Khan', role: 'Manager', shop: 'Meeran Wholesale', phone: '9988776655', status: 'On Leave', todayAttendance: 'Leave', attendance: [] },
];

const Employees = () => {
    const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [selectedEmployeeForAttendance, setSelectedEmployeeForAttendance] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', role: 'Salesman', shop: '', phone: '', status: 'Active'
    });

    const openAddModal = () => {
        setEditingEmployee(null);
        setFormData({ name: '', role: 'Salesman', shop: '', phone: '', status: 'Active' });
        setIsModalOpen(true);
    };

    const openEditModal = (emp) => {
        setEditingEmployee(emp);
        setFormData(emp);
        setIsModalOpen(true);
    };

    const openAttendanceModal = (emp) => {
        setSelectedEmployeeForAttendance(emp);
        setIsAttendanceModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            setEmployees(employees.filter(e => e.id !== id));
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingEmployee) {
            setEmployees(employees.map(emp => emp.id === editingEmployee.id ? { ...formData, id: emp.id } : emp));
        } else {
            setEmployees([...employees, { ...formData, id: Date.now(), attendance: [] }]);
        }
        setIsModalOpen(false);
    };

    const handleAttendanceMark = (status) => {
        // Update the employee's today attendance
        setEmployees(employees.map(emp =>
            emp.id === selectedEmployeeForAttendance.id
                ? { ...emp, todayAttendance: status.includes('Half Day') ? 'Half Day' : status }
                : emp
        ));
        alert(`✓ Marked ${status} for ${selectedEmployeeForAttendance.name}`);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Employee Management</h1>
                    <p className="page-subtitle">Manage staff access, roles, and payroll</p>
                </div>
                <button className="btn-primary" onClick={openAddModal}>
                    <UserPlus size={18} /> Add Employee
                </button>
            </div>

            <div className="table-card">
                <table className="responsive-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Assigned Shop</th>
                            <th>Contact</th>
                            <th>Today</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => {
                            const getAttendanceStyle = (att) => {
                                switch (att) {
                                    case 'Present': return { background: '#DCFCE7', color: '#166534' };
                                    case 'Absent': return { background: '#FEE2E2', color: '#991B1B' };
                                    case 'Half Day': return { background: '#DBEAFE', color: '#1E40AF' };
                                    case 'Leave': return { background: '#FEF3C7', color: '#92400E' };
                                    default: return { background: '#F3F4F6', color: '#6B7280' };
                                }
                            };
                            return (
                                <tr key={emp.id}>
                                    <td data-label="Name">
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {emp.name[0]}
                                            </div>
                                            <span style={{ fontWeight: '500', color: '#111827' }}>{emp.name}</span>
                                        </div>
                                    </td>
                                    <td data-label="Role">
                                        <span style={{ background: '#F3F4F6', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem' }}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td data-label="Assigned Shop">{emp.shop}</td>
                                    <td data-label="Contact">
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <Phone size={14} /> {emp.phone}
                                        </div>
                                    </td>
                                    <td data-label="Today">
                                        <span style={{
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            ...getAttendanceStyle(emp.todayAttendance)
                                        }}>
                                            {emp.todayAttendance || 'Not Marked'}
                                        </span>
                                    </td>
                                    <td data-label="Status">
                                        <span className={`status-badge ${emp.status === 'Active' ? 'status-active' : 'status-warning'}`}>
                                            {emp.status === 'Active' ? <CheckCircle size={14} /> : <XCircle size={14} />} {emp.status}
                                        </span>
                                    </td>
                                    <td data-label="Actions" style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button title="Attendance" className="action-btn" onClick={() => openAttendanceModal(emp)}>
                                                <Calendar size={18} />
                                            </button>
                                            <button title="Edit" className="action-btn" style={{ color: '#2563EB' }} onClick={() => openEditModal(emp)}>
                                                <Edit size={18} />
                                            </button>
                                            <button title="Delete" className="action-btn" style={{ color: '#EF4444' }} onClick={() => handleDelete(emp.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
                            <button className="action-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                        <option>Salesman</option>
                                        <option>Cashier</option>
                                        <option>Manager</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Assigned Shop</label>
                                    <select required value={formData.shop} onChange={e => setFormData({ ...formData, shop: e.target.value })}>
                                        <option value="">Select Shop</option>
                                        <option value="Wholesale">Meeran Wholesale</option>
                                        <option value="Retail 1">Meeran Times (Retail)</option>
                                        <option value="Retail 2">Daylook (Retail)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option>Active</option>
                                        <option>On Leave</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-card btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Save Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Attendance Modal */}
            {isAttendanceModalOpen && selectedEmployeeForAttendance && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Attendance: {selectedEmployeeForAttendance.name}</h2>
                            <button className="action-btn" onClick={() => setIsAttendanceModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#4B5563' }}>
                                Mark attendance for today ({new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})
                            </p>

                            {/* Main Attendance Options */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                <button
                                    className="day-box present"
                                    style={{ height: '70px', fontSize: '1rem', fontWeight: '600', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                    onClick={() => { handleAttendanceMark('Present'); setIsAttendanceModalOpen(false); }}
                                >
                                    <CheckCircle size={20} />
                                    Present
                                </button>
                                <button
                                    className="day-box absent"
                                    style={{ height: '70px', fontSize: '1rem', fontWeight: '600', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                    onClick={() => { handleAttendanceMark('Absent'); setIsAttendanceModalOpen(false); }}
                                >
                                    <XCircle size={20} />
                                    Absent
                                </button>
                            </div>

                            {/* Half Day Options */}
                            <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.5rem' }}>Half Day Options:</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                <button
                                    className="day-box half"
                                    style={{ height: '60px', fontSize: '0.9rem', fontWeight: '500', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.15rem' }}
                                    onClick={() => { handleAttendanceMark('Half Day - Morning'); setIsAttendanceModalOpen(false); }}
                                >
                                    🌅 Morning Only
                                </button>
                                <button
                                    className="day-box half"
                                    style={{ height: '60px', fontSize: '0.9rem', fontWeight: '500', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.15rem' }}
                                    onClick={() => { handleAttendanceMark('Half Day - Evening'); setIsAttendanceModalOpen(false); }}
                                >
                                    🌆 Evening Only
                                </button>
                            </div>

                            {/* Leave Option */}
                            <button
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#FEF3C7',
                                    border: '1px solid #F59E0B',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    color: '#92400E',
                                    cursor: 'pointer',
                                    marginBottom: '1.5rem'
                                }}
                                onClick={() => { handleAttendanceMark('Leave'); setIsAttendanceModalOpen(false); }}
                            >
                                📋 Mark as Leave (Approved)
                            </button>

                            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#374151' }}>History (Last 7 Days)</h3>
                            <div className="attendance-grid">
                                {[...Array(7)].map((_, i) => {
                                    const statuses = ['present', 'present', 'leave', 'half', 'absent', 'present', 'present'];
                                    const labels = ['P', 'P', 'L', 'HD', 'A', 'P', 'P'];
                                    return (
                                        <div key={i} className={`day-box ${statuses[i]}`}>
                                            <span style={{ fontWeight: 'bold' }}>{new Date(Date.now() - (6 - i) * 86400000).getDate()}</span>
                                            <span style={{ fontSize: '0.65rem' }}>{labels[i]}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem', color: '#6B7280', flexWrap: 'wrap' }}>
                                <span><span style={{ background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px', marginRight: '4px' }}>P</span> Present</span>
                                <span><span style={{ background: '#FEE2E2', padding: '2px 6px', borderRadius: '4px', marginRight: '4px' }}>A</span> Absent</span>
                                <span><span style={{ background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px', marginRight: '4px' }}>L</span> Leave</span>
                                <span><span style={{ background: '#DBEAFE', padding: '2px 6px', borderRadius: '4px', marginRight: '4px' }}>HD</span> Half Day</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
