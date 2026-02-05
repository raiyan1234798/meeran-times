import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Check, Printer, Camera } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import '../styles/ProductModal.css';

const ProductModal = ({ isOpen, onClose, onSave }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        model: '',
        category: 'Men',
        costPrice: '',
        sellingPrice: '',
        wholesaleStock: 0,
        retail1Stock: 0,
        retail2Stock: 0
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const barcodeCanvasRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Generate Barcode when Model changes
    useEffect(() => {
        if (formData.model && barcodeCanvasRef.current) {
            try {
                JsBarcode(barcodeCanvasRef.current, formData.model, {
                    format: "CODE128",
                    displayValue: true,
                    fontSize: 14,
                    height: 40,
                    margin: 0
                });
            } catch (error) {
                // Ignore empty/invalid input errors during typing
            }
        }
    }, [formData.model]);

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Use back camera on mobile
            });
            setCameraStream(stream);
            setIsCameraOpen(true);
            // Wait for video element to be available
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            alert('Could not access camera. Please ensure you have granted camera permissions.');
            console.error('Camera error:', err);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            setImagePreview(imageData);
            closeCamera();
        }
    };

    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        setCameraStream(null);
        setIsCameraOpen(false);
    };

    const handlePrintBarcode = (e) => {
        e.preventDefault();
        if (!formData.model) return alert("Enter a Model Number first");

        const canvas = barcodeCanvasRef.current;
        const printWindow = window.open('', '', 'width=400,height=300');
        printWindow.document.write(`
            <html>
            <head>
                <title>Print Barcode - ${formData.model}</title>
                <style>
                    @page {
                        size: 50mm 30mm;
                        margin: 0;
                    }
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        width: 50mm;
                        height: 30mm;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        font-family: 'Arial', 'Helvetica', sans-serif;
                        background: white;
                        padding: 2mm;
                    }
                    .label-container {
                        width: 100%;
                        height: 100%;
                        border: 0.5px solid #ccc;
                        padding: 2mm;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .brand {
                        font-weight: 900;
                        font-size: 10pt;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: #000;
                        text-align: center;
                    }
                    .barcode-wrapper {
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        margin: 1mm 0;
                    }
                    .barcode-img {
                        width: 42mm;
                        height: auto;
                    }
                    .product-name {
                        font-size: 7pt;
                        color: #333;
                        text-align: center;
                        max-width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .price {
                        font-weight: 900;
                        font-size: 12pt;
                        color: #000;
                        margin-top: 1mm;
                    }
                    .model-number {
                        font-size: 6pt;
                        color: #666;
                        font-family: monospace;
                    }
                </style>
            </head>
            <body>
                <div class="label-container">
                    <div class="brand">${formData.brand || 'MEERAN TIMES'}</div>
                    <div class="barcode-wrapper">
                        <img src="${canvas.toDataURL()}" class="barcode-img" />
                    </div>
                    <div class="product-name">${formData.name || 'Product'}</div>
                    <div class="price">₹ ${parseFloat(formData.sellingPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <script>
                    window.onload = function() { 
                        setTimeout(function() { 
                            window.print(); 
                            window.close(); 
                        }, 200);
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, image: imagePreview });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Add New Product</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-grid">
                        {/* Image Upload Area */}
                        <div className="image-upload-section">
                            {/* Preview Area */}
                            <div className="upload-box" style={{
                                backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: imagePreview ? '2px solid #10B981' : '2px dashed #D1D5DB',
                                position: 'relative',
                                minHeight: '140px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {!imagePreview && (
                                    <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>No image selected</span>
                                )}
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => setImagePreview(null)}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: '#EF4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <label style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: '#F3F4F6',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>
                                    <Upload size={16} />
                                    Upload
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={openCamera}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: '#111827',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    <Camera size={16} />
                                    Camera
                                </button>
                            </div>

                            {/* Sample Images */}
                            <div style={{ marginTop: '0.75rem' }}>
                                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>Or use sample image:</p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {[
                                        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=100&h=100&fit=crop',
                                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
                                        'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=100&h=100&fit=crop',
                                        'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=100&h=100&fit=crop'
                                    ].map((url, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setImagePreview(url)}
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                border: imagePreview === url ? '2px solid #10B981' : '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                padding: 0,
                                                cursor: 'pointer',
                                                background: 'none'
                                            }}
                                        >
                                            <img src={url} alt={`Sample ${idx + 1} `} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hidden canvas for capturing */}
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </div>

                        {/* Camera Modal */}
                        {isCameraOpen && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.95)',
                                zIndex: 2000,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1rem'
                            }}>
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    maxWidth: '500px',
                                    background: '#000',
                                    borderRadius: '12px',
                                    overflow: 'hidden'
                                }}>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '1rem',
                                        left: 0,
                                        right: 0,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '1rem'
                                    }}>
                                        <button
                                            type="button"
                                            onClick={closeCamera}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                background: '#EF4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <X size={18} /> Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={capturePhoto}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                background: '#10B981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Camera size={18} /> Capture
                                        </button>
                                    </div>
                                </div>
                                <p style={{ color: 'white', marginTop: '1rem', fontSize: '0.9rem' }}>
                                    Position the watch/clock in frame and tap Capture
                                </p>
                            </div>
                        )}

                        {/* Basic Details */}
                        <div className="details-section">
                            <div className="form-group">
                                <label>Brand</label>
                                <select name="brand" value={formData.brand} onChange={handleChange}>
                                    <option value="">Select Brand</option>
                                    <option value="Titan">Titan</option>
                                    <option value="Fastrack">Fastrack</option>
                                    <option value="Casio">Casio</option>
                                    <option value="Sonata">Sonata</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Model Number (Barcode)</label>
                                <input type="text" name="model" placeholder="Ex: ND1234" value={formData.model} onChange={handleChange} required />
                            </div>

                            <div className="form-group full-width">
                                <label>Product Name</label>
                                <input type="text" name="name" placeholder="Watch Name" value={formData.name} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Kids">Kids</option>
                                    <option value="Unisex">Unisex</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Barcode Preview & Print */}
                    {formData.model && (
                        <div style={{ margin: '1rem 0', padding: '1rem', background: '#F9FAFB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#6B7280', display: 'block', marginBottom: '0.5rem' }}>Generated Barcode</label>
                                <canvas ref={barcodeCanvasRef} style={{ maxWidth: '100%' }}></canvas>
                            </div>
                            <button type="button" onClick={handlePrintBarcode} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1rem', background: '#1F2937', color: 'white',
                                border: 'none', borderRadius: '6px', cursor: 'pointer'
                            }}>
                                <Printer size={16} /> Print Barcode
                            </button>
                        </div>
                    )}

                    <div className="divider"></div>

                    {/* Pricing */}
                    <h3>Pricing</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Cost Price</label>
                            <input type="number" name="costPrice" placeholder="0.00" value={formData.costPrice} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Selling Price</label>
                            <input type="number" name="sellingPrice" placeholder="0.00" value={formData.sellingPrice} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* Initial Stock */}
                    <h3>Initial Stock</h3>
                    <div className="form-row three-col">
                        <div className="form-group">
                            <label>Wholesale</label>
                            <input type="number" name="wholesaleStock" value={formData.wholesaleStock} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Retail Shop 1</label>
                            <input type="number" name="retail1Stock" value={formData.retail1Stock} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Retail Shop 2</label>
                            <input type="number" name="retail2Stock" value={formData.retail2Stock} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit">
                            <Check size={18} /> Save Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
