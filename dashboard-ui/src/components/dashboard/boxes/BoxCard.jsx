import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../../assets/styles/BoxCard.css';

function BoxCard({ box }) {
    const { t } = useTranslation();
    
    return (
        <div className="box-card">
            <div className="box-header">
                <h3 className="box-title">{box.Box.Name}</h3>
                <span className="status-badge">{t('dashboard.boxes.active')}</span>
            </div>
            
            {box.Box.Description && (
                <p className="box-description">{box.Box.Description}</p>
            )}
            
            <div className="stats-container">
                <div className="stat-item">
                    <span className="stat-number">{box.CountOfTotalCards}</span>
                    <span className="stat-label">{t('dashboard.boxes.CountOfTotalCards')}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{box.CountOfCardsDueToday}</span>
                    <span className="stat-label">{t('dashboard.boxes.CountOfCardsDueToday')}</span>
                </div>
            </div>
            
            <div className="button-group">
                <Link to={`/box/${box.Box.ID}/cards/create`} className="button button-add button-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                    </svg>
                    {t('dashboard.boxes.actions.addCard')}
                </Link>
                <Link to={`/box/${box.Box.ID}/review`} className="button button-review button-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                    </svg>
                    {t('dashboard.boxes.actions.review')}
                </Link>
                <Link to={`/box/${box.Box.ID}`} className="button button-primary button-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                    </svg>
                    {t('dashboard.boxes.actions.details')}
                </Link>
            </div>
        </div>
    );
}

export default BoxCard; 