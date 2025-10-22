import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import BoxReview from './pages/box/Review';
import ReverseReview from './pages/box/ReverseReview';
import GlobalReview from './pages/box/GlobalReview';
import GlobalReverseReview from './pages/box/GlobalReverseReview';
import CustomReview from './pages/box/CustomReview';
import BoxCustomReview from './pages/box/BoxCustomReview';
import CardCreate from './pages/box/CardCreate';
import BoxCreate from './pages/box/BoxCreate';
import BoxDetails from './pages/box/BoxDetails';
import BoxPresentation from './pages/box/BoxPresentation';
// Social pages
import PublicBoxes from './pages/social/PublicBoxes';
import ActivityFeed from './pages/social/ActivityFeed';
import UserProfile from './pages/social/UserProfile';
import UserSearch from './pages/social/UserSearch';

const Routes = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Show nothing while checking authentication
    if (isLoading) {
        return <div>Checking authentication...</div>;
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
            {/* More specific routes must come before less specific ones */}
            <Route 
                path="/box/:boxId/cards/create" 
                element={<CardCreate />}
            />
            <Route 
                path="/box/:boxId/cards/:cardId/edit" 
                element={isAuthenticated ? <CardCreate /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/box/:boxId/review" 
                element={isAuthenticated ? <BoxReview /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/box/:boxId/review/reverse" 
                element={isAuthenticated ? <ReverseReview /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/box/:boxId/review/custom" 
                element={isAuthenticated ? <BoxCustomReview /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/box/:boxId/presentation" 
                element={isAuthenticated ? <BoxPresentation /> : <Navigate to="/auth/login" />} 
            />
            
            {/* Global review routes */}
            <Route 
                path="/review/global" 
                element={isAuthenticated ? <GlobalReview /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/review/global/reverse" 
                element={isAuthenticated ? <GlobalReverseReview /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/review/custom" 
                element={isAuthenticated ? <CustomReview /> : <Navigate to="/auth/login" />} 
            />
            
            <Route 
                path="/box/:boxId" 
                element={isAuthenticated ? <BoxDetails /> : <Navigate to="/auth/login" />} 
            />
            
            {/* Social routes */}
            <Route 
                path="/social/discover" 
                element={isAuthenticated ? <PublicBoxes /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/social/feed" 
                element={isAuthenticated ? <ActivityFeed /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/social/users/search" 
                element={isAuthenticated ? <UserSearch /> : <Navigate to="/auth/login" />} 
            />
            <Route 
                path="/users/:userId/profile" 
                element={isAuthenticated ? <UserProfile /> : <Navigate to="/auth/login" />} 
            />
        </RouterRoutes>
    );
};

export default Routes; 