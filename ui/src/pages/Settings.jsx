import { useTranslation } from 'react-i18next';
import Navigation from '../components/dashboard/Navigation';
import '../assets/styles/Settings.css';

function Settings() {
    const { t } = useTranslation();

    return (
        <div className="layout-container">
            <Navigation />
            <div className="settings-container">
                <div className="settings-header">
                    <h1>{t('settings.title')}</h1>
                </div>
                
                <div className="settings-content">
                    {/* App Preferences */}
                    <div className="settings-section">
                        <h2>{t('settings.preferences')}</h2>
                        <div className="settings-options">
                            <div className="setting-item">
                                <div className="setting-info">
                                    <label>{t('settings.language')}</label>
                                    <p className="setting-description">{t('settings.languageDesc')}</p>
                                </div>
                                <select className="setting-select">
                                    <option value="en">English</option>
                                    <option value="de">Deutsch</option>
                                    <option value="es">Español</option>
                                </select>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <label>{t('settings.theme')}</label>
                                    <p className="setting-description">{t('settings.themeDesc')}</p>
                                </div>
                                <select className="setting-select">
                                    <option value="light">{t('settings.light')}</option>
                                    <option value="dark">{t('settings.dark')}</option>
                                    <option value="system">{t('settings.system')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="settings-section">
                        <h2>{t('settings.notifications')}</h2>
                        <div className="settings-options">
                            <div className="setting-item">
                                <div className="setting-info">
                                    <label>{t('settings.emailNotifications')}</label>
                                    <p className="setting-description">{t('settings.emailNotificationsDesc')}</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <label>{t('settings.studyReminders')}</label>
                                    <p className="setting-description">{t('settings.studyRemindersDesc')}</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Privacy */}
                    <div className="settings-section">
                        <h2>{t('settings.privacy')}</h2>
                        <div className="settings-options">
                            <div className="setting-item">
                                <div className="setting-info">
                                    <label>{t('settings.publicProfile')}</label>
                                    <p className="setting-description">{t('settings.publicProfileDesc')}</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="settings-actions">
                        <button className="btn-primary">
                            {t('settings.saveChanges')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings; 