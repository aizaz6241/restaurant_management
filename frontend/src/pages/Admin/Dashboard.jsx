import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FiDollarSign, FiShoppingCart, FiTrendingUp } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/orders`);
        setOrders(data);
        calculateStats(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();

    const socket = io(API_BASE_URL);
    socket.on('newOrder', (newOrder) => {
      setOrders(prev => {
        const updated = [newOrder, ...prev];
        calculateStats(updated);
        return updated;
      });
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prev => {
        const updated = prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
        calculateStats(updated);
        return updated;
      });
    });

    return () => socket.disconnect();
  }, []);

  const calculateStats = (ordersData) => {
    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, order) => order.status !== 'Cancelled' ? sum + order.totalAmount : sum, 0);
    const pendingOrders = ordersData.filter(o => o.status === 'Pending').length;
    setStats({ totalOrders, totalRevenue, pendingOrders });
  };

  const chartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [120, 190, 300, 250, 400, 350, stats.totalRevenue || 500],
        borderColor: 'rgba(248, 113, 113, 1)',
        backgroundColor: 'rgba(248, 113, 113, 0.2)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div className="grid-cols-3" style={{ marginBottom: '3rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p>${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: 'var(--success)' }}>
            <FiShoppingCart />
          </div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: 'var(--warning)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <p>{stats.pendingOrders}</p>
          </div>
        </div>
      </div>

      <div className="grid-cols-2">
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Revenue Over Time</h3>
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', height: '400px', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Orders</h3>
          {orders.slice(0, 5).map(order => (
            <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>{order.trackingNumber}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{order.customerName}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 'bold' }}>${order.totalAmount.toFixed(2)}</p>
                <span className={`badge badge-${order.status === 'Pending' ? 'warning' : order.status === 'Cancelled' ? 'danger' : 'success'}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
