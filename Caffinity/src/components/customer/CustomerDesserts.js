import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/CustomerDesserts.css';

const CustomerDesserts = () => {
  const [dessertProducts, setDessertProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('dessertCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dessertCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch dessert products from backend
  const fetchDessertProducts = async () => {
    try {
      console.log('Fetching dessert products for customer...');
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

  // Handle add to cart
  const handleAddToCart = (product) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const existingItem = cartItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if item exists
        setCartItems(prevItems => 
          prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        // Add new item to cart
        const newItem = {
          ...product,
          quantity: 1,
          addedAt: new Date().toISOString()
        };
        setCartItems(prevItems => [...prevItems, newItem]);
      }
      
      setIsLoading(false);
      
      // Show success message
      alert(`${product.name} added to cart!`);
    }, 500);
  };

  // Handle buy now (add to cart and redirect to cart page)
  const handleBuyNow = (product) => {
    handleAddToCart(product);
    // Redirect to cart page after a short delay
    setTimeout(() => {
      window.location.href = '/customer-cart'; // Adjust path to your CustomerCart route
    }, 600);
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
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
    <div className="customer-desserts-section">
      {/* Header */}
      <div className="desserts-section-header">
        <div className="header-content">
          <h1>Our Sweet Delights</h1>
          <p className="section-subtitle">Indulge in our delicious dessert selection</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {dessertProducts.length === 0 ? (
          <div className="no-products">
            <p>No dessert products available at the moment. Please check back later!</p>
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
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">₱{parseFloat(product.price).toFixed(2)}</div>
                
                {/* Action Buttons */}
                <div className="product-actions">
                  <button 
                    className={`add-to-cart-btn ${isInCart(product.id) ? 'in-cart' : ''}`}
                    onClick={() => handleAddToCart(product)}
                    disabled={isLoading}
                    title={isInCart(product.id) ? 'Added to Cart' : 'Add to Cart'}
                  >
                    <span className="cart-icon">🛒</span>
                    <span className="check-icon">✓</span>
                  </button>
                  <button 
                    className="order-now-btn"
                    onClick={() => handleBuyNow(product)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Order Now'}
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

export default CustomerDesserts;