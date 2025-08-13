import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import DashboardContainer from '../../components/layout/DashboardContainer';
import PageHeader from '../../components/common/PageHeader';
import PageTransition from '../../components/common/PageTransition';
import MarkdownContent from '../../components/common/MarkdownContent';
import { useToast } from '../../contexts/ToastContext';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/BoxCard.css';
import '../../assets/styles/BoxDetails.css';

function BoxDetails() {
    const { t } = useTranslation();
    const { boxId } = useParams();
    const { api } = useAuth();
    const { success, error: showError } = useToast();
    
    // State management
    const [loading, setLoading] = useState(true);
    const [box, setBox] = useState(null);
    const [cards, setCards] = useState([]);
    const [filteredCards, setFilteredCards] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(10);
    
    // Inline editing
    const [editingCard, setEditingCard] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const editInputRef = useRef(null);

    // Fetch box and cards data
    const fetchBoxData = async () => {
        try {
            setLoading(true);
            const [boxResponse, cardsResponse] = await Promise.all([
                api.get(`/dashboard/boxes/${boxId}`),
                api.get(`/dashboard/boxes/${boxId}/cards`)
            ]);
            
            setBox(boxResponse.data.data.box);
            setCards(cardsResponse.data.data.cards || []);
        } catch (error) {
            console.error('Failed to fetch box data:', error);
            setError('Failed to load box details');
        } finally {
            setLoading(false);
        }
    };

    // Filter and search cards
    useEffect(() => {
        let filtered = cards;
        
        // Apply status filter
        if (statusFilter) {
            filtered = filtered.filter(card => getCardStatusBadge(card) === statusFilter);
        }
        
        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(card => 
                card.Front.toLowerCase().includes(query) ||
                card.Back.toLowerCase().includes(query) ||
                (card.Extra && card.Extra.toLowerCase().includes(query))
            );
        }
        
        setFilteredCards(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [cards, statusFilter, searchQuery]);

    useEffect(() => {
        if (boxId) {
            fetchBoxData();
        }
    }, [boxId]);

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
            const updateData = { [field]: editValue };
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
            console.error('Failed to update card:', error);
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
                console.error('Failed to delete card:', error);
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
            console.error('Failed to archive card:', error);
            showError(t('cards.archiveError'));
        }
    };

    // Pagination logic
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);
    const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

    const getCardStatusBadge = (card) => {
        if (!card.Review) return 'new';
        if (card.Review.ReviewsCount === 0) return 'new';
        if (card.Review.NextDueDate === null) return 'archived';
        if (card.Review.Interval < 7) return 'learning';
        return 'review';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#3b82f6';
            case 'learning': return '#f59e0b';
            case 'review': return '#10b981';
            case 'archived': return '#6b7280';
            default: return '#6b7280';
        }
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

    if (loading) {
        return (
            <PageTransition>
                <DashboardContainer>
                    <div className="dashboard-container">
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <span>{t('common.loading')}</span>
                        </div>
                    </div>
                </DashboardContainer>
            </PageTransition>
        );
    }

    if (error) {
        return (
            <PageTransition>
                <DashboardContainer>
                    <div className="dashboard-container">
                        <div className="error-state">
                            <i className="fas fa-exclamation-triangle"></i>
                            <h2>{t('common.error')}</h2>
                            <p>{error}</p>
                        </div>
                    </div>
                </DashboardContainer>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <DashboardContainer>
                <div className="dashboard-container">
                    <PageHeader 
                        title={box?.Name || t('boxDetails.title')} 
                        subtitle={box?.Description}
                    />
                    
                    <div className="dashboard-content">
                        <div className="box-details-content">
                            {/* Action Bar */}
                            <div className="action-bar">
                                <div className="action-buttons">
                                    <Link to={`/box/${boxId}/cards/create`} className="btn btn-primary">
                                        <i className="fas fa-plus"></i>
                                        {t('cards.add')}
                                    </Link>
                                    <Link to={`/box/${boxId}/review`} className="btn btn-outline-primary">
                                        <i className="fas fa-play"></i>
                                        {t('review.start')}
                                    </Link>
                                </div>
                                <div className="stats-summary">
                                    <span className="stat-item">
                                        <i className="fas fa-layer-group"></i>
                                        {filteredCards.length} {t('cards.total')}
                                    </span>
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="search-filter-bar">
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input
                                        type="text"
                                        placeholder={t('cards.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />
                                    {searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery('')}
                                            className="clear-search"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="filter-pills">
                                    {['', 'new', 'learning', 'review', 'archived'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                                        >
                                            {status ? t(`cards.${status}`) : t('cards.all')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cards Table */}
                            {filteredCards.length === 0 ? (
                                <div className="empty-state-modern">
                                    <div className="empty-icon">
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <h3>{searchQuery ? t('cards.noSearchResults') : t('cards.noCards')}</h3>
                                    <p>
                                        {searchQuery 
                                            ? t('cards.tryDifferentSearch')
                                            : statusFilter 
                                                ? t('cards.noCardsWithFilter')
                                                : t('cards.createFirstDescription')
                                        }
                                    </p>
                                    {!searchQuery && !statusFilter && (
                                        <Link to={`/box/${boxId}/cards/create`} className="btn btn-primary">
                                            <i className="fas fa-plus"></i>
                                            {t('cards.createFirst')}
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="cards-table">
                                        <div className="table-header">
                                            <div className="col-status">{t('cards.status')}</div>
                                            <div className="col-front">{t('cards.front')}</div>
                                            <div className="col-back">{t('cards.back')}</div>
                                            <div className="col-extra">{t('cards.extra')}</div>
                                            <div className="col-actions">{t('cards.actions')}</div>
                                        </div>
                                        
                                        {currentCards.map(card => (
                                            <div key={card.ID} className="table-row">
                                                <div className="col-status">
                                                    <span 
                                                        className={`status-badge status-${getCardStatusBadge(card)}`}
                                                    >
                                                        {t(`cards.${getCardStatusBadge(card)}`)}
                                                    </span>
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
                                                <div className="col-actions">
                                                    <div className="action-buttons-group">
                                                        <Link 
                                                            to={`/box/${boxId}/cards/${card.ID}/edit`}
                                                            className="action-btn edit"
                                                            title={t('cards.edit')}
                                                        >
                                                            <i className="fas fa-external-link-alt"></i>
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleArchiveCard(card.ID)}
                                                            className="action-btn archive"
                                                            title={t('cards.archive')}
                                                        >
                                                            <i className="fas fa-archive"></i>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteCard(card.ID)}
                                                            className="action-btn delete"
                                                            title={t('cards.delete')}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
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
                                                    end: Math.min(indexOfLastCard, filteredCards.length),
                                                    total: filteredCards.length
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
            </DashboardContainer>
        </PageTransition>
    );
}

export default BoxDetails;
