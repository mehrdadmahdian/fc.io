import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { searchUsers } from '../../services/socialApi';
import { useToast } from '../../contexts/ToastContext';
import ReviewContainer from '../../components/layout/ReviewContainer';
import UserSearchCard from '../../components/social/UserSearchCard';
import '../../assets/styles/Social.css';
import '../../assets/styles/ModernPage.css';

const UserSearch = () => {
    const { t } = useTranslation();
    const { error: showError } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (searchQuery) {
            handleSearch(true);
        }
    }, []);

    const handleSearch = async (reset = false) => {
        if (!searchQuery.trim()) {
            showError(t('social.userSearch.enterQuery'));
            return;
        }

        try {
            setLoading(true);
            const skip = reset ? 0 : users.length;
            const response = await searchUsers(searchQuery, 20, skip);
            const newUsers = response.data.users || [];
            
            if (reset) {
                setUsers(newUsers);
                setHasSearched(true);
            } else {
                setUsers(prev => [...prev, ...newUsers]);
            }
            
            setHasMore(newUsers.length === 20);
            
            // Update URL
            const params = new URLSearchParams();
            if (searchQuery) params.set('q', searchQuery);
            setSearchParams(params);
        } catch (error) {
            showError(t('social.userSearch.searchError'));
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            handleSearch(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(true);
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
                            <h1>{t('social.userSearch.title')}</h1>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="modern-content-area">
                    <div className="modern-content-box">
                        <div className="modern-content-scroll">
                            <div className="user-search-page">
                <div className="search-section">
                    <div className="search-bar">
                        <input
                            type="text"
                            className="form-control search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={t('social.userSearch.placeholder')}
                        />
                        <button 
                            className="btn btn-primary search-btn"
                            onClick={() => handleSearch(true)}
                            disabled={loading || !searchQuery.trim()}
                        >
                            {loading ? (
                                <span className="loading-spinner">⟳</span>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                            {t('social.userSearch.search')}
                        </button>
                    </div>
                </div>

                <div className="results-section">
                    {loading && users.length === 0 ? (
                        <div className="loading-state">
                            <div className="loading-spinner large">⟳</div>
                            <p>{t('social.userSearch.searching')}</p>
                        </div>
                    ) : !hasSearched ? (
                        <div className="initial-state">
                            <div className="search-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3>{t('social.userSearch.startSearching')}</h3>
                            <p>{t('social.userSearch.startSearchingDescription')}</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3>{t('social.userSearch.noResults')}</h3>
                            <p>{t('social.userSearch.noResultsDescription', { query: searchQuery })}</p>
                        </div>
                    ) : (
                        <>
                            <div className="results-header">
                                <h3>
                                    {t('social.userSearch.resultsFor', { 
                                        query: searchQuery,
                                        count: users.length 
                                    })}
                                </h3>
                            </div>

                            <div className="users-list">
                                {users.map((user) => (
                                    <UserSearchCard 
                                        key={user.id} 
                                        user={user}
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
                                                {t('social.userSearch.loading')}
                                            </>
                                        ) : (
                                            t('social.userSearch.loadMore')
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

export default UserSearch;
