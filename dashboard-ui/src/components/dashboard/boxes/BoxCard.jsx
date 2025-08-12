import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';
import '../../../assets/styles/BoxCard.css';

const BoxCard = ({ box, onActiveChange, viewMode = 'full' }) => {
    const { t } = useTranslation();
    const [isSettingActive, setIsSettingActive] = useState(false);
    
    const handleSetActive = async () => {
        if (box.Box.IsActive) return;
        
        setIsSettingActive(true);
        try {
            await api.post(`/dashboard/boxes/${box.Box.ID}/set-active`);
            if (onActiveChange) {
                onActiveChange(box.Box.ID);
            }
        } catch (error) {
            console.error('Error setting active box:', error);
        } finally {
            setIsSettingActive(false);
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
                    <h4 className="box-icon-title" title={box.Box.Name}>{box.Box.Name}</h4>
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
                    <div className="active-indicator">✓</div>
                )}
            </div>
            <div className="box-icon-actions">
                <Link to={`/box/${box.Box.ID}/cards/create`} className="icon-action-btn add" title={t('dashboard.boxes.actions.addCard')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.75a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6a.75.75 0 01.75-.75z" />
                    </svg>
                </Link>
                <Link to={`/box/${box.Box.ID}/review`} className="icon-action-btn review" title={t('dashboard.boxes.actions.review')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                    </svg>
                </Link>
                <Link to={`/box/${box.Box.ID}`} className="icon-action-btn details" title={t('dashboard.boxes.actions.details')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );

    // Full view rendering
    const renderFullView = () => (
        <div className={`box-card ${box.Box.IsActive ? 'active-box' : ''}`}>
            <div className="box-header">
                <h3 className="box-title">{box.Box.Name}</h3>
                <div className="box-status">
                    {box.Box.IsActive ? (
                        <span className="status-badge active">{t('dashboard.boxes.active')}</span>
                    ) : (
                        <button 
                            className="set-active-btn" 
                            onClick={handleSetActive}
                            disabled={isSettingActive}
                        >
                            {isSettingActive ? t('dashboard.boxes.settingActive') : t('dashboard.boxes.setActive')}
                        </button>
                    )}
                </div>
            </div>
            
            {box.Box.Description && (
                <p className="box-description">{box.Box.Description}</p>
            )}
            
            <div className="stats-container">
                <div className="stat-item">
                    <span className="stat-number">{box.CountOfTotalCards}</span>
                    <span className="stat-label">{t('dashboard.boxes.CountOfTotalCards')}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{box.CountOfCardsDueToday}</span>
                    <span className="stat-label">{t('dashboard.boxes.CountOfCardsDueToday')}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{box.CountOfCardsNeedingReview}</span>
                    <span className="stat-label">{t('dashboard.boxes.CountOfCardsNeedingReview')}</span>
                </div>
            </div>
            
            <div className="button-group">
                <Link to={`/box/${box.Box.ID}/cards/create`} className="button button-add">
                    {t('dashboard.boxes.actions.addCard')}
                </Link>
                <Link to={`/box/${box.Box.ID}/review`} className="button button-review">
                    {t('dashboard.boxes.actions.review')}
                </Link>
                <Link to={`/box/${box.Box.ID}`} className="button button-primary">
                    {t('dashboard.boxes.actions.details')}
                </Link>
            </div>
        </div>
    );

    return viewMode === 'icon' ? renderIconView() : renderFullView();
};

export default BoxCard;