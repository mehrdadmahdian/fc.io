import { motion } from 'framer-motion';

export default function Pricing() {
    return (
        <section className="pricing-section">
            <h2>Choose Your Plan</h2>
            <div className="pricing-grid">
                <motion.div 
                    className="pricing-card"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="pricing-header">
                        <h3>Free</h3>
                        <div className="price">€0<span>/month</span></div>
                    </div>
                    <ul className="pricing-features">
                        <li><i className="fas fa-check"></i> Basic flashcard creation</li>
                        <li><i className="fas fa-check"></i> Up to 100 cards</li>
                        <li><i className="fas fa-check"></i> Basic statistics</li>
                    </ul>
                    <button className="btn-secondary">Get Started</button>
                </motion.div>

                <motion.div 
                    className="pricing-card featured"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="pricing-header">
                        <h3>Pro</h3>
                        <div className="price">€5<span>/month</span></div>
                    </div>
                    <ul className="pricing-features">
                        <li><i className="fas fa-check"></i> Unlimited flashcards</li>
                        <li><i className="fas fa-check"></i> Advanced statistics</li>
                        <li><i className="fas fa-check"></i> Custom study schedules</li>
                        <li><i className="fas fa-check"></i> Priority support</li>
                        <li><i className="fas fa-check"></i> No ads</li>
                    </ul>
                    <button className="btn-primary">Get Pro</button>
                </motion.div>
            </div>
        </section>
    );
} 