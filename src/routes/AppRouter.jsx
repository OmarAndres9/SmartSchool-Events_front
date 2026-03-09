import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import local views
import Login from '../views/auth/Login';
import Register from '../views/auth/Register';
import Dashboard from '../views/dashboard/Dashboard';
import EventsList from '../views/events/EventsList';
import Logistics from '../views/logistics/Logistics';
import Notifications from '../views/notifications/Notifications';
import Settings from '../views/settings/Settings';
import UsersList from '../views/users/UsersList';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Main Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/events" element={<EventsList />} />
                <Route path="/logistics" element={<Logistics />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/users" element={<UsersList />} />

                {/* Fallback - Redirect to login for now */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
