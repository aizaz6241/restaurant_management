import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { UploadButton } from '../../utils/uploadthing';
import { compressImageFile } from '../../utils/imageOptimizer';

const MenuManager = () => {
  const [items, setItems] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [bulkSearchQuery, setBulkSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // 'All', 'Available', 'Unavailable'
  
  const [sidesList, setSidesList] = useState([]);
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
    sides: [],
    hasVersions: false,
    versions: [],
  });

  const fetchMenu = async () => {
    try {
      const { data } = await api.get('/api/menu');
      setItems(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const fetchSidesList = async () => {
    try {
      const { data } = await api.get('/api/sides');
      setSidesList(data);
    } catch (error) {
      console.error('Error fetching sides list:', error);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchSidesList();
  }, []);

  const resetForm = () => {
    setFormData({ 
      name: '', description: '', price: '', image: '', category: '', 
      isAvailable: true, discountPrice: 0, isDeal: false, dealItems: [], sides: [],
      hasVersions: false, versions: []
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

    const normalizedSides = item.sides ? item.sides.map(s => s._id || s) : [];

    setFormData({ 
      ...item, 
      discountPrice: item.discountPrice || 0,
      isDeal: item.isDeal || false,
      dealItems: normalizedDealItems,
      sides: normalizedSides,
      hasVersions: item.hasVersions || false,
      versions: item.versions || [],
    });
    setEditingId(item._id);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/api/menu/${id}`);
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
        await api.put(`/api/menu/${editingId}`, formData);
      } else {
        await api.post('/api/menu', formData);
      }
      fetchMenu();
      resetForm();
    } catch (error) {
      console.error('Error saving item', error);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const updatedItem = { ...item, isAvailable: !item.isAvailable };
      const normalizedDealItems = item.dealItems ? item.dealItems.map(d => ({
        menuItem: d.menuItem._id || d.menuItem,
        quantity: d.quantity
      })) : [];
      const normalizedSides = item.sides ? item.sides.map(s => s._id || s) : [];

      const payload = {
        ...updatedItem,
        dealItems: normalizedDealItems,
        sides: normalizedSides
      };

      await api.put(`/api/menu/${item._id}`, payload);
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, isAvailable: !item.isAvailable } : i));
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'All' || 
      (filter === 'Available' && item.isAvailable) || 
      (filter === 'Unavailable' && !item.isAvailable);
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
  const handleSideToggle = (sideId) => {
    setFormData(prev => {
      const exists = prev.sides.includes(sideId);
      if (exists) {
        return { ...prev, sides: prev.sides.filter(id => id !== sideId) };
      } else {
        return { ...prev, sides: [...prev.sides, sideId] };
      }
    });
  };

  const handleAddVersion = () => {
    setFormData(prev => ({
      ...prev,
      versions: [...prev.versions, { name: '', price: '', discountPrice: 0 }]
    }));
  };

  const handleRemoveVersion = (index) => {
    setFormData(prev => ({
      ...prev,
      versions: prev.versions.filter((_, idx) => idx !== index)
    }));
  };

  const handleVersionChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.versions];
      updated[index][field] = value;
      return { ...prev, versions: updated };
    });
  };
  return (
    <>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1>Menu Management</h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => { setBulkSearchQuery(''); setBulkModalVisible(true); }}
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Add to Not Available List
            </button>
            <button className="btn btn-primary" onClick={() => { resetForm(); setFormVisible(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiPlus /> Add New Item
            </button>
          </div>
        </div>

        {/* Availability and Search Filters */}
        <div className="glass" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', alignItems: 'center', border: '1px solid var(--border)' }}>
          <div style={{ flex: '1', minWidth: '220px', position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by food name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '35px', width: '100%', margin: 0 }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              className={`btn ${filter === 'All' ? 'btn-primary' : 'btn-outline'}`} 
              onClick={() => setFilter('All')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', height: '38px', borderRadius: 'var(--radius-full)' }}
            >
              All Items
            </button>
            <button 
              className={`btn ${filter === 'Available' ? 'btn-primary' : 'btn-outline'}`} 
              onClick={() => setFilter('Available')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', height: '38px', borderRadius: 'var(--radius-full)' }}
            >
              Available
            </button>
            <button 
              className={`btn ${filter === 'Unavailable' ? 'btn-primary' : 'btn-outline'}`} 
              onClick={() => setFilter('Unavailable')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', height: '38px', borderRadius: 'var(--radius-full)' }}
            >
              Not Available
            </button>
            {(searchQuery || filter !== 'All') && (
              <button 
                className="btn btn-outline" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', height: '38px', borderRadius: 'var(--radius-full)' }} 
                onClick={() => {
                  setSearchQuery('');
                  setFilter('All');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

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
              {filteredItems.map(item => (
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
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '0.5rem', fontSize: '0.875rem' }}>AED {item.price.toFixed(2)}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>AED {item.discountPrice.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>AED {item.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleAvailability(item); }}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: item.isAvailable ? '#d1fae5' : '#fde8e8',
                        color: item.isAvailable ? '#059669' : '#e11d48',
                        border: `1px solid ${item.isAvailable ? '#34d399' : '#fca5a5'}`,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                      title="Click to toggle availability"
                    >
                      <span style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: item.isAvailable ? '#10b981' : '#ef4444',
                        display: 'inline-block' 
                      }}></span>
                      {item.isAvailable ? 'Available' : 'Out of Stock'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" style={{ color: 'var(--text-main)' }} onClick={() => handleEdit(item)}><FiEdit2 /></button>
                      <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No menu items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formVisible && (
        <div className="admin-modal-overlay" onClick={resetForm}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Menu Item' : 'Add New Item'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-cols-2">
                <div className="input-group">
                  <label className="input-label">Name</label>
                  <input type="text" className="input-field" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <input type="text" className="input-field" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
                </div>

                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
                  <input type="checkbox" id="hasVersions" checked={formData.hasVersions} onChange={(e) => setFormData({...formData, hasVersions: e.target.checked})} />
                  <label htmlFor="hasVersions" style={{ fontWeight: 'bold', cursor: 'pointer', color: 'var(--primary-dark)' }}>This item has multiple versions/sizes (e.g. Half, Full, 1 KG)</label>
                </div>

                {!formData.hasVersions ? (
                  <>
                    <div className="input-group">
                      <label className="input-label">Standard Price (AED)</label>
                      <input type="number" step="0.01" className="input-field" required={!formData.hasVersions} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Discount Price (AED) <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>(Optional, 0 = No Discount)</span></label>
                      <input type="number" step="0.01" className="input-field" value={formData.discountPrice} onChange={(e) => setFormData({...formData, discountPrice: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <div style={{ gridColumn: 'span 2', background: '#f9fafb', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0 }}>Versions & Prices</h4>
                      <button type="button" className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }} onClick={handleAddVersion}>
                        + Add Version
                      </button>
                    </div>
                    {formData.versions.map((ver, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem', borderBottom: '1px dashed var(--border)', paddingBottom: '1rem' }}>
                        <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
                          <label className="input-label" style={{ fontSize: '0.8rem' }}>Version Name (e.g., Half, Full)</label>
                          <input type="text" className="input-field" style={{ padding: '0.5rem' }} required value={ver.name} placeholder="Half" onChange={(e) => handleVersionChange(idx, 'name', e.target.value)} />
                        </div>
                        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                          <label className="input-label" style={{ fontSize: '0.8rem' }}>Price (AED)</label>
                          <input type="number" step="0.01" className="input-field" style={{ padding: '0.5rem' }} required value={ver.price} placeholder="10.00" onChange={(e) => handleVersionChange(idx, 'price', e.target.value)} />
                        </div>
                        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                          <label className="input-label" style={{ fontSize: '0.8rem' }}>Discount Price (AED)</label>
                          <input type="number" step="0.01" className="input-field" style={{ padding: '0.5rem' }} value={ver.discountPrice} placeholder="0.00" onChange={(e) => handleVersionChange(idx, 'discountPrice', e.target.value)} />
                        </div>
                        <button type="button" className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--danger)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer' }} onClick={() => handleRemoveVersion(idx)}>
                          Remove
                        </button>
                      </div>
                    ))}
                    {formData.versions.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No versions added yet. Click "+ Add Version" to define one.</p>
                    )}
                  </div>
                )}

                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Image (Upload or Image URL)</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="text" className="input-field" required value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                    <div style={{ flexShrink: 0 }}>
                      <UploadButton
                        endpoint="imageUploader"
                        onBeforeUploadBegin={async (files) => {
                          const compressedFiles = await Promise.all(
                            files.map(file => compressImageFile(file))
                          );
                          return compressedFiles;
                        }}
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
                              {menuItem.name} <span style={{ color: 'var(--text-muted)' }}>(AED {menuItem.price})</span>
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

              <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', background: 'white' }}>
                <label className="input-label" style={{ fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '0.75rem', display: 'block' }}>Include Additional Sides (Raita, Salad, Soup, etc.)</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  {sidesList.map(side => {
                    const isChecked = formData.sides.includes(side._id);
                    return (
                      <div key={side._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                        <input 
                          type="checkbox" 
                          id={`side-${side._id}`} 
                          checked={isChecked}
                          onChange={() => handleSideToggle(side._id)}
                        />
                        <label htmlFor={`side-${side._id}`} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={side.image} alt={side.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                          {side.name} {side.price > 0 && <span style={{ color: 'var(--primary)' }}>(+AED {side.price.toFixed(2)})</span>}
                        </label>
                      </div>
                    );
                  })}
                  {sidesList.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No side items created yet. Go to "Sides/Addons" to create some.</p>
                  )}
                </div>
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
        </div>
      )}

      {bulkModalVisible && (
        <div className="admin-modal-overlay" onClick={() => setBulkModalVisible(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', width: '90%', display: 'flex', flexDirection: 'column', maxHeight: '85vh', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '1.5rem', color: 'var(--primary-dark)' }}>Stock Availability Manager</h3>
              <button className="btn-icon" onClick={() => setBulkModalVisible(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search item name or category to toggle stock..." 
                value={bulkSearchQuery}
                onChange={(e) => setBulkSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '35px', width: '100%', margin: 0 }}
              />
            </div>

            {/* Scrollable Items List */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '200px' }}>
              {items
                .filter(item => {
                  const query = bulkSearchQuery.toLowerCase().trim();
                  return !query || 
                    item.name.toLowerCase().includes(query) || 
                    item.category.toLowerCase().includes(query);
                })
                .map(item => (
                  <div 
                    key={item._id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.75rem 1rem', 
                      border: '1px solid var(--border)', 
                      borderRadius: 'var(--radius-md)', 
                      background: item.isAvailable ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
                      />
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.category}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleAvailability(item)}
                      style={{
                        padding: '0.45rem 1rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s ease',
                        border: '1px solid',
                        boxShadow: 'var(--shadow-sm)',
                        background: item.isAvailable ? '#d1fae5' : '#fde8e8',
                        color: item.isAvailable ? '#059669' : '#e11d48',
                        borderColor: item.isAvailable ? '#34d399' : '#fca5a5',
                      }}
                    >
                      <span style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: item.isAvailable ? '#10b981' : '#ef4444',
                        display: 'inline-block' 
                      }}></span>
                      {item.isAvailable ? 'Available' : 'Out of Stock'}
                    </button>
                  </div>
                ))}
              
              {items.filter(item => {
                const query = bulkSearchQuery.toLowerCase().trim();
                return !query || 
                  item.name.toLowerCase().includes(query) || 
                  item.category.toLowerCase().includes(query);
              }).length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No matching menu items found.
                </div>
              )}
            </div>

            {/* Done button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => setBulkModalVisible(false)}
                style={{ padding: '0.5rem 2rem' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuManager;
