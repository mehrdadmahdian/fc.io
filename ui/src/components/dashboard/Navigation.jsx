import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Navigation() {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        document.documentElement.dir = lng === 'fa' ? 'rtl' : 'ltr';
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    return (
        <nav className="dashboard-nav">
            <div className="nav-container">
                <div className="nav-header">
                    <Link to="/" className="nav-brand">Flashcards.io</Link>
                    <button className="mobile-menu-btn" onClick={toggleMenu}>
                        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                </div>

                {/* Desktop Navigation */}
                <div className="desktop-nav">
                    <div className="main-links">
                        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                            <i className="fas fa-home"></i> {t('nav.dashboard')}
                        </Link>
                        <Link to="/dashboard/boxes" className={`nav-link ${location.pathname.includes('/boxes') ? 'active' : ''}`}>
                            <i className="fas fa-box"></i> {t('nav.boxes')}
                        </Link>
                    </div>
                    <div className="user-section">
                        <div className="language-selector">
                            <button onClick={() => changeLanguage('en')} className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}>EN</button>
                            <button onClick={() => changeLanguage('fa')} className={`lang-btn ${i18n.language === 'fa' ? 'active' : ''}`}>FA</button>
                        </div>
                        <div className="user-menu-wrapper">
                            <button onClick={toggleUserMenu} className="user-menu-btn">
                                <i className="fas fa-user"></i>
                                <span>John Doe</span>
                                <i className={`fas fa-chevron-${isUserMenuOpen ? 'up' : 'down'}`}></i>
                            </button>
                            {isUserMenuOpen && (
                                <div className="user-dropdown">
                                    <Link to="/dashboard/profile" className="dropdown-item">
                                        <i className="fas fa-user-circle"></i> {t('nav.profile')}
                                    </Link>
                                    <Link to="/dashboard/settings" className="dropdown-item">
                                        <i className="fas fa-cog"></i> {t('nav.settings')}
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <Link to="/auth/logout" className="dropdown-item">
                                        <i className="fas fa-sign-out-alt"></i> {t('nav.logout')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
                    <div className="mobile-menu">
                        <Link to="/dashboard" className="menu-item" onClick={toggleMenu}>
                            <i className="fas fa-home"></i> {t('nav.dashboard')}
                        </Link>
                        <Link to="/dashboard/boxes" className="menu-item" onClick={toggleMenu}>
                            <i className="fas fa-box"></i> {t('nav.boxes')}
                        </Link>
                        <Link to="/dashboard/profile" className="menu-item" onClick={toggleMenu}>
                            <i className="fas fa-user-circle"></i> {t('nav.profile')}
                        </Link>
                        <Link to="/dashboard/settings" className="menu-item" onClick={toggleMenu}>
                            <i className="fas fa-cog"></i> {t('nav.settings')}
                        </Link>
                        <div className="menu-item language-section">
                            <span className="language-label">{t('nav.language')}</span>
                            <div className="language-buttons">
                                <button onClick={() => changeLanguage('en')} className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}>
                                    English
                                </button>
                                <button onClick={() => changeLanguage('fa')} className={`lang-btn ${i18n.language === 'fa' ? 'active' : ''}`}>
                                    فارسی
                                </button>
                            </div>
                        </div>
                        <Link to="/auth/logout" className="menu-item logout" onClick={toggleMenu}>
                            <i className="fas fa-sign-out-alt"></i> {t('nav.logout')}
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navigation; 