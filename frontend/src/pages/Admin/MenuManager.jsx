import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { UploadButton } from '../../utils/uploadthing';
import { API_BASE_URL } from '../../config';

const MenuManager = () => {
  const [items, setItems] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    isAvailable: true,
    discountPrice: 0,
    isDeal: false,
    dealItems: [],
  });

  const fetchMenu = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/menu`);
      setItems(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const resetForm = () => {
    setFormData({ 
      name: '', description: '', price: '', image: '', category: '', 
      isAvailable: true, discountPrice: 0, isDeal: false, dealItems: [] 
    });
    setEditingId(null);
    setFormVisible(false);
  };

  const handleEdit = (item) => {
    // Normalizing dealItems to just store the IDs and quantities for the form state
    const normalizedDealItems = item.dealItems ? item.dealItems.map(d => ({
      menuItem: d.menuItem._id || d.menuItem,
      quantity: d.quantity
    })) : [];

    setFormData({ 
      ...item, 
      discountPrice: item.discountPrice || 0,
      isDeal: item.isDeal || false,
      dealItems: normalizedDealItems
    });
    setEditingId(item._id);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/menu/${id}`);
        fetchMenu();
      } catch (error) {
        console.error('Error deleting item', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/menu/${editingId}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/api/menu`, formData);
      }
      fetchMenu();
      resetForm();
    } catch (error) {
      console.error('Error saving item', error);
    }
  };

  const handleDealItemToggle = (menuItemId) => {
    setFormData(prev => {
      const exists = prev.dealItems.find(d => d.menuItem === menuItemId);
      if (exists) {
        return { ...prev, dealItems: prev.dealItems.filter(d => d.menuItem !== menuItemId) };
      } else {
        return { ...prev, dealItems: [...prev.dealItems, { menuItem: menuItemId, quantity: 1 }] };
      }
    });
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Menu Management</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setFormVisible(true); }}>
          <FiPlus /> Add New Item
        </button>
      </div>

      {formVisible && (
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
          <h3>{editingId ? 'Edit Menu Item' : 'Add New Item'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
            <div className="grid-cols-2">
              <div className="input-group">
                <label className="input-label">Name</label>
                <input type="text" className="input-field" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <input type="text" className="input-field" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
              </div>

              <div className="input-group">
                <label className="input-label">Standard Price ($)</label>
                <input type="number" step="0.01" className="input-field" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Discount Price ($) <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>(Optional, 0 = No Discount)</span></label>
                <input type="number" step="0.01" className="input-field" value={formData.discountPrice} onChange={(e) => setFormData({...formData, discountPrice: e.target.value})} />
              </div>

              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Image (Upload or Image URL)</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input type="text" className="input-field" required value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                  <div style={{ flexShrink: 0 }}>
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setFormData({...formData, image: res[0].url});
                        }
                      }}
                      onUploadError={(error) => {
                        alert(`ERROR! ${error.message}`);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input-field" required rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
            </div>

            <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', background: 'white' }}>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: formData.isDeal ? '1.5rem' : '0' }}>
                <input type="checkbox" id="isDeal" checked={formData.isDeal} onChange={(e) => setFormData({...formData, isDeal: e.target.checked})} />
                <label htmlFor="isDeal" style={{ fontWeight: 'bold', cursor: 'pointer', color: 'var(--primary-dark)' }}>Make this item a Combo Deal</label>
              </div>

              {formData.isDeal && (
                <div>
                  <label className="input-label">Select Items Included in this Deal:</label>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    {items.filter(i => !i.isDeal && i._id !== editingId).map(menuItem => {
                      const isChecked = formData.dealItems.some(d => d.menuItem === menuItem._id);
                      return (
                        <div key={menuItem._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                          <input 
                            type="checkbox" 
                            id={`deal-${menuItem._id}`} 
                            checked={isChecked}
                            onChange={() => handleDealItemToggle(menuItem._id)}
                          />
                          <label htmlFor={`deal-${menuItem._id}`} style={{ cursor: 'pointer', display:'flex', alignItems:'center', gap:'1rem' }}>
                            <img src={menuItem.image} alt={menuItem.name} style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                            {menuItem.name} <span style={{ color: 'var(--text-muted)' }}>(${menuItem.price})</span>
                          </label>
                        </div>
                      )
                    })}
                    {items.filter(i => !i.isDeal && i._id !== editingId).length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No standalone items available to add to a deal yet.</p>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Note: The Deal price is set by the "Standard Price" & "Discount Price" fields above. It does not automatically sum up.</p>
                </div>
              )}
            </div>

            <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})} />
              <label htmlFor="isAvailable" style={{ fontWeight: '500', cursor: 'pointer' }}>Item is Available for Ordering</label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Item' : 'Save Item'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id}>
                <td>
                  <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                </td>
                <td>
                  <div style={{ fontWeight: 'bold' }}>
                    {item.name}
                    {item.isDeal && <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>Deal</span>}
                  </div>
                  {item.discountPrice > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 'bold' }}>Discounted!</div>
                  )}
                </td>
                <td>{item.category}</td>
                <td>
                  {item.discountPrice > 0 ? (
                    <div>
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '0.5rem', fontSize: '0.875rem' }}>${item.price.toFixed(2)}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${item.discountPrice.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${item.price.toFixed(2)}</span>
                  )}
                </td>
                <td>
                  <span className={`badge badge-${item.isAvailable ? 'success' : 'danger'}`}>
                    {item.isAvailable ? 'Available' : 'Out of Stock'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-icon" style={{ color: 'var(--text-main)' }} onClick={() => handleEdit(item)}><FiEdit2 /></button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No menu items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuManager;
