import Navigation from './Navigation';
import Footer from './Footer';
import PageTransition from '../common/PageTransition';
import FloatingAddButton from '../common/FloatingAddButton';

function DashboardContainer({ children }) {
    return (
        <PageTransition>
            <div className="dashboard-layout">
                <Navigation />
                <main className="dashboard-main">
                    {children}
                </main>
                <Footer />
                
                {/* Global floating components */}
                <FloatingAddButton />
            </div>
        </PageTransition>
    );
}

export default DashboardContainer; 