    import { useState, useEffect } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { useTranslation } from 'react-i18next';
    import ReviewContainer from '../../components/layout/ReviewContainer';
    import PageHeader from '../../components/common/PageHeader';
    import ReviewCard from '../../components/dashboard/boxes/review/ReviewCard';
    import ReviewProgress from '../../components/dashboard/boxes/review/ReviewProgress';
    import '../../assets/styles/Dashboard.css';
    import '../../assets/styles/Review.css';
    import '../../assets/styles/CompactReview.css';
    import { api } from '../../services/api';


    function Review() {
        const { boxId } = useParams();
        const { t } = useTranslation();
        const [currentCard, setCurrentCard] = useState(0);
        const [totalCards, setTotalCards] = useState(0);
        const [showAnswer, setShowAnswer] = useState(false);
        const [reviewData, setReviewData] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [notification, setNotification] = useState(null);
        const navigate = useNavigate();

        useEffect(() => {
            const fetchReviewData = async () => {
                try {
                    const response = await api.get(`/dashboard/boxes/${boxId}/review/cards`);
                    if (response.data.status === 'success') {
                        if (!response.data.data.cards || response.data.data.cards.length === 0) {
                            setReviewData(null);
                            setTotalCards(0);
                        } else {
                            setReviewData({
                                boxName: response.data.data.boxName,
                                cards: response.data.data.cards,
                            });
                            setTotalCards(response.data.data.totalCards);
                        }
                    } else {
                        setError('Failed to fetch review data');
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
        
            fetchReviewData();
        }, [boxId]);

        const handleResponse = async (difficulty) => {
            try {
                await api.post(`/dashboard/boxes/${boxId}/review/respond`, {
                    cardId: reviewData.cards[currentCard].ID,
                    difficulty: difficulty
                });

                setShowAnswer(false);
                if (currentCard < totalCards - 1) {
                    setCurrentCard(prev => prev + 1);
                } else {
                    alert(`Review completed! You've reviewed ${currentCard + 1} cards.`);
                    navigate('/');
                }
            } catch (err) {
                setError(err.message);
            }
        };

        const handleShowAnswer = (value) => {
            setShowAnswer(value !== undefined ? value : !showAnswer);
        };

        const handleNext = () => {
            setShowAnswer(false);
            if (currentCard < totalCards - 1) {
                setCurrentCard(prev => prev + 1);
            } else {
                alert(`Review completed! You've reviewed ${currentCard + 1} cards.`);
                navigate('/');
            }
        };

        const handleArchive = async () => {
            try {
                const response = await api.post(`/dashboard/boxes/${boxId}/cards/${reviewData.cards[currentCard].ID}/archive`);
                
                if (response.data.status === 'success') {
                    setNotification('Card archived successfully!');
                    setTimeout(() => setNotification(null), 3000);
                }
                
                setShowAnswer(false);
                if (currentCard < totalCards - 1) {
                    setCurrentCard(prev => prev + 1);
                } else {
                    alert(`Review completed! You've reviewed ${currentCard + 1} cards.`);
                    navigate('/');
                }
            } catch (err) {
                setError(err.message);
            }
        };

        const handleEdit = () => {
            const currentCardId = reviewData.cards[currentCard].ID;
            navigate(`/box/${boxId}/cards/${currentCardId}/edit`);
        };

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
                    </div>
                </ReviewContainer>
            );
        }

        if (!reviewData || !reviewData.cards || reviewData.cards.length === 0) {
            return (
                <ReviewContainer>
                    <div className="dashboard-container">
                        <PageHeader title={t('review.title')} />
                        <div className="dashboard-content">
                            <div className="dashboard-box">
                                <div className="review-content empty">
                                    <div className="empty-state">
                                        <h3>{t('review.noCards.title')}</h3>
                                        <p>{t('review.noCards.message')}</p>
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={() => navigate(`/`)}
                                        >
                                            {t('common.backToBox')}
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
                                onClick={() => navigate('/')}
                                title={t('common.backToDashboard')}
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <div className="page-title">
                                <h1>{reviewData.boxName}</h1>
                                <span className="review-mode">Review</span>
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
                            <div className="progress-actions">
                                <button 
                                    className="compact-action-btn edit" 
                                    title={t('review.editCard')}
                                    onClick={handleEdit}
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                    className="compact-action-btn archive" 
                                    title={t('review.archiveCard')}
                                    onClick={handleArchive}
                                >
                                    <i className="fas fa-archive"></i>
                                </button>
                            </div>
                        </div>
                        {notification && (
                            <div className="inline-notification">
                                <i className="fas fa-check-circle"></i>
                                <span>{notification}</span>
                            </div>
                        )}
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="scrollable-content">
                        <ReviewCard 
                            card={reviewData.cards[currentCard]}
                            showAnswer={showAnswer}
                            onShowAnswer={handleShowAnswer}
                            onResponse={handleResponse}
                            onNext={handleNext}
                        />
                    </div>

                    {/* Fixed Bottom Buttons - handled by ReviewCard component */}
                </div>
            </ReviewContainer>
        );
    }

    export default Review; 