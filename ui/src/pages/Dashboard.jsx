import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from '../components/dashboard/Navigation';
import StatsCard from '../components/dashboard/StatsCard';
import BoxCard from '../components/dashboard/BoxCard';
import Footer from '../components/Footer';
import '../assets/styles/Dashboard.css';
import PageTransition from '../components/layout/PageTransition';
import { api } from '../services/api';

function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
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
                const boxInfos = await api.get('/dashboard/boxes');
                console.log(boxInfos);
                data = boxInfos.data.data
                console.log(data);
                setData({
                    stats: {
                        totalBoxes: data?.stats?.totalBoxes || { value: 0, trend: 0 },
                        totalCards: data?.stats?.totalCards || { value: 0, trend: 0 },
                        reviewAccuracy: data?.stats?.reviewAccuracy || { value: 0, trend: 0 },
                        streak: data?.stats?.streak || { value: 0, trend: 0 }
                    },
                    boxes: data?.boxes || []
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
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
                        <div className="dashboard-header">
                            <h1 className="dashboard-title">{t('dashboard.welcome')}</h1>
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
                                <h3>{t('dashboard.boxes.title')}</h3>
                                <Link to="/dashboard/box/create" className="btn btn-primary">
                                    {t('dashboard.boxes.create')}
                                </Link>
                            </div>

                            <div className="boxes-grid">
                                {data.boxes.map(box => (
                                    <BoxCard key={box.id} box={box} />
                                ))}
                                <Link to="/dashboard/box/create" className="box-card create-box">
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