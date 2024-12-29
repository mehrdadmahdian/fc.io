import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import PageTransition from '../../components/common/PageTransition';
import '../../assets/styles/Auth.css';

function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const success = await login(formData);
            if (success) {
                navigate('/');
            } else {
                setError(t('auth.errors.invalidCredentials'));
            }
        } catch (err) {
            setError(t('auth.errors.invalidCredentials'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <PageTransition>
            <div className="auth-container">
                <div className="auth-brand-wrapper">
                    <div className="auth-brand-logo">
                        <i className="fas fa-brain"></i>
                    </div>
                    <div className="auth-brand-text">
                        <h1>flashcards.io</h1>
                        <p>AI-Powered Learning</p>
                    </div>
                </div>

                <div className="auth-content">
                    <div className="auth-right">
                        <div className="auth-form-container">
                            <h2>{t('auth.welcome.title')}</h2>
                            <p className="auth-subtitle">{t('auth.login.subtitle')}</p>
                            
                            {error && (
                                <div className="auth-error">
                                    <i className="fas fa-exclamation-circle"></i>
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
                                        disabled={isLoading}
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
                                        disabled={isLoading}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="auth-submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <><i className="fas fa-spinner fa-spin"></i> {t('common.loading')}</>
                                    ) : (
                                        t('auth.loginButton')
                                    )}
                                </button>
                            </form>

                            <div className="auth-links">
                                <Link to="/auth/register" className="auth-link">
                                    <i className="fas fa-user-plus"></i>
                                    {t('auth.needAccount')}
                                </Link>
                                <Link to="/auth/forgot-password" className="auth-link">
                                    <i className="fas fa-key"></i>
                                    {t('auth.forgotPassword')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default Login; 