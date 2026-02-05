import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    ShoppingCart,
    Trash,
    User,
    Minus,
    Plus,
    CreditCard,
    Printer,
    Share2,
    Camera,
    Check,
    X,
    Eye
} from 'lucide-react';
import '../styles/POS.css';
import SmartScannerModal from '../components/smart-search/SmartScannerModal';
import { generateWhatsAppLink } from '../utils/whatsapp';
import { printThermalBill } from '../utils/printer';
import { useShop } from '../contexts/ShopContext';
import { useInventory } from '../contexts/InventoryContext';

const SALESMEN = [
    { id: 1, name: 'Rahul' },
    { id: 2, name: 'Priya' },
    { id: 3, name: 'Ahmed' }
];

const POS = () => {
    const { currentShop, selectedShop } = useShop();
    const { products, recordSale } = useInventory();

    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSalesman, setSelectedSalesman] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualItem, setManualItem] = useState({ name: '', price: '' });
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [gstNo, setGstNo] = useState('');
    const [mobileView, setMobileView] = useState('products');

    const addManualItem = () => {
        if (!manualItem.name || !manualItem.price) return;
        const newItem = {
            id: 'm_' + Date.now(),
            name: manualItem.name,
            model: 'MANUAL',
            price: parseFloat(manualItem.price),
            image: null,
            qty: 1
        };
        setCart([...cart, newItem]);
        setManualItem({ name: '', price: '' });
        setShowManualEntry(false);
    };

    const handleScanMatch = (product) => {
        const matchedProduct = products.find(p => p.model === product.model) || products[0];
        addToCart(matchedProduct);
    };

    const addToCart = (product) => {
        // Check local stock
        const currentStock = product.stock[selectedShop] || 0;
        const inCart = cart.find(item => item.id === product.id)?.qty || 0;

        if (inCart >= currentStock && product.model !== 'MANUAL') {
            alert(`Insufficient stock in ${currentShop.name}!`);
            return;
        }

        setCart(currentCart => {
            const existing = currentCart.find(item => item.id === product.id);
            if (existing) {
                return currentCart.map(item =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...currentCart, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        const product = products.find(p => p.id === id);
        if (delta > 0 && product) {
            const currentStock = product.stock[selectedShop] || 0;
            const inCart = cart.find(item => item.id === id)?.qty || 0;
            if (inCart >= currentStock && product.model !== 'MANUAL') {
                alert("Cannot exceed available stock!");
                return;
            }
        }

        setCart(currentCart => currentCart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(currentCart => currentCart.filter(item => item.id !== id));
    };

    const subTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subTotal * 0.18;
    const total = subTotal + tax;

    const navigate = useNavigate();

    const handleFinalPrint = () => {
        const billId = Date.now().toString().slice(-6);
        const saleData = {
            items: cart,
            total,
            subTotal,
            tax,
            shopId: selectedShop,
            shopName: currentShop.name,
            customerName,
            salesman: SALESMEN.find(s => s.id == selectedSalesman)?.name || 'General',
            paymentMethod,
            gstNo,
            billId,
            date: new Date().toLocaleDateString('en-IN')
        };

        // 1. Record Sale and Update Stock
        recordSale(saleData);

        // 2. Navigate to Preview Page
        navigate('/print-bill', { state: { billData: saleData } });

        // 3. Clear POS
        setCart([]);
        setCustomerName('');
        setGstNo('');
        setSelectedSalesman('');
        setIsReviewOpen(false);
        setMobileView('products');
    };

    const handlePreviewInvoice = () => {
        if (cart.length === 0) return alert('Cart is empty');

        const saleData = {
            items: cart,
            total,
            subTotal,
            tax,
            shopId: selectedShop,
            shopName: currentShop.name,
            customerName,
            salesman: SALESMEN.find(s => s.id == selectedSalesman)?.name || 'General',
            paymentMethod,
            gstNo,
            billId: 'PREVIEW-' + Date.now().toString().slice(-4),
            date: new Date().toLocaleDateString('en-IN')
        };

        navigate('/print-bill', { state: { billData: saleData } });
    };

    return (
        <div className="pos-container">
            <div style={{ gridColumn: '1 / -1', padding: '0 1rem', marginBottom: '-1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#111827' }}>{currentShop.name} - Billing</h2>
            </div>

            <SmartScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onMatchFound={handleScanMatch}
            />

            {/* Bill Verification Modal */}
            {isReviewOpen && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal-card" style={{ maxWidth: '500px' }}>
                        <div className="modal-title-row">
                            <h2>Review Bill Details</h2>
                            <button className="close-modal-btn" onClick={() => setIsReviewOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #F3F4F6' }}>
                                <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>Customer: <strong>{customerName || 'Walk-in'}</strong></p>
                                <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>Payment: <strong>{paymentMethod}</strong></p>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', fontSize: '0.8rem', color: '#9CA3AF', borderBottom: '1px solid #F3F4F6' }}>
                                        <th style={{ padding: '0.5rem 0' }}>ITEM</th>
                                        <th style={{ textAlign: 'center' }}>QTY</th>
                                        <th style={{ textAlign: 'right' }}>PRICE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map(item => (
                                        <tr key={item.id} style={{ fontSize: '0.9rem', borderBottom: '1px solid #F9FAFB' }}>
                                            <td style={{ padding: '0.75rem 0' }}>
                                                <div style={{ fontWeight: '600' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{item.model}</div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{item.qty}</td>
                                            <td style={{ textAlign: 'right' }}>₹{(item.price * item.qty).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Subtotal</span>
                                <span>₹{subTotal.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.2rem', color: '#111827' }}>
                                <span>Total Payable</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-card btn-outline" style={{ border: '1px solid #D1D5DB', padding: '0.75rem' }} onClick={() => setIsReviewOpen(false)}>Cancel</button>
                            <button className="btn-pay" style={{ background: '#10B981', flex: 2 }} onClick={handleFinalPrint}>
                                <Printer size={20} /> Final Print & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile View Toggle */}
            <div className="mobile-view-tabs">
                <button
                    className={`tab-btn ${mobileView === 'products' ? 'active' : ''}`}
                    onClick={() => setMobileView('products')}
                >
                    Products
                </button>
                <button
                    className={`tab-btn ${mobileView === 'cart' ? 'active' : ''}`}
                    onClick={() => setMobileView('cart')}
                >
                    Current Bill ({cart.length})
                </button>
            </div>

            <div className={`pos-left ${mobileView !== 'products' ? 'mobile-hidden' : ''}`}>
                <div className="pos-header">
                    <div className="search-box">
                        <Search size={20} />
                        <button className="scan-btn-mini" title="AI Scan" onClick={() => setIsScannerOpen(true)}>
                            <Camera size={20} />
                        </button>
                        <input
                            type="text"
                            placeholder="Scan Barcode / Search Product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const exactMatch = products.find(p => p.model.toLowerCase() === searchTerm.toLowerCase() || p.id === searchTerm);
                                    if (exactMatch) {
                                        addToCart(exactMatch);
                                        setSearchTerm('');
                                    }
                                }
                            }}
                            autoFocus
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <button
                            style={{
                                background: 'transparent', border: '1px dashed #9CA3AF', color: '#4B5563',
                                padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', width: '100%'
                            }}
                            onClick={() => setShowManualEntry(!showManualEntry)}
                        >
                            + Add Manual/Custom Item
                        </button>
                        {showManualEntry && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                <input
                                    placeholder="Item Name"
                                    style={{ flex: 2, padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                                    value={manualItem.name}
                                    onChange={e => setManualItem({ ...manualItem, name: e.target.value })}
                                />
                                <input
                                    placeholder="₹ Price"
                                    type="number"
                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                                    value={manualItem.price}
                                    onChange={e => setManualItem({ ...manualItem, price: e.target.value })}
                                />
                                <button
                                    onClick={addManualItem}
                                    style={{ background: '#111827', color: 'white', border: 'none', borderRadius: '6px', padding: '0 1rem', cursor: 'pointer' }}
                                >
                                    Add
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="categories">
                        <button className="cat-chip active">All</button>
                        <button className="cat-chip">Men</button>
                        <button className="cat-chip">Women</button>
                        <button className="cat-chip">Digital</button>
                    </div>
                </div>

                <div className="product-grid">
                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => {
                        const stock = product.stock[selectedShop] || 0;
                        return (
                            <div
                                key={product.id}
                                className={`product-card ${stock === 0 ? 'out-of-stock' : ''}`}
                                onClick={() => stock > 0 && addToCart(product)}
                            >
                                <div className="p-image">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '1.5rem', color: '#9CA3AF' }}>{product.brand[0]}</span>
                                    )}
                                    {stock <= 5 && stock > 0 && <span className="stock-tag-warning">Only {stock} left</span>}
                                    {stock === 0 && <span className="stock-tag-error">Out of Stock</span>}
                                </div>
                                <div className="p-details">
                                    <div className="p-model">{product.model}</div>
                                    <div className="p-name">{product.name}</div>
                                    <div className="p-price">₹{product.price.toLocaleString()}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={`pos-right ${mobileView !== 'cart' ? 'mobile-hidden' : ''}`}>
                <div className="cart-header">
                    <h3>Current Bill</h3>
                    <button className="clear-btn" onClick={() => setCart([])}>Clear</button>
                </div>

                <div className="cart-settings">
                    <div className="setting-row">
                        <div className="icon-input">
                            <User size={16} />
                            <select
                                value={selectedSalesman}
                                onChange={(e) => setSelectedSalesman(e.target.value)}
                            >
                                <option value="">Select Salesman</option>
                                {SALESMEN.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="setting-row">
                        <input
                            type="text"
                            className="customer-input"
                            placeholder="Customer Name / Mobile (Optional)"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <ShoppingCart size={48} />
                            <p>Cart is Empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="item-info">
                                    <div className="item-name">{item.name}</div>
                                    <div className="item-price">₹{item.price} x {item.qty}</div>
                                </div>
                                <div className="item-actions">
                                    <button onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                                    <span>{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                                    <button className="del-btn" onClick={() => removeFromCart(item.id)}>
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{subTotal.toLocaleString()}</span>
                    </div>
                    <div className="summary-row text-sm">
                        <span>Tax (18%)</span>
                        <span>₹{tax.toLocaleString()}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>₹{total.toLocaleString()}</span>
                    </div>

                    <div className="pay-actions-container">
                        <div style={{ marginBottom: '1rem' }} className="payment-control">
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Payment Method:</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {['Cash', 'UPI', 'Card', 'Credit'].map(method => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        style={{
                                            flex: 1, minWidth: '60px', padding: '0.5rem',
                                            borderRadius: '6px', border: paymentMethod === method ? '2px solid #10B981' : '1px solid #D1D5DB',
                                            background: paymentMethod === method ? '#ECFDF5' : 'white',
                                            color: paymentMethod === method ? '#047857' : '#374151',
                                            fontWeight: '500', fontSize: '0.85rem', cursor: 'pointer'
                                        }}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pay-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-pay" style={{ background: '#4B5563', flex: 1 }} onClick={handlePreviewInvoice}>
                                <Eye size={20} /> Preview
                            </button>
                            <button className="btn-pay cash" style={{ flex: 2 }} onClick={() => {
                                if (cart.length === 0) return alert('Cart is empty');
                                setIsReviewOpen(true);
                            }}>
                                <Check size={20} /> Review & Save
                            </button>
                        </div>
                    </div>
                </div>

                {mobileView === 'products' && cart.length > 0 && (
                    <button className="mobile-checkout-btn" onClick={() => setMobileView('cart')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <ShoppingCart size={22} />
                            <span>Review Bill ({cart.reduce((sum, item) => sum + item.qty, 0)} Items)</span>
                        </div>
                        <span className="total-pill">₹{total.toLocaleString()} →</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default POS;
