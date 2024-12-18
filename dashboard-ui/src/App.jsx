import './assets/styles/fonts.css';
import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes';

function App() {
    return (
        <BrowserRouter basename="/dashboard">
            <Routes />
        </BrowserRouter>
    );
}

export default App; 