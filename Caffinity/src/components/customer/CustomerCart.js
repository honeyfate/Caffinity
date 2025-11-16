import React, { useState, useEffect } from 'react';
import '../css/CustomerCart.css';

const CustomerCart = () => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('coffeeCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('coffeeCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace('₱', '').replace(',', ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const handleContinueShopping = () => {
    window.location.href = '/customer-coffee'; // Adjust path to your coffee page
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    // Here you can implement your checkout logic
    alert('Proceeding to checkout!');
    // window.location.href = '/checkout';
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
              {cartItems.length === 0 ? (
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
                cartItems.map(item => (
                  <div key={item.id} className="cart-item-detail">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>{item.price} each</p>
                      {item.category && <small>Category: {item.category}</small>}
                    </div>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>
                    <div className="item-total">
                      ₱{(parseFloat(item.price.replace('₱', '')) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
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
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>
              <button 
                className="card-btn secondary"
                onClick={handleContinueShopping}
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