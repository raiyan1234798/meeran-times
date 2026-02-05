import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import ShopSelection from './pages/ShopSelection';
import Layout from './components/Layout';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Suppliers from './pages/Suppliers';
import SalesHistory from './pages/SalesHistory';
import Settings from './pages/Settings';
import StockTransfers from './pages/StockTransfers';
import SmartStock from './pages/SmartStock';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Replace with a nice spinner

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; // Unauthorized: Redirect to dashboard
  }

  return children;
};

// Placeholder Components for now




import { ShopProvider } from './contexts/ShopContext';

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/shops" element={
              <ProtectedRoute>
                <ShopSelection />
              </ProtectedRoute>
            } />

            {/* Protected Routes inside Main Layout */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'cashier', 'salesman']}><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/smart-stock" element={<SmartStock />} />

              {/* Admin Only Routes */}
              <Route path="/inventory" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Inventory />
                </ProtectedRoute>
              } />

              <Route path="/employees" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Employees />
                </ProtectedRoute>
              } />

              <Route path="/suppliers" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suppliers />
                </ProtectedRoute>
              } />

              <Route path="/stock-transfers" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StockTransfers />
                </ProtectedRoute>
              } />

              <Route path="/sales" element={
                <ProtectedRoute allowedRoles={['admin', 'cashier', 'salesman']}>
                  <SalesHistory />
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['admin', 'cashier', 'salesman']}>
                  <Settings />
                </ProtectedRoute>
              } />

              <Route path="*" element={<h3>404 - Page Not Found</h3>} />
            </Route>
          </Routes>
        </Router>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
