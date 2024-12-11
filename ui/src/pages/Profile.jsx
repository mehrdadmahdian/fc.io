import { useTranslation } from 'react-i18next';
import Navigation from '../components/dashboard/Navigation';
import '../assets/styles/Profile.css';

function Profile() {
    const { t } = useTranslation();

    return (
        <div className="layout-container">
            <Navigation />
            <div className="profile-container">
                <div className="profile-header">
                    <h1>{t('profile.title')}</h1>
                </div>
                
                <div className="profile-content">
                    <div className="profile-section">
                        <h2>{t('profile.personalInfo')}</h2>
                        <div className="profile-form">
                            <div className="form-group">
                                <label>{t('profile.name')}</label>
                                <input 
                                    type="text" 
                                    placeholder={t('profile.namePlaceholder')}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('profile.email')}</label>
                                <input 
                                    type="email" 
                                    placeholder={t('profile.emailPlaceholder')}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="profile-section">
                        <h2>{t('profile.password')}</h2>
                        <div className="profile-form">
                            <div className="form-group">
                                <label>{t('profile.currentPassword')}</label>
                                <input 
                                    type="password" 
                                    placeholder={t('profile.currentPasswordPlaceholder')}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('profile.newPassword')}</label>
                                <input 
                                    type="password" 
                                    placeholder={t('profile.newPasswordPlaceholder')}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="btn-primary">
                            {t('profile.saveChanges')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile; 