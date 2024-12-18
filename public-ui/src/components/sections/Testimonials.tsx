export default function Testimonials() {
    return (
        <section className="testimonials-section">
            <h2>What Our Users Say</h2>
            <div className="testimonials-grid">
                <div className="testimonial-card">
                    <div className="testimonial-content">
                        <i className="fas fa-quote-left"></i>
                        <p>"This app transformed how I study medicine. The spaced repetition system is incredibly effective."</p>
                    </div>
                    <div className="testimonial-author">
                        <img src="https://source.unsplash.com/100x100/?portrait,1" alt="Sarah" />
                        <div>
                            <h4>Sarah Johnson</h4>
                            <p>Medical Student</p>
                        </div>
                    </div>
                </div>
                <div className="testimonial-card">
                    <div className="testimonial-content">
                        <i className="fas fa-quote-left"></i>
                        <p>"Perfect for language learning! My vocabulary retention has improved significantly."</p>
                    </div>
                    <div className="testimonial-author">
                        <img src="https://source.unsplash.com/100x100/?portrait,2" alt="Michael" />
                        <div>
                            <h4>Michael Chen</h4>
                            <p>Language Learner</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
} 