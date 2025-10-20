import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import '../../assets/styles/StatsCard.css';
import '../../assets/styles/GlobalReviewCard.css';

const GlobalReviewCard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [cardsCount, setCardsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGlobalCardsCount();
    }, []);

    const fetchGlobalCardsCount = async () => {
        try {
            const response = await api.get('/dashboard/review/global/cards/count');
            const count = response.data.data.totalCards || 0;
            setCardsCount(count);
        } catch (error) {
            setCardsCount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleGlobalReview = (mode = 'normal') => {
        if (mode === 'reverse') {
            navigate('/review/global/reverse');
        } else {
            navigate('/review/global');
        }
    };

    if (loading) {
        return (
            <div className="stat-card global-review-card loading">
                <div className="stat-header">
                    <div className="stat-icon">
                        <i className="fas fa-play-circle"></i>
                    </div>
                </div>
                <div className="stat-content">
                    <h3 className="stat-value">...</h3>
                    <p className="stat-title">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`stat-card global-review-card ${cardsCount > 0 ? 'clickable' : 'disabled'}`}>
            <div className="stat-header">
                <div className="stat-icon">
                    <i className="fas fa-play-circle"></i>
                </div>
                {cardsCount > 0 && (
                    <div className="review-badge">
                        <span>{t('globalReview.ready')}</span>
                    </div>
                )}
            </div>
            <div className="stat-content">
                <h3 className="stat-value">{cardsCount}</h3>
                <p className="stat-title">{t('globalReview.cardsToReview')}</p>
            </div>
            
            {cardsCount > 0 ? (
                <div className="review-actions">
                    <button 
                        className="review-action-btn normal"
                        onClick={() => handleGlobalReview('normal')}
                        title={t('globalReview.normalReview')}
                    >
                        <i className="fas fa-play"></i>
                        <span>{t('globalReview.review')}</span>
                    </button>
                    <button 
                        className="review-action-btn reverse"
                        onClick={() => handleGlobalReview('reverse')}
                        title={t('globalReview.reverseReview')}
                    >
                        <i className="fas fa-exchange-alt"></i>
                        <span>{t('globalReview.reverse')}</span>
                    </button>
                </div>
            ) : (
                <div className="empty-state">
                    <p className="empty-message">{t('globalReview.noCards')}</p>
                </div>
            )}
        </div>
    );
};

export default GlobalReviewCard;
