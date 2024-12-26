import { useTranslation } from 'react-i18next';

const ReviewProgress = ({ current, total }) => {
    return (
        <div className="review-progress">
            <div className="progress-text">
                Card {current} of {total}
            </div>
            <div className="progress-bar">
                {[...Array(total)].map((_, index) => (
                    <div 
                        key={index} 
                        className={`progress-segment ${
                            index + 1 < current ? 'completed' : 
                            index + 1 === current ? 'current' : ''
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ReviewProgress; 