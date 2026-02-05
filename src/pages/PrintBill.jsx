import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Download, Share2 } from 'lucide-react';
import '../styles/PrintBill.css';

const PrintBill = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const billData = location.state?.billData;

    if (!billData) {
        return (
            <div className="print-error">
                <p>No bill data found. Please go back to POS.</p>
                <button onClick={() => navigate('/pos')} className="btn-primary">Back to POS</button>
            </div>
        );
    }

    const {
        items,
        total,
        subTotal,
        tax,
        customerName,
        salesman,
        paymentMethod,
        shopName,
        gstNo,
        billId,
        date
    } = billData;

    const handleActualPrint = () => {
        window.print();
    };

    return (
        <div className="print-preview-container">
            <div className="no-print preview-header">
                <button onClick={() => navigate('/pos')} className="back-btn">
                    <ArrowLeft size={20} />
                    <span>Edit Bill</span>
                </button>
                <div className="header-actions">
                    <button className="action-btn" onClick={() => alert('Feature coming soon: Download PDF')}>
                        <Download size={20} />
                        <span>PDF</span>
                    </button>
                    <button className="btn-primary print-trigger-btn" onClick={handleActualPrint}>
                        <Printer size={20} />
                        <span>Print Bill</span>
                    </button>
                </div>
            </div>

            <div className="invoice-paper" id="invoice">
                <div className="invoice-header">
                    <div className="shop-info">
                        <h1>{shopName || 'MEERAN TIMES'}</h1>
                        <p className="shop-subtitle">Luxury Watch Gallery & Service Center</p>
                        <p>Veppamodu Junction, Nagercoil, Tamil Nadu</p>
                        <p>Phone: +91 91234 56789 | Email: contact@meerantimes.com</p>
                        {gstNo && <p className="gst-tag">GSTIN: {gstNo}</p>}
                    </div>
                    <div className="invoice-meta">
                        <div className="meta-item">
                            <span className="label">Invoice No:</span>
                            <span className="value">#{billId}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Date:</span>
                            <span className="value">{date}</span>
                        </div>
                    </div>
                </div>

                <div className="billing-details">
                    <div className="bill-to">
                        <h3>Bill To:</h3>
                        <p className="customer-name">{customerName || 'Walk-in Customer'}</p>
                        <p>Payment Mode: <strong>{paymentMethod}</strong></p>
                    </div>
                    <div className="sales-info">
                        <h3>Handled By:</h3>
                        <p>{salesman || 'General Staff'}</p>
                    </div>
                </div>

                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Description</th>
                            <th>Model</th>
                            <th className="text-right">Price</th>
                            <th className="text-center">Qty</th>
                            <th className="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    <div className="item-name">{item.name}</div>
                                </td>
                                <td>{item.model}</td>
                                <td className="text-right">₹{item.price.toLocaleString()}</td>
                                <td className="text-center">{item.qty}</td>
                                <td className="text-right">₹{(item.price * item.qty).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="invoice-summary">
                    <div className="summary-left">
                        <div className="terms">
                            <h4>Terms & Conditions:</h4>
                            <ul>
                                <li>Goods once sold will not be taken back.</li>
                                <li>Warranty as per manufacturer terms.</li>
                                <li>Subject to Nagercoil Jurisdiction.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="summary-right">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{subTotal.toLocaleString()}</span>
                        </div>
                        <div className="summary-row">
                            <span>GST (18%)</span>
                            <span>₹{tax.toLocaleString()}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Grand Total</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                        <div className="amount-words">
                            <p>Amount in words: Rupees {total.toLocaleString()} Only</p>
                        </div>
                    </div>
                </div>

                <div className="invoice-footer">
                    <div className="seal-area">
                        <p>Authorized Signatory</p>
                        <div className="seal-placeholder"></div>
                    </div>
                    <div className="thanks-msg">
                        <p>Thank you for your business!</p>
                        <p>Visit again at Meeran Times</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintBill;
