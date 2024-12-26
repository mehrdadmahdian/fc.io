import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import DashboardContainer from '../components/layout/DashboardContainer';
import PageHeader from '../components/common/PageHeader';
import '../assets/styles/Dashboard.css';

function Profile() {
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
        <DashboardContainer>
            <div className="dashboard-container">
                <PageHeader title={t('profile.title')} />
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
        </DashboardContainer>
    );
}

export default Profile; 