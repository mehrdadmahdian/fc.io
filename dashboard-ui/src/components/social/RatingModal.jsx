import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { rateBox } from '../../services/socialApi';
import { useToast } from '../../contexts/ToastContext';
import RatingStars from './RatingStars';

const RatingModal = ({ boxId, boxName, currentRating = null, isOpen, onClose, onRatingSuccess }) => {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const [rating, setRating] = useState(currentRating?.rating || 0);
    const [review, setReview] = useState(currentRating?.review || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            error(t('social.rating.selectRating'));
            return;
        }

        setIsLoading(true);
        try {
            const response = await rateBox(boxId, rating, review);
            success(
                currentRating 
                    ? t('social.rating.updateSuccess') 
                    : t('social.rating.submitSuccess')
            );
            
            if (onRatingSuccess) {
                onRatingSuccess(response.data.rating);
            }
            onClose();
        } catch (error) {
            error(
                error.response?.data?.error || t('social.rating.submitError')
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content rating-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        {currentRating 
                            ? t('social.rating.updateTitle') 
                            : t('social.rating.rateTitle')
                        }
                    </h3>
                    <button className="modal-close" onClick={handleClose} disabled={isLoading}>
                        ×
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="rating-box-info">
                            <h4>{boxName}</h4>
                            <p>{t('social.rating.rateDescription')}</p>
                        </div>
                        
                        <div className="form-group">
                            <label>{t('social.rating.yourRating')}</label>
                            <RatingStars 
                                rating={rating}
                                onRatingChange={setRating}
                                size="large"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="rating-review">
                                {t('social.rating.reviewLabel')}
                                <span className="optional">({t('common.optional')})</span>
                            </label>
                            <textarea
                                id="rating-review"
                                className="form-control"
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder={t('social.rating.reviewPlaceholder')}
                                rows={4}
                                maxLength={1000}
                                disabled={isLoading}
                            />
                            <small className="form-text">
                                {review.length}/1000 {t('common.characters')}
                            </small>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button 
                            type="button"
                            className="btn btn-secondary" 
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            {t('common.cancel')}
                        </button>
                        <button 
                            type="submit"
                            className="btn btn-primary" 
                            disabled={isLoading || rating === 0}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner">⟳</span>
                                    {t('social.rating.submitting')}
                                </>
                            ) : (
                                currentRating 
                                    ? t('social.rating.updateRating')
                                    : t('social.rating.submitRating')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RatingModal;
