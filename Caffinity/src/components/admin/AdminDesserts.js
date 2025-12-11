import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AdminDesserts.css';

const AdminDesserts = () => {
  const [dessertProducts, setDessertProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
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

  // Filter and search products
  const filteredProducts = dessertProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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

  // Delete product - FIXED VERSION
  const handleDelete = async (product) => {
    if (window.confirm('Are you sure you want to delete this dessert?')) {
      try {
        setIsLoading(true);
        
        // USE THE CORRECT PRODUCT ID FIELD
        const productId = product.productId || product.id;
        console.log('🔄 Attempting to delete dessert with ID:', productId);
        
        const response = await axios.delete(`http://localhost:8080/api/products/${productId}`);
        console.log('✅ Delete response:', response.status, response.statusText);
        
        // Use the same ID logic for filtering
        setDessertProducts(prev => prev.filter(p => (p.productId || p.id) !== productId));
        alert('Dessert deleted successfully!');
        
      } catch (error) {
        console.error('❌ Error deleting dessert:', error);
        alert('Error deleting dessert. Please try again.');
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
      {/* Header Section with Title and Add Button in same line */}
      <div className="desserts-section-header">
        <div className="header-left">
          <h1>Desserts Management</h1>
        </div>
        <div className="header-right">
          <button 
            className="add-product-btn"
            onClick={() => setShowAddForm(true)}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : '+ Add Dessert'}
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-bar">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search dessert products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-dropdown">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Categories</option>
            <option value="Pastry">Pastry</option>
            <option value="Cake">Cake</option>
            <option value="Cookie">Cookie</option>
            <option value="Ice Cream">Ice Cream</option>
            <option value="Specialty Dessert">Specialty Dessert</option>
            <option value="Seasonal">Seasonal</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Product Form - Premium Version */}
      {showAddForm && (
        <div className="product-form-overlay">
          <div className="product-form">
            <div className="form-header">
              <div className="form-title-container">
                <svg className="coffee-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                </svg>
                <h2>{editingProduct ? 'Edit Dessert' : 'Add New Dessert'}</h2>
              </div>
              <button className="close-btn" onClick={resetForm} disabled={isLoading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Image Upload Section */}
              <div className="form-group">
                <label className="form-label">
                  <svg className="form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Dessert Image
                </label>
                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="image-preview">
                      <div className="image-preview-wrapper">
                        <img src={imagePreview} alt="Preview" className="preview-image" />
                        <div className="image-overlay">
                          <button 
                            type="button" 
                            className="change-image-btn"
                            onClick={() => document.getElementById('imageUpload').click()}
                            disabled={isLoading}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Change Image
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="image-upload-placeholder"
                      onClick={() => document.getElementById('imageUpload').click()}
                    >
                      <div className="upload-icon-container">
                        <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="upload-text">
                        <p className="upload-title">Click to upload dessert image</p>
                        <p className="upload-subtitle">Recommended: 400x300px or larger</p>
                        <p className="upload-format">JPG, PNG, WEBP</p>
                      </div>
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
                <label className="form-label">
                  <svg className="form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Dessert Name *
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
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
              </div>

              <div className="form-group">
                <label className="form-label">
                  <svg className="form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Description *
                </label>
                <div className="textarea-wrapper">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the dessert, ingredients, and taste profile..."
                    rows="3"
                    className="form-textarea"
                    required
                    disabled={isLoading}
                    maxLength="200"
                  />
                  <div className="textarea-limit">
                    <span>{formData.description.length}</span>/200
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group price-group">
                  <label className="form-label">
                    <svg className="form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Price (₱) *
                  </label>
                  <div className="input-wrapper">
                    <div className="currency-prefix">₱</div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="form-input with-prefix"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="form-group category-group">
                  <label className="form-label">
                    <svg className="form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Category *
                  </label>
                  <div className="select-wrapper">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                      disabled={isLoading}
                    >
                      <option className="category-option" value="Pastry">Pastry</option>
                      <option className="category-option" value="Cake">Cake</option>
                      <option className="category-option" value="Cookie">Cookie</option>
                      <option className="category-option" value="Ice Cream">Ice Cream</option>
                      <option className="category-option" value="Specialty Dessert">Specialty Dessert</option>
                      <option className="category-option" value="Seasonal">Seasonal</option>
                    </select>
                    <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {editingProduct ? 'Update Dessert' : 'Add Dessert'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No dessert products found. {searchQuery || filterCategory !== 'All' ? 'Try adjusting your search or filter.' : 'Click "Add Dessert" to get started!'}</p>
          </div>
        ) : (
          filteredProducts.map(product => (
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
                    <h3 className="product-title">{product.name}</h3>
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

export default AdminDesserts;