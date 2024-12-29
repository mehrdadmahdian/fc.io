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
                            <h2>{t('auth.register.title')}</h2>
                            <p className="auth-subtitle">{t('auth.register.subtitle')}</p>

                            {error && (
                                <div className="auth-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="name">{t('auth.name')}</label>
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

                                <div className="form-group">
                                    <label htmlFor="confirmationPassword">
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
                                        t('auth.registerButton')
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