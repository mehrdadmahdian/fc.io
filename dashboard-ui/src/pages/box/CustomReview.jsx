import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReviewContainer from '../../components/layout/ReviewContainer';
import PageHeader from '../../components/common/PageHeader';
import ReviewCard from '../../components/dashboard/boxes/review/ReviewCard';
import ReviewProgress from '../../components/dashboard/boxes/review/ReviewProgress';
import CustomReviewFilters from '../../components/dashboard/boxes/review/CustomReviewFilters';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/Review.css';
import '../../assets/styles/CompactReview.css';
import '../../assets/styles/CustomReview.css';
import { api } from '../../services/api';

function CustomReview() {
    const { t } = useTranslation();
    const [currentCard, setCurrentCard] = useState(0);
    const [totalCards, setTotalCards] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState({
        boxId: '',
        labelIds: [],
        bookmarked: false,
        difficulty: [],
        shuffle: true,
        limit: 50
    });
    const [availableBoxes, setAvailableBoxes] = useState([]);
    const [availableLabels, setAvailableLabels] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAvailableBoxes();
    }, []);

    const fetchAvailableBoxes = async () => {
        try {
            const response = await api.get('/dashboard/boxes');
            if (response.data.status === 'success') {
                setAvailableBoxes(response.data.data.boxes || []);
            }
        } catch (err) {
            console.error('Failed to fetch boxes:', err);
        }
    };

    const fetchAvailableLabels = async (boxId) => {
        if (!boxId) {
            setAvailableLabels([]);
            return;
        }
        try {
            const response = await api.get(`/dashboard/boxes/${boxId}/labels`);
            if (response.data.status === 'success') {
                setAvailableLabels(response.data.data.labels || []);
            }
        } catch (err) {
            console.error('Failed to fetch labels:', err);
            setAvailableLabels([]);
        }
    };

    const handleBoxChange = (boxId) => {
        setFilters(prev => ({ ...prev, boxId, labelIds: [] }));
        fetchAvailableLabels(boxId);
    };

    const fetchCustomReviewData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/dashboard/review/custom', filters);
            if (response.data.status === 'success') {
                if (!response.data.data.cards || response.data.data.cards.length === 0) {
                    setReviewData(null);
                    setTotalCards(0);
                } else {
                    setReviewData({
                        cards: response.data.data.cards,
                    });
                    setTotalCards(response.data.data.totalCards);
                    setCurrentCard(0);
                    setShowAnswer(false);
                }
            } else {
                setError('Failed to fetch custom review data');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStartReview = () => {
        setShowFilters(false);
        fetchCustomReviewData();
    };

    const handleBackToFilters = () => {
        setShowFilters(true);
        setReviewData(null);
        setCurrentCard(0);
        setTotalCards(0);
        setShowAnswer(false);
    };

    const handleNext = () => {
        setShowAnswer(false);
        if (currentCard < totalCards - 1) {
            setCurrentCard(prev => prev + 1);
        } else {
            alert(`Review completed! You've reviewed ${currentCard + 1} cards.`);
            handleBackToFilters();
        }
    };

    const handlePrevious = () => {
        setShowAnswer(false);
        if (currentCard > 0) {
            setCurrentCard(prev => prev - 1);
        }
    };

    const handleShuffle = () => {
        fetchCustomReviewData();
    };

    const handleToggleBookmark = async () => {
        try {
            const currentCardId = reviewData.cards[currentCard].ID;
            await api.post(`/dashboard/cards/${currentCardId}/bookmark`, {
                card_id: currentCardId
            });
            
            // Update the card's bookmark status in the local state
            setReviewData(prev => ({
                ...prev,
                cards: prev.cards.map((card, index) => 
                    index === currentCard 
                        ? { ...card, IsBookmarked: !card.IsBookmarked }
                        : card
                )
            }));
            
            setNotification(
                reviewData.cards[currentCard].IsBookmarked 
                    ? t('review.bookmarkRemoved') 
                    : t('review.bookmarkAdded')
            );
            setTimeout(() => setNotification(null), 3000);
        } catch (err) {
            console.error('Failed to toggle bookmark:', err);
        }
    };

    if (showFilters) {
        return (
            <ReviewContainer>
                <div className="dashboard-container">
                    <PageHeader title={t('customReview.title')} />
                    <div className="dashboard-content">
                        <div className="dashboard-box">
                            <CustomReviewFilters
                                filters={filters}
                                onFiltersChange={setFilters}
                                onBoxChange={handleBoxChange}
                                availableBoxes={availableBoxes}
                                availableLabels={availableLabels}
                                onStartReview={handleStartReview}
                                loading={loading}
                            />
                        </div>
                    </div>
                </div>
            </ReviewContainer>
        );
    }

    if (loading) {
        return (
            <ReviewContainer>
                <div className="dashboard-container">
                    <div className="loading-state">
                        {t('common.loading')}...
                    </div>
                </div>
            </ReviewContainer>
        );
    }

    if (error) {
        return (
            <ReviewContainer>
                <div className="dashboard-container">
                    <div className="error-state">
                        {t('common.error')}: {error}
                    </div>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleBackToFilters}
                    >
                        {t('common.back')}
                    </button>
                </div>
            </ReviewContainer>
        );
    }

    if (!reviewData || !reviewData.cards || reviewData.cards.length === 0) {
        return (
            <ReviewContainer>
                <div className="dashboard-container">
                    <PageHeader title={t('customReview.title')} />
                    <div className="dashboard-content">
                        <div className="dashboard-box">
                            <div className="review-content empty">
                                <div className="empty-state">
                                    <h3>{t('customReview.noCards.title')}</h3>
                                    <p>{t('customReview.noCards.message')}</p>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={handleBackToFilters}
                                    >
                                        {t('common.back')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ReviewContainer>
        );
    }

    return (
        <ReviewContainer>
            <div className="compact-review-container">
                {/* Fixed Title Bar */}
                <div className="fixed-title-bar">
                    <div className="title-content">
                        <button 
                            className="back-button"
                            onClick={handleBackToFilters}
                            title={t('common.back')}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className="page-title">
                            <h1>{t('customReview.title')}</h1>
                        </div>
                        <div className="review-actions">
                            <button 
                                className="btn btn-secondary btn-sm"
                                onClick={handleShuffle}
                                title={t('customReview.shuffle')}
                            >
                                <i className="fas fa-random"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fixed Progress Bar */}
                <div className={`fixed-progress-bar ${showAnswer ? 'show-answer' : ''}`}>
                    <div className="progress-content">
                        <ReviewProgress 
                            current={currentCard + 1}
                            total={totalCards} 
                        />
                    </div>
                    {notification && (
                        <div className="inline-notification">
                            <i className="fas fa-check-circle"></i>
                            <span>{notification}</span>
                        </div>
                    )}
                </div>

                {/* Navigation Controls */}
                <div className="custom-review-navigation">
                    <button 
                        className="btn btn-secondary"
                        onClick={handlePrevious}
                        disabled={currentCard === 0}
                    >
                        <i className="fas fa-chevron-left"></i> {t('common.previous')}
                    </button>
                    <span className="card-counter">
                        {currentCard + 1} / {totalCards}
                    </span>
                    <button 
                        className="btn btn-secondary"
                        onClick={handleNext}
                        disabled={currentCard === totalCards - 1}
                    >
                        {t('common.next')} <i className="fas fa-chevron-right"></i>
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="scrollable-content">
                    <ReviewCard 
                        card={reviewData.cards[currentCard]}
                        showAnswer={showAnswer}
                        onShowAnswer={setShowAnswer}
                        onResponse={() => {}} // No response handling in custom review
                        onNext={handleNext}
                        onArchive={() => {}} // No archive in custom review
                        onEdit={() => {}} // No edit in custom review
                        onToggleBookmark={handleToggleBookmark}
                        isCustomReview={true}
                    />
                </div>
            </div>
        </ReviewContainer>
    );
}

export default CustomReview;
