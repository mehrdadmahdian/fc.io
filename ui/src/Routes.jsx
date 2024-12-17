import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import BoxReview from './pages/box/Review';
import AddCard from './pages/box/AddCard';

const Routes = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Show nothing while checking authentication
    if (isLoading) {
        return null;
    }

    return (
        <RouterRoutes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route 
                path="/dashboard" 
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
                path="/dashboard/profile" 
                element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
            />
            <Route 
                path="/dashboard/settings" 
                element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} 
            />
            <Route 
                path="/dashboard/box/:boxId/review" 
                element={isAuthenticated ? <BoxReview /> : <Navigate to="/login" />} 
            />
            <Route 
                path="/dashboard/box/:boxId/cards/create" 
                element={isAuthenticated ? <AddCard /> : <Navigate to="/login" />} 
            />
        </RouterRoutes>
    );
};

export default Routes; 