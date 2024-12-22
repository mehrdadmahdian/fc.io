import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navigation from '../../components/layout/Navigation';
import ReviewCard from '../../components/dashboard/boxes/review/ReviewCard';
import ReviewProgress from '../../components/dashboard/boxes/review/ReviewProgress';
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
        // Here you would handle the response (easy, medium, hard)
    };

    const handleNext = () => {
        setShowAnswer(false);
        if (currentCard < reviewData.totalCards - 1) {
            setCurrentCard(prev => prev + 1);
        }
    };

    return (
        <div className="review-layout">
            <Navigation />
            <div className="review-container">
                <div className="review-header">
                    <h2>{t('review.title', { boxName: reviewData.boxName })}</h2>
                    <ReviewProgress 
                        current={reviewData.currentCard} 
                        total={reviewData.totalCards} 
                    />
                </div>
                <div className="review-content">
                    <ReviewCard 
                        card={reviewData.cards[currentCard]}
                        showAnswer={showAnswer}
                        onShowAnswer={handleShowAnswer}
                        onResponse={handleResponse}
                        onNext={handleNext}
                    />
                </div>
            </div>
        </div>
    );
}

export default Review; 