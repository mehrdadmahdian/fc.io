import './assets/styles/fonts.css';
import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/common/Toast';

function App() {
    return (
        <ToastProvider>
            <div>
                <BrowserRouter basename="/dashboard">
                    <Routes />
                </BrowserRouter>
                <ToastContainer />
            </div>
        </ToastProvider>
    );
}

export default App; 