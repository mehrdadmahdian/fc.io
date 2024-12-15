import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/styles/Home.css';
import { useState } from 'react';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';
import Navigation from '../components/dashboard/Navigation';
import PageTransition from '../components/layout/PageTransition';
import CookieConsent from '../components/CookieConsent';

function Home() {
    const { t, i18n } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, isLoading, logout } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        document.documentElement.dir = lng === 'fa' ? 'rtl' : 'ltr';
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (isLoading) {
        return <div>Loading...</div>; // Or your loading component
    }

    return (
        <PageTransition>
            <div className="layout-container">
                <Navigation />
                
                <div className="page-wrapper">
                    {/* Navigation */}
                    <nav className="navbar">
                        <div className="navbar-container">
                            <Link to="/" className="navbar-brand">NoName.io</Link>
                            <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                                <Link to="/features" className="nav-link">{t('nav.features')}</Link>
                                <Link to="/pricing" className="nav-link">{t('nav.pricing')}</Link>
                                {isAuthenticated ? (
                                    <>
                                        <Link to="/dashboard" className="nav-link">{t('nav.dashboard')}</Link>
                                        <Link 
                                            to="#" 
                                            onClick={handleLogout}
                                            className="nav-link logout-link"
                                        >
                                            {t('nav.logout')}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/auth/login" className="nav-link">{t('nav.login')}</Link>
                                        <Link to="/auth/register" className="nav-btn">{t('nav.register')}</Link>
                                    </>
                                )}
                                <div className="language-selector">
                                    <button onClick={() => changeLanguage('en')} className="nav-link">EN</button>
                                    <button onClick={() => changeLanguage('fa')} className="nav-link">FA</button>
                                </div>
                            </div>
                            <button className="hamburger" onClick={toggleMenu}>
                                <i className="fas fa-bars"></i>
                            </button>
                        </div>
                    </nav>

                    {/* Updated Hero Section */}
                    <section className="hero-section">
                        <div className="hero-content">
                            <div className="hero-text">
                                <h1>Master Any Subject with Smart Flashcards</h1>
                                <p>Use scientifically-proven spaced repetition to learn faster and remember longer.</p>
                                <div className="hero-buttons">
                                    <button className="btn-primary">Get Started Free</button>
                                    <button className="btn-secondary">How It Works</button>
                                </div>
                            </div>
                            {/* <div className="hero-image">
                                <img 
                                    src="https://source.unsplash.com/800x600/?study,learning" 
                                    alt="Student learning"
                                    className="hero-img"
                                />
                            </div> */}
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="features-section">
                        <div className="features-container">
                            <h2>Why Choose Our Flashcards?</h2>
                            <div className="features-grid">
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <h3>Spaced Repetition</h3>
                                    <p>Review cards at optimal intervals to maximize long-term retention</p>
                                </div>
                                
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-brain"></i>
                                    </div>
                                    <h3>Smart Learning</h3>
                                    <p>Adaptive algorithm adjusts to your learning pace and style</p>
                                </div>
                                
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                    <h3>Track Progress</h3>
                                    <p>Visualize your learning journey with detailed statistics</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* New Stats Section */}
                    <section className="stats-section">
                        <div className="stats-container">
                            <div className="stat-card">
                                <i className="fas fa-users stat-icon"></i>
                                <div className="stat-number">10k+</div>
                                <div className="stat-label">Active Users</div>
                            </div>
                            
                            <div className="stat-card">
                                <i className="fas fa-brain stat-icon"></i>
                                <div className="stat-number">1M+</div>
                                <div className="stat-label">Cards Created</div>
                            </div>
                            
                            <div className="stat-card">
                                <i className="fas fa-chart-line stat-icon"></i>
                                <div className="stat-number">95%</div>
                                <div className="stat-label">Success Rate</div>
                            </div>
                        </div>
                    </section>

                    {/* Testimonials Section */}
                    <section className="testimonials-section">
                        <h2>What Our Users Say</h2>
                        <div className="testimonials-grid">
                            <div className="testimonial-card">
                                <div className="testimonial-content">
                                    <i className="fas fa-quote-left"></i>
                                    <p>"This app transformed how I study medicine. The spaced repetition system is incredibly effective."</p>
                                </div>
                                <div className="testimonial-author">
                                    <img src="https://source.unsplash.com/100x100/?portrait,1" alt="Sarah" />
                                    <div>
                                        <h4>Sarah Johnson</h4>
                                        <p>Medical Student</p>
                                    </div>
                                </div>
                            </div>
                            <div className="testimonial-card">
                                <div className="testimonial-content">
                                    <i className="fas fa-quote-left"></i>
                                    <p>"Perfect for language learning! My vocabulary retention has improved significantly."</p>
                                </div>
                                <div className="testimonial-author">
                                    <img src="https://source.unsplash.com/100x100/?portrait,2" alt="Michael" />
                                    <div>
                                        <h4>Michael Chen</h4>
                                        <p>Language Learner</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pricing Section */}
                    <section className="pricing-section">
                        <h2>Choose Your Plan</h2>
                        <div className="pricing-grid">
                            <div className="pricing-card">
                                <div className="pricing-header">
                                    <h3>Free</h3>
                                    <div className="price">€0<span>/month</span></div>
                                </div>
                                <ul className="pricing-features">
                                    <li><i className="fas fa-check"></i> Basic flashcard creation</li>
                                    <li><i className="fas fa-check"></i> Up to 100 cards</li>
                                    <li><i className="fas fa-check"></i> Basic statistics</li>
                                </ul>
                                <button className="btn-secondary">Get Started</button>
                            </div>

                            <div className="pricing-card featured">
                                <div className="pricing-header">
                                    <h3>Pro</h3>
                                    <div className="price">€5<span>/month</span></div>
                                </div>
                                <ul className="pricing-features">
                                    <li><i className="fas fa-check"></i> Unlimited flashcards</li>
                                    <li><i className="fas fa-check"></i> Advanced statistics</li>
                                    <li><i className="fas fa-check"></i> Custom study schedules</li>
                                    <li><i className="fas fa-check"></i> Priority support</li>
                                    <li><i className="fas fa-check"></i> No ads</li>
                                </ul>
                                <button className="btn-primary">Get Pro</button>
                            </div>
                        </div>
                    </section>

                    <Footer />
                </div>
                <CookieConsent />
            </div>
        </PageTransition>
    );
}

export default Home;
