import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getUserProfile } from '../../services/socialApi';
import { useToast } from '../../contexts/ToastContext';
import ReviewContainer from '../../components/layout/ReviewContainer';
import FollowButton from '../../components/social/FollowButton';
import UserBoxes from '../../components/social/UserBoxes';
import '../../assets/styles/Social.css';
import '../../assets/styles/ModernPage.css';

const UserProfile = () => {
    const { userId } = useParams();
    const { t } = useTranslation();
    const { error: showError } = useToast();
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('boxes');

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await getUserProfile(userId);
            setProfile(response.data);
        } catch (error) {
            showError(
                error.response?.data?.error || t('social.profile.loadError')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFollowChange = (newFollowStatus) => {
        setProfile(prev => ({
            ...prev,
            is_following: newFollowStatus,
            follower_count: prev.follower_count + (newFollowStatus ? 1 : -1)
        }));
    };

    const formatJoinDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long'
        });
    };

    if (loading) {
        return (
            <ReviewContainer>
                <div className="modern-page-container">
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
                                <h1>{t('social.profile.loading')}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="modern-content-area">
                        <div className="modern-content-box">
                            <div className="loading-state">
                                <div className="loading-spinner large">⟳</div>
                                <p>{t('social.profile.loading')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </ReviewContainer>
        );
    }

    if (!profile) {
        return (
            <ReviewContainer>
                <div className="modern-page-container">
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
                                <h1>{t('social.profile.notFound')}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="modern-content-area">
                        <div className="modern-content-box">
                            <div className="error-state">
                                <h3>{t('social.profile.notFound')}</h3>
                                <p>{t('social.profile.notFoundDescription')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </ReviewContainer>
        );
    }

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
                            <h1>{profile.display_name}</h1>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="modern-content-area">
                    <div className="modern-content-box">
                        <div className="modern-content-scroll">
                            <div className="user-profile-page">
                <div className="profile-header">
                    <div className="profile-info">
                        <div className="profile-avatar">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.display_name} />
                            ) : (
                                <div className="avatar-placeholder">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        
                        <div className="profile-details">
                            <h1 className="profile-name">{profile.display_name}</h1>
                            {profile.username && (
                                <p className="profile-username">@{profile.username}</p>
                            )}
                            
                            {profile.bio && (
                                <p className="profile-bio">{profile.bio}</p>
                            )}
                            
                            <div className="profile-meta">
                                <span className="join-date">
                                    {t('social.profile.joinedOn', { 
                                        date: formatJoinDate(profile.created_at) 
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="profile-actions">
                        {profile.is_following !== undefined && (
                            <FollowButton 
                                userId={userId}
                                isFollowing={profile.is_following}
                                onFollowChange={handleFollowChange}
                            />
                        )}
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="stat-item">
                        <span className="stat-number">{profile.follower_count || 0}</span>
                        <span className="stat-label">{t('social.profile.followers')}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{profile.following_count || 0}</span>
                        <span className="stat-label">{t('social.profile.following')}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{profile.public_box_count || 0}</span>
                        <span className="stat-label">{t('social.profile.publicBoxes')}</span>
                    </div>
                </div>

                <div className="profile-content">
                    <div className="profile-tabs">
                        <button 
                            className={`tab ${activeTab === 'boxes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('boxes')}
                        >
                            {t('social.profile.tabs.boxes')}
                        </button>
                        <button 
                            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
                            onClick={() => setActiveTab('activity')}
                        >
                            {t('social.profile.tabs.activity')}
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'boxes' && (
                            <UserBoxes userId={userId} />
                        )}
                        {activeTab === 'activity' && (
                            <div className="user-activity">
                                <p>{t('social.profile.activityComingSoon')}</p>
                            </div>
                        )}
                    </div>
                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ReviewContainer>
    );
};

export default UserProfile;
