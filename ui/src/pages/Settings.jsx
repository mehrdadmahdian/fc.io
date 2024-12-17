import { useTranslation } from 'react-i18next';
import Navigation from '../components/dashboard/Navigation';
import PageTransition from '../components/layout/PageTransition';
import '../assets/styles/Dashboard.css';

function Settings() {
    const { t } = useTranslation();

    return (
        <PageTransition>
            <div className="dashboard-layout">
                <Navigation />
                <main className="dashboard-main">
                    <div className="dashboard-container">
                        <div className="dashboard-header">
                            <h1 className="dashboard-title">{t('settings.title')}</h1>
                        </div>
                        <div className="dashboard-content">
                            <div className="dashboard-box">
                                <h2>{t('settings.preferences')}</h2>
                                {/* Add settings options here */}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
}

export default Settings; 