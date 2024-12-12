import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Review from './pages/Review';
import AddCard from './pages/AddCard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProtectedRoute from './components/common/ProtectedRoute';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            <Route path="/dashboard" element={<ProtectedRoute />}>
                <Route index element={<Dashboard />} />
                <Route path="box/:boxId/review" element={<Review />} />
                <Route path="box/:boxId/cards/create" element={<AddCard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App; 