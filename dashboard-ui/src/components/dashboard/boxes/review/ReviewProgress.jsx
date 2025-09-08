import { useState, useEffect } from 'react';

const ReviewProgress = ({ current, total }) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const progressPercentage = (current / total) * 100;

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedProgress(progressPercentage);
        }, 100);
        return () => clearTimeout(timer);
    }, [progressPercentage]);

    return (
        <div className="enhanced-progress">
            <div className="progress-info">
                <div className="progress-stats">
                    <span className="current">{current}</span>
                    <span className="separator">/</span>
                    <span className="total">{total}</span>
                </div>
                <div className="progress-percentage">
                    {Math.round(progressPercentage)}%
                </div>
            </div>
            <div className="progress-bar-enhanced">
                <div 
                    className="progress-fill-enhanced"
                    style={{ width: `${animatedProgress}%` }}
                >
                    <div className="progress-shine"></div>
                </div>
                <div className="progress-track-bg"></div>
            </div>
        </div>
    );
};

export default ReviewProgress; 