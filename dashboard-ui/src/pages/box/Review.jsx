import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardContainer from '../../components/layout/DashboardContainer';
import PageHeader from '../../components/common/PageHeader';
import ReviewCard from '../../components/dashboard/boxes/review/ReviewCard';
import ReviewProgress from '../../components/dashboard/boxes/review/ReviewProgress';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/Review.css';

function Review() {
    const { t } = useTranslation();
    const [currentCard, setCurrentCard] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    // Fake data for development
    const reviewData = {
        boxName: "JavaScript Basics",
        totalCards: 20,
        currentCard: currentCard + 1,
        cards: [
            {
                id: 1,
                question: "What is closure in JavaScript?",
                answer: "A closure is the combination of a function bundled together with references to its surrounding state. In JavaScript, closures are created every time a function is created, at function creation time.",
                difficulty: "medium"
            },
            // Add more cards here
        ]
    };

    const handleShowAnswer = (value) => {
        setShowAnswer(value !== undefined ? value : !showAnswer);
    };

    const handleResponse = (response) => {
        setShowAnswer(false);
        if (currentCard < reviewData.totalCards - 1) {
            setCurrentCard(prev => prev + 1);
        }
    };

    const handleNext = () => {
        setShowAnswer(false);
        if (currentCard < reviewData.totalCards - 1) {
            setCurrentCard(prev => prev + 1);
        }
    };

    return (
        <DashboardContainer>
            <div className="dashboard-container">
                <PageHeader title={t('review.title', { boxName: reviewData.boxName })} />
                <div className="dashboard-content">
                    <div className="dashboard-box">
                        <ReviewProgress 
                            current={reviewData.currentCard} 
                            total={reviewData.totalCards} 
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