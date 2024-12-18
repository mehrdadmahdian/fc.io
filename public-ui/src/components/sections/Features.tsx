export default function Features() {
    return (
        <section className="features-section">
            <div className="features-container">
                <h2>Why Choose Our Flashcards?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-clock"></i>
                        </div>
                        <h3>Spaced Repetition</h3>
                        <p>Review cards at optimal intervals to maximize long-term retention</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-brain"></i>
                        </div>
                        <h3>Smart Learning</h3>
                        <p>Adaptive algorithm adjusts to your learning pace and style</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <h3>Track Progress</h3>
                        <p>Visualize your learning journey with detailed statistics</p>
                    </div>
                </div>
            </div>
        </section>
    );
} 