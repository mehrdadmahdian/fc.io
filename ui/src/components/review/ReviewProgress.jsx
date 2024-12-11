import { useTranslation } from 'react-i18next';

function ReviewProgress({ current, total }) {
    const { t } = useTranslation();
    const progress = (current / total) * 100;

    return (
        <div className="review-progress">
            <div className="progress-text">
                {t('review.progress', { current, total })}
            </div>
            <div className="progress-bar">
                <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

export default ReviewProgress; 