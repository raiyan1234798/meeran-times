import React, { useState } from 'react';
import {
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    ArrowRightLeft,
    Check,
    X,
    Eye,
    Camera,
    Upload,
    Loader
} from 'lucide-react';
import '../styles/Inventory.css';
import ProductModal from '../components/ProductModal';
import { useShop } from '../contexts/ShopContext';
import { useAuth } from '../contexts/AuthContext';

// Mock Data for UI Dev
const MOCK_INVENTORY = [
    // Watches
    {
        id: '1',
        name: 'Titan Neo Splash',
        model: 'Ti-90123',
        category: 'Men',
        price: 4995,
        costPrice: 2500,
        stock: { wholesale: 50, retail1: 10, retail2: 5 },
        brand: 'Titan',
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop'
    },
    {
        id: '2',
        name: 'Fastrack Reflex',
        model: 'Fa-X100',
        category: 'Unisex',
        price: 2495,
        costPrice: 1200,
        stock: { wholesale: 100, retail1: 20, retail2: 15 },
        brand: 'Fastrack',
        image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop'
    },
    {
        id: '3',
        name: 'Casio Vintage',
        model: 'A168',
        category: 'Men',
        price: 3995,
        costPrice: 1800,
        stock: { wholesale: 20, retail1: 2, retail2: 0 },
        brand: 'Casio',
        image: 'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=400&h=400&fit=crop'
    },
    { id: '4', name: 'Sonata Gold', model: 'So-G776', category: 'Women', price: 1299, costPrice: 600, stock: { wholesale: 80, retail1: 15, retail2: 10 }, brand: 'Sonata', image: null },
    { id: '5', name: 'Timex Expedition', model: 'Tx-E44', category: 'Men', price: 3495, costPrice: 1750, stock: { wholesale: 40, retail1: 8, retail2: 4 }, brand: 'Timex', image: null },
    { id: '6', name: 'Fossil Gen 6', model: 'Fo-Smart', category: 'Smart', price: 18995, costPrice: 12000, stock: { wholesale: 15, retail1: 3, retail2: 1 }, brand: 'Fossil', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=400&fit=crop' },

    // Clocks - Ajanta
    { id: 'c1', name: 'Ajanta Quartz Wall', model: 'AJ-497', category: 'Wall Clock', price: 450, costPrice: 200, stock: { wholesale: 200, retail1: 30, retail2: 25 }, brand: 'Ajanta', image: 'https://images.unsplash.com/photo-1563861826100-9cb868c656d9?w=400&h=400&fit=crop' },
    { id: 'c2', name: 'Ajanta Digital Red', model: 'AJ-Digi', category: 'Digital Clock', price: 890, costPrice: 450, stock: { wholesale: 150, retail1: 20, retail2: 10 }, brand: 'Ajanta', image: null },
    { id: 'c3', name: 'Ajanta Musical', model: 'AJ-Mus', category: 'Wall Clock', price: 1200, costPrice: 700, stock: { wholesale: 60, retail1: 5, retail2: 5 }, brand: 'Ajanta', image: null },
    { id: 'c4', name: 'Ajanta OLC-100', model: 'OLC-100', category: 'Table Clock', price: 250, costPrice: 120, stock: { wholesale: 300, retail1: 50, retail2: 40 }, brand: 'Ajanta', image: null },

    // Clocks - Oreva
    { id: 'c5', name: 'Oreva Classic Wood', model: 'OR-W22', category: 'Wall Clock', price: 650, costPrice: 350, stock: { wholesale: 120, retail1: 15, retail2: 12 }, brand: 'Oreva', image: null },
    { id: 'c6', name: 'Oreva Silent Sweep', model: 'OR-S99', category: 'Wall Clock', price: 850, costPrice: 480, stock: { wholesale: 90, retail1: 12, retail2: 8 }, brand: 'Oreva', image: null },
    { id: 'c7', name: 'Oreva Pendulum', model: 'OR-P01', category: 'Wall Clock', price: 1850, costPrice: 1100, stock: { wholesale: 45, retail1: 8, retail2: 3 }, brand: 'Oreva', image: null },

    // Clocks - Rikon
    { id: 'c8', name: 'Rikon Round 12"', model: 'RK-12', category: 'Wall Clock', price: 550, costPrice: 280, stock: { wholesale: 180, retail1: 25, retail2: 20 }, brand: 'Rikon', image: null },
    { id: 'c9', name: 'Rikon Square Basic', model: 'RK-Sq', category: 'Wall Clock', price: 420, costPrice: 210, stock: { wholesale: 250, retail1: 40, retail2: 35 }, brand: 'Rikon', image: null },

    // Clocks - Seiko
    { id: 'c10', name: 'Seiko Melody Motion', model: 'QXM-378', category: 'Premium Clock', price: 8500, costPrice: 5500, stock: { wholesale: 10, retail1: 2, retail2: 1 }, brand: 'Seiko', image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=400&h=400&fit=crop' },
    { id: 'c11', name: 'Seiko Wooden Mantel', model: 'QXW-221', category: 'Table Clock', price: 4200, costPrice: 2800, stock: { wholesale: 15, retail1: 1, retail2: 1 }, brand: 'Seiko', image: null }
];

const Inventory = () => {
    const { selectedShop, currentShop } = useShop();
    const { userRole } = useAuth(); // Get user role from AuthContext
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState(MOCK_INVENTORY);
    const [showFilters, setShowFilters] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Popup State
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Image Search State
    const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
    const [searchImage, setSearchImage] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    // Transfer Modal State
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    // ... (rest of transfer data state)

    const handleImageSearch = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSearchImage(reader.result);
                // Simulate Scanning
                setIsScanning(true);
                setTimeout(() => {
                    setIsScanning(false);
                    // Simulate Finding a Match (For demo, pick Titan Neo Splash)
                    const match = products.find(p => p.id === '1');
                    if (match) {
                        setIsImageSearchOpen(false);
                        setSelectedProduct(match);
                        setSearchImage(null);
                    } else {
                        alert("No matching product found in inventory.");
                        setSearchImage(null);
                    }
                }, 2000);
            };
            reader.readAsDataURL(file);
        }
    };
    const [transferData, setTransferData] = useState({
        productId: '',
        targetShop: 'retail1',
        quantity: 0
    });

    const handleAddProduct = (newProduct) => {
        const productWithId = {
            id: Date.now().toString(),
            name: newProduct.name || 'Unnamed Product',
            brand: newProduct.brand || 'Unknown',
            model: newProduct.model || 'N/A',
            category: newProduct.category || 'Men',
            price: parseFloat(newProduct.sellingPrice) || 0,
            costPrice: parseFloat(newProduct.costPrice) || 0,
            image: newProduct.image || null,
            stock: {
                wholesale: parseInt(newProduct.wholesaleStock) || 0,
                retail1: parseInt(newProduct.retail1Stock) || 0,
                retail2: parseInt(newProduct.retail2Stock) || 0
            }
        };
        setProducts([...products, productWithId]);
    };

    const handleTransferStock = (e) => {
        e.preventDefault();
        const { productId, targetShop, quantity } = transferData;
        const qty = parseInt(quantity);

        if (!productId || qty <= 0) return alert('Invalid transfer details');

        setProducts(currentProducts => currentProducts.map(p => {
            if (p.id === productId) {
                if (p.stock.wholesale < qty) {
                    alert(`Insufficient wholesale stock! Available: ${p.stock.wholesale}`);
                    return p;
                }
                return {
                    ...p,
                    stock: {
                        ...p.stock,
                        wholesale: p.stock.wholesale - qty,
                        [targetShop]: p.stock[targetShop] + qty
                    }
                };
            }
            return p;
        }));
        setIsTransferOpen(false);
        setTransferData({ productId: '', targetShop: 'retail1', quantity: 0 });
        alert('Stock transferred successfully!');
    };

    return (
        <div className="inventory-container">
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddProduct}
            />

            {/* Product Details Modal (When Clicking Stock) */}
            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-container" style={{ maxWidth: '400px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div style={{ position: 'relative', width: '100%', height: '200px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {selectedProduct.image ? (
                                <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9CA3AF' }}>{selectedProduct.brand[0]}</span>
                            )}
                            <button
                                onClick={() => setSelectedProduct(null)}
                                style={{
                                    position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)',
                                    color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selectedProduct.name}</h2>
                            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1rem' }}>{selectedProduct.brand} • {selectedProduct.model}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#F9FAFB', padding: '1rem', borderRadius: '8px' }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Selling Price</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>₹{selectedProduct.price.toLocaleString()}</span>
                                </div>
                                {/* Show Cost Price ONLY to Admin */}
                                {userRole === 'admin' && (
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Cost Price</span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#EF4444' }}>₹{selectedProduct.costPrice?.toLocaleString() || 'N/A'}</span>
                                    </div>
                                )}
                            </div>

                            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Stock Availability</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #F3F4F6' }}>
                                    <span style={{ color: '#4B5563' }}>Meeran Wholesale</span>
                                    <span style={{ fontWeight: '600' }}>{selectedProduct.stock.wholesale} units</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #F3F4F6' }}>
                                    <span style={{ color: '#4B5563' }}>Meeran Retail</span>
                                    <span style={{ fontWeight: '600' }}>{selectedProduct.stock.retail1} units</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem' }}>
                                    <span style={{ color: '#4B5563' }}>Daylook</span>
                                    <span style={{ fontWeight: '600' }}>{selectedProduct.stock.retail2} units</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Search Modal */}
            {isImageSearchOpen && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Visual Inventory Search</h2>
                            <button onClick={() => setIsImageSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        {!searchImage ? (
                            <div style={{ padding: '3rem 1rem', border: '2px dashed #E5E7EB', borderRadius: '12px', background: '#F9FAFB' }}>
                                <Camera size={48} color="#9CA3AF" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Upload or capture a photo of the watch/clock to check stock availability.</p>
                                <label className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', background: '#111827', color: 'white' }}>
                                    <Upload size={18} />
                                    <span>Upload Photo</span>
                                    <input type="file" accept="image/*" onChange={handleImageSearch} hidden />
                                </label>
                            </div>
                        ) : (
                            <div>
                                <div style={{ position: 'relative', width: '100%', height: '250px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                    <img src={searchImage} alt="Scanning" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {isScanning && (
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center', color: 'white'
                                        }}>
                                            <Loader size={48} className="spin-animation" />
                                            <p style={{ marginTop: '1rem', fontWeight: '500' }}>Analyzing Product...</p>
                                        </div>
                                    )}
                                </div>
                                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Comparing with {products.length} inventory items...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Transfer Stock Modal */}
            {isTransferOpen && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Transfer Stock</h2>
                            <button className="close-btn" onClick={() => setIsTransferOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleTransferStock} className="modal-body">
                            <div className="form-group">
                                <label>Select Product</label>
                                <select
                                    value={transferData.productId}
                                    onChange={e => setTransferData({ ...transferData, productId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Choose Product --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (Qty: {p.stock.wholesale})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Transfer To</label>
                                <select
                                    value={transferData.targetShop}
                                    onChange={e => setTransferData({ ...transferData, targetShop: e.target.value })}
                                >
                                    <option value="retail1">Meeran Times (Retail)</option>
                                    <option value="retail2">Daylook (Retail)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Enter Qty"
                                    value={transferData.quantity}
                                    onChange={e => setTransferData({ ...transferData, quantity: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsTransferOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-submit"><Check size={18} /> Transfer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header Actions */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Inventory Management</h1>
                    <p className="page-subtitle">
                        {currentShop.name}
                        {selectedShop === 'wholesale' ? ' - Global Stock Hub' : ' - Local Stock View'}
                    </p>
                </div>
                <div className="header-buttons">
                    {selectedShop === 'wholesale' ? (
                        <button className="btn btn-secondary" onClick={() => setIsTransferOpen(true)}>
                            <ArrowRightLeft size={18} />
                            <span>Transfer Stock</span>
                        </button>
                    ) : (
                        <button
                            className="btn btn-secondary"
                            style={{ background: '#10B981', color: 'white', border: 'none' }}
                            onClick={() => {
                                const qty = prompt("Enter Quantity Received from Wholesale:");
                                if (qty && !isNaN(qty)) {
                                    alert(`Successfully received ${qty} units from Meeran Wholesale! Stock updated.`);
                                    // Logic to update local stock would go here
                                }
                            }}
                        >
                            <ArrowRightLeft size={18} />
                            <span>Receive Stock</span>
                        </button>
                    )}
                    {selectedShop === 'wholesale' && (
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                            <Plus size={18} />
                            <span>Add Product</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="control-bar">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by Model, Brand, or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Image Search Button */}
                <button
                    className="btn-icon"
                    onClick={() => setIsImageSearchOpen(true)}
                    title="Search by Image"
                >
                    <Camera size={18} />
                </button>
                <button className={`btn-icon ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                    <Filter size={18} />
                </button>
            </div>

            {/* Main Table */}
            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Product Details</th>
                            <th>Model / SKU</th>
                            <th>Category</th>
                            <th className="text-right">Price (₹)</th>

                            {selectedShop === 'wholesale' ? (
                                <>
                                    <th className="text-center" style={{ background: '#F3F4F6' }}>Total Stock</th>
                                    <th className="text-center">Wholesale</th>
                                    <th className="text-center">Meeran Retail</th>
                                    <th className="text-center">Daylook</th>
                                </>
                            ) : (
                                <th className="text-center">Current Stock</th>
                            )}

                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            // Determine relevant stock based on shop
                            let currentStock = 0;
                            if (selectedShop === 'wholesale') currentStock = product.stock.wholesale;
                            else if (selectedShop === 'retail1') currentStock = product.stock.retail1;
                            else if (selectedShop === 'retail2') currentStock = product.stock.retail2;

                            return (
                                <tr key={product.id}>
                                    <td data-label="Product">
                                        <div className="product-cell">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="product-img" />
                                            ) : (
                                                <div className="product-img-placeholder">
                                                    {product.brand[0]}
                                                </div>
                                            )}
                                            <div className="product-info">
                                                <div className="name">{product.name}</div>
                                                <div className="brand">{product.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Model / SKU"><span className="sku-badge">{product.model}</span></td>
                                    <td data-label="Category">{product.category}</td>
                                    <td data-label="Price" className="text-right font-medium">₹{product.price.toLocaleString()}</td>

                                    {/* Stock Columns Logic */}
                                    {selectedShop === 'wholesale' ? (
                                        <>
                                            <td
                                                className="text-center stock-cell"
                                                style={{ background: '#F3F4F6', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                                                onClick={() => setSelectedProduct(product)}
                                                title="View Details"
                                            >
                                                {product.stock.wholesale + product.stock.retail1 + product.stock.retail2}
                                            </td>
                                            <td
                                                data-label="Wholesale Stock"
                                                className="text-center stock-cell wholesale"
                                                onClick={() => setSelectedProduct(product)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {product.stock.wholesale}
                                            </td>
                                            <td
                                                data-label="Retail 1 Stock"
                                                className="text-center stock-cell"
                                                onClick={() => setSelectedProduct(product)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {product.stock.retail1}
                                            </td>
                                            <td
                                                data-label="Retail 2 Stock"
                                                className="text-center stock-cell"
                                                onClick={() => setSelectedProduct(product)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {product.stock.retail2}
                                            </td>
                                        </>
                                    ) : (
                                        <td
                                            data-label="My Stock"
                                            className="text-center stock-cell"
                                            style={{ fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
                                            onClick={() => setSelectedProduct(product)}
                                        >
                                            {currentStock}
                                        </td>
                                    )}

                                    <td>
                                        <span className={`status-badge ${currentStock > 5 ? 'success' : 'warning'}`}>
                                            {currentStock > 5 ? 'In Stock' : 'Low Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn" onClick={() => setSelectedProduct(product)}>
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
