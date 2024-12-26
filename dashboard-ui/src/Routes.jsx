import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import BoxReview from './pages/box/Review';
import CardCreate from './pages/box/CardCreate';
import BoxCreate from './pages/box/BoxCreate';

const Routes = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Show nothing while checking authentication
    if (isLoading) {
        return null;
    }

    return (
        <RouterRoutes>        
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route 
                path="/" 
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/profile" 
                element={isAuthenticated ? <Profile /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/settings" 
                element={isAuthenticated ? <Settings /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/box/create" 
                element={isAuthenticated ? <BoxCreate /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/box/:boxId/review" 
                element={isAuthenticated ? <BoxReview /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/box/:boxId/cards/create" 
                element={isAuthenticated ? <CardCreate /> : <Navigate to="/auth/login" />} 
            />
        </RouterRoutes>
    );
};

export default Routes; 