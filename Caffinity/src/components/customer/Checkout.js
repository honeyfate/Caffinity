// components/customer/Checkout.js - UPDATED WITH PAYMENT ENTITY
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Checkout.css';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('shipping');
  const [formData, setFormData] = useState({
    shippingAddress: '',
    customerNotes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [orderCreated, setOrderCreated] = useState(null);
  const navigate = useNavigate();

  // Get session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  // Load cart items
  useEffect(() => {
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
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    fetchCart();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateOrder = async () => {
    if (!formData.shippingAddress.trim()) {
      alert('Please enter shipping address');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get current user ID
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || 1;

      // Create order with PENDING status
      const response = await axios.post('http://localhost:8080/api/orders/create', null, {
        params: {
          userId: userId,
          shippingAddress: formData.shippingAddress,
          customerNotes: formData.customerNotes
        }
      });

      console.log('Order created successfully:', response.data);
      setOrderCreated(response.data);
      setCurrentStep('payment');
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order: ' + (error.response?.data || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      const totalAmount = (getTotalPrice() * 1.12 + 50).toFixed(2);

      // Step 1: Create payment record
      const paymentResponse = await axios.post('http://localhost:8080/api/payments/create', null, {
        params: {
          orderId: orderCreated.id,
          paymentMethod: paymentMethod,
          amount: parseFloat(totalAmount)
        }
      });

      console.log('Payment created:', paymentResponse.data);

      // Step 2: Simulate payment processing (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Step 3: Complete payment with transaction ID
      await axios.put(`http://localhost:8080/api/payments/${paymentResponse.data.id}/complete`, null, {
        params: { 
          transactionId: 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        }
      });

      // Step 4: Clear cart after successful payment
      const sessionId = getSessionId();
      await axios.delete('http://localhost:8080/api/cart/clear', {
        headers: { 'X-Session-Id': sessionId }
      });

      alert('Payment successful! Your order is now confirmed.');
      setCurrentStep('confirmation');
      
    } catch (error) {
      console.error('Payment failed:', error);
      
      // Update payment status to FAILED if payment fails
      try {
        await axios.put(`http://localhost:8080/api/payments/order/${orderCreated.id}/fail`);
      } catch (statusError) {
        console.error('Failed to update payment status:', statusError);
      }
      
      alert('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : 
                   typeof item.price === 'string' ? parseFloat(item.price.replace('₱', '').replace(',', '')) : 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getItemName = (item) => {
    return item.product?.name || item.name || 'Unknown Product';
  };

  const getItemPrice = (item) => {
    if (typeof item.price === 'number') return item.price;
    if (typeof item.price === 'string') return parseFloat(item.price.replace('₱', '').replace(',', ''));
    return 0;
  };

  const totalAmount = (getTotalPrice() * 1.12 + 50).toFixed(2);

  return (
    <div className="checkout-page">
      <div className="page-header">
        <h1>Checkout</h1>
        <p>Complete your order</p>
      </div>

      {/* Checkout Steps */}
      <div className="checkout-steps">
        <div className={`checkout-step ${currentStep === 'shipping' ? 'active' : ''} ${['payment', 'confirmation'].includes(currentStep) ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Shipping</div>
        </div>
        <div className={`checkout-step ${currentStep === 'payment' ? 'active' : ''} ${currentStep === 'confirmation' ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Payment</div>
        </div>
        <div className={`checkout-step ${currentStep === 'confirmation' ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Confirmation</div>
        </div>
      </div>

      {/* Shipping Step */}
      {currentStep === 'shipping' && (
        <div className="checkout-content">
          <div className="checkout-form-section">
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">Shipping Information</h3>
              </div>
              <div className="card-content">
                <div className="form-group">
                  <label htmlFor="shippingAddress">Shipping Address *</label>
                  <textarea
                    id="shippingAddress"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="Enter your complete shipping address"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="customerNotes">Order Notes (Optional)</label>
                  <textarea
                    id="customerNotes"
                    name="customerNotes"
                    value={formData.customerNotes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for your order..."
                    rows="2"
                  />
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">Order Items</h3>
              </div>
              <div className="card-content">
                {cartItems.length === 0 ? (
                  <div className="empty-cart">
                    <p>Your cart is empty</p>
                    <button 
                      className="card-btn" 
                      onClick={() => navigate('/customer/coffee')}
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="checkout-items">
                    {cartItems.map((item, index) => (
                      <div key={index} className="checkout-item">
                        <div className="item-info">
                          <h4>{getItemName(item)}</h4>
                          <p>Quantity: {item.quantity}</p>
                        </div>
                        <div className="item-price">
                          ₱{(getItemPrice(item) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="order-summary-section">
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
                  <span>Shipping:</span>
                  <span>₱50.00</span>
                </div>
                <div className="summary-row">
                  <span>Tax (12%):</span>
                  <span>₱{(getTotalPrice() * 0.12).toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₱{totalAmount}</span>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="card-btn primary"
                  onClick={handleCreateOrder}
                  disabled={isLoading || cartItems.length === 0 || !formData.shippingAddress.trim()}
                >
                  {isLoading ? 'Creating Order...' : 'Proceed to Payment'}
                </button>
                <button 
                  className="card-btn secondary"
                  onClick={() => navigate('/customer/cart')}
                  disabled={isLoading}
                >
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Step */}
      {currentStep === 'payment' && orderCreated && (
        <div className="checkout-content">
          <div className="checkout-form-section">
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">Payment Method</h3>
              </div>
              <div className="card-content">
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="payment"
                      value="CREDIT_CARD"
                      checked={paymentMethod === 'CREDIT_CARD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="checkmark"></span>
                    Credit Card
                  </label>
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="payment"
                      value="DEBIT_CARD"
                      checked={paymentMethod === 'DEBIT_CARD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="checkmark"></span>
                    Debit Card
                  </label>
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="payment"
                      value="GCASH"
                      checked={paymentMethod === 'GCASH'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="checkmark"></span>
                    GCash
                  </label>
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="payment"
                      value="PAYMAYA"
                      checked={paymentMethod === 'PAYMAYA'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="checkmark"></span>
                    PayMaya
                  </label>
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="payment"
                      value="BANK_TRANSFER"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="checkmark"></span>
                    Bank Transfer
                  </label>
                </div>

                {['CREDIT_CARD', 'DEBIT_CARD'].includes(paymentMethod) && (
                  <div className="payment-details">
                    <div className="form-group">
                      <label>Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" className="card-input" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input type="text" placeholder="MM/YY" className="card-input" />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input type="text" placeholder="123" className="card-input" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Cardholder Name</label>
                      <input type="text" placeholder="John Doe" className="card-input" />
                    </div>
                  </div>
                )}

                {paymentMethod === 'GCASH' && (
                  <div className="payment-details">
                    <div className="gcash-instructions">
                      <h4>Pay using GCash:</h4>
                      <ol>
                        <li>Open your GCash app</li>
                        <li>Go to "Send Money"</li>
                        <li>Enter phone number: <strong>0917-123-4567</strong></li>
                        <li>Amount: <strong>₱{totalAmount}</strong></li>
                        <li>Add note: "Order #{orderCreated.id}"</li>
                        <li>Complete the transaction</li>
                      </ol>
                    </div>
                  </div>
                )}

                {paymentMethod === 'PAYMAYA' && (
                  <div className="payment-details">
                    <div className="paymaya-instructions">
                      <h4>Pay using PayMaya:</h4>
                      <ol>
                        <li>Open your PayMaya app</li>
                        <li>Tap "Send Money"</li>
                        <li>Enter mobile number: <strong>0917-987-6543</strong></li>
                        <li>Amount: <strong>₱{totalAmount}</strong></li>
                        <li>Add description: "Order #{orderCreated.id}"</li>
                        <li>Confirm the payment</li>
                      </ol>
                    </div>
                  </div>
                )}

                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="payment-details">
                    <div className="bank-instructions">
                      <h4>Bank Transfer Details:</h4>
                      <div className="bank-details">
                        <p><strong>Bank:</strong> BDO (Banco de Oro)</p>
                        <p><strong>Account Name:</strong> Caffinity Coffee Shop</p>
                        <p><strong>Account Number:</strong> 0012-3456-7890</p>
                        <p><strong>Amount:</strong> ₱{totalAmount}</p>
                        <p><strong>Reference:</strong> Order #{orderCreated.id}</p>
                      </div>
                      <p className="transfer-note">Please send the screenshot of transaction to our email after payment.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="order-summary-section">
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">Order Summary</h3>
              </div>
              <div className="card-content">
                <div className="order-info">
                  <p><strong>Order ID:</strong> #{orderCreated.id}</p>
                  <p><strong>Status:</strong> <span className="status-pending">Awaiting Payment</span></p>
                  <p><strong>Shipping:</strong> {formData.shippingAddress}</p>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>₱{totalAmount}</span>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="card-btn primary"
                  onClick={handlePayment}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing Payment...' : `Pay ₱${totalAmount}`}
                </button>
                <button 
                  className="card-btn secondary"
                  onClick={() => setCurrentStep('shipping')}
                  disabled={isLoading}
                >
                  Back to Shipping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Step */}
      {currentStep === 'confirmation' && orderCreated && (
        <div className="confirmation-step">
          <div className="content-card confirmation-card">
            <div className="card-header">
              <h3 className="card-title">Order Confirmed! 🎉</h3>
            </div>
            <div className="card-content">
              <div className="confirmation-details">
                <div className="success-icon">✅</div>
                <h2>Thank you for your order!</h2>
                <p>Your order has been confirmed and is being processed.</p>
                
                <div className="order-details">
                  <p><strong>Order ID:</strong> #{orderCreated.id}</p>
                  <p><strong>Status:</strong> <span className="status-confirmed">Confirmed</span></p>
                  <p><strong>Total Amount:</strong> ₱{totalAmount}</p>
                  <p><strong>Payment Method:</strong> {paymentMethod.replace('_', ' ')}</p>
                  <p><strong>Shipping Address:</strong> {formData.shippingAddress}</p>
                </div>

                <p className="confirmation-note">
                  You will receive an email confirmation shortly. 
                  You can track your order status in your order history.
                </p>
              </div>
            </div>
            <div className="card-actions">
              <button 
                className="card-btn primary"
                onClick={() => navigate('/customer')}
              >
                View Order History
              </button>
              <button 
                className="card-btn secondary"
                onClick={() => navigate('/customer/coffee')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;