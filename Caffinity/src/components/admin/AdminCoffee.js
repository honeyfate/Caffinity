import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AdminCoffee.css';

const AdminCoffee = () => {
  const [coffeeProducts, setCoffeeProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
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
      const response = await axios.get('http://localhost:8080/api/products/coffee');
      setCoffeeProducts(response.data);
    } catch (error) {
      console.error('Error fetching coffee products:', error);
    }
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
      if (editingProduct) {
        // Update existing product
        await axios.put(`http://localhost:8080/api/products/${editingProduct.id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Add new product
        await axios.post('http://localhost:8080/api/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      // Reset form and refresh products
      resetForm();
      fetchCoffeeProducts();
      alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
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

  // Delete product
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:8080/api/products/${productId}`);
        fetchCoffeeProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  return (
    <div className="admin-coffee-section">
      <div className="coffee-section-header">
        <h1>Coffee Management</h1>
        <button 
          className="add-product-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Coffee Product
        </button>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="product-form-overlay">
          <div className="product-form">
            <div className="form-header">
              <h2>{editingProduct ? 'Edit Coffee Product' : 'Add New Coffee Product'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Image Upload Section */}
              <div className="form-group">
                <label>Product Image</label>
                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" className="preview-image" />
                      <button 
                        type="button" 
                        className="change-image-btn"
                        onClick={() => document.getElementById('imageUpload').click()}
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
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Cappuccino, Latte, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the coffee product..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₱) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Hot Coffee">Hot Coffee</option>
                    <option value="Iced Coffee">Iced Coffee</option>
                    <option value="Specialty Coffee">Specialty Coffee</option>
                    <option value="Seasonal">Seasonal</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingProduct ? 'Update Product' : 'Add Product'}
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
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
                <div className="product-category">{product.category}</div>
              </div>
              
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">₱{product.price.toFixed(2)}</div>
                
                <div className="product-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
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