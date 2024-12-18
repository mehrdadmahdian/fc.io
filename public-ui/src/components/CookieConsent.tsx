'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';

export default function CookieConsent() {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-consent">
            <div className="cookie-content">
                <div className="cookie-text">
                    <i className="fas fa-cookie-bite cookie-icon"></i>
                    <p>{t('cookies.message')}</p>
                </div>
                <div className="cookie-buttons">
                    <button onClick={handleDecline} className="cookie-button decline">
                        {t('cookies.decline')}
                    </button>
                    <button onClick={handleAccept} className="cookie-button accept">
                        {t('cookies.accept')}
                    </button>
                </div>
            </div>
        </div>
    );
} 