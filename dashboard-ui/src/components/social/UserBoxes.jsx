import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPublicBoxes } from '../../services/socialApi';
import { useToast } from '../../contexts/ToastContext';
import PublicBoxCard from './PublicBoxCard';

const UserBoxes = ({ userId }) => {
    const { t } = useTranslation();
    const { error: showError } = useToast();
    
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadUserBoxes();
    }, [userId]);

    const loadUserBoxes = async (reset = false) => {
        try {
            setLoading(true);
            const skip = reset ? 0 : boxes.length;
            
            // Note: This would need to be implemented as a separate endpoint
            // For now, we'll use the public boxes endpoint with user filtering
            const response = await getPublicBoxes({
                userId: userId, // This would need to be added to the API
                limit: 20,
                skip
            });

            const newBoxes = response.data.boxes || [];
            
            if (reset) {
                setBoxes(newBoxes);
            } else {
                setBoxes(prev => [...prev, ...newBoxes]);
            }
            
            setHasMore(newBoxes.length === 20);
        } catch (error) {
            showError(t('social.profile.boxesLoadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadUserBoxes(false);
        }
    };

    const handleBoxFork = () => {
        // Optionally refresh the boxes or update counts
        loadUserBoxes(true);
    };

    if (loading && boxes.length === 0) {
        return (
            <div className="loading-state">
                <div className="loading-spinner">⟳</div>
                <p>{t('social.profile.loadingBoxes')}</p>
            </div>
        );
    }

    if (boxes.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15z" />
                    </svg>
                </div>
                <h3>{t('social.profile.noPublicBoxes')}</h3>
                <p>{t('social.profile.noPublicBoxesDescription')}</p>
            </div>
        );
    }

    return (
        <div className="user-boxes">
            <div className="boxes-grid">
                {boxes.map((box) => (
                    <PublicBoxCard 
                        key={box.id} 
                        box={box}
                        onFork={handleBoxFork}
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
                                {t('social.profile.loading')}
                            </>
                        ) : (
                            t('social.profile.loadMore')
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserBoxes;
