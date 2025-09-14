import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FollowButton from './FollowButton';

const UserSearchCard = ({ user }) => {
    const { t } = useTranslation();

    const formatJoinDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className="user-search-card">
            <div className="user-info">
                <div className="user-avatar">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.display_name} />
                    ) : (
                        <div className="avatar-placeholder">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                </div>
                
                <div className="user-details">
                    <div className="user-name-section">
                        <Link to={`/users/${user.id}/profile`} className="user-name">
                            {user.display_name}
                        </Link>
                        {user.username && (
                            <span className="username">@{user.username}</span>
                        )}
                    </div>
                    
                    {user.bio && (
                        <p className="user-bio">{user.bio}</p>
                    )}
                    
                    <div className="user-meta">
                        <div className="user-stats">
                            <span className="stat">
                                <strong>{user.follower_count || 0}</strong> {t('social.userSearch.followers')}
                            </span>
                            <span className="stat">
                                <strong>{user.public_box_count || 0}</strong> {t('social.userSearch.publicBoxes')}
                            </span>
                        </div>
                        
                        <span className="join-date">
                            {t('social.userSearch.joined')} {formatJoinDate(user.created_at)}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="user-actions">
                {user.is_following !== undefined && (
                    <FollowButton 
                        userId={user.id}
                        isFollowing={user.is_following}
                        size="small"
                    />
                )}
                
                <Link 
                    to={`/users/${user.id}/profile`}
                    className="btn btn-outline btn-sm"
                >
                    {t('social.userSearch.viewProfile')}
                </Link>
            </div>
        </div>
    );
};

export default UserSearchCard;
