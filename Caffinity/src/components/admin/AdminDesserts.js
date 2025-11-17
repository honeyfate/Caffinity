import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AdminDesserts.css';

const AdminDesserts = () => {
  const [dessertProducts, setDessertProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pastry',
    imageFile: null
  });

  // Fetch dessert products from backend
  const fetchDessertProducts = async () => {
    try {
      console.log('Fetching dessert products...');
      const response = await axios.get('http://localhost:8080/api/products/desserts');
      console.log('Dessert products fetched:', response.data);
      
      // Ensure we have proper image URLs
      const productsWithImages = response.data.map(product => ({
        ...product,
        imageUrl: product.imageUrl || getPlaceholderImage(product.name)
      }));
      setDessertProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching dessert products:', error);
    }
  };

  // Helper function for placeholder images
  const getPlaceholderImage = (productName) => {
    return `https://via.placeholder.com/300x200/8B4513/ffffff?text=${encodeURIComponent(productName)}`;
  };

  useEffect(() => {
    fetchDessertProducts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('type', 'dessert');
    submitData.append('category', formData.category);
    
    if (formData.imageFile) {
      submitData.append('image', formData.imageFile);
    }

    try {
      console.log('Submitting dessert form data...');
      let response;
      if (editingProduct) {
        // Update existing product
        response = await axios.put(`http://localhost:8080/api/products/${editingProduct.id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Add new product
        response = await axios.post('http://localhost:8080/api/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      console.log('Dessert saved successfully:', response.data);
      
      // Reset form and refresh products
      resetForm();
      
      // Force refresh the products list
      await fetchDessertProducts();
      
      alert(editingProduct ? 'Dessert updated successfully!' : 'Dessert added successfully!');
    } catch (error) {
      console.error('Error saving dessert:', error);
      console.error('Error details:', error.response?.data);
      alert('Error saving dessert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Pastry',
      imageFile: null
    });
    setImagePreview(null);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  // Edit product
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageFile: null
    });
    setImagePreview(product.imageUrl || null);
    setEditingProduct(product);
    setShowAddForm(true);
  };

 // Delete product
const handleDelete = async (productId) => {
  if (window.confirm('Are you sure you want to delete this dessert?')) {
    try {
      setIsLoading(true);
      console.log('🔄 Attempting to delete dessert with ID:', productId);
      
      const response = await axios.delete(`http://localhost:8080/api/products/${productId}`);
      console.log('✅ Delete response:', response.status, response.statusText);
      
      // FIXED: Use setDessertProducts instead of setCoffeeProducts
      setDessertProducts(prev => prev.filter(product => product.id !== productId));
      alert('Dessert deleted successfully!');
      
    } catch (error) {
      console.error('❌ Full error object:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      
      let errorMessage = 'Error deleting dessert. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = `Server Error: ${error.response.status} - ${error.response.statusText}`;
        if (error.response.data) {
          errorMessage += ` - ${JSON.stringify(error.response.data)}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network Error: No response from server. Check if backend is running.';
      } else {
        // Something else happened
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
};

  // Get image source for product
  const getProductImage = (product) => {
    if (product.imageUrl) {
      // If it's already a full URL, use it directly
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
      }
      // If it's a relative path, make it absolute
      return `http://localhost:8080${product.imageUrl}`;
    }
    // Fallback to placeholder if no image URL
    return getPlaceholderImage(product.name);
  };

  return (
    <div className="admin-desserts-section">
      <div className="desserts-section-header">
        <h1>Desserts Management</h1>
        <button 
          className="add-product-btn"
          onClick={() => setShowAddForm(true)}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : '+ Add Dessert'}
        </button>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="product-form-overlay">
          <div className="product-form">
            <div className="form-header">
              <h2>{editingProduct ? 'Edit Dessert' : 'Add New Dessert'}</h2>
              <button className="close-btn" onClick={resetForm} disabled={isLoading}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Image Upload Section */}
              <div className="form-group">
                <label className="form-label">Dessert Image</label>
                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" className="preview-image" />
                      <button 
                        type="button" 
                        className="change-image-btn"
                        onClick={() => document.getElementById('imageUpload').click()}
                        disabled={isLoading}
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="image-upload-placeholder"
                      onClick={() => document.getElementById('imageUpload').click()}
                    >
                      <div className="upload-icon">📷</div>
                      <p>Click to upload dessert image</p>
                      <small>Recommended: 400x300px or larger</small>
                    </div>
                  )}
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dessert Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Chocolate Cake, Tiramisu, etc."
                  className="form-input"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the dessert..."
                  rows="3"
                  className="form-textarea"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-row">
                <div className="form-group price-group">
                  <label className="form-label">Price (₱) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="form-input"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group category-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                    disabled={isLoading}
                  >
                    <option value="Pastry">Pastry</option>
                    <option value="Cake">Cake</option>
                    <option value="Cookie">Cookie</option>
                    <option value="Ice Cream">Ice Cream</option>
                    <option value="Specialty Dessert">Specialty Dessert</option>
                    <option value="Seasonal">Seasonal</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : (editingProduct ? 'Update Dessert' : 'Add Dessert')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {dessertProducts.length === 0 ? (
          <div className="no-products">
            <p>No dessert products yet. Click "Add Dessert" to get started!</p>
          </div>
        ) : (
          dessertProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img 
                  src={getProductImage(product)} 
                  alt={product.name}
                  onError={(e) => {
                    console.error('Image failed to load:', product.imageUrl);
                    e.target.onerror = null;
                    e.target.src = getPlaceholderImage(product.name);
                  }}
                />
                <div className="product-category">{product.category}</div>
              </div>
              
              <div className="product-info">
                <div className="product-content">
                  <div className="product-text-content">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-price-container">
                      <div className="product-price">₱{parseFloat(product.price).toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="product-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(product)}
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(product.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDesserts;