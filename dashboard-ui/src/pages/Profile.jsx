import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import DashboardContainer from '../components/layout/DashboardContainer';
import '../assets/styles/Dashboard.css';
import '../assets/styles/ModernPage.css';

function Profile() {
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
        <DashboardContainer>
            <div className="modern-page-container">
                {/* Title Bar */}
                <div className="modern-title-bar">
                    <div className="modern-title-content">
                        <button 
                            className="modern-back-button"
                            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                            title={t('common.back')}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className="modern-page-title">
                            <h1>{t('profile.title')}</h1>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="modern-content-area">
                    <div className="modern-content-box">
                        <div className="modern-content-scroll">
                            <div className="dashboard-content">
                                <div className="dashboard-box">
                                    <div className="profile-info">
                                        <div className="profile-avatar">
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div className="profile-details">
                                            <h2>{user?.name}</h2>
                                            <p>{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardContainer>
    );
}

export default Profile; 