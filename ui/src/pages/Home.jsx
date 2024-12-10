import { Link } from 'react-router-dom';
import '../assets/styles/Home.css';
import { useState } from 'react';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

function Home() {
    const { t, i18n } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        document.documentElement.dir = lng === 'fa' ? 'rtl' : 'ltr';
    };

    return (
        <div className="page-wrapper">
            {/* Navigation */}
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-brand">Flashcards.io</Link>
                    <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                        <Link to="/features" className="nav-link">{t('nav.features')}</Link>
                        <Link to="/pricing" className="nav-link">{t('nav.pricing')}</Link>
                        <Link to="/dashboard" className="nav-link">{t('nav.dashboard')}</Link>
                        <Link to="/auth/logout" className="nav-link">{t('nav.logout')}</Link>
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

            {/* Hero Section */}
            <main>
                <div className="hero-section">
                    <h1 className="hero-title">{t('hero.title')}</h1>
                    <p className="hero-subtitle">{t('hero.subtitle')}</p>
                    <Link to="/auth/register" className="btn-primary">
                        {t('hero.cta')}
                    </Link>
                </div>

                {/* Features Grid */}
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-brain"></i>
                        </div>
                        <h3>{t('features.smartLearning.title')}</h3>
                        <p>{t('features.smartLearning.description')}</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <h3>{t('features.progressTracking.title')}</h3>
                        <p>{t('features.progressTracking.description')}</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-mobile-alt"></i>
                        </div>
                        <h3>{t('features.studyAnywhere.title')}</h3>
                        <p>{t('features.studyAnywhere.description')}</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Home;
