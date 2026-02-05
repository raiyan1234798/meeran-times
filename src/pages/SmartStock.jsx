import React, { useState } from 'react';
import { Camera, Upload, Loader, Check, X, Box, Search } from 'lucide-react';
import { useShop } from '../contexts/ShopContext';

// Mock Data for Smart Search Simulation
const MOCK_DB = [
    {
        id: '1',
        name: 'Titan Neo Splash',
        model: 'Ti-90123',
        stock: { wholesale: 50, retail1: 10, retail2: 5 },
        brand: 'Titan',
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop'
    },
    {
        id: '2',
        name: 'Fastrack Reflex',
        model: 'Fa-X100',
        stock: { wholesale: 100, retail1: 20, retail2: 15 },
        brand: 'Fastrack',
        image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop'
    },
    {
        id: '3',
        name: 'Casio Vintage',
        model: 'A168',
        stock: { wholesale: 20, retail1: 2, retail2: 0 },
        brand: 'Casio',
        image: 'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=400&h=400&fit=crop'
    },
    {
        id: '4',
        name: 'Signet Rose Gold Classic',
        model: 'SG-Rose-22',
        stock: { wholesale: 15, retail1: 3, retail2: 1 },
        brand: 'Signet',
        image: 'https://images.unsplash.com/photo-1513122384738-4b741ca537cd?w=400&h=400&fit=crop'
    },
    {
        id: '5',
        name: 'Seiko Presage Series',
        model: 'SRP-881',
        stock: { wholesale: 8, retail1: 0, retail2: 2 },
        brand: 'Seiko',
        image: 'https://images.unsplash.com/photo-1616353071588-708dcff912e2?w=400&h=400&fit=crop'
    }
];

import '../styles/SmartStock.css';

const SmartStock = () => {
    const { currentShop } = useShop();
    const [searchImage, setSearchImage] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [retryCount, setRetryCount] = useState(0); // Add retry mechanics

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = React.useRef(null);
    const streamRef = React.useRef(null);

    // Camera Functions
    const startCamera = async () => {
        try {
            setIsCameraOpen(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            // Short delay to ensure ref is attached
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
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
            runSimulation(imageUrl);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSearchImage(reader.result);
                runSimulation(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // A simple deterministic hash to generate a seed from the image string
    const runSimulation = (imageSrc) => {
        setScanResult(null);
        setIsScanning(true);

        // Simple hash of the image string to create unique but consistent ID
        let hash = 0;
        for (let i = 0; i < imageSrc.length; i++) {
            hash = ((hash << 5) - hash) + imageSrc.charCodeAt(i);
            hash |= 0;
        }
        const positiveHash = Math.abs(hash);

        // Simulate AI Processing Time
        setTimeout(() => {
            setIsScanning(false);

            // Logic Improved: 
            // Drastically reduced failure rate to 10% for better UX.
            // If user retries, we force a match.

            const matchChance = positiveHash % 100;

            if (matchChance > 90 && retryCount === 0) {
                // 10% chance of failure on first try only
                setScanResult(null);
                setRetryCount(prev => prev + 1);
            } else {
                // Pick a result based on hash, but bias towards new items for variety
                const index = positiveHash % MOCK_DB.length;
                setScanResult(MOCK_DB[index]);
                setRetryCount(0); // Reset on success
            }
        }, 1500); // Faster processing time (1.5s)
    };

    const resetSearch = () => {
        searchTerminated();
    };

    const searchTerminated = () => {
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
                    Take a picture of any watch to instantly check availability across all Meeran Times shops.
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
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Tap to Scan Watch</h3>
                        <p style={{ color: '#9CA3AF', marginBottom: '1.5rem', textAlign: 'center' }}>Place watch in center of frame</p>

                        <div className="action-buttons">
                            <button className="btn-open-camera" onClick={startCamera}>
                                <Camera size={20} />
                                Open Camera
                            </button>

                            <label className="btn-upload">
                                <Upload size={20} />
                                Upload File
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
                                    <p style={{ marginTop: '1rem', fontWeight: '500', fontSize: '1.1rem' }}>AI Visual Recognition...</p>
                                    <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Matching features with inventory...</p>
                                </div>
                            )}

                            {!isScanning && (
                                <button
                                    onClick={resetSearch}
                                    className="close-preview"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Results */}
                        {!isScanning && (
                            scanResult ? (
                                <div className="match-results">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#059669', fontWeight: '600' }}>
                                        <Check size={20} />
                                        <span>Match Found in Database</span>
                                    </div>

                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{scanResult.name}</h2>
                                    <p style={{ color: '#6B7280', fontSize: '1rem', marginBottom: '1.5rem' }}>{scanResult.brand} • {scanResult.model}</p>

                                    <div className="stock-grid">
                                        <div className="stock-card">
                                            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.25rem' }}>Meeran Wholesale</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{scanResult.stock.wholesale}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '500' }}>In Stock</div>
                                        </div>
                                        <div className="stock-card">
                                            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.25rem' }}>Meeran Retail</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{scanResult.stock.retail1}</div>
                                            <div style={{ fontSize: '0.8rem', color: scanResult.stock.retail1 > 0 ? '#059669' : '#EF4444', fontWeight: '500' }}>
                                                {scanResult.stock.retail1 > 0 ? 'In Stock' : 'Out of Stock'}
                                            </div>
                                        </div>
                                        <div className="stock-card">
                                            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.25rem' }}>Daylook</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{scanResult.stock.retail2}</div>
                                            <div style={{ fontSize: '0.8rem', color: scanResult.stock.retail2 > 0 ? '#059669' : '#EF4444', fontWeight: '500' }}>
                                                {scanResult.stock.retail2 > 0 ? 'In Stock' : 'Out of Stock'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
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
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartStock;
