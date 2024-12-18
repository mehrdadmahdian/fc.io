import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/layout/PageTransition';
import '../assets/styles/Auth.css';

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
                <div className="auth-content">
                    <div className="auth-left">
                        <div className="auth-welcome">
                            <h1>{t('auth.welcome.title')}</h1>
                            <p className="auth-subtitle">{t('auth.login.subtitle')}</p>
                            <div className="auth-features">
                                <div className="auth-feature">
                                    <i className="fas fa-sync"></i>
                                    <div className="feature-text">
                                        <h3>{t('auth.welcome.features.spaced.title')}</h3>
                                        <p>{t('auth.welcome.features.spaced.description')}</p>
                                    </div>
                                </div>
                                <div className="auth-feature">
                                    <i className="fas fa-chart-line"></i>
                                    <div className="feature-text">
                                        <h3>{t('auth.welcome.features.progress.title')}</h3>
                                        <p>{t('auth.welcome.features.progress.description')}</p>
                                    </div>
                                </div>
                                <div className="auth-feature">
                                    <i className="fas fa-mobile-alt"></i>
                                    <div className="feature-text">
                                        <h3>{t('auth.welcome.features.anywhere.title')}</h3>
                                        <p>{t('auth.welcome.features.anywhere.description')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="auth-right">
                        <div className="auth-form-container">
                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <i className="fas fa-envelope"></i>
                                        {t('auth.email')}
                                    </label>
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
                                    <label htmlFor="password">
                                        <i className="fas fa-lock"></i>
                                        {t('auth.password')}
                                    </label>
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
                                        <>{t('auth.loginButton')}</>
                                    )}
                                </button>
                            </form>

                            <div className="auth-links">
                                <Link to="/auth/register" className="auth-link">
                                    {t('auth.needAccount')}
                                </Link>
                                <br />
                                <Link to="/auth/forgot-password" className="auth-link">
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