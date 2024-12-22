import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function BoxCard({ box }) {
    const { t } = useTranslation();
    return (
        <div className="box-card">
            <div className="box-header">
                <h3>{box.Box.Name}</h3>
                <span className="badge bg-success">{t('dashboard.boxes.active')}</span>
            </div>
            <div className="box-content">
                <p className="text-muted">{box.Box.Description}</p>
                <div className="box-stats">
                    <div className="stat">
                        <span className="value">{box.CountOfTotalCards}</span>
                        <span className="label">{t('dashboard.boxes.CountOfTotalCards')}</span>
                    </div>
                    <div className="stat">
                        <span className="value">{box.CountOfCardsDueToday}</span>
                        <span className="label">{t('dashboard.boxes.CountOfCardsDueToday')}</span>
                    </div>
                </div>
            </div>
            <div className="action-buttons">
                <Link to={`/box/${box.Box.ID}/cards/create`} className="btn btn-outline-primary">
                    {t('dashboard.boxes.actions.addCard')}
                </Link>
                <Link to={`/box/${box.Box.ID}/review`} className="btn btn-primary">
                    {t('dashboard.boxes.actions.review')}
                </Link>
                <Link to={`/box/${box.Box.ID}`} className="btn btn-light">
                    {t('dashboard.boxes.actions.details')}
                </Link>
            </div>
        </div>
    );
}

export default BoxCard; 