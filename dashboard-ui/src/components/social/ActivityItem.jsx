import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RatingStars from './RatingStars';

const ActivityItem = ({ activity }) => {
    const { t } = useTranslation();

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const activityDate = new Date(dateString);
        const diffInSeconds = Math.floor((now - activityDate) / 1000);

        if (diffInSeconds < 60) {
            return t('social.timeAgo.justNow');
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return t('social.timeAgo.minutesAgo', { count: minutes });
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return t('social.timeAgo.hoursAgo', { count: hours });
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return t('social.timeAgo.daysAgo', { count: days });
        } else {
            return activityDate.toLocaleDateString();
        }
    };

    const getActivityIcon = (activityType) => {
        switch (activityType) {
            case 'box_created':
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15z" />
                        <path d="M12 9v6m3-3H9" />
                    </svg>
                );
            case 'box_forked':
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z" />
                        <path d="M14 2v6h6" />
                    </svg>
                );
            case 'box_rated':
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                );
            case 'user_followed':
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        <path d="M19 8v6m3-3h-6" />
                    </svg>
                );
            case 'box_made_public':
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    </svg>
                );
        }
    };

    const getActivityContent = () => {
        const user = activity.user;
        const metadata = activity.metadata || {};

        switch (activity.activity_type) {
            case 'box_created':
                return (
                    <div className="activity-content">
                        <p>
                            <Link to={`/users/${user.id}/profile`} className="user-link">
                                {user.display_name || user.name}
                            </Link>
                            {' '}{t('social.activities.createdBox')}{' '}
                            <Link to={`/boxes/${activity.target_id}`} className="box-link">
                                {metadata.box_name}
                            </Link>
                        </p>
                    </div>
                );

            case 'box_forked':
                return (
                    <div className="activity-content">
                        <p>
                            <Link to={`/users/${user.id}/profile`} className="user-link">
                                {user.display_name || user.name}
                            </Link>
                            {' '}{t('social.activities.forkedBox')}{' '}
                            <Link to={`/boxes/${metadata.original_box_id}`} className="box-link">
                                {metadata.original_box_name}
                            </Link>
                        </p>
                        {metadata.fork_description && (
                            <div className="fork-description">
                                <p>"{metadata.fork_description}"</p>
                            </div>
                        )}
                    </div>
                );

            case 'box_rated':
                return (
                    <div className="activity-content">
                        <p>
                            <Link to={`/users/${user.id}/profile`} className="user-link">
                                {user.display_name || user.name}
                            </Link>
                            {' '}{t('social.activities.ratedBox')}{' '}
                            <Link to={`/boxes/${activity.target_id}`} className="box-link">
                                {metadata.box_name}
                            </Link>
                        </p>
                        <div className="rating-info">
                            <RatingStars 
                                rating={metadata.rating}
                                readonly={true}
                                size="small"
                            />
                            {metadata.review && (
                                <div className="review-text">
                                    <p>"{metadata.review}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'user_followed':
                return (
                    <div className="activity-content">
                        <p>
                            <Link to={`/users/${user.id}/profile`} className="user-link">
                                {user.display_name || user.name}
                            </Link>
                            {' '}{t('social.activities.followedUser')}{' '}
                            <Link to={`/users/${metadata.following_id}/profile`} className="user-link">
                                {metadata.following_name}
                            </Link>
                        </p>
                    </div>
                );

            case 'box_made_public':
                return (
                    <div className="activity-content">
                        <p>
                            <Link to={`/users/${user.id}/profile`} className="user-link">
                                {user.display_name || user.name}
                            </Link>
                            {' '}{t('social.activities.madeBoxPublic')}{' '}
                            <Link to={`/boxes/${activity.target_id}`} className="box-link">
                                {metadata.box_name}
                            </Link>
                        </p>
                    </div>
                );

            default:
                return (
                    <div className="activity-content">
                        <p>{t('social.activities.unknownActivity')}</p>
                    </div>
                );
        }
    };

    return (
        <div className="activity-item">
            <div className="activity-icon">
                {getActivityIcon(activity.activity_type)}
            </div>
            
            <div className="activity-main">
                {getActivityContent()}
                
                <div className="activity-meta">
                    <span className="activity-time">
                        {formatTimeAgo(activity.created_at)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ActivityItem;
