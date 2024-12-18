export default function Stats() {
    return (
        <section className="stats-section">
            <div className="stats-container">
                <div className="stat-card">
                    <i className="fas fa-users stat-icon"></i>
                    <div className="stat-number">10k+</div>
                    <div className="stat-label">Active Users</div>
                </div>
                
                <div className="stat-card">
                    <i className="fas fa-brain stat-icon"></i>
                    <div className="stat-number">1M+</div>
                    <div className="stat-label">Cards Created</div>
                </div>
                
                <div className="stat-card">
                    <i className="fas fa-chart-line stat-icon"></i>
                    <div className="stat-number">95%</div>
                    <div className="stat-label">Success Rate</div>
                </div>
            </div>
        </section>
    );
} 