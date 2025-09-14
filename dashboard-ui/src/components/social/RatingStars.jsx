import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const RatingStars = ({ 
    rating = 0, 
    onRatingChange, 
    readonly = false, 
    size = 'normal',
    showCount = false,
    ratingCount = 0 
}) => {
    const { t } = useTranslation();
    const [hoverRating, setHoverRating] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    const handleStarClick = (starRating) => {
        if (readonly || !onRatingChange) return;
        onRatingChange(starRating);
    };

    const handleStarHover = (starRating) => {
        if (readonly) return;
        setHoverRating(starRating);
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setHoverRating(0);
    };

    const displayRating = isHovering ? hoverRating : rating;
    const starSize = size === 'small' ? '16' : size === 'large' ? '24' : '20';

    return (
        <div className={`rating-stars ${size} ${readonly ? 'readonly' : 'interactive'}`}>
            <div className="stars-container" onMouseLeave={handleMouseLeave}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`star ${star <= displayRating ? 'filled' : 'empty'} ${
                            !readonly ? 'clickable' : ''
                        }`}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        disabled={readonly}
                        title={readonly ? '' : t('social.rating.clickToRate', { rating: star })}
                    >
                        <svg width={starSize} height={starSize} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </button>
                ))}
            </div>
            
            {showCount && ratingCount > 0 && (
                <span className="rating-count">
                    ({ratingCount} {t('social.rating.reviews', { count: ratingCount })})
                </span>
            )}
            
            {!readonly && isHovering && (
                <span className="rating-text">
                    {hoverRating === 1 && t('social.rating.poor')}
                    {hoverRating === 2 && t('social.rating.fair')}
                    {hoverRating === 3 && t('social.rating.good')}
                    {hoverRating === 4 && t('social.rating.veryGood')}
                    {hoverRating === 5 && t('social.rating.excellent')}
                </span>
            )}
        </div>
    );
};

export default RatingStars;
