import React, { useState, useRef } from 'react';
import { Camera, X, Loader, Search } from 'lucide-react';
import '../../styles/SmartScanner.css';

const SmartScannerModal = ({ isOpen, onClose, onMatchFound }) => {
    if (!isOpen) return null;

    const [scanning, setScanning] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const videoRef = useRef(null);

    const startCamera = async () => {
        setScanning(true);
        // In a real app, uses navigator.mediaDevices.getUserMedia
        // Here we simulate the process
        setTimeout(() => {
            setAnalyzing(true);
            setTimeout(() => {
                // Mock Match Found
                const mockMatch = {
                    id: '1',
                    name: 'Titan Neo Splash',
                    model: 'Ti-90123',
                    confidence: 98
                };
                setScanning(false);
                setAnalyzing(false);
                onMatchFound(mockMatch);
                onClose();
            }, 2000);
        }, 1500);
    };

    return (
        <div className="scanner-overlay">
            <div className="scanner-card">
                <button className="close-scan" onClick={onClose}><X size={24} /></button>

                <div className="scanner-view">
                    {!scanning ? (
                        <div className="start-scan-placeholder" onClick={startCamera}>
                            <div className="scan-circle">
                                <Camera size={48} />
                            </div>
                            <p>Tap to Scan Watch</p>
                            <span className="scan-hint">Place watch in center of frame</span>
                        </div>
                    ) : (
                        <div className="camera-feed-sim">
                            {/* Simulated Camera Feed */}
                            <div className="scan-laser"></div>
                            {analyzing && (
                                <div className="ai-overlay">
                                    <Loader className="spin" size={32} />
                                    <span>Analyzing Aesthetics...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="scanner-footer">
                    <div className="ai-badge">
                        <Search size={14} />
                        AI Visual Recognition
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartScannerModal;
