import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RatingStars from './RatingStars';
import ForkButton from './ForkButton';
import RatingModal from './RatingModal';

const PublicBoxCard = ({ box, onFork }) => {
    const { t } = useTranslation();
    const [showRatingModal, setShowRatingModal] = useState(false);

    const handleRateClick = () => {
        setShowRatingModal(true);
    };

    const handleRatingSuccess = () => {
        // Optionally refresh the box data or update local state
        setShowRatingModal(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'beginner': return 'green';
            case 'intermediate': return 'orange';
            case 'advanced': return 'red';
            default: return 'gray';
        }
    };

    return (
        <>
            <div className="public-box-card">
                <div className="box-header">
                    <div className="box-title-section">
                        <h3 className="box-title">{box.name}</h3>
                        <div className="box-meta">
                            <span className="box-author">
                                {t('social.publicBoxes.by')} 
                                <Link to={`/users/${box.user_id}/profile`} className="author-link">
                                    {box.user?.display_name || box.user?.name}
                                </Link>
                            </span>
                            <span className="box-date">
                                {formatDate(box.created_at)}
                            </span>
                        </div>
                    </div>
                    
                    <div className="box-actions">
                        <ForkButton 
                            boxId={box.id}
                            boxName={box.name}
                            onForkSuccess={onFork}
                        />
                    </div>
                </div>

                <div className="box-content">
                    {box.description && (
                        <p className="box-description">{box.description}</p>
                    )}

                    <div className="box-tags">
                        {box.tags && box.tags.map((tag, index) => (
                            <span key={index} className="tag">
                                {tag}
                            </span>
                        ))}
                        
                        <span className={`difficulty-tag ${getDifficultyColor(box.difficulty)}`}>
                            {t(`social.difficulty.${box.difficulty}`) || box.difficulty}
                        </span>
                        
                        {box.language && (
                            <span className="language-tag">
                                {box.language.toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="box-stats">
                    <div className="stat-item">
                        <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15z" />
                        </svg>
                        <span>{box.card_count || 0} {t('social.publicBoxes.cards')}</span>
                    </div>
                    
                    <div className="stat-item">
                        <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z" />
                        </svg>
                        <span>{box.fork_count || 0} {t('social.publicBoxes.forks')}</span>
                    </div>
                    
                    <div className="stat-item">
                        <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                        </svg>
                        <span>{box.view_count || 0} {t('social.publicBoxes.views')}</span>
                    </div>
                </div>

                <div className="box-rating">
                    <div className="rating-display">
                        <RatingStars 
                            rating={box.average_rating || 0}
                            readonly={true}
                            size="small"
                            showCount={true}
                            ratingCount={box.rating_count || 0}
                        />
                    </div>
                    
                    <button 
                        className="rate-btn"
                        onClick={handleRateClick}
                        title={t('social.rating.rateBox')}
                    >
                        <svg className="rate-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {t('social.rating.rate')}
                    </button>
                </div>

                {box.is_forked && box.original_box_id && (
                    <div className="fork-info">
                        <svg className="fork-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z" />
                        </svg>
                        <span>{t('social.publicBoxes.forkedFrom')}</span>
                        <Link to={`/boxes/${box.original_box_id}`} className="original-link">
                            {t('social.publicBoxes.originalBox')}
                        </Link>
                    </div>
                )}
            </div>

            <RatingModal 
                boxId={box.id}
                boxName={box.name}
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onRatingSuccess={handleRatingSuccess}
            />
        </>
    );
};

export default PublicBoxCard;
