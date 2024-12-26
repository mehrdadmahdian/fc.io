import { useNavigate } from 'react-router-dom';
import '../../assets/styles/PageHeader.css';

function PageHeader({ title, showBack = true }) {
    const navigate = useNavigate();

    return (
        <div className="page-header-container">
            <div className="page-header">
                <div className="header-content">
                    {showBack && (
                        <button 
                            className="back-button" 
                            onClick={() => navigate(-1)}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                    )}
                    <h4>{title}</h4>
                </div>
            </div>
        </div>
    );
}

export default PageHeader; 