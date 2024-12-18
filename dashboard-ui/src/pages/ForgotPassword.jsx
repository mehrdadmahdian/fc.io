import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../assets/styles/Auth.css';

function ForgotPassword() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            // TODO: Replace with your actual API call
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Request failed');
            }

            setStatus({
                type: 'success',
                message: t('auth.forgotPassword.successMessage')
            });
            setEmail('');
        } catch (err) {
            setStatus({
                type: 'error',
                message: t('auth.forgotPassword.errorMessage')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{t('auth.forgotPassword.title')}</h2>
                <p className="auth-description">
                    {t('auth.forgotPassword.description')}
                </p>

                {status.message && (
                    <div className={`auth-message ${status.type}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">{t('auth.email')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('auth.placeholders.email')}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="auth-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting 
                            ? t('auth.forgotPassword.sending') 
                            : t('auth.forgotPassword.submit')}
                    </button>
                </form>

                <div className="auth-links">
                    <Link to="/login">
                        {t('auth.forgotPassword.backToLogin')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword; 