import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../assets/styles/Auth.css';

function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            // Fake successful login
            // In production, this would be an actual API call
            const fakeToken = 'fake-jwt-token-' + Date.now();
            localStorage.setItem('token', fakeToken);
            localStorage.setItem('user', JSON.stringify({
                id: 1,
                name: 'Test User',
                email: formData.email
            }));
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            navigate('/dashboard');
        } catch (err) {
            setError(t('auth.errors.invalidCredentials'));
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{t('auth.login')}</h2>
                
                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">{t('auth.email')}</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('auth.placeholders.email')}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">{t('auth.password')}</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={t('auth.placeholders.password')}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-submit">
                        {t('auth.loginButton')}
                    </button>
                </form>

                <div className="auth-links">
                    <Link to="/register">{t('auth.needAccount')}</Link>
                    <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
                </div>
            </div>
        </div>
    );
}

export default Login; 