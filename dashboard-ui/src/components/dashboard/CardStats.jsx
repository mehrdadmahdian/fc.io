import { useTranslation } from 'react-i18next';

function CardStats({ card, onClose }) {
    const { t } = useTranslation();

    return (
        <div className="stats-modal-overlay" onClick={onClose}>
            <div className="stats-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
                
                <h3>{t('review.stats.title')}</h3>
                
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-label">{t('review.stats.totalReviews')}</div>
                        <div className="stat-value">{card.stats?.totalReviews || 0}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">{t('review.stats.successRate')}</div>
                        <div className="stat-value">
                            {((card.stats?.successRate || 0) * 100).toFixed(1)}%
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">{t('review.stats.streak')}</div>
                        <div className="stat-value">{card.stats?.currentStreak || 0}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">{t('review.stats.bestStreak')}</div>
                        <div className="stat-value">{card.stats?.bestStreak || 0}</div>
                    </div>
                </div>

                <div className="stats-history">
                    <h4>{t('review.stats.lastReviews')}</h4>
                    <div className="history-dots">
                        {(card.stats?.history || []).map((result, index) => (
                            <span 
                                key={index} 
                                className={`history-dot ${result}`} 
                                title={t(`review.stats.results.${result}`)}
                            />
                        ))}
                    </div>
                </div>

                <div className="stats-details">
                    <div className="detail-item">
                        <span>{t('review.stats.created')}</span>
                        <span>{new Date(card.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                        <span>{t('review.stats.lastReview')}</span>
                        <span>{card.stats?.lastReview ? new Date(card.stats.lastReview).toLocaleDateString() : '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardStats; 