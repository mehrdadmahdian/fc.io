import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from '../components/layout/Navigation';
import BoxCard from '../components/dashboard/boxes/BoxCard';
import StatsCard from '../components/dashboard/StatsCard';
import Footer from '../components/layout/Footer';
import '../assets/styles/Dashboard.css';
import PageTransition from '../components/common/PageTransition';
import { api } from '../services/api';

function Dashboard() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: {
            totalBoxes: { value: 0, trend: 0 },
            totalCards: { value: 0, trend: 0 },
            reviewAccuracy: { value: 0, trend: 0 },
            streak: { value: 0, trend: 0 }
        },
        boxes: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/dashboard/boxes');
                const responseData = response.data.data;
                setData({
                    stats: {
                        totalBoxes: responseData?.stats?.totalBoxes || { value: 0, trend: 0 },
                        totalCards: responseData?.stats?.totalCards || { value: 0, trend: 0 },
                        reviewAccuracy: responseData?.stats?.reviewAccuracy || { value: 0, trend: 0 },
                        streak: responseData?.stats?.streak || { value: 0, trend: 0 }
                    },
                    boxes: responseData?.boxes || []
                });
            } catch (error) {
                setData({
                    stats: {
                        totalBoxes: { value: 0, trend: 0 },
                        totalCards: { value: 0, trend: 0 },
                        reviewAccuracy: { value: 0, trend: 0 },
                        streak: { value: 0, trend: 0 }
                    },
                    boxes: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <PageTransition>
                <div className="dashboard-layout">
                    <Navigation />
                    <main className="dashboard-main">
                        <div className="dashboard-container">
                            <div className="dashboard-header">
                                <h1 className="dashboard-title">{t('dashboard.loading')}</h1>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="dashboard-layout">
                <Navigation />
                <main className="dashboard-main">
                    <div className="dashboard-container">
                        <div className="stats-container">
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
                            <div className="boxes-grid">
                                {data.boxes.map(box => (
                                    <BoxCard key={box.id} box={box} />
                                ))}
                                <Link to="/box/create" className="box-card create-box">
                                    <div className="create-box-content">
                                        <i className="fas fa-plus-circle"></i>
                                        <h3>{t('dashboard.boxes.create')}</h3>
                                        <p>{t('dashboard.boxes.createDesc')}</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}

export default Dashboard; 