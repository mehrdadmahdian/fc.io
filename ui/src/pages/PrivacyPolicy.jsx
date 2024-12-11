import { useTranslation } from 'react-i18next';
import '../assets/styles/Legal.css';

function PrivacyPolicy() {
    const { t } = useTranslation();

    return (
        <div className="legal-container">
            <div className="legal-content">
                <h1>Privacy Policy</h1>
                <p className="last-updated">Last updated: <strong>11.12.2024</strong></p>

                <div className="legal-section">
                    <h2>1. Introduction</h2>
                    <p>Welcome to <strong>"No Name Defined Yet Website"</strong>! I value your privacy and am committed to protecting your personal data. This privacy policy explains how I collect, use, and safeguard your information.</p>
                </div>

                <div className="legal-section">
                    <h2>2. Data Collection</h2>
                    <p>I may collect the following information:</p>
                    <ul>
                        <li><strong>Log Data:</strong> Nothing for now.</li>
                        <li><strong>Optional Data:</strong> If you contact me or register, I may collect your name, email, or any other information you provide.</li>
                        <li><strong>Cookies:</strong> See Section 4 for details.</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>3. Purpose of Data Processing</h2>
                    <p>Your data is processed to:</p>
                    <ul>
                        <li>Ensure the website operates correctly and securely.</li>
                        <li>Respond to inquiries or requests.</li>
                        <li>Analyze and improve website functionality.</li>
                    </ul>
                    <p>The legal basis is <strong>legitimate interest</strong> or your <strong>consent</strong>, where applicable.</p>
                </div>

                <div className="legal-section">
                    <h2>4. Cookies and Tracking</h2>
                    <p>Cookies are used to improve your experience. You can manage cookies in your browser settings.</p>
                    <ul>
                        <li><strong>Essential Cookies:</strong> Required for website functionality.</li>
                        <li><strong>Optional Cookies:</strong> Used for analytics or preferences (requires consent).</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>5. Data Sharing</h2>
                    <p>Your data is not shared except:</p>
                    <ul>
                        <li>To comply with legal obligations.</li>
                        <li>With service providers necessary for hosting the website.</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>6. Your Rights</h2>
                    <p>Under GDPR, you have the right to:</p>
                    <ul>
                        <li>Access your data.</li>
                        <li>Correct inaccuracies.</li>
                        <li>Request deletion of your data.</li>
                        <li>Restrict certain processing activities.</li>
                        <li>Object to specific processing activities.</li>
                        <li>Lodge a complaint with the German Data Protection Authority (<a href="https://www.bfdi.bund.de/" target="_blank" rel="noopener noreferrer">BfDI</a>).</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>7. Data Retention</h2>
                    <p>Your data is retained as long as necessary for the stated purposes or as required by law. You can request deletion of your data at any time.</p>
                </div>

                <div className="legal-section">
                    <h2>8. Security Measures</h2>
                    <p>Appropriate measures are in place to protect your data, including secure hosting and restricted access to sensitive information.</p>
                </div>

                <div className="legal-section">
                    <h2>9. Contact Information</h2>
                    <p>If you have any questions, please contact:</p>
                    <p><strong>Name:</strong> Mohammadhassan Mahdian</p>
                    <p><strong>Email:</strong> <a href="mailto:mahdian.mhd@gmail.com">mahdian.mhd@gmail.com</a></p>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy; 