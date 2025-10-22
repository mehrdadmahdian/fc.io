import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import '../../../assets/styles/BoxCard.css';

const BoxCard = ({ box, onActiveChange, viewMode = 'full' }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    const [isSettingActive, setIsSettingActive] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Check if we're on mobile and handle initial state
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            // On mobile, only the active box should be expanded initially
            if (mobile) {
                setIsExpanded(box.Box.IsActive);
            } else {
                setIsExpanded(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [box.Box.IsActive]);

    // Handle box expansion/collapse on mobile
    const handleBoxToggle = () => {
        if (isMobile) {
            setIsExpanded(!isExpanded);
        }
    };
    
    const handleSetActive = async () => {
        if (box.Box.IsActive) return;
        
        setIsSettingActive(true);
        try {
            await api.post(`/dashboard/boxes/${box.Box.ID}/set-active`);
            if (onActiveChange) {
                onActiveChange(box.Box.ID);
            }
        } catch (error) {
            // Error setting active box - could add proper error handling here
        } finally {
            setIsSettingActive(false);
        }
    };

    const handleDeleteBox = async () => {
        if (window.confirm(t('dashboard.boxes.deleteConfirm'))) {
            setIsDeleting(true);
            try {
                await api.delete(`/dashboard/boxes/${box.Box.ID}`);
                success(t('dashboard.boxes.deleteSuccess'));
                // Navigate to dashboard after successful deletion
                navigate('/dashboard');
            } catch (error) {
                showError(t('dashboard.boxes.deleteError'));
            } finally {
                setIsDeleting(false);
            }
        }
    };

    // Icon view rendering
    const renderIconView = () => (
        <div className={`box-card box-card-icon ${box.Box.IsActive ? 'active-box' : ''}`}>
            <div className="box-icon-content">
                <div className="box-icon-header">
                    <div className="box-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h15a3 3 0 013 3v4.146a4.483 4.483 0 00-3-.146h-15c-1.035 0-2.016.277-2.86.75a3.972 3.972 0 00-.14-.604z" />
                        </svg>
                    </div>
                    <div className="box-header-info">
                        <h4 className="box-icon-title" title={box.Box.Name}>{box.Box.Name}</h4>
                        {!box.Box.IsActive ? (
                            <button 
                                className="icon-set-active-btn" 
                                onClick={handleSetActive}
                                disabled={isSettingActive}
                                title={t('dashboard.boxes.setActive')}
                            >
                                ✓
                            </button>
                        ) : (
                            <div className="active-indicator">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
                <div className="box-icon-stats">
                    <div className="stat-with-hint">
                        <span className="stat-badge">{box.CountOfTotalCards}</span>
                        <span className="stat-hint">{t('dashboard.boxes.totalCards')}</span>
                    </div>
                    {box.CountOfCardsDueToday > 0 && (
                        <div className="stat-with-hint">
                            <span className="due-badge">{box.CountOfCardsDueToday}</span>
                            <span className="stat-hint">{t('dashboard.boxes.dueToday')}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="box-icon-actions">
                <Link 
                    to={`/box/${box.Box.ID}/cards/create`} 
                    state={{ from: location.pathname }}
                    className="icon-action-btn add" 
                    title={t('dashboard.boxes.actions.addCard')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.75a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6a.75.75 0 01.75-.75z" />
                    </svg>
                    <span className="action-text">{t('dashboard.boxes.actions.addCard')}</span>
                </Link>
                <Link to={`/box/${box.Box.ID}/review`} className="icon-action-btn review" title={t('dashboard.boxes.actions.review')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                    </svg>
                    <span className="action-text">{t('dashboard.boxes.actions.review')}</span>
                </Link>
                <Link to={`/box/${box.Box.ID}/review/reverse`} className="icon-action-btn review-reverse" title={t('dashboard.boxes.actions.reviewReverse')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    <span className="action-text">{t('dashboard.boxes.actions.reviewReverse')}</span>
                </Link>
                <Link to={`/box/${box.Box.ID}`} className="icon-action-btn details" title={t('dashboard.boxes.actions.details')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                    <span className="action-text">{t('dashboard.boxes.actions.details')}</span>
                </Link>
                <button 
                    className="icon-action-btn delete" 
                    onClick={handleDeleteBox}
                    disabled={isDeleting}
                    title={t('dashboard.boxes.actions.delete')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452a51.007 51.007 0 013.273 0zM14.25 9.75a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0v-8.25zm-4.5 0a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0v-8.25z" clipRule="evenodd" />
                    </svg>
                    <span className="action-text">{t('dashboard.boxes.actions.delete')}</span>
                </button>
            </div>
        </div>
    );

    // Compact list view rendering
    const renderListView = () => (
        <div className={`box-list-item ${box.Box.IsActive ? 'active-box' : ''} ${isMobile ? 'mobile-view' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="list-item-main">
                <div className="list-item-info" onClick={isMobile ? handleBoxToggle : undefined}>
                    <div className="list-item-header">
                        <h4 className="list-item-title">{box.Box.Name}</h4>
                        <div className="list-item-right-controls">
                            <div className="list-item-status">
                                {box.Box.IsActive ? (
                                    <span className="status-badge active">{t('dashboard.boxes.active')}</span>
                                ) : (
                                    <button 
                                        className="list-set-active-btn" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSetActive();
                                        }}
                                        disabled={isSettingActive}
                                        title={t('dashboard.boxes.setActive')}
                                    >
                                        ✓
                                    </button>
                                )}
                            </div>
                            {isMobile && (
                                <div className="mobile-expand-indicator">
                                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                                </div>
                            )}
                        </div>
                    </div>
                    {box.Box.Description && isExpanded && (
                        <p className="list-item-description">{box.Box.Description}</p>
                    )}
                </div>
                
                {isExpanded && (
                    <>
                        <div className="list-item-stats">
                            <div className="list-stat">
                                <span className="list-stat-number">{box.CountOfTotalCards}</span>
                                <span className="list-stat-label">{t('dashboard.boxes.totalCards')}</span>
                            </div>
                            <div className="list-stat">
                                <span className="list-stat-number due">{box.CountOfCardsDueToday}</span>
                                <span className="list-stat-label">{t('dashboard.boxes.dueToday')}</span>
                            </div>
                            <div className="list-stat">
                                <span className="list-stat-number review">{box.CountOfCardsNeedingReview}</span>
                                <span className="list-stat-label">{t('dashboard.boxes.needingReview')}</span>
                            </div>
                        </div>
                        
                        <div className="list-item-actions">
                            <Link 
                                to={`/box/${box.Box.ID}/cards/create`} 
                                state={{ from: location.pathname }}
                                className="list-action-btn add" 
                                title={t('dashboard.boxes.actions.addCard')}
                            >
                                <i className="fas fa-plus"></i>
                            </Link>
                            <Link 
                                to={`/box/${box.Box.ID}/review`} 
                                className="list-action-btn review" 
                                title={t('dashboard.boxes.actions.review')}
                            >
                                <i className="fas fa-play"></i>
                            </Link>
                            <Link 
                                to={`/box/${box.Box.ID}/review/reverse`} 
                                className="list-action-btn review-reverse" 
                                title={t('dashboard.boxes.actions.reviewReverse')}
                            >
                                <i className="fas fa-exchange-alt"></i>
                            </Link>
                            <Link 
                                to={`/box/${box.Box.ID}`} 
                                className="list-action-btn details" 
                                title={t('dashboard.boxes.actions.details')}
                            >
                                <i className="fas fa-info-circle"></i>
                            </Link>
                            <button 
                                className="list-action-btn delete" 
                                onClick={handleDeleteBox}
                                disabled={isDeleting}
                                title={t('dashboard.boxes.actions.delete')}
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );


    return viewMode === 'icon' ? renderIconView() : renderListView();
};

export default BoxCard;