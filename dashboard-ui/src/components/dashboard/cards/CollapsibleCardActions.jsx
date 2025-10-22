import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, Edit, Archive, BarChart3, MoreHorizontal, X } from 'lucide-react';

function CollapsibleCardActions({ 
    card, 
    onToggleBookmark, 
    onEdit, 
    onArchive, 
    onShowStats,
    disabled = false 
}) {
    const { t } = useTranslation();
    const [showActions, setShowActions] = useState(false);

    const handleToggleBookmark = () => {
        if (onToggleBookmark) {
            onToggleBookmark();
        }
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit();
            setShowActions(false);
        }
    };

    const handleArchive = () => {
        if (onArchive) {
            onArchive();
            setShowActions(false);
        }
    };

    const handleShowStats = () => {
        if (onShowStats) {
            onShowStats();
            setShowActions(false);
        }
    };

    return (
        <div className="collapsible-card-actions">
            {/* Toggle Button */}
            <button 
                className="action-toggle-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                }}
                disabled={disabled}
                title={showActions ? t('review.hideActions') : t('review.showActions')}
            >
                {showActions ? <X className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
            </button>
            
            {/* Collapsible Action Buttons */}
            {showActions && (
                <div className="action-buttons-grid">
                    {/* Bookmark Toggle - Far Left */}
                    {onToggleBookmark && (
                        <button 
                            className={`action-btn bookmark ${card.IsBookmarked ? 'bookmarked' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBookmark();
                            }}
                            title={card.IsBookmarked ? t('review.removeBookmark') : t('review.addBookmark')}
                        >
                            <Bookmark className="h-4 w-4" />
                            <span>{card.IsBookmarked ? t('review.removeBookmark') : t('review.addBookmark')}</span>
                        </button>
                    )}
                    
                    {/* Edit Button */}
                    {onEdit && (
                        <button 
                            className="action-btn edit"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit();
                            }}
                            title={t('review.editCard')}
                        >
                            <Edit className="h-4 w-4" />
                            <span>{t('review.editCard')}</span>
                        </button>
                    )}
                    
                    {/* Stats Button */}
                    {onShowStats && (
                        <button 
                            className="action-btn stats"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleShowStats();
                            }}
                            title={t('review.showStats')}
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span>{t('review.showStats')}</span>
                        </button>
                    )}
                    
                    {/* Archive Button */}
                    {onArchive && (
                        <button 
                            className="action-btn archive"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleArchive();
                            }}
                            title={t('review.archiveCard')}
                        >
                            <Archive className="h-4 w-4" />
                            <span>{t('review.archiveCard')}</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default CollapsibleCardActions;
