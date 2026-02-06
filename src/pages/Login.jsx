import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Watch, ArrowRight, Lock, Mail, UserPlus } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const { login, loginWithGoogle, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            if (isSignUp) {
                await register(email, password);
                // navigate('/shops'); // Registering logs you in automatically
            } else {
                await login(email, password);
            }
            navigate('/shops');
        } catch (err) {
            setError(`Failed to ${isSignUp ? 'sign up' : 'sign in'}: ` + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/shops');
        } catch (err) {
            setError('Failed to Google sign in: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="brand-logo">
                        <Watch size={40} className="logo-icon" />
                    </div>
                    <h1>Meeran Times</h1>
                    <p>{isSignUp ? 'Create New Account' : 'Enterprise ERP & POS System'}</p>
                </div>

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} />
                            <input
                                type="email"
                                required
                                placeholder="admin@meerantimes.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {!isSignUp && (
                        <div className="form-footer">
                            <a href="#" className="forgot-password">Forgot password?</a>
                        </div>
                    )}

                    <button disabled={loading} type="submit" className="login-btn">
                        {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')} <ArrowRight size={18} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
                        <span style={{ padding: '0 1rem', color: '#64748B', fontSize: '0.875rem' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleGoogleLogin}
                        className="login-btn google-btn"
                        style={{ background: '#fff', color: '#1E293B', border: '1px solid #CBD5E1', justifyContent: 'center' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
                        >
                            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Create one'}
                        </button>
                    </div>
                </form>

                <div className="login-meta">
                    <p>Protected System. Authorized Personnel Only.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
