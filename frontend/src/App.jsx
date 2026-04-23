import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Customer/Home';
import MenuPage from './pages/Customer/MenuPage';
import AboutUs from './pages/Customer/AboutUs';
import ContactUs from './pages/Customer/ContactUs';
import Checkout from './pages/Customer/Checkout';
import Tracking from './pages/Customer/Tracking';
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import OrdersManager from './pages/Admin/OrdersManager';
import MenuManager from './pages/Admin/MenuManager';

function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<><Header /><Home /></>} />
        <Route path="/about" element={<><Header /><AboutUs /></>} />
        <Route path="/menu" element={<><Header /><MenuPage /></>} />
        <Route path="/contact" element={<><Header /><ContactUs /></>} />
        <Route path="/checkout" element={<><Header /><Checkout /></>} />
        <Route path="/track/:trackingNumber?" element={<><Header /><Tracking /></>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="menu" element={<MenuManager />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
