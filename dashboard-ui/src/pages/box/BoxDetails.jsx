import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import DashboardContainer from '../../components/layout/DashboardContainer';
import PageHeader from '../../components/common/PageHeader';
import PageTransition from '../../components/common/PageTransition';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/BoxCard.css';

function BoxDetails() {
    const { t } = useTranslation();
    const { boxId } = useParams();
    const { api } = useAuth();
    const [loading, setLoading] = useState(true);
    const [box, setBox] = useState(null);
    const [cards, setCards] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [error, setError] = useState('');

    const fetchBoxData = async () => {
        try {
            setLoading(true);
            const [boxResponse, cardsResponse] = await Promise.all([
                api.get(`/dashboard/boxes/${boxId}`),
                api.get(`/dashboard/boxes/${boxId}/cards${statusFilter ? `?status=${statusFilter}` : ''}`)
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

    useEffect(() => {
        if (boxId) {
            fetchBoxData();
        }
    }, [boxId, statusFilter]);

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
    };

    const handleDeleteCard = async (cardId) => {
        if (window.confirm(t('cards.deleteConfirm'))) {
            try {
                await api.delete(`/dashboard/boxes/${boxId}/cards/${cardId}`);
                await fetchBoxData(); // Refresh the cards list
            } catch (error) {
                console.error('Failed to delete card:', error);
                setError('Failed to delete card');
            }
        }
    };

    const handleArchiveCard = async (cardId) => {
        try {
            await api.post(`/dashboard/boxes/${boxId}/cards/${cardId}/archive`);
            await fetchBoxData(); // Refresh the cards list
        } catch (error) {
            console.error('Failed to archive card:', error);
            setError('Failed to archive card');
        }
    };

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

    if (loading) {
        return (
            <PageTransition>
                <DashboardContainer>
                    <div className="dashboard-container">
                        <div className="dashboard-header">
                            <h1 className="dashboard-title">{t('common.loading')}</h1>
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
                        <div className="dashboard-header">
                            <h1 className="dashboard-title">{t('common.error')}</h1>
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
                        {/* Action Buttons */}
                        <div className="box-actions" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <Link 
                                to={`/box/${boxId}/cards/create`} 
                                className="button button-primary"
                            >
                                <i className="fas fa-plus"></i>
                                {t('cards.add')}
                            </Link>
                            <Link 
                                to={`/box/${boxId}/review`} 
                                className="button button-outline-primary"
                            >
                                <i className="fas fa-play"></i>
                                {t('review.start')}
                            </Link>
                        </div>

                        {/* Filter Buttons */}
                        <div className="filter-section" style={{ marginBottom: '2rem' }}>
                            <h3>{t('cards.filterByStatus')}</h3>
                            <div className="filter-buttons" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button 
                                    className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
                                    onClick={() => handleStatusFilterChange('')}
                                >
                                    {t('cards.all')}
                                </button>
                                <button 
                                    className={`filter-btn ${statusFilter === 'new' ? 'active' : ''}`}
                                    onClick={() => handleStatusFilterChange('new')}
                                >
                                    {t('cards.new')}
                                </button>
                                <button 
                                    className={`filter-btn ${statusFilter === 'learning' ? 'active' : ''}`}
                                    onClick={() => handleStatusFilterChange('learning')}
                                >
                                    {t('cards.learning')}
                                </button>
                                <button 
                                    className={`filter-btn ${statusFilter === 'review' ? 'active' : ''}`}
                                    onClick={() => handleStatusFilterChange('review')}
                                >
                                    {t('cards.review')}
                                </button>
                                <button 
                                    className={`filter-btn ${statusFilter === 'archived' ? 'active' : ''}`}
                                    onClick={() => handleStatusFilterChange('archived')}
                                >
                                    {t('cards.archived')}
                                </button>
                            </div>
                        </div>

                        {/* Cards List */}
                        <div className="cards-section">
                            <h3>{t('cards.title')} ({cards.length})</h3>
                            
                            {cards.length === 0 ? (
                                <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                                    <i className="fas fa-cards-blank fa-3x" style={{ marginBottom: '1rem' }}></i>
                                    <p>{statusFilter ? t('cards.noCardsWithFilter') : t('cards.noCards')}</p>
                                    <Link to={`/box/${boxId}/card/create`} className="button button-primary">
                                        {t('cards.createFirst')}
                                    </Link>
                                </div>
                            ) : (
                                <div className="cards-grid" style={{ display: 'grid', gap: '1rem' }}>
                                    {cards.map(card => (
                                        <div key={card.ID} className="card-item" style={{ 
                                            background: 'white', 
                                            border: '1px solid #e5e7eb', 
                                            borderRadius: '8px', 
                                            padding: '1.5rem',
                                            transition: 'box-shadow 0.2s'
                                        }}>
                                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div className="card-content" style={{ flex: 1 }}>
                                                    <div className="card-front" style={{ marginBottom: '0.5rem' }}>
                                                        <strong>{t('cards.front')}:</strong> {card.Front}
                                                    </div>
                                                    <div className="card-back" style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
                                                        <strong>{t('cards.back')}:</strong> {card.Back}
                                                    </div>
                                                    {card.Extra && (
                                                        <div className="card-extra" style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                                                            <strong>{t('cards.extra')}:</strong> {card.Extra}
                                                        </div>
                                                    )}
                                                </div>
                                                <span 
                                                    className="status-badge" 
                                                    style={{ 
                                                        background: getStatusColor(getCardStatusBadge(card)), 
                                                        color: 'white', 
                                                        padding: '0.25rem 0.75rem', 
                                                        borderRadius: '1rem', 
                                                        fontSize: '0.75rem',
                                                        textTransform: 'capitalize'
                                                    }}
                                                >
                                                    {t(`cards.${getCardStatusBadge(card)}`)}
                                                </span>
                                            </div>
                                            
                                            <div className="card-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <Link 
                                                    to={`/box/${boxId}/card/${card.ID}/edit`} 
                                                    className="btn-small btn-outline"
                                                    title={t('cards.edit')}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </Link>
                                                <button 
                                                    onClick={() => handleArchiveCard(card.ID)}
                                                    className="btn-small btn-outline"
                                                    title={t('cards.archive')}
                                                >
                                                    <i className="fas fa-archive"></i>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteCard(card.ID)}
                                                    className="btn-small btn-danger"
                                                    title={t('cards.delete')}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardContainer>
        </PageTransition>
    );
}

export default BoxDetails;
