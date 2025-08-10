import './assets/styles/fonts.css';
import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes';

function App() {
    // Debug: Log to console when App component mounts
    console.log('Dashboard App component loaded successfully');
    
    // Temporary: Add visible content to debug rendering
    return (
        <div>
            <BrowserRouter basename="/dashboard">
                <Routes />
            </BrowserRouter>
        </div>
    );
}

export default App; 