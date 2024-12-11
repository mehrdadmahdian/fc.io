import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Review from './pages/Review';
import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/box/:boxId/review" element={<Review />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}

export default App; 