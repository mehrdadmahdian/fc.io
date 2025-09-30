import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/white.css';
import MarkdownContent from '../../components/common/MarkdownContent';
import ModernContainer from '../../components/layout/ModernContainer';
import PresentationControls from '../../components/presentation/PresentationControls';
import '../../assets/styles/BoxPresentation.css';

function BoxPresentation() {
    const { t } = useTranslation();
    const { boxId } = useParams();
    const navigate = useNavigate();
    const { api } = useAuth();
    const { error: showError } = useToast();
    
    // State management
    const [loading, setLoading] = useState(true);
    const [box, setBox] = useState(null);
    const [cards, setCards] = useState([]);
    const [filteredCards, setFilteredCards] = useState([]);
    const [error, setError] = useState('');
    const [isPresenting, setIsPresenting] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Presentation settings
    const [settings, setSettings] = useState({
        duration: 5000, // 5 seconds per slide
        sequence: 'both', // 'both', 'front-only', 'back-only'
        filter: 'all', // 'all', 'new', 'review', 'learning'
        loop: true,
        showHint: true,
        showExtra: true
    });
    
    const deckRef = useRef(null);
    const revealRef = useRef(null);

    // Fetch box and cards data
    useEffect(() => {
        const fetchBoxData = async () => {
            try {
                setLoading(true);
                const [boxResponse, cardsResponse] = await Promise.all([
                    api.get(`/dashboard/boxes/${boxId}`),
                    api.get(`/dashboard/boxes/${boxId}/cards`)
                ]);
                
                setBox(boxResponse.data.data.box);
                setCards(cardsResponse.data.data.cards || []);
            } catch (error) {
                setError('Failed to load box data for presentation');
            } finally {
                setLoading(false);
            }
        };

        if (boxId) {
            fetchBoxData();
        }
    }, [boxId, api]);

    // Filter cards based on settings
    useEffect(() => {
        let filtered = cards;
        
        // Apply card status filter
        if (settings.filter !== 'all') {
            filtered = filtered.filter(card => {
                const status = getCardStatusBadge(card);
                return status === settings.filter;
            });
        }
        
        // Sort by most recent first
        filtered.sort((a, b) => {
            const aTime = new Date(a.UpdatedAt || a.CreatedAt);
            const bTime = new Date(b.UpdatedAt || b.CreatedAt);
            return bTime - aTime;
        });
        
        setFilteredCards(filtered);
    }, [cards, settings.filter]);

    // Initialize reveal.js
    useEffect(() => {
        if (!isPresenting || filteredCards.length === 0) return;

        const initReveal = () => {
            if (revealRef.current) {
                revealRef.current.destroy();
            }

            revealRef.current = new Reveal(deckRef.current, {
                hash: false,
                controls: true,
                progress: true,
                center: true,
                touch: true,
                loop: settings.loop,
                autoSlide: isPlaying ? settings.duration : 0,
                autoSlideStoppable: true,
                autoSlideMethod: Reveal.navigateNext,
                keyboard: {
                    32: () => togglePlayPause(), // Space to pause/resume
                    27: () => exitPresentation(), // Escape to exit
                    70: null, // Disable default fullscreen
                },
                plugins: []
            });

            revealRef.current.initialize().then(() => {
                // Listen for slide changes
                revealRef.current.on('slidechanged', (event) => {
                    setCurrentSlide(event.indexh || 0);
                });

                // Listen for auto-slide pause/resume
                revealRef.current.on('autoslidepaused', () => {
                    setIsPlaying(false);
                });

                revealRef.current.on('autoslideresumed', () => {
                    setIsPlaying(true);
                });
            });
        };

        const timer = setTimeout(initReveal, 100);
        return () => clearTimeout(timer);
    }, [isPresenting, filteredCards, settings.duration, settings.loop, isPlaying]);

    // Helper functions
    const getCardStatusBadge = (card) => {
        if (!card.Review) return 'new';
        if (card.Review.ReviewsCount === 0) return 'new';
        if (card.Review.NextDueDate === null) return 'archived';
        if (card.Review.Interval < 7) return 'learning';
        return 'review';
    };

    const startPresentation = () => {
        if (filteredCards.length === 0) {
            showError(t('presentation.noCards'));
            return;
        }
        setIsPresenting(true);
        setIsPlaying(true);
        setCurrentSlide(0);
    };

    const exitPresentation = () => {
        if (revealRef.current) {
            revealRef.current.destroy();
            revealRef.current = null;
        }
        setIsPresenting(false);
        setIsPlaying(false);
        setCurrentSlide(0);
    };

    const togglePlayPause = () => {
        if (!revealRef.current) return;
        
        if (isPlaying) {
            revealRef.current.configure({ autoSlide: 0 });
            setIsPlaying(false);
        } else {
            revealRef.current.configure({ autoSlide: settings.duration });
            setIsPlaying(true);
        }
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));

        // Update reveal.js configuration if presenting
        if (revealRef.current && key === 'duration') {
            revealRef.current.configure({ 
                autoSlide: isPlaying ? parseInt(value) : 0 
            });
        }
    };

    // Generate slides based on settings - one slide per card with front/back side by side
    const generateSlides = () => {
        const slides = [];
        
        filteredCards.forEach((card, cardIndex) => {
            slides.push(
                <section key={card.ID} className="fc-presentation-slide">
                    <div className="slide-content">
                        <div className="slide-header">
                            <div className="card-info">
                                <span className="card-progress">
                                    Card {cardIndex + 1} of {filteredCards.length}
                                </span>
                                <span className="box-name">{box?.Name}</span>
                            </div>
                            <span className={`status-badge status-${getCardStatusBadge(card)}`}>
                                {t(`cards.${getCardStatusBadge(card)}`)}
                            </span>
                        </div>
                        
                        <div className="slide-body">
                            <div className="card-sides">
                                {/* Front Side */}
                                {(settings.sequence === 'front-only' || settings.sequence === 'front-back' || settings.sequence === 'both') && (
                                    <div className="card-side front-side">
                                        <div className="side-header">
                                            <h3>{t('cards.front')}</h3>
                                        </div>
                                        <div className="side-content">
                                            <MarkdownContent content={card.Front} />
                                        </div>
                                    </div>
                                )}
                                
                                {/* Back Side */}
                                {(settings.sequence === 'back-only' || settings.sequence === 'front-back' || settings.sequence === 'both') && (
                                    <div className="card-side back-side">
                                        <div className="side-header">
                                            <h3>{t('cards.back')}</h3>
                                        </div>
                                        <div className="side-content">
                                            <MarkdownContent content={card.Back} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Additional Information */}
                            {(settings.showExtra && card.Extra) || (settings.showHint && card.Hint) && (
                                <div className="card-additional">
                                    {settings.showExtra && card.Extra && (
                                        <div className="additional-item">
                                            <div className="additional-label">{t('cards.extra')}</div>
                                            <div className="additional-content">
                                                <MarkdownContent content={card.Extra} />
                                            </div>
                                        </div>
                                    )}
                                    
                                    {settings.showHint && card.Hint && (
                                        <div className="additional-item">
                                            <div className="additional-label">{t('cards.hint')}</div>
                                            <div className="additional-content">
                                                <MarkdownContent content={card.Hint} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            );
        });

        return slides;
    };

    if (loading) {
        return (
            <ModernContainer>
                <div className="presentation-loading">
                    <div className="loading-spinner"></div>
                    <span>{t('common.loading')}</span>
                </div>
            </ModernContainer>
        );
    }

    if (error) {
        return (
            <ModernContainer>
                <div className="presentation-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h2>{t('common.error')}</h2>
                    <p>{error}</p>
                    <Link to={`/box/${boxId}`} className="btn btn-primary">
                        {t('common.backToBox')}
                    </Link>
                </div>
            </ModernContainer>
        );
    }

    return (
        <ModernContainer>
            <div className={`presentation-container ${isPresenting ? 'presenting' : ''}`}>
                {!isPresenting ? (
                    // Setup Screen
                    <div className="presentation-setup">
                        <div className="setup-header">
                            <button 
                                className="back-button"
                                onClick={() => navigate(`/box/${boxId}`)}
                                title={t('common.back')}
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <div className="setup-title">
                                <h1>{t('presentation.title')}</h1>
                                <span className="box-name">{box?.Name}</span>
                            </div>
                        </div>

                        <div className="setup-content">
                            <div className="setup-info">
                                <div className="cards-summary">
                                    <div className="summary-item">
                                        <span className="summary-number">{filteredCards.length}</span>
                                        <span className="summary-label">{t('cards.total')}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-number">
                                            {filteredCards.length}
                                        </span>
                                        <span className="summary-label">{t('presentation.slides')}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-number">
                                            {Math.ceil(filteredCards.length * settings.duration / 60000)}
                                        </span>
                                        <span className="summary-label">{t('presentation.estimatedMinutes')}</span>
                                    </div>
                                </div>

                                <PresentationControls 
                                    settings={settings}
                                    onSettingChange={handleSettingChange}
                                    totalCards={cards.length}
                                    filteredCards={filteredCards.length}
                                />
                            </div>

                            <div className="setup-actions">
                                <button 
                                    className="start-presentation-btn"
                                    onClick={startPresentation}
                                    disabled={filteredCards.length === 0}
                                >
                                    <i className="fas fa-play"></i>
                                    {t('presentation.start')}
                                </button>
                                
                                {filteredCards.length === 0 && (
                                    <p className="no-cards-message">
                                        {t('presentation.noCardsWithFilter')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Presentation Screen
                    <div className="presentation-screen">
                        <div className="presentation-header">
                            <button 
                                className="exit-presentation-btn"
                                onClick={exitPresentation}
                                title={t('presentation.exit')}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                            
                            <div className="presentation-controls-mini">
                                <button 
                                    className={`control-btn ${isPlaying ? 'pause' : 'play'}`}
                                    onClick={togglePlayPause}
                                    title={isPlaying ? t('presentation.pause') : t('presentation.play')}
                                >
                                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                                </button>
                                
                                <span className="slide-counter">
                                    {currentSlide + 1} / {filteredCards.length}
                                </span>
                            </div>
                        </div>

                        <div className="reveal" ref={deckRef}>
                            <div className="slides">
                                {generateSlides()}
                            </div>
                        </div>

                        <div className="presentation-footer">
                            <div className="keyboard-hints">
                                <span><kbd>Space</kbd> Play/Pause</span>
                                <span><kbd>←/→</kbd> Navigate</span>
                                <span><kbd>Esc</kbd> Exit</span>
                                <span><kbd>F</kbd> Fullscreen</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ModernContainer>
    );
}

export default BoxPresentation;
