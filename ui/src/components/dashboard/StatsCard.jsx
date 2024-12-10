import { useTranslation } from 'react-i18next';

function StatsCard({ icon, title, value, trend }) {
    const { t } = useTranslation();
    
    return (
        <div className="stats-card">
            <div className="stats-icon">
                <i className={`fas ${icon}`}></i>
            </div>
            <div className="stats-info">
                <h3 className="stats-value">{value}</h3>
                <p className="stats-title">{t(title)}</p>
                {trend && (
                    <div className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
                        <i className={`fas fa-arrow-${trend > 0 ? 'up' : 'down'}`}></i>
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StatsCard; 