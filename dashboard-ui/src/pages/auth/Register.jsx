import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import PageTransition from '../../components/common/PageTransition';
import '../../assets/styles/Auth.css';

function Register() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmationPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.password !== formData.confirmationPassword) {
            setError(t('auth.errors.passwordMismatch'));
            setIsLoading(false);
            return;
        }

        try {
            const success = await register(formData);
            if (success) {
                navigate('/');
            } else {
                setError(t('auth.errors.registrationFailed'));
            }
        } catch (err) {
            setError(t('auth.errors.registrationFailed'));
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
                            <div className="auth-logo">
                                <i className="fas fa-brain"></i>
                            </div>
                            <h1>{t('auth.register.title')}</h1>
                            <p className="auth-subtitle">{t('auth.register.subtitle')}</p>
                            <div className="auth-quote">
                                <i className="fas fa-quote-left"></i>
                                <p>The journey of a thousand miles begins with a single step.</p>
                                <span>- Lao Tzu</span>
                            </div>
                        </div>
                    </div>

                    <div className="auth-right">
                        <div className="auth-form-container">
                            <h2>{t('auth.register.title')}</h2>
                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="name">
                                        <i className="fas fa-user"></i>
                                        {t('auth.name')}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={t('auth.placeholders.name')}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

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

                                <div className="form-group">
                                    <label htmlFor="confirmationPassword">
                                        <i className="fas fa-lock"></i>
                                        {t('auth.confirmationPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmationPassword"
                                        name="confirmationPassword"
                                        value={formData.confirmationPassword}
                                        onChange={handleChange}
                                        placeholder={t('auth.placeholders.confirmationPassword')}
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
                                        <>{t('auth.registerButton')}</>
                                    )}
                                </button>
                            </form>

                            <div className="auth-links">
                                <Link to="/auth/login" className="auth-link">
                                    <i className="fas fa-arrow-left"></i>
                                    {t('auth.haveAccount')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default Register; 