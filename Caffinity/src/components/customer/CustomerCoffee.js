import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCartPlus, FaCheck, FaShoppingCart } from 'react-icons/fa';
import '../css/CustomerCoffee.css';

const CustomerCoffee = () => {
  const [coffeeProducts, setCoffeeProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Generate or get session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  // Show custom notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
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
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      const savedCart = localStorage.getItem('cart');
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
    
    // ADD THIS DEBUG LOG:
    if (response.data.length > 0) {
      console.log('First product fields:', Object.keys(response.data[0]));
      console.log('First product ID field:', response.data[0].id, response.data[0].productId);
    }
    
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
// Toggle cart item - add if not present, remove if present
const toggleCartItem = async (product) => {
  setIsLoading(true);
  
  try {
    const sessionId = getSessionId();
    
    // USE THE CORRECT PRODUCT ID FIELD
    const productId = product.productId || product.id;
    const isCurrentlyInCart = isInCart(productId);

    console.log('=== DEBUG TOGGLE CART ===');
    console.log('Full product object:', product);
    console.log('Product ID:', productId);
    console.log('Product ID type:', typeof productId);
    console.log('Session ID:', sessionId);

    // Validate product ID
    if (!productId || productId === 'undefined' || productId === 'null') {
      console.error('INVALID PRODUCT ID:', productId);
      throw new Error('Invalid product ID');
    }

    if (isCurrentlyInCart) {
      // Remove from cart
      console.log('Removing product ID:', productId);
      const deleteUrl = `http://localhost:8080/api/cart/remove/${productId}`;
      console.log('DELETE URL:', deleteUrl);
      
      await axios.delete(deleteUrl, {
        headers: { 'X-Session-Id': sessionId }
      });
      showNotification(`${product.name} removed from cart!`, 'success');
    } else {
      // Add to cart
      console.log('Adding product ID:', productId);
      const requestData = {
        productId: Number(productId), // Ensure it's a number
        quantity: 1
      };
      console.log('Request data:', requestData);
      
      await axios.post('http://localhost:8080/api/cart/add', 
        requestData,
        { headers: { 'X-Session-Id': sessionId } }
      );
      showNotification(`${product.name} added to cart!`, 'success');
    }
    
    // Refresh cart data
    await fetchCart();
  } catch (error) {
    console.error('=== ERROR TOGGLING CART ITEM ===');
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    
    // Fallback to localStorage
    console.log('Using localStorage fallback');
    const savedCart = localStorage.getItem('cart') || '[]';
    let cartItems = JSON.parse(savedCart);
    const existingItemIndex = cartItems.findIndex(item => {
      const itemProductId = item.product?.productId || item.productId || item.id;
      return itemProductId === product.productId || itemProductId === product.id;
    });
    
    if (existingItemIndex > -1) {
      cartItems.splice(existingItemIndex, 1);
      showNotification(`${product.name} removed from cart!`, 'success');
    } else {
      cartItems.push({ 
        productId: product.productId || product.id, 
        quantity: 1,
        product: {
          productId: product.productId || product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl
        }
      });
      showNotification(`${product.name} added to cart!`, 'success');
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    setCartItems(cartItems);
  } finally {
    setIsLoading(false);
  }
};

  // Handle buy now (add to cart and redirect to cart page)
  // Handle buy now (add to cart and redirect to cart page)
const handleBuyNow = async (product) => {
  const productId = product.productId || product.id;
  if (!isInCart(productId)) {
    await toggleCartItem(product);
  }
  // Redirect to cart page after a short delay
  setTimeout(() => {
    window.location.href = '/customer/cart';
  }, 600);
};
 // Check if product is in cart
const isInCart = (productId) => {
  return cartItems.some(item => {
    const itemProductId = item.product?.productId || item.productId || item.id;
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
      {/* Custom Notification */}
      {notification.show && (
        <div className={`custom-notification ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'success' ? <FaCheck /> : '⚠'}
            </div>
            <div className="notification-message">{notification.message}</div>
          </div>
          <div className="notification-progress"></div>
        </div>
      )}

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
                    className={`add-to-cart-btn ${isInCart(product.productId || product.id) ? 'in-cart' : ''}`}
                    onClick={() => toggleCartItem(product)}
                    disabled={isLoading}
                    title={isInCart(product.productId || product.id) ? 'Remove from Cart' : 'Add to Cart'}
                  >
                    {isInCart(product.productId || product.id) ? ( // CHANGED THIS LINE
                      <FaCheck className="check-icon" />
                    ) : (
                      <FaCartPlus className="cart-icon" />
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