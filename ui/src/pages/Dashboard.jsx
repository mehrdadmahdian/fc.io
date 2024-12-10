import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from '../components/dashboard/Navigation';
import StatsCard from '../components/dashboard/StatsCard';
import BoxCard from '../components/dashboard/BoxCard';
import Footer from '../components/Footer';
import '../assets/styles/Dashboard.css';

// Fake data for development
const fakeData = {

    stats: {
        totalBoxes: { value: 12, trend: 8 },
        totalCards: { value: 486, trend: 15 },
        reviewAccuracy: { value: 92, trend: -3 },
        streak: { value: 7, trend: 2 }
    },
    boxes: [
        {
            id: 1,
            name: "JavaScript Basics",
            description: "Core concepts of JavaScript programming",
            totalCards: 45,
            dueCards: 8,
            lastReviewed: "2024-02-10"
        },
        {
            id: 2,
            name: "React Hooks",
            description: "Modern React hooks and state management",
            totalCards: 32,
            dueCards: 5,
            lastReviewed: "2024-02-09"
        },
        // Add more fake boxes as needed
    ]
};

function Dashboard() {
    const { t } = useTranslation();
    const [data] = useState(fakeData);

    return (
        <div className="dashboard-layout">
            <Navigation />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h2>{t('dashboard.welcome')}</h2>
                    <p className="text-muted">{t('dashboard.overview')}</p>
                </div>

                <div className="stats-grid">
                    <StatsCard 
                        icon="fa-box"
                        title="dashboard.stats.boxes"
                        value={data.stats.totalBoxes.value}
                        trend={data.stats.totalBoxes.trend}
                    />
                    <StatsCard 
                        icon="fa-layer-group"
                        title="dashboard.stats.cards"
                        value={data.stats.totalCards.value}
                        trend={data.stats.totalCards.trend}
                    />
                    <StatsCard 
                        icon="fa-chart-line"
                        title="dashboard.stats.accuracy"
                        value={`${data.stats.reviewAccuracy.value}%`}
                        trend={data.stats.reviewAccuracy.trend}
                    />
                    <StatsCard 
                        icon="fa-fire"
                        title="dashboard.stats.streak"
                        value={data.stats.streak.value}
                        trend={data.stats.streak.trend}
                    />
                </div>

                <div className="boxes-section">
                    <div className="section-header">
                        <h3>{t('dashboard.yourBoxes')}</h3>
                        <Link to="/dashboard/box/create" className="btn btn-primary">
                            {t('dashboard.createBox')}
                        </Link>
                    </div>

                    <div className="boxes-grid">
                        {data.boxes.map(box => (
                            <BoxCard key={box.id} box={box} />
                        ))}
                        <Link to="/dashboard/box/create" className="box-card create-box">
                            <div className="create-box-content">
                                <i className="fas fa-plus-circle"></i>
                                <h3>{t('dashboard.createNewBox')}</h3>
                                <p>{t('dashboard.createBoxDesc')}</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer className="dashboard-footer" />
        </div>
    );
}

export default Dashboard; 