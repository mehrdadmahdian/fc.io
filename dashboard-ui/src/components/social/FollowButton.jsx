import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { followUser, unfollowUser } from '../../services/socialApi';
import { useToast } from '../../contexts/ToastContext';

const FollowButton = ({ userId, isFollowing: initialFollowing, onFollowChange, size = 'normal' }) => {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const handleFollowToggle = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(userId);
                setIsFollowing(false);
                success(t('social.follow.unfollowSuccess'));
            } else {
                await followUser(userId);
                setIsFollowing(true);
                success(t('social.follow.followSuccess'));
            }
            
            if (onFollowChange) {
                onFollowChange(isFollowing);
            }
        } catch (error) {
            error(
                isFollowing 
                    ? t('social.follow.unfollowError') 
                    : t('social.follow.followError')
            );
        } finally {
            setIsLoading(false);
        }
    };

    const buttonClass = `follow-btn ${size === 'small' ? 'follow-btn-small' : ''} ${
        isFollowing ? 'following' : 'not-following'
    } ${isLoading ? 'loading' : ''}`;

    return (
        <button 
            className={buttonClass}
            onClick={handleFollowToggle}
            disabled={isLoading}
        >
            {isLoading ? (
                <span className="loading-spinner">⟳</span>
            ) : (
                <>
                    {isFollowing ? (
                        <>
                            <svg className="follow-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {size !== 'small' && t('social.follow.following')}
                        </>
                    ) : (
                        <>
                            <svg className="follow-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.75a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6a.75.75 0 01.75-.75z" />
                            </svg>
                            {size !== 'small' && t('social.follow.follow')}
                        </>
                    )}
                </>
            )}
        </button>
    );
};

export default FollowButton;
