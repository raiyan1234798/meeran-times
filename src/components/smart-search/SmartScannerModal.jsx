import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader, ScanBarcode } from 'lucide-react';
import '../../styles/SmartScanner.css';

const SmartScannerModal = ({ isOpen, onClose, onMatchFound }) => {
    if (!isOpen) return null;

    const [scanning, setScanning] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setCameraActive(true);
            setScanning(true);
            streamRef.current = stream;

            // Allow DOM to update
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);

            // Simulate Barcode Detection
            setTimeout(() => {
                handleBarcodeDetected();
            }, 2500);

        } catch (err) {
            console.error("Camera Error:", err);
            alert("Unable to access camera for barcode scanning.");
            onClose();
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
        setScanning(false);
    };

    const handleBarcodeDetected = () => {
        // Simulate a successful scan
        // In a real app, this would be the result from a library like 'react-qr-barcode-scanner'
        const mockBarcodeResult = {
            id: '1',
            name: 'Titan Neo Splash',
            model: 'Ti-90123',
            code: '890123456789'
        };

        // Play a beep sound effectively
        const audio = new Audio('https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_1MB_MP3.mp3'); // Fallback or generate tone
        // Simple Beep
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.connect(ctx.destination);
            osc.frequency.value = 800;
            osc.start();
            setTimeout(() => osc.stop(), 100);
        } catch (e) { console.error(e) }

        stopCamera();
        onMatchFound(mockBarcodeResult);
        onClose();
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    return (
        <div className="scanner-overlay">
            <div className="scanner-card">
                <button className="close-scan" onClick={handleClose}><X size={24} /></button>

                <div className="scanner-view">
                    {!cameraActive ? (
                        <div className="start-scan-placeholder" onClick={startCamera}>
                            <div className="scan-circle" style={{ background: '#10B981' }}>
                                <ScanBarcode size={48} color="white" />
                            </div>
                            <p>Tap to Scan Barcode</p>
                            <span className="scan-hint">Align barcode within the frame</span>
                        </div>
                    ) : (
                        <div className="camera-feed-container" style={{ position: 'relative', width: '100%', height: '100%', background: 'black', borderRadius: '12px', overflow: 'hidden' }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />

                            {/* Scanning UI Overlay */}
                            <div className="scanner-overlay-ui" style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <div className="scan-area" style={{
                                    width: '80%', height: '150px', border: '2px solid rgba(255, 255, 255, 0.5)',
                                    borderRadius: '12px', position: 'relative', boxShadow: '0 0 0 1000px rgba(0,0,0,0.5)'
                                }}>
                                    <div className="laser-line" style={{
                                        position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px',
                                        background: 'red', boxShadow: '0 0 4px red', animation: 'scan 1.5s infinite ease-in-out'
                                    }}></div>
                                </div>
                                <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.7)', padding: '0.5rem 1rem', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Loader size={16} className="spin-animation" />
                                    <span style={{ fontSize: '0.9rem' }}>Searching for barcode...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="scanner-footer">
                    <div className="ai-badge" style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #10B981' }}>
                        <ScanBarcode size={14} />
                        Barcode Scanner Active
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default SmartScannerModal;
