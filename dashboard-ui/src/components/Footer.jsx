import { Link } from 'react-router-dom';
import '../assets/styles/Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-links">
                        <Link to="/privacy" className="footer-link">Privacy</Link>
                        {" • "}
                        <Link to="/terms" className="footer-link">Terms</Link>
                        {" • "}
                        <Link to="/contact" className="footer-link">Contact</Link>

                    </div>
                    <div className="copyright">
                        © 2024 "No Name Defined Yet Website". All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer; 