import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/CustomerCoffee.css';

const CustomerCoffee = () => {
  const [coffeeProducts, setCoffeeProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Generate or get session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  // Fetch current cart from database
  const fetchCart = async () => {
    try {
      const sessionId = getSessionId();
      const response = await axios.get('http://localhost:8080/api/cart', {
        headers: { 'X-Session-Id': sessionId }
      });
      
      if (response.data && response.data.cartItems) {
        setCartItems(response.data.cartItems || []);
      } else if (response.data && Array.isArray(response.data)) {
        setCartItems(response.data);
      } else {
        const savedCart = localStorage.getItem('coffeeCart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      const savedCart = localStorage.getItem('coffeeCart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  };

  // Load cart on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Fetch coffee products from backend
  const fetchCoffeeProducts = async () => {
    try {
      console.log('Fetching coffee products for customer...');
      const response = await axios.get('http://localhost:8080/api/products/coffee');
      console.log('Products fetched:', response.data);
      
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

  // Toggle cart item - add if not present, remove if present
  const toggleCartItem = async (product) => {
    setIsLoading(true);
    
    try {
      const sessionId = getSessionId();
      const isCurrentlyInCart = isInCart(product.id);

      if (isCurrentlyInCart) {
        // Remove from cart
        await axios.delete(`http://localhost:8080/api/cart/remove/${product.id}`, {
          headers: { 'X-Session-Id': sessionId }
        });
        alert(`${product.name} removed from cart!`);
      } else {
        // Add to cart
        await axios.post('http://localhost:8080/api/cart/add', 
          { productId: product.id, quantity: 1 },
          { headers: { 'X-Session-Id': sessionId } }
        );
        alert(`${product.name} added to cart!`);
      }
      
      // Refresh cart data
      await fetchCart();
    } catch (error) {
      console.error('Error toggling cart item:', error);
      // Fallback to localStorage
      const savedCart = localStorage.getItem('coffeeCart') || '[]';
      let cartItems = JSON.parse(savedCart);
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        // Remove from cart
        cartItems.splice(existingItemIndex, 1);
        alert(`${product.name} removed from cart!`);
      } else {
        // Add to cart
        cartItems.push({ ...product, quantity: 1 });
        alert(`${product.name} added to cart!`);
      }
      
      localStorage.setItem('coffeeCart', JSON.stringify(cartItems));
      setCartItems(cartItems);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle buy now (add to cart and redirect to cart page)
  const handleBuyNow = async (product) => {
    if (!isInCart(product.id)) {
      await toggleCartItem(product);
    }
    // Redirect to cart page after a short delay
    setTimeout(() => {
      window.location.href = '/customer-cart';
    }, 600);
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => {
      const itemProductId = item.product?.id || item.id;
      return itemProductId === productId;
    });
  };

  // Get image source for product
  const getProductImage = (product) => {
    if (product.imageUrl) {
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
      }
      return `http://localhost:8080${product.imageUrl}`;
    }
    return getPlaceholderImage(product.name);
  };

  return (
    <div className="customer-coffee-section">
      {/* Header */}
      <div className="coffee-section-header">
        <div className="header-content">
          <h1>Our Coffee Selection</h1>
          <p className="section-subtitle">Discover our premium coffee varieties crafted with passion</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {coffeeProducts.length === 0 ? (
          <div className="no-products">
            <p>No coffee products available at the moment. Please check back later!</p>
          </div>
        ) : (
          coffeeProducts.map(product => (
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
                    onClick={() => toggleCartItem(product)}
                    disabled={isLoading}
                    title={isInCart(product.id) ? 'Remove from Cart' : 'Add to Cart'}
                  >
                    {isInCart(product.id) ? (
                      <span className="check-icon">✓</span>
                    ) : (
                      <span className="cart-icon">🛒</span>
                    )}
                  </button>
                  <button 
                    className="order-now-btn"
                    onClick={() => handleBuyNow(product)}
                    disabled={isLoading}
                  >
                    {isLoading ? '...' : 'Order Now'}
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

export default CustomerCoffee;