import React, { useState } from 'react';
import '../css/CustomerCart.css';

const CustomerCart = () => {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Cappuccino', price: '₱125.00', quantity: 2 },
    { id: 2, name: 'Tiramisu', price: '₱180.00', quantity: 1 },
    { id: 3, name: 'Latte', price: '₱130.00', quantity: 1 }
  ]);

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

  return (
    <div className="customer-cart">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>Review your items and proceed to checkout</p>
      </div>

      <div className="cart-content">
        <div className="cart-items-section">
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">Cart Items ({cartItems.length})</h3>
            </div>
            <div className="card-content">
              {cartItems.length === 0 ? (
                <p>Your cart is empty</p>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="cart-item-detail">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>{item.price} each</p>
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
                <span>Subtotal:</span>
                <span>₱{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>₱{(getTotalPrice() * 0.12).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₱{(getTotalPrice() * 1.12).toFixed(2)}</span>
              </div>
            </div>
            <div className="card-actions">
              <button className="card-btn" disabled={cartItems.length === 0}>
                Proceed to Checkout
              </button>
              <button className="card-btn secondary">
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