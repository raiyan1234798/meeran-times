import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader, Check, X, Box } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import Tesseract from 'tesseract.js';
import '../styles/SmartStock.css';

const SmartStock = () => {
    const { products } = useInventory();

    // State
    const [searchImage, setSearchImage] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [scanStatus, setScanStatus] = useState('');
    const [noMatch, setNoMatch] = useState(false);

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // --- Camera Functions ---
    const startCamera = async () => {
        try {
            setIsCameraOpen(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            setTimeout(() => {
                if (videoRef.current) videoRef.current.srcObject = stream;
            }, 100);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
            const imageUrl = canvas.toDataURL('image/jpeg');
            setSearchImage(imageUrl);
            stopCamera();
            processImage(imageUrl);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSearchImage(reader.result);
                processImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- AI Processing ---
    const processImage = async (imageSrc) => {
        setIsScanning(true);
        setScanResult(null);
        setNoMatch(false);

        try {
            setScanStatus('Initializing neural network...');

            // 1. OCR Text Extraction
            setScanStatus('Reading watch dial text...');
            const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setScanStatus(`Analyzing visual data... ${Math.floor(m.progress * 100)}%`);
                    }
                }
            });

            const extractedText = text.toLowerCase();
            console.log("OCR Extracted:", extractedText);

            setScanStatus('Comparing with inventory visual assets...');

            // 2. Fuzzy Match Logic
            const tokens = extractedText.split(/\s+/).filter(t => t.length > 2); // Ignore short noise

            // Score products based on token matches in Brand or Model
            const scoredProducts = products.map(p => {
                let score = 0;
                const pString = `${p.brand} ${p.model} ${p.name}`.toLowerCase();

                tokens.forEach(token => {
                    if (pString.includes(token)) score += 1;
                });

                // Boost score if specific unique model numbers are found
                if (extractedText.includes(p.model.toLowerCase())) score += 3;

                return { ...p, score };
            }).filter(p => p.score > 0).sort((a, b) => b.score - a.score);

            if (scoredProducts.length > 0) {
                // Auto-select the top result regardless of confidence threshold for efficiency
                setScanResult(scoredProducts[0]);
            } else {
                setNoMatch(true);
            }

        } catch (error) {
            console.error("AI Error:", error);
            setNoMatch(true);
        } finally {
            setIsScanning(false);
        }
    };

    const resetSearch = () => {
        setSearchImage(null);
        setScanResult(null);
        setIsScanning(false);
        stopCamera();
    };

    return (
        <div className="smart-stock-container">
            <div className="stock-header">
                <h1 className="stock-title">
                    <Box size={32} color="#4F46E5" />
                    Smart Stock Check
                </h1>
                <p className="stock-subtitle">
                    AI-powered Visual Search. Snap a photo to check instant availability.
                </p>
            </div>

            <div className="scan-card">
                {isCameraOpen ? (
                    <div className="camera-box">
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div className="camera-controls">
                            <button onClick={stopCamera} className="btn-cancel">Cancel</button>
                            <button onClick={capturePhoto} className="btn-capture">
                                <Camera size={20} /> Capture
                            </button>
                        </div>
                    </div>
                ) : !searchImage ? (
                    <div className="upload-placeholder">
                        <div className="placeholder-icon">
                            <Camera size={48} color="#4F46E5" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Camera Search</h3>
                        <p style={{ color: '#9CA3AF', marginBottom: '1.5rem', textAlign: 'center' }}>
                            Point at any watch face. Our AI will read the brand & model.
                        </p>

                        <div className="action-buttons">
                            <button className="btn-open-camera" onClick={startCamera}>
                                <Camera size={20} /> Open Camera
                            </button>
                            <label className="btn-upload">
                                <Upload size={20} /> Upload Image
                                <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="results-grid">
                        {/* Image Preview */}
                        <div className="preview-image-box">
                            <img src={searchImage} alt="Scanned" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            {isScanning && (
                                <div className="scanning-overlay">
                                    <Loader size={48} className="spin-animation" />
                                    <p style={{ marginTop: '1rem', fontWeight: '500', fontSize: '1.1rem' }}>{scanStatus}</p>
                                </div>
                            )}
                            {!isScanning && (
                                <button onClick={resetSearch} className="close-preview"><X size={20} /></button>
                            )}
                        </div>

                        {/* Search Results */}
                        {!isScanning && (
                            <div className="match-results">
                                {/* Match Found */}
                                {scanResult && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#059669', fontWeight: '600' }}>
                                            <Check size={20} />
                                            <span>Match Found in Database</span>
                                        </div>
                                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{scanResult.name}</h2>
                                        <p style={{ color: '#6B7280', fontSize: '1rem', marginBottom: '1.5rem' }}>{scanResult.brand} • {scanResult.model}</p>

                                        <div className="stock-grid">
                                            {/* Stock Cards (Reused Logic) */}
                                            {['wholesale', 'retail1', 'retail2'].map(shop => (
                                                <div key={shop} className="stock-card">
                                                    <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                                                        {shop === 'wholesale' ? 'Wholesale' : shop === 'retail1' ? 'Meeran Retail' : 'Daylook'}
                                                    </div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                                                        {scanResult.stock[shop] || 0}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: (scanResult.stock[shop] || 0) > 0 ? '#059669' : '#EF4444', fontWeight: '500' }}>
                                                        {(scanResult.stock[shop] || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* No Match Found */}
                                {noMatch && !scanResult && (
                                    <div className="match-results" style={{ textAlign: 'center', paddingTop: '2rem' }}>
                                        <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '50%', display: 'inline-flex', marginBottom: '1rem' }}>
                                            <X size={32} color="#EF4444" />
                                        </div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>No Match Found</h3>
                                        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
                                            We couldn't identify this item in the inventory. Try adjusting the angle or lighting.
                                        </p>
                                        <button
                                            onClick={resetSearch}
                                            style={{
                                                background: '#374151', color: 'white', padding: '0.75rem 1.5rem',
                                                borderRadius: '8px', border: 'none', fontWeight: '500', cursor: 'pointer'
                                            }}
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartStock;
