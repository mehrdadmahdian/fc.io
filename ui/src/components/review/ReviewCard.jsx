import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CardStats from './CardStats';

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
                case '3': case 'g': onResponse('good'); break;
                case '4': case 'e': onResponse('easy'); break;
                default: break;
            }
        }
    };

    return (
        <div className="review-section">
            <div className="side-panel">
                <div className="action-group">
                    <Link 
                        to={`/dashboard/card/${card.id}/edit`}
                        className="action-btn edit"
                        title={t('review.actions.edit')}
                    >
                        <i className="fas fa-edit"></i>
                        <span>{t('review.actions.edit')}</span>
                    </Link>
                    <button 
                        className="action-btn archive"
                        title={t('review.actions.archive')}
                    >
                        <i className="fas fa-archive"></i>
                        <span>{t('review.actions.archive')}</span>
                    </button>
                    <button 
                        className="action-btn study"
                        title={t('review.actions.study')}
                    >
                        <i className="fas fa-book"></i>
                        <span>{t('review.actions.study')}</span>
                    </button>
                    <button 
                        className="action-btn info"
                        title={t('review.actions.stats')}
                        onClick={() => setShowStats(true)}
                    >
                        <i className="fas fa-chart-bar"></i>
                        <span>{t('review.actions.stats')}</span>
                    </button>
                </div>
            </div>

            <div className="main-content">
                <div 
                    className="review-card" 
                    onClick={handleCardClick}
                    tabIndex={0}
                    onKeyDown={handleKeyPress}
                    role="button"
                >
                    <div className="card-content">
                        <div className={`card-face ${showAnswer ? 'back' : 'front'}`}>
                            {!showAnswer ? (
                                <div className="question">
                                    <div className="question-text">{card.question}</div>
                                </div>
                            ) : (
                                <div className="answer">
                                    <div className="answer-main">
                                        <div className="answer-text">{card.answer}</div>
                                    </div>
                                    <div className="answer-details">
                                        {card.example && (
                                            <div className="answer-section">
                                                <div className="example-text">{card.example}</div>
                                            </div>
                                        )}
                                        {card.additionalInfo && (
                                            <div className="answer-section">
                                                <div className="info-text">{card.additionalInfo}</div>
                                            </div>
                                        )}
                                        {card.notes && (
                                            <div className="answer-section">
                                                <div className="notes-text">{card.notes}</div>
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
                            className={`btn-response again ${!showAnswer ? 'disabled' : ''}`}
                            onClick={() => showAnswer && onResponse('again')}
                            disabled={!showAnswer}
                        >
                            <span className="shortcut">1</span>
                            {t('review.responses.again')}
                        </button>
                        <button 
                            className={`btn-response hard ${!showAnswer ? 'disabled' : ''}`}
                            onClick={() => showAnswer && onResponse('hard')}
                            disabled={!showAnswer}
                        >
                            <span className="shortcut">2</span>
                            {t('review.responses.hard')}
                        </button>
                        <button 
                            className={`btn-response good ${!showAnswer ? 'disabled' : ''}`}
                            onClick={() => showAnswer && onResponse('good')}
                            disabled={!showAnswer}
                        >
                            <span className="shortcut">3</span>
                            {t('review.responses.good')}
                        </button>
                        <button 
                            className={`btn-response easy ${!showAnswer ? 'disabled' : ''}`}
                            onClick={() => showAnswer && onResponse('easy')}
                            disabled={!showAnswer}
                        >
                            <span className="shortcut">4</span>
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