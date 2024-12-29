import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    const [currentCard, setCurrentCard] = useState(1);
    const [totalCards, setTotalCards] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviewData = async () => {
            try {
                const response = await api.get(`/dashboard/boxes/${boxId}/review/cards`);
                if (response.data.status === 'success') {
                    setReviewData({
                        boxName: response.data.data.boxName,
                        cards: response.data.data.cards,
                    });
                    setTotalCards(response.data.data.totalCards);
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
    }, [boxId]); // Added boxId as dependency

    const handleResponse = async (response) => {
        try {
            await api.post('/reviews/respond', {
                cardId: reviewData.cards[currentCard].id,
                response: response
            });

            setShowAnswer(false);
            if (currentCard < totalCards - 1) {
                setCurrentCard(prev => prev + 1);
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
        if (currentCard < totalCards- 1) {
            setCurrentCard(prev => prev + 1);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!reviewData) {
        return <div>No cards to review</div>;
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
                            <button className="action-btn edit">
                                <i className="fas fa-edit"></i>
                                <span>{t('Edit')}</span>
                            </button>
                            <button className="action-btn archive">
                                <i className="fas fa-archive"></i>
                                <span>{t('Archive')}</span>
                            </button>
                            <button className="action-btn flag">
                                <i className="fas fa-flag"></i>
                                <span>{t('Flag')}</span>
                            </button>
                            <button className="action-btn info">
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