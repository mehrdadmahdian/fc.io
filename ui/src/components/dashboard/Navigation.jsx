import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/Navigation.css';

function Navigation() {
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'fa' ? 'rtl' : 'ltr';
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const userMenuWrapper = document.querySelector('.user-menu-wrapper');
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

            if (userMenuWrapper && !userMenuWrapper.contains(event.target) && 
                mobileMenuBtn && !mobileMenuBtn.contains(event.target)) {
                setIsUserMenuOpen(false);
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (location.pathname === '/') {
        return null;
    }

    const changeLanguage = async (lng) => {
        try {
            await i18n.changeLanguage(lng);
            document.documentElement.dir = lng === 'fa' ? 'rtl' : 'ltr';
            setIsMenuOpen(false);
            setIsUserMenuOpen(false);
        } catch (error) {
            console.error('Error changing language:', error);
        }
    };

    const toggleMenu = (e) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
        setIsUserMenuOpen(false);
    };

    const toggleUserMenu = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsUserMenuOpen(!isUserMenuOpen);
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="dashboard-nav">
            <div className="nav-container">
                {/* Website name */}
                <Link to="/" className="nav-brand">
                    Flashcards.io
                </Link>

                {/* Navigation items */}
                <div className="main-links">
                   
                    <Link to="/dashboard/profile" className={`nav-link ${location.pathname === '/dashboard/profile' ? 'active' : ''}`}>
                        <i className="fas fa-user-circle"></i> {t('nav.profile')}
                    </Link>
                    <Link to="/dashboard/settings" className={`nav-link ${location.pathname === '/dashboard/settings' ? 'active' : ''}`}>
                        <i className="fas fa-cog"></i> {t('nav.settings')}
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button 
                        onClick={handleLogout}
                        className="nav-link logout-link"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span className="nav-link-text">{t('nav.logout')}</span>
                    </button>
                </div>

                {/* Language selector */}
                <div className="language-selector">
                    <button onClick={() => changeLanguage('en')} className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}>
                        EN
                    </button>
                    <button onClick={() => changeLanguage('fa')} className={`lang-btn ${i18n.language === 'fa' ? 'active' : ''}`}>
                        FA
                    </button>
                </div>

                {/* Mobile menu button */}
                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>

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
                            <div className="language-buttons">
                                <button 
                                    onClick={() => changeLanguage('en')} 
                                    className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                                >
                                    English
                                </button>
                                <button 
                                    onClick={() => changeLanguage('fa')} 
                                    className={`lang-btn ${i18n.language === 'fa' ? 'active' : ''}`}
                                >
                                    فارسی
                                </button>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="menu-item logout"
                            onClick={toggleMenu}
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            <span className="menu-item-text">{t('nav.logout')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navigation; 