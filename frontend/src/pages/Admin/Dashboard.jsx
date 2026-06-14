import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { io } from 'socket.io-client';
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiActivity, FiAward, FiClock } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/api/orders');
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = io(API_BASE_URL);
    
    socket.on('newOrder', (newOrder) => {
      setOrders(prev => {
        if (prev.some(o => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
    });

    socket.on('orderEditedByCustomer', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    socket.on('orderAcknowledged', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    socket.on('orderDeleted', (deletedId) => {
      setOrders(prev => prev.filter(o => o._id !== deletedId));
    });

    return () => socket.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading dashboard analytics...</h2>
      </div>
    );
  }

  // 1. Stats Calculations
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => order.status !== 'Cancelled' ? sum + order.totalAmount : sum, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Sort orders by newest first (Today's orders at top)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 2. Revenue Trend for Last 7 Days (Line Chart)
  const getRevenueTrend = () => {
    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(i === 0 ? 'Today' : label);
      
      const dayRev = orders
        .filter(o => o.status !== 'Cancelled' && o.createdAt.split('T')[0] === dateStr)
        .reduce((sum, o) => sum + o.totalAmount, 0);
      data.push(dayRev);
    }
    return { labels, data };
  };
  const revenueTrend = getRevenueTrend();

  const revenueChartData = {
    labels: revenueTrend.labels,
    datasets: [
      {
        label: 'Daily Revenue (AED)',
        data: revenueTrend.data,
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointHoverRadius: 6,
      },
    ],
  };

  // 3. Today's Revenue & Daily Target (Gauge/Meter Chart)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = orders
    .filter(o => o.status !== 'Cancelled' && o.createdAt.split('T')[0] === todayStr)
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const dailyTarget = 1500;
  const targetPercent = Math.min(100, Math.round((todayRevenue / dailyTarget) * 100));

  const gaugeChartData = {
    labels: ['Today\'s Sales', 'Goal Remaining'],
    datasets: [
      {
        data: [todayRevenue, Math.max(0, dailyTarget - todayRevenue)],
        backgroundColor: ['#10b981', '#e5e7eb'],
        hoverBackgroundColor: ['#059669', '#d1d5db'],
        borderWidth: 0,
      },
    ],
  };

  const gaugeChartOptions = {
    circumference: 180,
    rotation: 270,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: AED ${context.raw.toFixed(2)}`
        }
      }
    },
    cutout: '75%',
  };

  // 4. Top 5 Selling Items (Pie Chart)
  const getTopItems = () => {
    const sales = {};
    orders.forEach(o => {
      if (o.status !== 'Cancelled') {
        o.items.forEach(item => {
          sales[item.name] = (sales[item.name] || 0) + item.quantity;
        });
      }
    });
    const sorted = Object.entries(sales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return {
      labels: sorted.map(s => s[0]),
      data: sorted.map(s => s[1]),
    };
  };
  const topItems = getTopItems();

  const topItemsChartData = {
    labels: topItems.labels.length > 0 ? topItems.labels : ['No Data Available'],
    datasets: [
      {
        data: topItems.data.length > 0 ? topItems.data : [1],
        backgroundColor: [
          'rgba(248, 113, 113, 0.85)', // soft red
          'rgba(96, 165, 250, 0.85)',  // soft blue
          'rgba(52, 211, 153, 0.85)',  // soft green
          'rgba(251, 191, 36, 0.85)',  // soft amber
          'rgba(167, 139, 250, 0.85)'  // soft purple
        ],
        borderColor: 'var(--border)',
        borderWidth: 1,
      },
    ],
  };

  // 5. Peak Ordering Hours (Bar Chart)
  const getHourlyStats = () => {
    const hours = Array(24).fill(0);
    orders.forEach(o => {
      const date = new Date(o.createdAt);
      const hour = date.getHours();
      hours[hour]++;
    });
    // Operating hours 08:00 to 23:00
    const startHour = 8;
    const endHour = 23;
    const labels = [];
    const data = [];
    for (let h = startHour; h <= endHour; h++) {
      labels.push(`${h.toString().padStart(2, '0')}:00`);
      data.push(hours[h]);
    }
    return { labels, data };
  };
  const hourlyStats = getHourlyStats();

  const hourlyChartData = {
    labels: hourlyStats.labels,
    datasets: [
      {
        label: 'Orders Placed',
        data: hourlyStats.data,
        backgroundColor: 'rgba(96, 165, 250, 0.85)',
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.95)',
        borderRadius: 4,
        borderWidth: 0,
      },
    ],
  };

  // 6. Order Status Breakdown (Doughnut Chart)
  const getStatusStats = () => {
    const counts = { Pending: 0, Approved: 0, Preparing: 0, 'On the Way': 0, Delivered: 0, Cancelled: 0 };
    orders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return {
      labels: Object.keys(counts),
      data: Object.values(counts),
    };
  };
  const statusStats = getStatusStats();

  const statusChartData = {
    labels: statusStats.labels,
    datasets: [
      {
        data: statusStats.data,
        backgroundColor: [
          'rgba(251, 191, 36, 0.85)', // Pending (Amber)
          'rgba(96, 165, 250, 0.85)',  // Approved (Blue)
          'rgba(129, 140, 248, 0.85)', // Preparing (Indigo)
          'rgba(167, 139, 250, 0.85)', // On the Way (Purple)
          'rgba(52, 211, 153, 0.85)',  // Delivered (Green)
          'rgba(248, 113, 113, 0.85)'  // Cancelled (Red)
        ],
        borderColor: 'var(--border)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      {/* 4 Stats Cards Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p>AED {totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <FiShoppingCart />
          </div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p>{totalOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: 'var(--warning)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <p>{pendingOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <FiActivity />
          </div>
          <div className="stat-info">
            <h3>Avg Order Value</h3>
            <p>AED {averageOrderValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts Layout Row 1: Line & Gauge */}
      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiActivity style={{ color: 'var(--primary)' }} /> Revenue Trend (Last 7 Days)
          </h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
            <Line 
              data={revenueChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(0,0,0,0.05)' } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', position: 'relative' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiAward style={{ color: '#10b981' }} /> Daily Sales Goal
          </h3>
          <div style={{ height: '180px', position: 'relative', marginTop: '1rem' }}>
            <Doughnut data={gaugeChartData} options={gaugeChartOptions} />
            <div style={{ position: 'absolute', top: '75%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{targetPercent}%</span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Achieved</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>TODAY'S REVENUE</p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>AED {todayRevenue.toFixed(2)}</p>
            </div>
            <div style={{ borderRight: '1px solid var(--border)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>DAILY TARGET</p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>AED {dailyTarget.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Layout Row 2: Top Selling & Peak Ordering Hours */}
      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiAward style={{ color: 'var(--warning)' }} /> Top 5 Selling Items
          </h3>
          <div style={{ height: '280px', display: 'flex', justifyContent: 'center' }}>
            {topItems.labels.length > 0 ? (
              <Pie 
                data={topItemsChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } }
                }} 
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>No items sold yet.</div>
            )}
          </div>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiClock style={{ color: '#0284c7' }} /> Peak Ordering Hours
          </h3>
          <div style={{ height: '280px' }}>
            <Bar 
              data={hourlyChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { precision: 0 } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Charts Layout Row 3: Status Distribution & Recent Orders */}
      <div className="grid-cols-2">
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiTrendingUp style={{ color: 'var(--success)' }} /> Orders Status Distribution
          </h3>
          <div style={{ height: '280px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut 
              data={statusChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } }
              }} 
            />
          </div>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', height: '346px', overflowY: 'auto', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1.5rem', position: 'sticky', top: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(5px)', paddingBottom: '0.5rem', zIndex: 2 }}>
            Recent Orders
          </h3>
          {sortedOrders.length > 0 ? (
            sortedOrders.slice(0, 10).map(order => {
              const isToday = new Date(order.createdAt).toISOString().split('T')[0] === todayStr;
              return (
                <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0.5rem', borderBottom: '1px solid var(--border)', background: isToday ? 'rgba(16, 185, 129, 0.04)' : 'transparent' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>{order.trackingNumber}</p>
                      {isToday && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'var(--success-light)', color: 'var(--success)', borderRadius: '4px', fontWeight: 'bold' }}>TODAY</span>}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>{order.customerName}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>AED {order.totalAmount.toFixed(2)}</p>
                    <span className={`badge badge-${order.status === 'Pending' ? 'warning' : order.status === 'Cancelled' ? 'danger' : 'success'}`} style={{ marginTop: '5px', display: 'inline-block' }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders placed yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
