import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/CustomerCart.css';

const CustomerCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Generate or get session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  // Load cart from database
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const sessionId = getSessionId();
      const response = await axios.get('http://localhost:8080/api/cart', {
        headers: { 'X-Session-Id': sessionId }
      });
      
      console.log('Cart API Response:', response.data);
      
      if (response.data && response.data.cartItems) {
        setCartItems(response.data.cartItems || []);
      } else if (response.data && Array.isArray(response.data)) {
        setCartItems(response.data);
      } else {
        const savedCart = localStorage.getItem('coffeeCart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      const savedCart = localStorage.getItem('coffeeCart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Safe function to get item name
  const getItemName = (item) => {
    return item.product?.name || item.name || 'Unknown Product';
  };

  // Safe function to get item price
  const getItemPrice = (item) => {
    if (typeof item.price === 'number') {
      return item.price;
    } else if (typeof item.price === 'string') {
      return parseFloat(item.price.replace('₱', '').replace(',', ''));
    }
    return 0;
  };

  // Safe function to get item category
  const getItemCategory = (item) => {
    return item.product?.category || item.category || '';
  };

  // Safe function to get product ID
  const getProductId = (item) => {
    return item.product?.id || item.id;
  };

  // Safe function to get product image
  const getProductImage = (item) => {
    const imageUrl = item.product?.imageUrl || item.imageUrl;
    if (imageUrl) {
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      return `http://localhost:8080${imageUrl}`;
    }
    // Fallback placeholder image
    return `https://via.placeholder.com/80x80/8B4513/ffffff?text=${encodeURIComponent(getItemName(item).charAt(0))}`;
  };

  // Update quantity in database
  const updateQuantity = async (productId, newQuantity) => {
    try {
      const sessionId = getSessionId();
      
      if (newQuantity === 0) {
        await removeFromCart(productId);
      } else {
        await axios.put('http://localhost:8080/api/cart/update', 
          { productId, quantity: newQuantity },
          { headers: { 'X-Session-Id': sessionId } }
        );
        fetchCart(); // Refresh cart data
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      // Fallback to localStorage update
      setCartItems(prevItems => {
        if (newQuantity === 0) {
          return prevItems.filter(item => getProductId(item) !== productId);
        } else {
          return prevItems.map(item => 
            getProductId(item) === productId ? { ...item, quantity: newQuantity } : item
          );
        }
      });
    }
  };

  // Remove item from cart completely
  const removeFromCart = async (productId) => {
    try {
      const sessionId = getSessionId();
      await axios.delete(`http://localhost:8080/api/cart/remove/${productId}`, {
        headers: { 'X-Session-Id': sessionId }
      });
      fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback to localStorage
      setCartItems(prevItems => prevItems.filter(item => getProductId(item) !== productId));
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = getItemPrice(item);
      return total + (price * item.quantity);
    }, 0);
  };

  const handleContinueShopping = () => {
    window.location.href = '/customer/coffee';
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    try {
      setIsLoading(true);
      alert('Proceeding to checkout!');
      const sessionId = getSessionId();
      await axios.delete('http://localhost:8080/api/cart/clear', {
        headers: { 'X-Session-Id': sessionId }
      });
      setCartItems([]);
      localStorage.removeItem('coffeeCart');
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="customer-cart">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>Review your items and proceed to checkout</p>
      </div>

      {/* Checkout Steps */}
      <div className="checkout-steps">
        <div className="checkout-step">
          <div className="step-number active">1</div>
          <div className="step-label active">Cart</div>
        </div>
        <div className="checkout-step">
          <div className="step-number">2</div>
          <div className="step-label">Information</div>
        </div>
        <div className="checkout-step">
          <div className="step-number">3</div>
          <div className="step-label">Payment</div>
        </div>
        <div className="checkout-step">
          <div className="step-number">4</div>
          <div className="step-label">Confirmation</div>
        </div>
      </div>

      <div className="cart-content">
        <div className="cart-items-section">
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">Cart Items ({cartItems.length})</h3>
            </div>
            <div className="card-content">
              {isLoading ? (
                <div className="loading">Loading cart...</div>
              ) : cartItems.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <h3>Your cart is empty</h3>
                  <p>Add some delicious coffee items to get started!</p>
                  <button 
                    className="card-btn" 
                    onClick={handleContinueShopping}
                  >
                    Browse Coffee Selection
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map(item => (
                    <div key={item.id || getProductId(item)} className="cart-item-card">
                      <div className="cart-item-image">
                        <img 
                          src={getProductImage(item)} 
                          alt={getItemName(item)}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/80x80/8B4513/ffffff?text=${encodeURIComponent(getItemName(item).charAt(0))}`;
                          }}
                        />
                      </div>
                      <div className="cart-item-details">
                        <div className="item-info">
                          <h4>{getItemName(item)}</h4>
                          <p className="item-price">₱{getItemPrice(item).toFixed(2)} each</p>
                          {getItemCategory(item) && <small className="item-category">Category: {getItemCategory(item)}</small>}
                        </div>
                        <div className="item-controls">
                          <div className="quantity-controls">
                            <button 
                              onClick={() => updateQuantity(getProductId(item), item.quantity - 1)}
                              className="quantity-btn"
                              disabled={isLoading}
                            >
                              -
                            </button>
                            <span className="quantity">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(getProductId(item), item.quantity + 1)}
                              className="quantity-btn"
                              disabled={isLoading}
                            >
                              +
                            </button>
                          </div>
                          <button 
                            className="delete-btn"
                            onClick={() => removeFromCart(getProductId(item))}
                            disabled={isLoading}
                            title="Remove item"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="item-total">
                        ₱{(getItemPrice(item) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="order-summary">
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">Order Summary</h3>
            </div>
            <div className="card-content">
              <div className="summary-row">
                <span>Items ({cartItems.reduce((total, item) => total + item.quantity, 0)}):</span>
                <span>₱{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>₱{cartItems.length > 0 ? '50.00' : '0.00'}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>₱{(getTotalPrice() * 0.12).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₱{(getTotalPrice() * 1.12 + (cartItems.length > 0 ? 50 : 0)).toFixed(2)}</span>
              </div>
            </div>
            <div className="card-actions">
              <button 
                className="card-btn" 
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || isLoading}
              >
                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
              <button 
                className="card-btn secondary"
                onClick={handleContinueShopping}
                disabled={isLoading}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCart;