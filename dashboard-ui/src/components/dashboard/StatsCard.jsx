import { useTranslation } from 'react-i18next';
import '../../assets/styles/StatsCard.css';

const StatsCard = ({ icon, title, value, trend }) => {
    const { t } = useTranslation();
    
    const getTrendIcon = () => {
        if (trend > 0) return 'fa-arrow-up text-green-500';
        if (trend < 0) return 'fa-arrow-down text-red-500';
        return 'fa-minus text-gray-400';
    };

    return (
        <div className="stat-card">
            <div className="stat-header">
                <div className="stat-icon">
                    <i className={`fas ${icon}`}></i>
                </div>
                <div className="stat-trend">
                    <i className={`fas ${getTrendIcon()}`}></i>
                    <span className={trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'}>
                        {trend !== 0 ? `${Math.abs(trend)}%` : '-'}
                    </span>
                </div>
            </div>
            <div className="stat-content">
                <h3 className="stat-value">{value}</h3>
                <p className="stat-title">{t(title)}</p>
            </div>
        </div>
    );
};

export default StatsCard; 