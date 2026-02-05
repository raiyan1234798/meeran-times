import React, { useState } from 'react';
import { Bluetooth, Printer, Save, AlertTriangle, Store, Info, ChevronDown, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Settings.css';

const Settings = () => {
    const { userRole } = useAuth();

    const [storeDetails, setStoreDetails] = useState({
        name: 'Meeran Times',
        address: '123 Main St, City Center',
        phone: '9876543210',
        upi: 'shop@okicici'
    });

    const [printerStatus, setPrinterStatus] = useState('disconnected');

    return (
        <div className="settings-container">
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle" style={{ color: '#6B7280', marginBottom: '2rem' }}>
                {userRole === 'admin' ? 'Configure store and printer settings' : 'Printer Configuration'}
            </p>

            <div className="settings-grid">
                {/* Printer Settings - Visible to ALL */}
                <div className="settings-card">
                    <h2>Printer Settings</h2>

                    <div className="printer-status-box">
                        <div className="status-header">
                            <Bluetooth size={20} />
                            <span>Bluetooth Printer (58mm)</span>
                        </div>

                        <div className="status-message">
                            <Info size={18} />
                            <div>
                                <strong>No Printer Configured</strong>
                                <p>Click "Scan for Printers" to connect.</p>
                            </div>
                        </div>
                    </div>

                    <div className="instructions-box">
                        <div className="info-title"><Info size={16} /> Instructions</div>
                        <ul>
                            <li>Turn on your Bluetooth thermal printer</li>
                            <li>Click "Scan for Printers" to search device</li>
                            <li>Select your printer from the list</li>
                            <li>Click "Test Print" to verify connection</li>
                        </ul>
                    </div>

                    <div className="printer-actions">
                        <button className="btn-scan">
                            <Bluetooth size={18} /> Scan for Printers
                        </button>
                        <button className="btn-test" onClick={() => window.print()}>
                            <Printer size={18} /> Test Print
                        </button>
                    </div>

                    <div className="warning-box">
                        <AlertTriangle size={20} className="warn-icon" />
                        <div>
                            <strong>Browser Compatibility</strong>
                            <p>Bluetooth printing requires Web Bluetooth API. Supported on Chrome (Android/Windows/Mac) and Edge. Not supported on iOS Safari/Firefox.</p>
                        </div>
                    </div>
                </div>

                {/* Store Information - Admin Only */}
                {userRole === 'admin' && (
                    <div className="settings-card">
                        <div className="card-header">
                            <h2>Store Information</h2>
                        </div>

                        <div className="store-form">
                            <div className="form-section-title">
                                <Store size={18} /> Store Details
                            </div>

                            <div className="form-group">
                                <label>Store Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={storeDetails.name}
                                    onChange={(e) => setStoreDetails({ ...storeDetails, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Store Address</label>
                                <textarea
                                    rows="3"
                                    placeholder="e.g. 123 Main St, City"
                                    value={storeDetails.address}
                                    onChange={(e) => setStoreDetails({ ...storeDetails, address: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Store Phone</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 9876543210"
                                    value={storeDetails.phone}
                                    onChange={(e) => setStoreDetails({ ...storeDetails, phone: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>UPI ID (for QR Code) <span className="required">*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. shop@okicici"
                                    value={storeDetails.upi}
                                    onChange={(e) => setStoreDetails({ ...storeDetails, upi: e.target.value })}
                                />
                            </div>

                            <div className="checkbox-group">
                                <label className="checkbox-item">
                                    <input type="checkbox" defaultChecked />
                                    <span>Auto-print receipts</span>
                                </label>
                                <p className="help-text">Automatically print receipt after billing</p>

                                <label className="checkbox-item">
                                    <input type="checkbox" />
                                    <span>Print Logo on receipts</span>
                                </label>
                            </div>

                            <div className="accordion-header">
                                <FileText size={18} /> Tax & GST Settings <ChevronDown size={16} />
                            </div>

                            <button className="btn-save">
                                <Save size={18} /> Save Store Information
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
