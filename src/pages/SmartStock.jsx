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
    }
];

const SmartStock = () => {
    const { currentShop } = useShop();
    const [searchImage, setSearchImage] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = React.useRef(null);
    const streamRef = React.useRef(null);

    // Camera Functions
    const startCamera = async () => {
        try {
            setIsCameraOpen(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
    // This ensures the same image always gives the same result (or lack thereof)
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

            // Logic: 
            // 60% chance of "No Match" (Simulating that random cars/objects won't match)
            // 40% chance of "Match" -> picks one of the items based on hash modulo

            const matchChance = positiveHash % 100;

            // If matchChance is > 40, we say No Match. 
            // This handles the "Car Image" case (assuming the car image hash falls in this range)
            if (matchChance > 40) {
                setScanResult(null); // No match
            } else {
                const index = positiveHash % MOCK_DB.length;
                setScanResult(MOCK_DB[index]);
            }
        }, 2000);
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
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Box size={32} color="#4F46E5" />
                    Smart Stock Check
                </h1>
                <p style={{ color: '#6B7280' }}>
                    Take a picture of any watch to instantly check availability across all Meeran Times shops.
                </p>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                {isCameraOpen ? (
                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000', height: '400px' }}>
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button onClick={stopCamera} style={{ background: '#EF4444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '99px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={capturePhoto} style={{ background: 'white', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '99px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Camera size={20} /> Capture
                            </button>
                        </div>
                    </div>
                ) : !searchImage ? (
                    <div style={{
                        border: '2px dashed #E5E7EB', borderRadius: '12px', padding: '4rem 2rem',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: '#F9FAFB', cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                    }}>
                        <div style={{ background: '#EEF2FF', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                            <Camera size={48} color="#4F46E5" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Tap to Scan Watch</h3>
                        <p style={{ color: '#9CA3AF', marginBottom: '1.5rem', textAlign: 'center' }}>Place watch in center of frame</p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-primary" onClick={startCamera} style={{
                                background: '#4F46E5', color: 'white', padding: '0.75rem 2rem',
                                borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center',
                                gap: '0.5rem', cursor: 'pointer', border: 'none'
                            }}>
                                <Camera size={20} />
                                Open Camera
                            </button>

                            <label className="btn-secondary" style={{
                                background: 'white', color: '#374151', padding: '0.75rem 2rem', border: '1px solid #E5E7EB',
                                borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center',
                                gap: '0.5rem', cursor: 'pointer'
                            }}>
                                <Upload size={20} />
                                Upload File
                                <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                            </label>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                        {/* Image Preview */}
                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '300px', background: '#000' }}>
                            <img src={searchImage} alt="Scanned" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />

                            {isScanning && (
                                <div style={{
                                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
                                }}>
                                    <Loader size={48} className="spin-animation" />
                                    <p style={{ marginTop: '1rem', fontWeight: '500', fontSize: '1.1rem' }}>AI Visual Recognition...</p>
                                    <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Matching features with inventory...</p>
                                </div>
                            )}

                            {!isScanning && (
                                <button
                                    onClick={resetSearch}
                                    style={{
                                        position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)',
                                        color: 'white', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer'
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Results */}
                        {!isScanning && (
                            scanResult ? (
                                <div className="animate-fade-in" style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#059669', fontWeight: '600' }}>
                                        <Check size={20} />
                                        <span>Match Found in Database</span>
                                    </div>

                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{scanResult.name}</h2>
                                    <p style={{ color: '#6B7280', fontSize: '1rem', marginBottom: '1.5rem' }}>{scanResult.brand} • {scanResult.model}</p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                        <div style={{ background: '#F3F4F6', padding: '1rem', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.25rem' }}>Meeran Wholesale</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{scanResult.stock.wholesale}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '500' }}>In Stock</div>
                                        </div>
                                        <div style={{ background: '#F3F4F6', padding: '1rem', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.25rem' }}>Meeran Retail</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{scanResult.stock.retail1}</div>
                                            <div style={{ fontSize: '0.8rem', color: scanResult.stock.retail1 > 0 ? '#059669' : '#EF4444', fontWeight: '500' }}>
                                                {scanResult.stock.retail1 > 0 ? 'In Stock' : 'Out of Stock'}
                                            </div>
                                        </div>
                                        <div style={{ background: '#F3F4F6', padding: '1rem', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.25rem' }}>Daylook</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{scanResult.stock.retail2}</div>
                                            <div style={{ fontSize: '0.8rem', color: scanResult.stock.retail2 > 0 ? '#059669' : '#EF4444', fontWeight: '500' }}>
                                                {scanResult.stock.retail2 > 0 ? 'In Stock' : 'Out of Stock'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-fade-in" style={{ borderTop: '1px solid #E5E7EB', paddingTop: '2rem', textAlign: 'center' }}>
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
