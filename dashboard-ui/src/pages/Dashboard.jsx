import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
                        <div className="welcome-section">
                            <h1 className="welcome-title">
                                {t('dashboard.welcome')} 👋
                            </h1>
                            <p className="welcome-subtitle">
                                {t('dashboard.subtitle')}
                            </p>
                        </div>

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
                            <div className="section-header">
                                <div className="header-left">
                                    <h2 className="section-title">{t('dashboard.boxes.title')}</h2>
                                    <p className="section-subtitle">{t('dashboard.boxes.subtitle')}</p>
                                </div>
                                {/* <Link to="/dashboard/box/create" className="btn btn-primary">
                                    <i className="fas fa-plus"></i>
                                    {t('dashboard.boxes.create')}
                                </Link> */}
                            </div>

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

                        {/* <div className="quick-actions">
                            <h2 className="section-title">{t('dashboard.quickActions')}</h2>
                            <div className="actions-grid">
                                <button className="action-card" onClick={() => navigate('/dashboard/box/create')}>
                                    <i className="fas fa-plus"></i>
                                    <span>{t('dashboard.createBox')}</span>
                                </button>
                                <button className="action-card">
                                    <i className="fas fa-book"></i>
                                    <span>{t('dashboard.startReview')}</span>
                                </button>
                                <button className="action-card">
                                    <i className="fas fa-chart-bar"></i>
                                    <span>{t('dashboard.viewStats')}</span>
                                </button>
                                <button className="action-card">
                                    <i className="fas fa-cog"></i>
                                    <span>{t('dashboard.settings')}</span>
                                </button>
                            </div>
                        </div> */}

                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}

export default Dashboard; 