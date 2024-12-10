import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-links">
                        <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                        <Link to="/terms" className="footer-link">Terms of Service</Link>
                        <Link to="/contact" className="footer-link">Contact</Link>
                        <a href="https://twitter.com/flashcardsio" className="footer-link" target="_blank" rel="noopener noreferrer">Twitter</a>
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