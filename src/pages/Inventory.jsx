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
import { useInventory } from '../contexts/InventoryContext';

const Inventory = () => {
    const { selectedShop, currentShop } = useShop();
    const { userRole } = useAuth();
    const { products, updateStock, addProduct } = useInventory();

    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
    const [searchImage, setSearchImage] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    const [transferData, setTransferData] = useState({
        productId: '',
        targetShop: 'retail1',
        quantity: 0
    });

    const handleImageSearch = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSearchImage(reader.result);
                setIsScanning(true);
                setTimeout(() => {
                    setIsScanning(false);
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
        addProduct(productWithId);
    };

    const handleTransferStock = (e) => {
        e.preventDefault();
        const { productId, targetShop, quantity } = transferData;
        const qty = parseInt(quantity);

        const p = products.find(prod => prod.id === productId);
        if (!p) return;

        if (p.stock.wholesale < qty) {
            alert(`Insufficient wholesale stock! Available: ${p.stock.wholesale}`);
            return;
        }

        updateStock(productId, 'wholesale', -qty);
        updateStock(productId, targetShop, qty);

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
                                const model = prompt("Enter Model Number of received stock:");
                                if (!model) return;
                                const product = products.find(p => p.model.toLowerCase() === model.toLowerCase());
                                if (product) {
                                    const qty = prompt(`Enter Quantity of ${product.name} received:`);
                                    if (qty && !isNaN(qty)) {
                                        updateStock(product.id, selectedShop, parseInt(qty));
                                        alert(`Successfully received ${qty} units!`);
                                    }
                                } else {
                                    alert("Product model not found.");
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
