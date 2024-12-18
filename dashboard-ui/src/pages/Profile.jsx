import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/dashboard/Navigation';
import PageTransition from '../components/layout/PageTransition';
import '../assets/styles/Dashboard.css';

function Profile() {
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
        <PageTransition>
            <div className="dashboard-layout">
                <Navigation />
                <main className="dashboard-main">
                    <div className="dashboard-container">
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
                </main>
            </div>
        </PageTransition>
    );
}

export default Profile; 