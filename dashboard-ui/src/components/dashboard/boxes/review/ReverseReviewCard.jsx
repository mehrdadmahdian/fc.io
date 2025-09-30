import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CardStats from '../../CardStats';
import MarkdownContent from '../../../common/MarkdownContent';

function ReverseReviewCard({ card, showAnswer, onShowAnswer, onResponse, onNext }) {
    const { t } = useTranslation();
    const [showStats, setShowStats] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const cardRef = useRef(null);

    // Swipe detection
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && !showAnswer) {
            onShowAnswer(true);
        } else if (isRightSwipe && showAnswer) {
            onShowAnswer(false);
        }
    };

    const handleCardClick = (e) => {
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            onShowAnswer(!showAnswer);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onShowAnswer(!showAnswer);
        } else if (showAnswer) {
            switch(e.key.toLowerCase()) {
                case '1': case 'a': onResponse('again'); break;
                case '2': case 'h': onResponse('hard'); break;
                case '3': case 'e': onResponse('easy'); break;
                case '4': case 'n': onNext(); break;
                default: break;
            }
        }
    };

    return (
        <div className="compact-review-section reverse">
            <div className="compact-card-container">
                <div 
                    ref={cardRef}
                    className={`compact-review-card reverse-mode ${showAnswer ? 'show-answer' : ''}`} 
                    onClick={handleCardClick}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    tabIndex={0}
                    onKeyDown={handleKeyPress}
                    role="button"
                    aria-label={showAnswer ? t('review.showingAnswer') : t('review.clickToReveal')}
                >
                    <div className="reverse-indicator">
                        <i className="fas fa-exchange-alt"></i>
                        <span>REVERSE</span>
                    </div>
                    
                    <div className="card-content">
                        {!showAnswer ? (
                            <div className="question-side">
                                <div className="content-text">
                                    <MarkdownContent content={card.Back} className="question-text" />
                                    {showHint && card.Hint && (
                                        <div className="hint-text">
                                            <div className="hint-label">{t('review.hint')}:</div>
                                            <MarkdownContent content={card.Hint} className="hint-content" />
                                        </div>
                                    )}
                                </div>
                                <div className="card-actions">
                                    {card.Hint && (
                                        <button 
                                            className="hint-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowHint(!showHint);
                                            }}
                                            title={showHint ? t('review.hideHint') : t('review.showHint')}
                                        >
                                            <i className={`fas ${showHint ? 'fa-eye-slash' : 'fa-lightbulb'}`}></i>
                                            {showHint ? t('review.hideHint') : t('review.showHint')}
                                        </button>
                                    )}
                                </div>
                                <div className="swipe-hint">
                                    <span>Tap or swipe → to reveal</span>
                                </div>
                            </div>
                        ) : (
                            <div className="answer-side">
                                <div className="content-text">
                                    <MarkdownContent content={card.Front} className="answer-text" />
                                    {card.Extra && (
                                        <div className="extra-text">
                                            <MarkdownContent content={card.Extra} className="extra-content" />
                                        </div>
                                    )}
                                    {card.Hint && (
                                        <div className="hint-text">
                                            <div className="hint-label">{t('review.hint')}:</div>
                                            <MarkdownContent content={card.Hint} className="hint-content" />
                                        </div>
                                    )}
                                </div>
                                <div className="swipe-hint">
                                    <span>← Swipe to go back</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Always visible response buttons */}
                <div className="fixed-response-buttons reverse">
                    <button 
                        className="response-btn-compact again"
                        onClick={() => {
                            if (!showAnswer) onShowAnswer(true);
                            else onResponse('again');
                        }}
                        title={!showAnswer ? "Reveal answer first" : "Again - Study in 1 min"}
                    >
                        <i className="fas fa-redo"></i>
                        <span>Again</span>
                        <kbd>1</kbd>
                    </button>
                    
                    <button 
                        className="response-btn-compact hard"
                        onClick={() => {
                            if (!showAnswer) onShowAnswer(true);
                            else onResponse('hard');
                        }}
                        title={!showAnswer ? "Reveal answer first" : "Hard - Study in 6 min"}
                    >
                        <i className="fas fa-clock"></i>
                        <span>Hard</span>
                        <kbd>2</kbd>
                    </button>
                    
                    <button 
                        className="response-btn-compact easy"
                        onClick={() => {
                            if (!showAnswer) onShowAnswer(true);
                            else onResponse('easy');
                        }}
                        title={!showAnswer ? "Reveal answer first" : "Easy - Study in 4 days"}
                    >
                        <i className="fas fa-check"></i>
                        <span>Easy</span>
                        <kbd>3</kbd>
                    </button>
                    
                    <button 
                        className="response-btn-compact skip"
                        onClick={onNext}
                        title="Skip - No change"
                    >
                        <i className="fas fa-arrow-right"></i>
                        <span>Skip</span>
                        <kbd>4</kbd>
                    </button>
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

export default ReverseReviewCard;

