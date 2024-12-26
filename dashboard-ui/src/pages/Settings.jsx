import { useTranslation } from 'react-i18next';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import PageTransition from '../components/common/PageTransition';
import PageHeader from '../components/common/PageHeader';
import '../assets/styles/Dashboard.css';

function Settings() {
    const { t } = useTranslation();

    return (
        <PageTransition>
            <div className="dashboard-layout">
                <Navigation />
                <main className="dashboard-main">
                    <div className="dashboard-container">
                        <PageHeader title={t('settings.title')} />
                        <div className="dashboard-content">
                            <div className="dashboard-box">
                                <h2>{t('settings.preferences')}</h2>
                                {/* Add settings options here */}
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}

export default Settings; 