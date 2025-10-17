import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import ModernContainer from '../../components/layout/ModernContainer';
import MarkdownContent from '../../components/common/MarkdownContent';
import BoxSelectionModal from '../../components/dashboard/cards/BoxSelectionModal';
import ProgressResetModal from '../../components/dashboard/cards/ProgressResetModal';
import BoxEditModal from '../../components/social/BoxEditModal';
import StatusFilter from '../../components/ui/StatusFilter';
import ActionsMenu from '../../components/ui/ActionsMenu';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../contexts/ToastContext';
import {
    Plus,
    PlusCircle,
    Play,
    Presentation,
    RotateCcw,
    CheckSquare,
    X,
    Search,
    Edit,
    ArrowLeft,
    MoreHorizontal,
    Save,
    Edit2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/BoxCard.css';
import '../../assets/styles/BoxDetails.css';
import '../../assets/styles/ModernPage.css';
import '../../assets/styles/Migration.css';
import '../../assets/styles/ProgressReset.css';

function BoxDetails() {
    const { t } = useTranslation();
    const { boxId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { api } = useAuth();
    const { success, error: showError } = useToast();
    
    // State management
    const [loading, setLoading] = useState(true);
    const [box, setBox] = useState(null);
    const [cards, setCards] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [error, setError] = useState('');
    
    // Pagination (server-side)
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(10);
    const [totalCards, setTotalCards] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    // Inline editing
    const [editingCard, setEditingCard] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const editInputRef = useRef(null);
    
    // New card creation
    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const [newCardData, setNewCardData] = useState({
        front: '',
        back: '',
        extra: '',
        hint: ''
    });
    
    // Card migration
    const [selectedCards, setSelectedCards] = useState(new Set());
    const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
    const [migrationCardIds, setMigrationCardIds] = useState([]);
    const [bulkSelectMode, setBulkSelectMode] = useState(false);
    
    // Progress reset
    const [isProgressResetModalOpen, setIsProgressResetModalOpen] = useState(false);
    const [resetType, setResetType] = useState('card'); // 'card', 'box', 'bulk'
    
    // Box edit modal
    const [showBoxEditModal, setShowBoxEditModal] = useState(false);
    const [resetCardIds, setResetCardIds] = useState([]);
    
    // Box deletion
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch box and cards data with server-side pagination and filtering
    const fetchBoxData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Build query parameters for pagination, search, and filtering
            const params = new URLSearchParams({
                page: currentPage.toString(),
                page_size: cardsPerPage.toString(),
                sort_by: 'updated_at',
                sort_order: '-1' // Descending order
            });
            
            if (statusFilter && statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            
            if (debouncedSearchQuery.trim()) {
                params.append('search', debouncedSearchQuery.trim());
            }
            
            const [boxResponse, cardsResponse] = await Promise.all([
                api.get(`/dashboard/boxes/${boxId}`),
                api.get(`/dashboard/boxes/${boxId}/cards?${params.toString()}`)
            ]);
            
            setBox(boxResponse.data.data.box);
            setCards(cardsResponse.data.data.cards || []);
            
            // Set pagination metadata if available
            if (cardsResponse.data.data.pagination) {
                setTotalCards(cardsResponse.data.data.pagination.total);
                setTotalPages(cardsResponse.data.data.pagination.total_pages);
            } else {
                // Fallback for non-paginated response (backward compatibility)
                setTotalCards(cardsResponse.data.data.cards?.length || 0);
                setTotalPages(1);
            }
        } catch (error) {
            setError('Failed to load box details');
        } finally {
            setLoading(false);
        }
    }, [boxId, api, currentPage, cardsPerPage, statusFilter, debouncedSearchQuery]);

    // Fetch data when dependencies change
    useEffect(() => {
        if (boxId) {
            fetchBoxData();
        }
    }, [boxId, fetchBoxData]);

    // Debounce search query to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset to page 1 when filters or search query change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, debouncedSearchQuery]);

    // Inline editing functions
    const startEditing = (cardId, field, currentValue) => {
        setEditingCard(cardId);
        setEditingField(field);
        setEditValue(currentValue);
        setTimeout(() => {
            if (editInputRef.current) {
                editInputRef.current.focus();
            }
        }, 50);
    };

    const cancelEditing = () => {
        setEditingCard(null);
        setEditingField(null);
        setEditValue('');
    };

    const saveEdit = async (cardId, field) => {
        try {
            // Find the current card to get all its values
            const currentCard = cards.find(card => card.ID === cardId);
            if (!currentCard) {
                showError(t('cards.updateError'));
                return;
            }

            // Prepare update data with all required fields
            const updateData = {
                front: field === 'Front' ? editValue : (currentCard.Front || ''),
                back: field === 'Back' ? editValue : (currentCard.Back || ''),
                extra: field === 'Extra' ? editValue : (currentCard.Extra || ''),
                hint: field === 'Hint' ? editValue : (currentCard.Hint || '')
            };

            await api.put(`/dashboard/boxes/${boxId}/cards/${cardId}`, updateData);
            
            // Update local state
            setCards(cards.map(card => 
                card.ID === cardId 
                    ? { ...card, [field]: editValue }
                    : card
            ));
            
            cancelEditing();
            success(t('cards.updateSuccess'));
        } catch (error) {
            // Failed to update card - error handled by toast
            showError(t('cards.updateError'));
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (window.confirm(t('cards.deleteConfirm'))) {
            try {
                await api.delete(`/dashboard/boxes/${boxId}/cards/${cardId}`);
                setCards(cards.filter(card => card.ID !== cardId));
                success(t('cards.deleteSuccess'));
            } catch (error) {
                // Failed to delete card - error handled by toast
                showError(t('cards.deleteError'));
            }
        }
    };

    const handleArchiveCard = async (cardId) => {
        try {
            await api.post(`/dashboard/boxes/${boxId}/cards/${cardId}/archive`);
            await fetchBoxData(); // Refresh to update status
            success(t('cards.archiveSuccess'));
        } catch (error) {
            // Failed to archive card - error handled by toast
            showError(t('cards.archiveError'));
        }
    };

    const handleDeleteBox = async () => {
        if (window.confirm(t('dashboard.boxes.deleteConfirm'))) {
            setIsDeleting(true);
            try {
                await api.delete(`/dashboard/boxes/${boxId}`);
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

    // New card creation functions
    const startCreatingCard = () => {
        setIsCreatingCard(true);
        setNewCardData({ front: '', back: '', extra: '', hint: '' });
    };

    const cancelCreatingCard = () => {
        setIsCreatingCard(false);
        setNewCardData({ front: '', back: '', extra: '', hint: '' });
    };

    const saveNewCard = async () => {
        try {
            if (!newCardData.front.trim() || !newCardData.back.trim()) {
                showError(t('cards.frontBackRequired'));
                return;
            }

            await api.post(`/dashboard/boxes/${boxId}/cards`, newCardData);
            await fetchBoxData(); // Refresh to get the new card
            cancelCreatingCard();
            success(t('cards.createSuccess'));
        } catch (error) {
            showError(t('cards.createError'));
        }
    };

    const updateNewCardField = (field, value) => {
        setNewCardData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNewCardKeyPress = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (newCardData.front.trim() && newCardData.back.trim()) {
                saveNewCard();
            }
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            cancelCreatingCard();
        }
    };

    // Card migration functions
    const toggleCardSelection = (cardId) => {
        setSelectedCards(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(cardId)) {
                newSelection.delete(cardId);
            } else {
                newSelection.add(cardId);
            }
            return newSelection;
        });
    };

    const selectAllCards = () => {
        setSelectedCards(new Set(currentCards.map(card => card.ID)));
    };

    const clearSelection = () => {
        setSelectedCards(new Set());
        setBulkSelectMode(false);
    };

    const handleBoxUpdate = (updatedBox) => {
        setBox(updatedBox);
        // Optionally refresh the entire box data to ensure consistency
        // fetchBoxData(); // Uncomment if needed for full refresh
    };

    const handleSingleCardMigration = (cardId) => {
        setMigrationCardIds([cardId]);
        setIsMigrationModalOpen(true);
    };

    const handleBulkMigration = () => {
        if (selectedCards.size === 0) {
            showError(t('migration.noCardsSelected'));
            return;
        }
        setMigrationCardIds(Array.from(selectedCards));
        setIsMigrationModalOpen(true);
    };

    const handleMigrationConfirm = async ({ targetBoxId, preserveProgress, cardIds }) => {
        try {
            if (cardIds.length === 1) {
                // Single card migration
                await api.post(`/dashboard/boxes/${boxId}/cards/${cardIds[0]}/migrate`, {
                    target_box_id: targetBoxId,
                    preserve_progress: preserveProgress
                });
                success(t('migration.singleCardSuccess'));
            } else {
                // Bulk migration
                const response = await api.post('/dashboard/cards/bulk-migrate', {
                    card_ids: cardIds,
                    target_box_id: targetBoxId,
                    preserve_progress: preserveProgress
                });
                
                const result = response.data.data.migration_result;
                if (result.total_failed > 0) {
                    success(t('migration.bulkPartialSuccess', {
                        successful: result.total_successful,
                        failed: result.total_failed
                    }));
                } else {
                    success(t('migration.bulkSuccess', { count: result.total_successful }));
                }
            }
            
            // Refresh data and close modal
            await fetchBoxData();
            setIsMigrationModalOpen(false);
            clearSelection();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            showError(t('migration.error') + ': ' + errorMessage);
        }
    };

    const toggleBulkSelectMode = () => {
        setBulkSelectMode(!bulkSelectMode);
        if (bulkSelectMode) {
            clearSelection();
        }
    };

    // Progress Reset Handlers
    const handleSingleCardReset = (cardId) => {
        setResetType('card');
        setResetCardIds([cardId]);
        setIsProgressResetModalOpen(true);
    };

    const handleBulkReset = () => {
        if (selectedCards.size === 0) return;
        
        setResetType('bulk');
        setResetCardIds(Array.from(selectedCards));
        setIsProgressResetModalOpen(true);
    };

    const handleBoxReset = () => {
        setResetType('box');
        setResetCardIds([]);
        setIsProgressResetModalOpen(true);
    };

    const handleProgressResetConfirm = async (result) => {
        try {
            if (result.total_successful > 0) {
                if (result.total_failed > 0) {
                    success(t('progress_reset.partial_success', {
                        successful: result.total_successful,
                        failed: result.total_failed
                    }));
                } else {
                    success(t('progress_reset.success_message', { 
                        successful: result.total_successful,
                        total: result.total_requested 
                    }));
                }
            }
            
            // Refresh data and close modal
            await fetchBoxData();
            setIsProgressResetModalOpen(false);
            if (bulkSelectMode) {
                clearSelection();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            showError(t('progress_reset.error_message') + ': ' + errorMessage);
        }
    };

    // Pagination logic
    // With server-side pagination, cards already contains only the current page
    const currentCards = cards;
    const indexOfFirstCard = (currentPage - 1) * cardsPerPage;
    const indexOfLastCard = Math.min(indexOfFirstCard + cards.length, totalCards);

    const getCardStatusBadge = (card) => {
        if (!card.Review) return 'new';
        if (card.Review.ReviewsCount === 0) return 'new';
        if (card.Review.NextDueDate === null) return 'archived';
        if (card.Review.Interval < 7) return 'learning';
        return 'review';
    };

    const getCardStatusIcon = (card) => {
        const status = getCardStatusBadge(card);
        switch (status) {
            case 'new':
                return { icon: 'fas fa-circle', color: '#10b981', title: t('cards.new') };
            case 'learning':
                return { icon: 'fas fa-clock', color: '#f59e0b', title: t('cards.learning') };
            case 'review':
                return { icon: 'fas fa-sync', color: '#3b82f6', title: t('cards.review') };
            case 'archived':
                return { icon: 'fas fa-archive', color: '#6b7280', title: t('cards.archived') };
            default:
                return { icon: 'fas fa-question', color: '#6b7280', title: t('cards.unknown') };
        }
    };


    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '-';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        // Less than 1 minute
        if (diffInSeconds < 60) {
            return t('time.justNow');
        }
        
        // Less than 1 hour
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return t('time.minutesAgo', { count: minutes });
        }
        
        // Less than 24 hours
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return t('time.hoursAgo', { count: hours });
        }
        
        // Less than 7 days
        if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return t('time.daysAgo', { count: days });
        }
        
        // More than 7 days - show actual date
        return date.toLocaleDateString();
    };

    // Inline edit component
    const renderEditableField = (card, field, displayField = null) => {
        const isEditing = editingCard === card.ID && editingField === field;
        const value = card[field] || '';
        const displayValue = displayField ? card[displayField] : value;

        if (isEditing) {
            return (
                <div className="inline-edit-container">
                    <textarea
                        ref={editInputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                                saveEdit(card.ID, field);
                            } else if (e.key === 'Escape') {
                                cancelEditing();
                            }
                        }}
                        className="inline-edit-textarea"
                        rows={3}
                    />
                    <div className="inline-edit-actions">
                        <button 
                            onClick={() => saveEdit(card.ID, field)}
                            className="btn btn-sm btn-primary"
                        >
                            <i className="fas fa-check"></i>
                        </button>
                        <button 
                            onClick={cancelEditing}
                            className="btn btn-sm btn-secondary"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div 
                className="editable-field"
                onClick={() => startEditing(card.ID, field, value)}
                title={t('cards.clickToEdit')}
            >
                <MarkdownContent content={displayValue || t('cards.empty')} />
                <i className="fas fa-edit edit-icon"></i>
            </div>
        );
    };

    // Render compact new card creation form
    const renderNewCardForm = () => {
        if (!isCreatingCard) return null;

        return (
            <div className="fast-card-creator">
                <div className="fast-card-overlay" onClick={cancelCreatingCard}></div>
                <div className="fast-card-form">
                    <div className="fast-card-header">
                        <div className="fast-card-title">
                            <i className="fas fa-plus-circle"></i>
                            {t('cards.quickAdd')}
                        </div>
                        <button 
                            className="fast-card-close"
                            onClick={cancelCreatingCard}
                            title={t('common.cancel')}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div className="fast-card-fields">
                        <div className="fast-field">
                            <label className="fast-field-label">
                                {t('cards.front')} <span className="required">*</span>
                            </label>
                            <textarea
                                value={newCardData.front}
                                onChange={(e) => updateNewCardField('front', e.target.value)}
                                onKeyDown={handleNewCardKeyPress}
                                placeholder={t('cards.frontPlaceholder')}
                                className="fast-field-input"
                                rows={2}
                                autoFocus
                            />
                        </div>
                        
                        <div className="fast-field">
                            <label className="fast-field-label">
                                {t('cards.back')} <span className="required">*</span>
                            </label>
                            <textarea
                                value={newCardData.back}
                                onChange={(e) => updateNewCardField('back', e.target.value)}
                                onKeyDown={handleNewCardKeyPress}
                                placeholder={t('cards.backPlaceholder')}
                                className="fast-field-input"
                                rows={2}
                            />
                        </div>
                        
                        <div className="fast-field">
                            <label className="fast-field-label">{t('cards.extra')}</label>
                            <textarea
                                value={newCardData.extra}
                                onChange={(e) => updateNewCardField('extra', e.target.value)}
                                onKeyDown={handleNewCardKeyPress}
                                placeholder={t('cards.extraPlaceholder')}
                                className="fast-field-input"
                                rows={2}
                            />
                        </div>
                        
                        <div className="fast-field">
                            <label className="fast-field-label">{t('cards.hint')}</label>
                            <textarea
                                value={newCardData.hint}
                                onChange={(e) => updateNewCardField('hint', e.target.value)}
                                onKeyDown={handleNewCardKeyPress}
                                placeholder={t('cards.hintPlaceholder')}
                                className="fast-field-input"
                                rows={2}
                            />
                        </div>
                    </div>
                    
                    <div className="fast-card-actions">
                        <div className="fast-card-hint">
                            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> {t('cardCreate.toSave')}
                        </div>
                        <div className="fast-card-buttons">
                            <button 
                                onClick={cancelCreatingCard}
                                className="fast-btn fast-btn-cancel"
                            >
                                {t('common.cancel')}
                            </button>
                            <button 
                                onClick={saveNewCard}
                                className={`fast-btn fast-btn-save ${
                                    newCardData.front.trim() && newCardData.back.trim() ? 'ready' : ''
                                }`}
                                disabled={!newCardData.front.trim() || !newCardData.back.trim()}
                            >
                                <i className="fas fa-check"></i>
                                {t('common.save')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <ModernContainer>
                <div className="modern-page-container">
                    <div className="modern-title-bar">
                        <div className="modern-title-content">
                            <div className="modern-page-title">
                                <h1>{t('common.loading')}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="modern-content-area">
                        <div className="modern-content-box">
                            <div className="modern-content-scroll">
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <span>{t('common.loading')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModernContainer>
        );
    }

    if (error) {
        return (
            <ModernContainer>
                <div className="modern-page-container">
                    <div className="modern-title-bar">
                        <div className="modern-title-content">
                            <button 
                                className="modern-back-button"
                                onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                                title={t('common.backToDashboard')}
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <div className="modern-page-title">
                                <h1>{t('common.error')}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="modern-content-area">
                        <div className="modern-content-box">
                            <div className="modern-content-scroll">
                                <div className="error-state">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <h2>{t('common.error')}</h2>
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModernContainer>
        );
    }

    return (
        <ModernContainer>
            <div className="modern-page-container">
                {/* Fixed Title Bar */}
                <div className="modern-title-bar">
                    <div className="modern-title-content">
                        <button 
                            className="modern-back-button"
                            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                            title={t('common.backToDashboard')}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className="modern-page-title">
                            <h1>{box?.Name || t('boxDetails.title')}</h1>
                            {box?.Description && <span className="subtitle">{box.Description}</span>}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="modern-content-area">
                    <div className="modern-content-box">
                        <div className="modern-content-scroll">
                            <div className="box-details-content">
                            {/* Box Actions Bar */}
                            <div className="box-actions-bar">
                                <div className="box-actions-left">
                                    <div className="action-buttons-compact">
                                        <button 
                                            className="compact-btn compact-btn-primary"
                                            onClick={() => setShowBoxEditModal(true)}
                                            title={t('boxDetails.editBox')}
                                        >
                                            <i className="fas fa-edit"></i>
                                            <span className="action-text">{t('boxDetails.editBox')}</span>
                                        </button>
                                        <button 
                                            className="compact-btn compact-btn-danger"
                                            onClick={handleDeleteBox}
                                            disabled={isDeleting}
                                            title={t('dashboard.boxes.actions.delete')}
                                        >
                                            <i className="fas fa-trash"></i>
                                            <span className="action-text">{t('dashboard.boxes.actions.delete')}</span>
                                        </button>
                                        <button 
                                            onClick={startCreatingCard} 
                                            className="compact-btn compact-btn-primary"
                                            disabled={isCreatingCard}
                                        >
                                            <i className="fas fa-plus"></i>
                                            <span className="action-text">{t('cards.addQuick')}</span>
                                        </button>
                                        <Link 
                                            to={`/box/${boxId}/cards/create`} 
                                            state={{ from: location.pathname }}
                                            className="compact-btn compact-btn-outline"
                                        >
                                            <i className="fas fa-plus-circle"></i>
                                            <span className="action-text">{t('cards.addDetailed')}</span>
                                        </Link>
                                        <Link to={`/box/${boxId}/review`} className="compact-btn compact-btn-success">
                                            <i className="fas fa-play"></i>
                                            <span className="action-text">{t('review.start')}</span>
                                        </Link>
                                        <Link to={`/box/${boxId}/presentation`} className="compact-btn compact-btn-presentation">
                                            <i className="fas fa-slideshare"></i>
                                            <span className="action-text">{t('presentation.start')}</span>
                                        </Link>
                                        <button 
                                            onClick={handleBoxReset}
                                            className="compact-btn compact-btn-danger"
                                            title={t('progress_reset.box_reset_warning')}
                                        >
                                            <i className="fas fa-undo-alt"></i>
                                            <span className="action-text">{t('progress_reset.box_reset')}</span>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Bulk Actions in same bar */}
                                <div className="box-actions-right">
                                    <button 
                                        onClick={toggleBulkSelectMode}
                                        className={`compact-btn ${bulkSelectMode ? 'compact-btn-primary' : 'compact-btn-outline'}`}
                                    >
                                        <i className={`fas ${bulkSelectMode ? 'fa-times' : 'fa-check-square'}`}></i>
                                        <span className="action-text">{bulkSelectMode ? t('cards.exitBulkSelect') : t('cards.bulkSelect')}</span>
                                    </button>
                                    
                                    {bulkSelectMode && (
                                        <>
                                            <button 
                                                onClick={selectAllCards}
                                                className="compact-btn compact-btn-outline"
                                                disabled={selectedCards.size === currentCards.length}
                                            >
                                                <i className="fas fa-check-double"></i>
                                                <span className="action-text">{t('cards.selectAll')}</span>
                                            </button>
                                            <button 
                                                onClick={clearSelection}
                                                className="compact-btn compact-btn-outline"
                                                disabled={selectedCards.size === 0}
                                            >
                                                <i className="fas fa-times"></i>
                                                <span className="action-text">{t('cards.clearSelection')}</span>
                                            </button>
                                            
                                            {selectedCards.size > 0 && (
                                                <>
                                                    <button 
                                                        onClick={handleBulkMigration}
                                                        className="compact-btn compact-btn-warning"
                                                        disabled={selectedCards.size === 0}
                                                    >
                                                        <i className="fas fa-arrow-right"></i>
                                                        <span className="action-text">{t('migration.migrateSelected', { count: selectedCards.size })}</span>
                                                    </button>
                                                    <button 
                                                        onClick={handleBulkReset}
                                                        className="compact-btn compact-btn-danger"
                                                        disabled={selectedCards.size === 0}
                                                    >
                                                        <i className="fas fa-undo-alt"></i>
                                                        <span className="action-text">{t('progress_reset.bulk_reset')} ({selectedCards.size})</span>
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Card Filtering & Search Bar */}
                            <div className="card-filter-bar">
                                <div className="filter-bar-left">
                                    <div className="stats-compact">
                                        <span className="stat-compact">
                                            <i className="fas fa-layer-group"></i>
                                            {totalCards} {t('cards.total')}
                                        </span>
                                        {selectedCards.size > 0 && (
                                            <span className="stat-compact selected">
                                                <i className="fas fa-check-square"></i>
                                                {selectedCards.size} {t('cards.selected')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="filter-bar-right">
                                    <div className="search-box-compact">
                                        <i className="fas fa-search"></i>
                                        <input
                                            type="text"
                                            placeholder={t('cards.searchPlaceholder')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="search-input-compact"
                                        />
                                        {searchQuery && (
                                            <button 
                                                onClick={() => setSearchQuery('')}
                                                className="clear-search-compact"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        )}
                                    </div>
                                    <StatusFilter 
                                        value={statusFilter}
                                        onChange={setStatusFilter}
                                    />
                                </div>
                            </div>


                            {/* Cards Table */}
                            {totalCards === 0 && !isCreatingCard ? (
                                <div className="empty-state-modern">
                                    <div className="empty-icon">
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <h3>{searchQuery ? t('cards.noSearchResults') : t('cards.noCards')}</h3>
                                    <p>
                                        {searchQuery 
                                            ? t('cards.tryDifferentSearch')
                                            : (statusFilter && statusFilter !== 'all')
                                                ? t('cards.noCardsWithFilter')
                                                : t('cards.createFirstDescription')
                                        }
                                    </p>
                                    {!searchQuery && (!statusFilter || statusFilter === 'all') && (
                                        <div className="empty-state-buttons">
                                            <button 
                                                onClick={startCreatingCard} 
                                                className="btn btn-primary"
                                                disabled={isCreatingCard}
                                            >
                                                <i className="fas fa-plus"></i>
                                                {t('cards.addQuick')}
                                            </button>
                                            <Link 
                                                to={`/box/${boxId}/cards/create`} 
                                                state={{ from: location.pathname }}
                                                className="btn btn-outline-primary"
                                            >
                                                <i className="fas fa-plus-circle"></i>
                                                {t('cards.addDetailed')}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className={`cards-table ${bulkSelectMode ? 'bulk-select-mode' : ''}`}>
                                        <div className="table-header">
                                            {bulkSelectMode && (
                                                <div className="col-select">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCards.size === currentCards.length && currentCards.length > 0}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                selectAllCards();
                                                            } else {
                                                                clearSelection();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                            <div className="col-status">{t('cards.status')}</div>
                            <div className="col-front">{t('cards.front')}</div>
                            <div className="col-back">{t('cards.back')}</div>
                            <div className="col-extra">{t('cards.extra')}</div>
                            <div className="col-hint">{t('cards.hint')}</div>
                            <div className="col-timestamp">{t('cards.lastModified')}</div>
                            <div className="col-actions">{t('cards.actions')}</div>
                                        </div>
                                        
                                        {/* Fast card creator form */}
                                        
                                        {currentCards.map(card => (
                                            <div key={card.ID} className={`table-row ${selectedCards.has(card.ID) ? 'selected' : ''}`}>
                                                {bulkSelectMode && (
                                                    <div className="col-select">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCards.has(card.ID)}
                                                            onChange={() => toggleCardSelection(card.ID)}
                                                        />
                                                    </div>
                                                )}
                                                <div className="col-status">
                                                    {(() => {
                                                        const statusInfo = getCardStatusIcon(card);
                                                        return (
                                                            <span 
                                                                className="status-icon-simple"
                                                                title={statusInfo.title}
                                                                style={{ color: statusInfo.color }}
                                                            >
                                                                <i className={statusInfo.icon}></i>
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                                <div className="col-front">
                                                    {renderEditableField(card, 'Front')}
                                                </div>
                                                <div className="col-back">
                                                    {renderEditableField(card, 'Back')}
                                                </div>
                                                <div className="col-extra">
                                                    {renderEditableField(card, 'Extra')}
                                                </div>
                                                <div className="col-hint">
                                                    {renderEditableField(card, 'Hint')}
                                                </div>
                                                <div className="col-timestamp">
                                                    <div className="timestamp-info">
                                                        <div className="timestamp-main">
                                                            {formatTimestamp(card.UpdatedAt)}
                                                        </div>
                                                        {card.CreatedAt !== card.UpdatedAt && (
                                                            <div className="timestamp-created">
                                                                {t('cards.created')}: {formatTimestamp(card.CreatedAt)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-actions">
                                                    <ActionsMenu
                                                        buttonContent={
                                                            <>
                                                                <i className="fas fa-ellipsis-h"></i>
                                                                <span className="action-label">{t('cards.actions')}</span>
                                                            </>
                                                        }
                                                        buttonClassName="card-action-btn actions-btn"
                                                        actions={[
                                                            {
                                                                id: 'edit',
                                                                label: t('cards.edit'),
                                                                icon: 'fa-edit',
                                                                onClick: () => {
                                                                    window.location.href = `/dashboard/box/${boxId}/cards/${card.ID}/edit`;
                                                                }
                                                            },
                                                            {
                                                                id: 'migrate',
                                                                label: t('migration.move_to_box'),
                                                                icon: 'fa-arrow-right',
                                                                onClick: () => handleSingleCardMigration(card.ID)
                                                            },
                                                            {
                                                                id: 'reset',
                                                                label: 'Reset',
                                                                icon: 'fa-undo-alt',
                                                                onClick: () => handleSingleCardReset(card.ID)
                                                            },
                                                            {
                                                                id: 'archive',
                                                                label: t('cards.archive'),
                                                                icon: 'fa-archive',
                                                                onClick: () => handleArchiveCard(card.ID)
                                                            },
                                                            { divider: true },
                                                            {
                                                                id: 'delete',
                                                                label: t('cards.delete'),
                                                                icon: 'fa-trash-alt',
                                                                danger: true,
                                                                onClick: () => handleDeleteCard(card.ID)
                                                            }
                                                        ]}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="pagination">
                                            <div className="pagination-info">
                                                {t('pagination.showing', {
                                                    start: indexOfFirstCard + 1,
                                                    end: indexOfLastCard,
                                                    total: totalCards
                                                })}
                                            </div>
                                            <div className="pagination-controls">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                    className="pagination-btn"
                                                >
                                                    <i className="fas fa-chevron-left"></i>
                                                </button>
                                                
                                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                    .filter(page => 
                                                        page === 1 || 
                                                        page === totalPages || 
                                                        Math.abs(page - currentPage) <= 2
                                                    )
                                                    .map((page, index, array) => (
                                                        <React.Fragment key={page}>
                                                            {index > 0 && array[index - 1] !== page - 1 && (
                                                                <span className="pagination-ellipsis">...</span>
                                                            )}
                                                            <button
                                                                onClick={() => setCurrentPage(page)}
                                                                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                                                            >
                                                                {page}
                                                            </button>
                                                        </React.Fragment>
                                                    ))
                                                }
                                                
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="pagination-btn"
                                                >
                                                    <i className="fas fa-chevron-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Fast Card Creator */}
            {renderNewCardForm()}
            
            {/* Migration Modal */}
            <BoxSelectionModal
                isOpen={isMigrationModalOpen}
                onClose={() => setIsMigrationModalOpen(false)}
                onConfirm={handleMigrationConfirm}
                cardIds={migrationCardIds}
                currentBoxId={boxId}
            />
            
            {/* Progress Reset Modal */}
            <ProgressResetModal
                isOpen={isProgressResetModalOpen}
                onClose={() => setIsProgressResetModalOpen(false)}
                onConfirm={handleProgressResetConfirm}
                resetType={resetType}
                cardIds={resetCardIds}
                boxId={resetType === 'box' ? boxId : null}
                currentBoxId={boxId}
            />
            
            {/* Box Edit Modal */}
            <BoxEditModal
                box={box}
                isOpen={showBoxEditModal}
                onClose={() => setShowBoxEditModal(false)}
                onBoxUpdate={handleBoxUpdate}
            />
        </ModernContainer>
    );
}

export default BoxDetails;
