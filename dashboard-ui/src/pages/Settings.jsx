import { useTranslation } from 'react-i18next';
import DashboardContainer from '../components/layout/DashboardContainer';
import '../assets/styles/Dashboard.css';
import '../assets/styles/ModernPage.css';

function Settings() {
    const { t } = useTranslation();

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
                            <h1>{t('settings.title')}</h1>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="modern-content-area">
                    <div className="modern-content-box">
                        <div className="modern-content-scroll">
                            <div className="dashboard-content">
                                <div className="dashboard-box">
                                    <h2>{t('settings.preferences')}</h2>
                                    {/* Add settings options here */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardContainer>
    );
}

export default Settings; 