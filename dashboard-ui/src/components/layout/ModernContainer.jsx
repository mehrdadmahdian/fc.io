import Navigation from './Navigation';
import PageTransition from '../common/PageTransition';

function ModernContainer({ children }) {
    return (
        <PageTransition>
            <div className="modern-layout">
                <Navigation />
                <main className="modern-main">
                    {children}
                </main>
            </div>
        </PageTransition>
    );
}

export default ModernContainer;
