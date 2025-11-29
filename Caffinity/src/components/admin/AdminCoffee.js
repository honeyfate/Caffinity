import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AdminCoffee.css';

const AdminCoffee = () => {
  const [coffeeProducts, setCoffeeProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Hot Coffee',
    imageFile: null
  });

  // Fetch coffee products from backend
  const fetchCoffeeProducts = async () => {
    try {
      console.log('Fetching coffee products...');
      const response = await axios.get('http://localhost:8080/api/products/coffee');
      console.log('Products fetched:', response.data);
      
      // Debug product IDs
      if (response.data.length > 0) {
        console.log('First product fields:', Object.keys(response.data[0]));
        console.log('First product ID:', response.data[0].id, 'Product ID:', response.data[0].productId);
      }
      
      // Ensure we have proper image URLs
      const productsWithImages = response.data.map(product => ({
        ...product,
        imageUrl: product.imageUrl || getPlaceholderImage(product.name)
      }));
      setCoffeeProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching coffee products:', error);
    }
  };

  // Helper function for placeholder images
  const getPlaceholderImage = (productName) => {
    return `https://via.placeholder.com/300x200/8B4513/ffffff?text=${encodeURIComponent(productName)}`;
  };

  useEffect(() => {
    fetchCoffeeProducts();
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
    submitData.append('type', 'coffee');
    submitData.append('category', formData.category);
    
    if (formData.imageFile) {
      submitData.append('image', formData.imageFile);
    }

    try {
      console.log('Submitting form data...');
      let response;
      if (editingProduct) {
        // Update existing product - USE CORRECT PRODUCT ID
        const productId = editingProduct.productId || editingProduct.id;
        response = await axios.put(`http://localhost:8080/api/products/${productId}`, submitData, {
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
      
      console.log('Product saved successfully:', response.data);
      
      // Reset form and refresh products
      resetForm();
      
      // Force refresh the products list
      await fetchCoffeeProducts();
      
      alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error details:', error.response?.data);
      alert('Error saving product. Please try again.');
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
      category: 'Hot Coffee',
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

  // Delete product - FIXED VERSION
  const handleDelete = async (product) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setIsLoading(true);
        
        // USE THE CORRECT PRODUCT ID FIELD
        const productId = product.productId || product.id;
        console.log('🔄 Attempting to delete product with ID:', productId);
        
        const response = await axios.delete(`http://localhost:8080/api/products/${productId}`);
        console.log('✅ Delete response:', response.status, response.statusText);
        
        // Use the same ID logic for filtering
        setCoffeeProducts(prev => prev.filter(p => (p.productId || p.id) !== productId));
        alert('Product deleted successfully!');
        
      } catch (error) {
        console.error('❌ Error deleting product:', error);
        alert('Error deleting product. Please try again.');
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
    <div className="admin-coffee-section">
      <div className="coffee-section-header">
        <h1>Coffee Management</h1>
        <button 
          className="add-product-btn"
          onClick={() => setShowAddForm(true)}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : '+ Add Coffee Product'}
        </button>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="product-form-overlay">
          <div className="product-form">
            <div className="form-header">
              <h2>{editingProduct ? 'Edit Coffee Product' : 'Add New Coffee Product'}</h2>
              <button className="close-btn" onClick={resetForm} disabled={isLoading}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Image Upload Section */}
              <div className="form-group">
                <label className="form-label">Product Image</label>
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
                      <p>Click to upload product image</p>
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
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Cappuccino, Latte, etc."
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
                  placeholder="Describe the coffee product..."
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
                    <option value="Hot Coffee">Hot Coffee</option>
                    <option value="Iced Coffee">Iced Coffee</option>
                    <option value="Specialty Coffee">Specialty Coffee</option>
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
                  {isLoading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {coffeeProducts.length === 0 ? (
          <div className="no-products">
            <p>No coffee products yet. Click "Add Coffee Product" to get started!</p>
          </div>
        ) : (
          coffeeProducts.map(product => (
            <div key={product.productId || product.id} className="product-card">
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
                      onClick={() => handleDelete(product)}
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

export default AdminCoffee;