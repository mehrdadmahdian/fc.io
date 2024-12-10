import { useTranslation } from 'react-i18next';

function StatsCard({ icon, title, value, trend }) {
    const { t } = useTranslation();
    
    return (
        <div className="stats-card">
            <div className="stats-icon">
                <i className={`fas ${icon}`}></i>
            </div>
            <div className="stats-info">
                <h3>{t(title)}</h3>
                <div className="stats-value">
                    <span className="value">{value}</span>
                    {trend && (
                        <span className={`trend ${trend > 0 ? 'up' : 'down'}`}>
                            <i className={`fas fa-arrow-${trend > 0 ? 'up' : 'down'}`}></i>
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StatsCard; 