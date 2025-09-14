import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { getPublicBoxes } from '../../services/socialApi';
import { useToast } from '../../contexts/ToastContext';
import ReviewContainer from '../../components/layout/ReviewContainer';
import PublicBoxCard from '../../components/social/PublicBoxCard';
import BoxFilters from '../../components/social/BoxFilters';
import '../../assets/styles/Social.css';
import '../../assets/styles/ModernPage.css';

const PublicBoxes = () => {
    const { t } = useTranslation();
    const { error: showError } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        tags: searchParams.get('tags') || '',
        language: searchParams.get('language') || '',
        difficulty: searchParams.get('difficulty') || '',
        sort: searchParams.get('sort') || 'created_at'
    });

    const loadBoxes = async (reset = false) => {
        try {
            setLoading(true);
            const skip = reset ? 0 : boxes.length;
            const response = await getPublicBoxes({
                ...filters,
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
            showError(t('social.publicBoxes.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBoxes(true);
        
        // Update URL params
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params);
    }, [filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadBoxes(false);
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
                            <h1>{t('social.publicBoxes.title')}</h1>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="modern-content-area">
                    <div className="modern-content-box">
                        <div className="modern-content-scroll">
                            <div className="public-boxes-page">
                <div className="filters-section">
                    <BoxFilters 
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                <div className="boxes-section">
                    {loading && boxes.length === 0 ? (
                        <div className="loading-state">
                            <div className="loading-spinner large">⟳</div>
                            <p>{t('social.publicBoxes.loading')}</p>
                        </div>
                    ) : boxes.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h15a3 3 0 013 3v4.146a4.483 4.483 0 00-3-.146h-15c-1.035 0-2.016.277-2.86.75a3.972 3.972 0 00-.14-.604z" />
                                </svg>
                            </div>
                            <h3>{t('social.publicBoxes.noBoxes')}</h3>
                            <p>{t('social.publicBoxes.noBoxesDescription')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="boxes-grid">
                                {boxes.map((box) => (
                                    <PublicBoxCard 
                                        key={box.id} 
                                        box={box}
                                        onFork={() => loadBoxes(true)}
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
                                                {t('social.publicBoxes.loading')}
                                            </>
                                        ) : (
                                            t('social.publicBoxes.loadMore')
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

export default PublicBoxes;
