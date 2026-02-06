import React, { useState } from 'react';
import { Users, UserPlus, Phone, CheckCircle, XCircle, MoreHorizontal, Edit, Trash2, Calendar, X, BarChart3, TrendingUp } from 'lucide-react';
import '../styles/ResponsiveTables.css';
import '../styles/Employees.css';

const MOCK_EMPLOYEES = [
    {
        id: 1,
        name: 'Rahul Sharma',
        role: 'Salesman',
        shop: 'Meeran Times (Retail)',
        phone: '9876543210',
        status: 'Active',
        todayAttendance: 'Present',
        history: [
            { date: '2026-02-01', status: 'P' },
            { date: '2026-02-02', status: 'P' },
            { date: '2026-02-03', status: 'A' },
            { date: '2026-02-04', status: 'P' },
            { date: '2026-02-05', status: 'P' },
            { date: '2026-01-31', status: 'P' },
            { date: '2026-01-30', status: 'HD' },
        ]
    },
    {
        id: 2,
        name: 'Priya Verma',
        role: 'Cashier',
        shop: 'Daylook (Retail)',
        phone: '9123456780',
        status: 'Active',
        todayAttendance: 'Half Day',
        history: [
            { date: '2026-02-01', status: 'P' },
            { date: '2026-02-02', status: 'P' },
            { date: '2026-02-03', status: 'P' },
            { date: '2026-02-04', status: 'HD' },
            { date: '2026-02-05', status: 'HD' },
        ]
    },
    {
        id: 3,
        name: 'Ahmed Khan',
        role: 'Manager',
        shop: 'Meeran Wholesale',
        phone: '9988776655',
        status: 'On Leave',
        todayAttendance: 'Leave',
        history: [
            { date: '2026-02-01', status: 'L' },
            { date: '2026-02-02', status: 'L' },
            { date: '2026-02-03', status: 'L' },
            { date: '2026-02-04', status: 'L' },
            { date: '2026-02-05', status: 'L' },
        ]
    },
];

const Employees = () => {
    const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

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
        setSelectedEmployee(emp);
        setIsAttendanceModalOpen(true);
    };

    const openReportModal = (emp) => {
        setSelectedEmployee(emp);
        setIsReportModalOpen(true);
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
            setEmployees([...employees, { ...formData, id: Date.now(), history: [] }]);
        }
        setIsModalOpen(false);
    };

    const handleAttendanceMark = (status) => {
        const statusMap = {
            'Present': 'P',
            'Absent': 'A',
            'Half Day - Morning': 'HD',
            'Half Day - Evening': 'HD',
            'Leave': 'L'
        };

        const today = new Date().toISOString().split('T')[0];

        setEmployees(employees.map(emp =>
            emp.id === selectedEmployee.id
                ? {
                    ...emp,
                    todayAttendance: status,
                    history: [
                        { date: today, status: statusMap[status] },
                        ...emp.history.filter(h => h.date !== today)
                    ]
                }
                : emp
        ));
        alert(`✓ Marked ${status} for ${selectedEmployee.name}`);
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
                                            <button title="Performance Report" className="action-btn" style={{ color: '#8B5CF6' }} onClick={() => openReportModal(emp)}>
                                                <BarChart3 size={18} />
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
                    <div className="modal-content attendance-modal" style={{ maxWidth: '480px', borderRadius: '24px', padding: '0' }}>
                        <div className="modal-header" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1E293B' }}>Mark Attendance</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>{selectedEmployeeForAttendance.name}</p>
                            </div>
                            <button className="close-modal-btn" onClick={() => setIsAttendanceModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ padding: '2rem' }}>
                            <div className="today-marker" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', fontWeight: '700' }}>Current Date</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#334155', marginTop: '4px' }}>
                                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>

                            <div className="attendance-options-grid">
                                <button className="att-opt-btn present" onClick={() => { handleAttendanceMark('Present'); setIsAttendanceModalOpen(false); }}>
                                    <div className="opt-icon"><CheckCircle size={28} /></div>
                                    <div className="opt-label">Full Day</div>
                                    <div className="opt-status">Present</div>
                                </button>

                                <button className="att-opt-btn absent" onClick={() => { handleAttendanceMark('Absent'); setIsAttendanceModalOpen(false); }}>
                                    <div className="opt-icon"><XCircle size={28} /></div>
                                    <div className="opt-label">Full Day</div>
                                    <div className="opt-status">Absent</div>
                                </button>

                                <button className="att-opt-btn half" onClick={() => { handleAttendanceMark('Half Day - Morning'); setIsAttendanceModalOpen(false); }}>
                                    <div className="opt-icon">🌅</div>
                                    <div className="opt-label">Morning</div>
                                    <div className="opt-status">Half Day</div>
                                </button>

                                <button className="att-opt-btn half" onClick={() => { handleAttendanceMark('Half Day - Evening'); setIsAttendanceModalOpen(false); }}>
                                    <div className="opt-icon">🌆</div>
                                    <div className="opt-label">Evening</div>
                                    <div className="opt-status">Half Day</div>
                                </button>
                            </div>

                            <button className="att-leave-btn" onClick={() => { handleAttendanceMark('Leave'); setIsAttendanceModalOpen(false); }}>
                                <Calendar size={18} />
                                <span>Approved Leave / Vacation</span>
                            </button>

                            <div className="attendance-history-section">
                                <div className="section-title">
                                    <span>Last 7 Days</span>
                                    <div className="status-legend">
                                        <span className="dot p"></span> P
                                        <span className="dot a"></span> A
                                        <span className="dot l"></span> L
                                        <span className="dot hd"></span> HD
                                    </div>
                                </div>
                                <div className="history-grid-modern">
                                    {[...Array(7)].map((_, i) => {
                                        const date = new Date(Date.now() - (6 - i) * 86400000);
                                        const dateStr = date.toISOString().split('T')[0];
                                        const entry = selectedEmployee.history.find(h => h.date === dateStr);
                                        const status = entry ? entry.status.toLowerCase() : 'empty';
                                        return (
                                            <div key={i} className={`history-day-node ${status}`}>
                                                <div className="day-name">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                                                <div className="day-circle">{date.getDate()}</div>
                                                <div className="day-status">{status === 'empty' ? '-' : status.toUpperCase()}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Report Modal */}
            {isReportModalOpen && selectedEmployee && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '550px', borderRadius: '24px' }}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <TrendingUp style={{ color: '#8B5CF6' }} /> Performance Analysis
                                </h2>
                                <p style={{ fontSize: '0.9rem', color: '#64748B' }}>Report for {selectedEmployee.name}</p>
                            </div>
                            <button className="action-btn" onClick={() => setIsReportModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            {/* Summary Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '16px', border: '1px solid #DCFCE7', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Present</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#15803D' }}>
                                        {selectedEmployee.history.filter(h => h.status === 'P').length}
                                    </div>
                                </div>
                                <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '16px', border: '1px solid #FEE2E2', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#991B1B', textTransform: 'uppercase' }}>Absent</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#B91C1C' }}>
                                        {selectedEmployee.history.filter(h => h.status === 'A').length}
                                    </div>
                                </div>
                                <div style={{ background: '#EFF6FF', padding: '1rem', borderRadius: '16px', border: '1px solid #DBEAFE', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase' }}>Score</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1D4ED8' }}>
                                        {Math.round((selectedEmployee.history.filter(h => h.status === 'P').length / Math.max(1, selectedEmployee.history.length)) * 100)}%
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1E293B' }}>Attendance Trend</h3>
                            <div className="history-grid-modern" style={{ marginBottom: '2rem' }}>
                                {selectedEmployee.history.slice(0, 10).map((h, i) => (
                                    <div key={i} className={`history-day-node ${h.status.toLowerCase()}`}>
                                        <div className="day-circle" style={{ width: '40px', height: '40px' }}>{h.status}</div>
                                        <div className="day-name" style={{ fontSize: '0.6rem' }}>{h.date.split('-')[2]}/{h.date.split('-')[1]}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                <h4 style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>Management Insight:</h4>
                                <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#64748B' }}>
                                    {selectedEmployee.history.filter(h => h.status === 'A').length > 2
                                        ? "⚠️ Higher than average absenteeism. Consideration for review recommended."
                                        : "✅ Consistent attendance performance. Maintaining high reliability standards."}
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-primary" style={{ width: 'auto' }} onClick={() => window.print()}>Export PDF Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
