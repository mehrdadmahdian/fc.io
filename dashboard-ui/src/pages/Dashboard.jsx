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
            todayDue: { value: 0, trend: 0 },
            reviewAccuracy: { value: 0, trend: 0 },
            streak: { value: 0, trend: 0 }
        },
        boxes: []
    });

    const handleActiveBoxChange = (newActiveBoxId) => {
        setData(prevData => ({
            ...prevData,
            boxes: prevData.boxes.map(box => ({
                ...box,
                Box: {
                    ...box.Box,
                    IsActive: box.Box.ID === newActiveBoxId
                }
            }))
        }));
    };

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
                        todayDue: responseData?.stats?.todayDue || { value: 0, trend: 0 },
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
                        todayDue: { value: 0, trend: 0 },
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

                            <div className="stat-card combined-cards-stats">
                                <div className="stat-header">
                                    <div className="stat-icon">
                                        <i className="fas fa-layer-group"></i>
                                    </div>
                                </div>
                                <div className="stat-content">
                                    <div className="combined-stats-row">
                                        <div className="stat-item">
                                            <h3 className="stat-value">{data.stats.totalCards.value}</h3>
                                            <p className="stat-title">Total Cards</p>
                                        </div>
                                        <div className="stat-divider">|</div>
                                        <div className="stat-item">
                                            <h3 className="stat-value">{data.stats.todayDue?.value || 0}</h3>
                                            <p className="stat-title">Due Today</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                            <div className="boxes-header">
                                <h2>{t('dashboard.boxes.title')}</h2>
                                <Link to="/box/create" className="btn btn-primary">
                                    <i className="fas fa-plus"></i>
                                    {t('dashboard.boxes.create')}
                                </Link>
                            </div>
                            <div className="boxes-grid boxes-grid-icons">
                                {data.boxes.length > 0 ? (
                                    data.boxes.map((box) => (
                                        <BoxCard 
                                            key={box.Box.ID} 
                                            box={box} 
                                            onActiveChange={handleActiveBoxChange}
                                            viewMode="icon"
                                        />
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-icon">
                                            <i className="fas fa-box"></i>
                                        </div>
                                        <h3>{t('dashboard.boxes.empty')}</h3>
                                        <p>{t('dashboard.boxes.createDesc')}</p>
                                        <Link to="/box/create" className="btn btn-primary">
                                            <i className="fas fa-plus"></i>
                                            {t('dashboard.boxes.create')}
                                        </Link>
                                    </div>
                                )}
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