import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardContainer from '../../components/layout/DashboardContainer';
import PageHeader from '../../components/common/PageHeader';
import ReviewCard from '../../components/dashboard/boxes/review/ReviewCard';
import ReviewProgress from '../../components/dashboard/boxes/review/ReviewProgress';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/Review.css';
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
                navigate(`/`);
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
            navigate('/');
        }
    };

    if (loading) {
        return (
            <DashboardContainer>
                <div className="dashboard-container">
                    <div className="loading-state">
                        {t('common.loading')}...
                    </div>
                </div>
            </DashboardContainer>
        );
    }

    if (error) {
        return (
            <DashboardContainer>
                <div className="dashboard-container">
                    <div className="error-state">
                        {t('common.error')}: {error}
                    </div>
                </div>
            </DashboardContainer>
        );
    }

    if (!reviewData || !reviewData.cards || reviewData.cards.length === 0) {
        return (
            <DashboardContainer>
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
            </DashboardContainer>
        );
    }

    return (
        <DashboardContainer>
            <div className="dashboard-container">
                <PageHeader title={t('review.title', { boxName: reviewData.boxName })} />
                <div className="dashboard-content">
                    <div className="dashboard-box">
                        <ReviewProgress 
                            current={currentCard + 1}
                            total={totalCards} 
                        />
                        <div className="review-content">
                            <ReviewCard 
                                card={reviewData.cards[currentCard]}
                                showAnswer={showAnswer}
                                onShowAnswer={handleShowAnswer}
                                onResponse={handleResponse}
                                onNext={handleNext}
                            />
                        </div>
                        <div className="action-group">
                            <button className="action-btn edit" title={t('Edit')}>
                                <i className="fas fa-edit"></i>
                                <span>{t('Edit')}</span>
                            </button>
                            <button className="action-btn archive" title={t('Archive')}>
                                <i className="fas fa-archive"></i>
                                <span>{t('Archive')}</span>
                            </button>
                            <button className="action-btn flag" title={t('Flag')}>
                                <i className="fas fa-flag"></i>
                                <span>{t('Flag')}</span>
                            </button>
                            <button className="action-btn info" title={t('Info')}>
                                <i className="fas fa-info-circle"></i>
                                <span>{t('Info')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardContainer>
    );
}

export default Review; 