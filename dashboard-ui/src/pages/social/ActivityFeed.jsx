import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPersonalizedFeed } from '../../services/socialApi';
import { useToast } from '../../contexts/ToastContext';
import ReviewContainer from '../../components/layout/ReviewContainer';
import ActivityItem from '../../components/social/ActivityItem';
import '../../assets/styles/Social.css';
import '../../assets/styles/ModernPage.css';

const ActivityFeed = () => {
    const { t } = useTranslation();
    const { error: showError } = useToast();
    
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadActivities = async (reset = false) => {
        try {
            if (reset) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            
            const skip = reset ? 0 : activities.length;
            const response = await getPersonalizedFeed(20, skip);
            const newActivities = response.data.activities || [];
            
            if (reset) {
                setActivities(newActivities);
            } else {
                setActivities(prev => [...prev, ...newActivities]);
            }
            
            setHasMore(newActivities.length === 20);
        } catch (error) {
            showError(t('social.feed.loadError'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadActivities(true);
    }, []);

    const handleRefresh = () => {
        if (!refreshing) {
            loadActivities(true);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadActivities(false);
        }
    };

    return (
        <ReviewContainer>
            <div className="modern-page-container">
                {/* Title Bar */}
                <div className="modern-title-bar">
                    <div className="modern-title-content">
                        <button 
                            className="modern-back-button"
                            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                            title={t('common.back')}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className="modern-page-title">
                            <h1>{t('social.feed.title')}</h1>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="modern-content-area">
                    <div className="modern-content-box">
                        <div className="modern-content-scroll">
                            <div className="activity-feed-page">
                <div className="feed-header">
                    <button 
                        className="refresh-btn"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        title={t('social.feed.refresh')}
                    >
                        <svg className={`refresh-icon ${refreshing ? 'spinning' : ''}`} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 12a8 8 0 018-8V2.5L14.5 5 12 7.5V6a6 6 0 100 12 6 6 0 006-6h2a8 8 0 01-16 0z" />
                        </svg>
                        {refreshing ? t('social.feed.refreshing') : t('social.feed.refresh')}
                    </button>
                </div>

                <div className="feed-content">
                    {loading && activities.length === 0 ? (
                        <div className="loading-state">
                            <div className="loading-spinner large">⟳</div>
                            <p>{t('social.feed.loading')}</p>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <h3>{t('social.feed.empty')}</h3>
                            <p>{t('social.feed.emptyDescription')}</p>
                            <div className="empty-actions">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => window.location.href = '/social/discover'}
                                >
                                    {t('social.feed.discoverBoxes')}
                                </button>
                                <button 
                                    className="btn btn-outline"
                                    onClick={() => window.location.href = '/social/users/search'}
                                >
                                    {t('social.feed.findUsers')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="activities-list">
                                {activities.map((activity) => (
                                    <ActivityItem 
                                        key={activity.id} 
                                        activity={activity}
                                    />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="load-more-section">
                                    <button 
                                        className="btn btn-outline load-more-btn"
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="loading-spinner">⟳</span>
                                                {t('social.feed.loading')}
                                            </>
                                        ) : (
                                            t('social.feed.loadMore')
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ReviewContainer>
    );
};

export default ActivityFeed;
