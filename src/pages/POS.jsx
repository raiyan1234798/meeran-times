import React, { useState } from 'react';
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
    Camera
} from 'lucide-react';
import '../styles/POS.css';
import SmartScannerModal from '../components/smart-search/SmartScannerModal';
import { generateWhatsAppLink } from '../utils/whatsapp';
import { printThermalBill } from '../utils/printer';

// Mock Data
const PRODUCTS = [
    { id: '1', name: 'Titan Neo Splash', model: 'Ti-90123', price: 4995, image: 'T' },
    { id: '2', name: 'Fastrack Reflex', model: 'Fa-X100', price: 2495, image: 'F' },
    { id: '3', name: 'Casio Vintage', model: 'A168', price: 3995, image: 'C' },
    { id: '4', name: 'G-Shock GA-2100', model: 'GA-2100', price: 8995, image: 'G' },
    { id: '5', name: 'Fossil Gen 6', model: 'FTW4061', price: 18995, image: 'F' },
    { id: '6', name: 'Sonata Gold', model: 'SG-889', price: 1499, image: 'S' },
];

const SALESMEN = [
    { id: 1, name: 'Rahul' },
    { id: 2, name: 'Priya' },
    { id: 3, name: 'Ahmed' }
];

import { useShop } from '../contexts/ShopContext';

const POS = () => {
    const { currentShop } = useShop(); // Get current shop details
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSalesman, setSelectedSalesman] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualItem, setManualItem] = useState({ name: '', price: '' });
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [gstNo, setGstNo] = useState('');

    const addManualItem = () => {
        if (!manualItem.name || !manualItem.price) return;
        const newItem = {
            id: 'm_' + Date.now(),
            name: manualItem.name,
            model: 'MANUAL',
            price: parseFloat(manualItem.price),
            image: 'M',
            qty: 1
        };
        setCart([...cart, newItem]);
        setManualItem({ name: '', price: '' });
        setShowManualEntry(false);
    };

    const handleScanMatch = (product) => {
        // Logic to find product in DB (mocked here)
        const matchedProduct = PRODUCTS.find(p => p.model === product.model) || PRODUCTS[0];
        addToCart(matchedProduct);
        alert(`AI Matched: ${matchedProduct.name}`);
    };

    // Add Item
    const addToCart = (product) => {
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

    // Update Qty
    const updateQty = (id, delta) => {
        setCart(currentCart => currentCart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    // Remove Item
    const removeFromCart = (id) => {
        setCart(currentCart => currentCart.filter(item => item.id !== id));
    };

    // Calculations
    const subTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subTotal * 0.18; // 18% GST Mock
    const total = subTotal + tax;

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
            {/* LEFT: Product Catalog */}
            <div className="pos-left">
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
                                    const exactMatch = PRODUCTS.find(p => p.model.toLowerCase() === searchTerm.toLowerCase() || p.id === searchTerm);
                                    if (exactMatch) {
                                        addToCart(exactMatch);
                                        setSearchTerm('');
                                        // Optional: Play a beep sound here
                                    }
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    {/* Manual Entry Toggle */}
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
                    {PRODUCTS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                        <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
                            <div className="p-image">{product.image}</div>
                            <div className="p-details">
                                <div className="p-model">{product.model}</div>
                                <div className="p-name">{product.name}</div>
                                <div className="p-price">₹{product.price.toLocaleString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Cart & Billing */}
            <div className="pos-right">
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
                                            flex: 1,
                                            minWidth: '60px',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            border: paymentMethod === method ? '2px solid #10B981' : '1px solid #D1D5DB',
                                            background: paymentMethod === method ? '#ECFDF5' : 'white',
                                            color: paymentMethod === method ? '#047857' : '#374151',
                                            fontWeight: '500',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <input
                                type="text"
                                placeholder="Customer GST No (Optional)"
                                value={gstNo}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none',
                                    fontSize: '0.9rem', boxSizing: 'border-box'
                                }}
                                onChange={(e) => setGstNo(e.target.value)}
                            />
                        </div>

                        <div className="pay-actions">
                            <button className="btn-pay cash" onClick={() => {
                                if (cart.length === 0) return alert('Cart is empty');
                                printThermalBill({
                                    total, subTotal, tax, items: cart,
                                    billId: Date.now().toString().slice(-6),
                                    date: new Date().toLocaleDateString(),
                                    customerName: customerName,
                                    salesman: SALESMEN.find(s => s.id == selectedSalesman)?.name,
                                    paymentMethod: paymentMethod,
                                    shopName: 'MEERAN TIMES',
                                    gstNo: gstNo
                                });
                            }}>
                                <Printer size={20} /> Print Bill ({paymentMethod})
                            </button>
                            <div className="secondary-actions">
                                <button className="btn-action" onClick={() => alert('Saved!')}><CreditCard size={20} /></button>
                                <button className="btn-action" onClick={() => {
                                    if (cart.length === 0) return alert('Cart is empty');
                                    const link = generateWhatsAppLink(customerName, {
                                        total,
                                        items: cart,
                                        billId: Date.now().toString().slice(-6),
                                        date: new Date().toLocaleDateString()
                                    });
                                    window.open(link, '_blank');
                                }}>
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POS;
