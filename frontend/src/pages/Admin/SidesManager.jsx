import { useState, useEffect } from 'react';
    import axios from 'axios';
    import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
    import { UploadButton } from '../../utils/uploadthing';
    import { API_BASE_URL } from '../../config';

    const SidesManager = () => {
      const [sides, setSides] = useState([]);
      const [formVisible, setFormVisible] = useState(false);
      const [editingId, setEditingId] = useState(null);
      
      const [formData, setFormData] = useState({
        name: '',
        image: '',
        price: 0,
      });

      const fetchSides = async () => {
        try {
          const { data } = await axios.get(`${API_BASE_URL}/api/sides`);
          setSides(data);
        } catch (error) {
          console.error('Error fetching sides:', error);
        }
      };

      useEffect(() => {
        fetchSides();
      }, []);

      const resetForm = () => {
        setFormData({ name: '', image: '', price: 0 });
        setEditingId(null);
        setFormVisible(false);
      };

      const handleEdit = (side) => {
        setFormData({
          name: side.name,
          image: side.image,
          price: side.price || 0,
        });
        setEditingId(side._id);
        setFormVisible(true);
      };

      const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this side item?')) {
          try {
            await axios.delete(`${API_BASE_URL}/api/sides/${id}`);
            fetchSides();
          } catch (error) {
            console.error('Error deleting side item:', error);
          }
        }
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          if (editingId) {
            await axios.put(`${API_BASE_URL}/api/sides/${editingId}`, formData);
          } else {
            await axios.post(`${API_BASE_URL}/api/sides`, formData);
          }
          fetchSides();
          resetForm();
        } catch (error) {
          console.error('Error saving side item:', error);
        }
      };

      return (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1>Sides & Addons Management</h1>
            <button className="btn btn-primary" onClick={() => { resetForm(); setFormVisible(true); }}>
              <FiPlus /> Add New Side
            </button>
          </div>

          {formVisible && (
            <div className="admin-modal-overlay" onClick={resetForm}>
              <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Side Item' : 'Add New Side Item'}</h3>
                <form onSubmit={handleSubmit}>
                <div className="grid-cols-2">
                  <div className="input-group">
                    <label className="input-label">Name (e.g. Mint Raita, Fresh Salad, Tomato Soup)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      required 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Price (AED) <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>(Optional, default 0 for free side)</span></label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="input-field" 
                      value={formData.price} 
                      onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    />
                  </div>

                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label className="input-label">Image (Upload or Image URL)</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="input-field" 
                        required 
                        value={formData.image} 
                        onChange={(e) => setFormData({...formData, image: e.target.value})} 
                      />
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

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingId ? 'Update Side' : 'Save Side'}</button>
                </div>
              </form>
            </div>
          </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Extra Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sides.map(side => (
                  <tr key={side._id}>
                    <td>
                      <img src={side.image} alt={side.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }} />
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{side.name}</td>
                    <td>
                      {side.price > 0 ? (
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>+AED {side.price.toFixed(2)}</span>
                      ) : (
                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Free / Included</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" style={{ color: 'var(--text-main)' }} onClick={() => handleEdit(side)}><FiEdit2 /></button>
                        <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(side._id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sides.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No side items found. Click "Add New Side" to create one.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    export default SidesManager;
    
