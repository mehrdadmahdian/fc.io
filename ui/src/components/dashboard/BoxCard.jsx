import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function BoxCard({ box }) {
    const { t } = useTranslation();

    return (
        <div className="box-card">
            <div className="box-header">
                <h3>{box.name}</h3>
                <span className="badge bg-success">{t('dashboard.active')}</span>
            </div>
            <div className="box-content">
                <p className="text-muted">{box.description}</p>
                <div className="box-stats">
                    <div className="stat">
                        <span className="value">{box.totalCards}</span>
                        <span className="label">{t('dashboard.totalCards')}</span>
                    </div>
                    <div className="stat">
                        <span className="value">{box.dueCards}</span>
                        <span className="label">{t('dashboard.dueToday')}</span>
                    </div>
                </div>
            </div>
            <div className="action-buttons">
                <Link to={`/dashboard/box/${box.id}/card/create`} className="btn btn-outline-primary">
                    {t('dashboard.addCard')}
                </Link>
                <Link to={`/dashboard/box/${box.id}/review`} className="btn btn-primary">
                    {t('dashboard.review')}
                </Link>
                <Link to={`/dashboard/box/${box.id}`} className="btn btn-light">
                    {t('dashboard.details')}
                </Link>
            </div>
        </div>
    );
}

export default BoxCard; 