import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CardStats from '../../CardStats';

function ReviewCard({ card, showAnswer, onShowAnswer, onResponse, onNext }) {
    const { t } = useTranslation();
    const [showStats, setShowStats] = useState(false);

    const handleCardClick = (e) => {
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button') && !e.target.closest('.card-actions')) {
            onShowAnswer(!showAnswer);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onShowAnswer();
        } else if (showAnswer) {
            switch(e.key.toLowerCase()) {
                case '1': case 'a': onResponse('again'); break;
                case '2': case 'h': onResponse('hard'); break;
                case '3': case 'e': onResponse('easy'); break;
                default: break;
            }
        }
    };

    return (
        <div className="review-section">
            

            <div className="main-content">
                <div 
                    className={`review-card ${showAnswer ? 'show-answer' : ''}`} 
                    onClick={handleCardClick}
                    tabIndex={0}
                    onKeyDown={handleKeyPress}
                    role="button"
                >
                    <div className="card-content">
                        <div className={`card-face ${showAnswer ? 'back' : 'front'}`}>
                            {!showAnswer ? (
                                <div className="question">
                                    <div className="question-text">{card.Front}</div>
                                </div>
                            ) : (
                                <div className="answer">
                                    <div className="answer-main">
                                        <div className="answer-text">{card.Back}</div>
                                    </div>
                                    <div className="answer-details">
                                        {card.Extra && (
                                            <div className="answer-section small-text">
                                                <div className="extra-text text-muted">{card.Extra}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {!showAnswer && (
                        <div className="show-answer-hint">
                            {t('review.clickToReveal')}
                            <span className="shortcut">Space</span>
                        </div>
                    )}
                </div>

                <div className="response-container">
                    <div className="response-buttons">
                        <button 
                            className="btn-response again"
                            onClick={() => onResponse('again')}
                        >
                            {t('review.responses.again')}
                        </button>
                        <button 
                            className="btn-response hard"
                            onClick={() => onResponse('hard')}
                        >
                            {t('review.responses.hard')}
                        </button>
                        <button 
                            className="btn-response easy"
                            onClick={() => onResponse('easy')}
                        >
                            {t('review.responses.easy')}
                        </button>
                        <button 
                            className="btn-response next"
                            onClick={onNext}
                        >
                            <span className="shortcut">→</span>
                            {t('review.responses.next')}
                        </button>
                    </div>
                </div>
            </div>

            {showStats && (
                <CardStats 
                    card={card} 
                    onClose={() => setShowStats(false)} 
                />
            )}
        </div>
    );
}

export default ReviewCard; 