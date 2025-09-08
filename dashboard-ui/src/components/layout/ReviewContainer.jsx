import Navigation from './Navigation';
import PageTransition from '../common/PageTransition';

function ReviewContainer({ children }) {
    return (
        <PageTransition>
            <div className="review-layout">
                <Navigation />
                <main className="review-main">
                    {children}
                </main>
            </div>
        </PageTransition>
    );
}

export default ReviewContainer;
