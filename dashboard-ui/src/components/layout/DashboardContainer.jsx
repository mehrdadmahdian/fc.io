import Navigation from './Navigation';
import Footer from './Footer';
import PageTransition from '../common/PageTransition';

function DashboardContainer({ children }) {
    return (
        <PageTransition>
            <div className="dashboard-layout">
                <Navigation />
                <main className="dashboard-main">
                    {children}
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}

export default DashboardContainer; 