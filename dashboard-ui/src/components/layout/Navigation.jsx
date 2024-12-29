import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/Navigation.css';

const NAVIGATION_LINKS = [
    { path: '/', icon: 'fa-home', label: 'nav.dashboard' },
    { path: '/profile', icon: 'fa-user-circle', label: 'nav.profile' },
    { path: '/settings', icon: 'fa-cog', label: 'nav.settings' }
];

const LANGUAGES = [
    { code: 'en', label: 'EN', fullLabel: 'English' },
    { code: 'fa', label: 'FA', fullLabel: 'فارسی' }
];

function Navigation() {
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'fa' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.mobile-menu-btn') && !event.target.closest('.mobile-nav')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = async (lng) => {
        try {
            await i18n.changeLanguage(lng);
            document.documentElement.dir = lng === 'fa' ? 'rtl' : 'ltr';
            setIsMenuOpen(false);
        } catch (error) { 
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const renderNavLinks = (isMobile = false) => (
        NAVIGATION_LINKS.map(({ path, icon, label }) => (
            <Link 
                key={path}
                to={path} 
                className={isMobile ? "menu-item" : `nav-link ${location.pathname === path ? 'active' : ''}`}
                onClick={() => isMobile && setIsMenuOpen(false)}
            >
                <i className={`fas ${icon}`}></i> {t(label)}
            </Link>
        ))
    );

    const renderLanguageButtons = (isMobile = false) => (
        LANGUAGES.map(({ code, label, fullLabel }) => (
            <button 
                key={code}
                onClick={() => changeLanguage(code)} 
                className={`lang-btn ${i18n.language === code ? 'active' : ''}`}
            >
                {isMobile ? fullLabel : label}
            </button>
        ))
    );

    return (
        <nav className="dashboard-nav">
            <div className="nav-container">
                <Link to="/" className="nav-brand">
                    Flashcards.io
                </Link>

                <div className="main-links">
                    {renderNavLinks()}
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="nav-link logout-link">
                        <i className="fas fa-sign-out-alt"></i>
                        <span className="nav-link-text">{t('nav.logout')}</span>
                    </button>
                </div>

                <div className="language-selector">
                    {renderLanguageButtons()}
                </div>

                <button 
                    className="mobile-menu-btn" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>

                <div className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
                    <div className="mobile-menu">
                        {renderNavLinks(true)}
                        <div className="menu-item language-section">
                            <div className="language-buttons">
                                {renderLanguageButtons(true)}
                            </div>
                        </div>
                        <button onClick={handleLogout} className="menu-item logout">
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