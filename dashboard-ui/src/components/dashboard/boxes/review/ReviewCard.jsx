import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CardStats from '../../CardStats';
import MarkdownContent from '../../../common/MarkdownContent';
import '../../../../assets/styles/ReviewCard.css';

function ReviewCard({ card, showAnswer, onShowAnswer, onResponse, onNext, onPrevious, onArchive, onEdit, onToggleBookmark, isCustomReview = false }) {
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
                case '4': case 'r': if (onArchive) onArchive(); break;
                case '5': case 'n': onNext(); break;
                default: break;
            }
        }
    };

    return (
        <div className="compact-review-section">
            <div className="compact-card-container">
                <div 
                    ref={cardRef}
                    className={`compact-review-card ${showAnswer ? 'show-answer' : ''}`} 
                    onClick={handleCardClick}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    tabIndex={0}
                    onKeyDown={handleKeyPress}
                    role="button"
                    aria-label={showAnswer ? t('review.showingAnswer') : t('review.clickToReveal')}
                >
                    {/* Simple Action Buttons - Top Corners */}
                    <div className="card-action-buttons">
                        {/* Bookmark Toggle - Top Left */}
                        {onToggleBookmark && (
                            <button 
                                className={`card-bookmark-btn ${card.IsBookmarked ? 'bookmarked' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleBookmark();
                                }}
                                title={card.IsBookmarked ? t('review.removeBookmark') : t('review.addBookmark')}
                            >
                                <i className={`fas ${card.IsBookmarked ? 'fa-star' : 'fa-star-o'}`}></i>
                            </button>
                        )}
                        
                        {/* Edit Button - Top Right */}
                        {onEdit && (
                            <button 
                                className="card-edit-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                title={t('review.editCard')}
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                        )}
                    </div>
                    <div className="card-content">
                        {!showAnswer ? (
                            <div className="question-side">
                                <div className="content-text">
                                    <MarkdownContent content={card.Front} className="question-text" />
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
                            </div>
                        ) : (
                            <div className="answer-side">
                                <div className="content-text">
                                    <MarkdownContent content={card.Back} className="answer-text" />
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
                            </div>
                        )}
                    </div>
                    {/* Card Metadata Footer - Inside Card */}
                    <div className="card-metadata-footer">
                        {/* Card Labels - Bottom Left */}
                        <div className="card-labels-container">
                            {card.Labels && card.Labels.length > 0 ? (
                                card.Labels.map(label => (
                                    <span 
                                        key={label.ID} 
                                        className="label-tag"
                                        style={{ backgroundColor: label.Color }}
                                    >
                                        {label.Name}
                                    </span>
                                ))
                            ) : (
                                <div className="labels-placeholder">
                                    <span className="label-tag no-labels">No labels</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Card Metadata - Bottom Right */}
                        <div className="card-metadata-inline">
                            {card.IsBookmarked && (
                                <span className="metadata-item bookmark">
                                    <i className="fas fa-star"></i>
                                </span>
                            )}
                            {card.Difficulty && (
                                <span className={`metadata-item difficulty ${card.Difficulty}`}>
                                    <i className="fas fa-signal"></i>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Response buttons - different for custom review */}
                {!isCustomReview ? (
                    <div className="fixed-response-buttons">
                        <div className="response-row primary">
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
                        </div>
                        
                        <div className="response-row secondary">
                            <button 
                                className="response-btn-compact archive"
                                onClick={onArchive}
                                title="Archive - Remove from review"
                            >
                                <i className="fas fa-archive"></i>
                                <span>Archive</span>
                                <kbd>4</kbd>
                            </button>
                            
                            <button 
                                className="response-btn-compact next"
                                onClick={onNext}
                                title="Next - Skip without changing interval"
                            >
                                <i className="fas fa-arrow-right"></i>
                                <span>Next</span>
                                <kbd>5</kbd>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="fixed-response-buttons">
                        <div className="response-row secondary">
                            <button 
                                className="response-btn-compact archive"
                                onClick={onPrevious}
                                title={t('common.previous')}
                            >
                                <i className="fas fa-chevron-left"></i>
                                <span>{t('common.previous')}</span>
                            </button>
                            
                            <button 
                                className="response-btn-compact next"
                                onClick={onNext}
                                title={t('common.next')}
                            >
                                <i className="fas fa-chevron-right"></i>
                                <span>{t('common.next')}</span>
                            </button>
                        </div>
                    </div>
                )}
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