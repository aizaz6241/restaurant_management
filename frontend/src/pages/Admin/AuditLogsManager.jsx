import { useState, useEffect } from 'react';
import { FiClock, FiUser, FiInfo, FiActivity } from 'react-icons/fi';
import api from '../../utils/api';

const AuditLogsManager = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/orders/logs');
      setLogs(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to fetch audit logs.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const toggleExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE_ORDER':
        return <span className="badge badge-success">New Order</span>;
      case 'ADMIN_EDIT_ORDER':
        return <span className="badge badge-warning">Admin Edit</span>;
      case 'CUSTOMER_ADD_ITEMS':
        return <span className="badge badge-danger" style={{ animation: 'pulseBadge 2s infinite' }}>Customer Edit</span>;
      case 'DELETE_ORDER':
        return <span className="badge badge-danger">Order Deleted</span>;
      case 'UPDATE_STATUS':
        return <span className="badge badge-success">Status Update</span>;
      case 'ACKNOWLEDGE_ORDER':
        return <span className="badge badge-success" style={{ background: '#10B981', color: 'white' }}>Alarm Ticked</span>;
      default:
        return <span className="badge badge-outline">{action}</span>;
    }
  };

  const formatLogDetails = (log) => {
    if (!log.details) return 'No details available';
    
    // Customize rendering based on action type
    if (log.action === 'UPDATE_STATUS') {
      return (
        <div>
          <strong>Status Change:</strong> From <span className="badge badge-warning">{log.details.oldStatus}</span> to <span className="badge badge-success">{log.details.newStatus}</span>
        </div>
      );
    }
    
    if (log.action === 'CUSTOMER_ADD_ITEMS') {
      return (
        <div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Items Added:</strong>
          </div>
          <ul style={{ paddingLeft: '1.25rem', margin: '0 0 0.5rem 0' }}>
            {log.details.addedItems?.map((item, idx) => (
              <li key={idx}>
                {item.quantity}x {item.name} {item.version && `(${item.version})`} @ AED {item.price} each
              </li>
            ))}
          </ul>
          <div>
            <strong>Amount Updated:</strong> From <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>AED {log.details.oldTotal?.toFixed(2)}</span> to <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>AED {log.details.newTotal?.toFixed(2)}</span>
          </div>
        </div>
      );
    }

    if (log.action === 'ADMIN_EDIT_ORDER') {
      return (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Modified Order Details:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#fafafa', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <div style={{ fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '0.8rem' }}>BEFORE</div>
              <div style={{ fontSize: '0.85rem' }}>
                <div>Name: {log.details.old?.customerName}</div>
                <div>Phone: {log.details.old?.phoneNumber}</div>
                <div>Address: {log.details.old?.address}</div>
                <div>Total: AED {log.details.old?.totalAmount?.toFixed(2)}</div>
                <div>Status: {log.details.old?.status}</div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.8rem' }}>AFTER</div>
              <div style={{ fontSize: '0.85rem' }}>
                <div>Name: {log.details.new?.customerName}</div>
                <div>Phone: {log.details.new?.phoneNumber}</div>
                <div>Address: {log.details.new?.address}</div>
                <div>Total: AED {log.details.new?.totalAmount?.toFixed(2)}</div>
                <div>Status: {log.details.new?.status}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (log.action === 'DELETE_ORDER') {
      return (
        <div>
          <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Deleted Order details:</span>
          <pre style={{ margin: '0.5rem 0 0 0', background: '#fafafa', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(log.details.deletedOrder, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <pre style={{ margin: 0, background: '#fafafa', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(log.details, null, 2)}
      </pre>
    );
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>System Audit Logs</h1>
        <button onClick={fetchLogs} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
          Refresh
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem' }}>Loading logs...</div>}
      {error && <div className="badge badge-danger" style={{ display: 'block', textAlign: 'center', padding: '1rem' }}>{error}</div>}

      {!loading && !error && (
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Action</th>
                <th>Order ID / Track</th>
                <th>Actor</th>
                <th>Timestamp</th>
                <th>Details Preview</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const isExpanded = expandedLogId === log._id;
                return (
                  <>
                    <tr 
                      key={log._id} 
                      onClick={() => toggleExpand(log._id)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <FiActivity style={{ color: 'var(--text-muted)' }} />
                      </td>
                      <td>{getActionBadge(log.action)}</td>
                      <td style={{ fontWeight: 'bold' }}>{log.trackingNumber || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
                          <FiUser style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontWeight: '600' }}>{log.changedBy}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <FiClock />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.action === 'UPDATE_STATUS' && `Status changed to ${log.details?.newStatus}`}
                        {log.action === 'CUSTOMER_ADD_ITEMS' && `Added ${log.details?.addedItems?.length || 0} item(s)`}
                        {log.action === 'ADMIN_EDIT_ORDER' && `Modified details`}
                        {log.action === 'DELETE_ORDER' && `Deleted order`}
                        {log.action === 'CREATE_ORDER' && `Order placed by ${log.details?.customerName}`}
                        {log.action === 'ACKNOWLEDGE_ORDER' && `Acknowledged by admin`}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${log._id}-details`}>
                        <td colSpan="6" style={{ background: 'var(--bg-color)', padding: '1.5rem 2rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                            <FiInfo /> Detailed Log Info
                          </div>
                          <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            {formatLogDetails(log)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No system logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogsManager;
