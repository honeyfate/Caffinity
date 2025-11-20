import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaPhone, FaCreditCard, FaMobile, FaCheck, FaArrowLeft } from 'react-icons/fa';
import '../css/CustomerCart.css';

const CustomerCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state for customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });

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
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      const savedCart = localStorage.getItem('cart');
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
    return `https://via.placeholder.com/80x80/8B4513/ffffff?text=${encodeURIComponent(getItemName(item).charAt(0))}`;
  };

  // Handle checkbox selection
  const handleSelectItem = (productId) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(productId)) {
        newSelected.delete(productId);
      } else {
        newSelected.add(productId);
      }
      return newSelected;
    });
  };

  // Select all items
  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      const allItemIds = cartItems.map(item => getProductId(item));
      setSelectedItems(new Set(allItemIds));
    }
  };

  // Handle quantity update (optimistic update)
  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (newQuantity === 0) {
      // Show confirmation modal instead of immediate removal
      const item = cartItems.find(item => getProductId(item) === productId);
      showDeleteConfirmation(productId, getItemName(item));
      return;
    }

    // Optimistically update the UI first
    setCartItems(prevItems => 
      prevItems.map(item => 
        getProductId(item) === productId ? { ...item, quantity: newQuantity } : item
      )
    );

    // Then update in database
    await updateQuantity(productId, newQuantity);
  };

  // Update quantity in database
  const updateQuantity = async (productId, newQuantity) => {
    try {
      const sessionId = getSessionId();
      
      // Only make API call if quantity is greater than 0
      if (newQuantity > 0) {
        await axios.put('http://localhost:8080/api/cart/update', 
          { productId, quantity: newQuantity },
          { headers: { 'X-Session-Id': sessionId } }
        );
      }
      
      // Refresh cart to ensure sync with server
      fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      // Revert optimistic update on error
      fetchCart();
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (productId, productName) => {
    setProductToDelete({ id: productId, name: productName });
    setShowDeleteModal(true);
  };

  // Show bulk delete confirmation modal
  const showBulkDeleteConfirmation = () => {
    if (selectedItems.size === 0) {
      alert('Please select items to remove');
      return;
    }
    setShowBulkDeleteModal(true);
  };

  // Remove item from cart completely
  const removeFromCart = async (productId) => {
    try {
      const sessionId = getSessionId();
      await axios.delete(`http://localhost:8080/api/cart/remove/${productId}`, {
        headers: { 'X-Session-Id': sessionId }
      });
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(productId);
        return newSelected;
      });
      fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      setCartItems(prevItems => prevItems.filter(item => getProductId(item) !== productId));
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(productId);
        return newSelected;
      });
    }
  };

  // Confirm single item deletion
  const confirmDelete = async () => {
    if (productToDelete) {
      await removeFromCart(productToDelete.id);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  // Cancel single item deletion
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Remove selected items from cart
  const removeSelectedItems = async () => {
    try {
      setIsLoading(true);
      const sessionId = getSessionId();
      
      for (const productId of selectedItems) {
        await axios.delete(`http://localhost:8080/api/cart/remove/${productId}`, {
          headers: { 'X-Session-Id': sessionId }
        });
      }
      
      setSelectedItems(new Set());
      fetchCart();
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error('Error removing selected items:', error);
      setCartItems(prevItems => prevItems.filter(item => !selectedItems.has(getProductId(item))));
      setSelectedItems(new Set());
      setShowBulkDeleteModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel bulk deletion
  const cancelBulkDelete = () => {
    setShowBulkDeleteModal(false);
  };

  // Get total price for all items
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = getItemPrice(item);
      return total + (price * item.quantity);
    }, 0);
  };

  // Get total price for selected items only
  const getSelectedTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.has(getProductId(item))) {
        const price = getItemPrice(item);
        return total + (price * item.quantity);
      }
      return total;
    }, 0);
  };

  // Get total quantity for selected items
  const getSelectedTotalQuantity = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.has(getProductId(item))) {
        return total + item.quantity;
      }
      return total;
    }, 0);
  };

  const handleContinueShopping = () => {
    window.location.href = '/customer/coffee';
  };

  const handleCheckout = async () => {
    const selectedCount = selectedItems.size;
    
    if (selectedCount === 0) {
      alert('Please select at least one item to checkout!');
      return;
    }
    
    try {
      setIsLoading(true);
      setCurrentStep(2);
      const selectedCartItems = cartItems.filter(item => selectedItems.has(getProductId(item)));
      localStorage.setItem('checkoutItems', JSON.stringify(selectedCartItems));
      console.log('Proceeding to checkout with items:', selectedCartItems);
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation between steps
  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle customer info change
  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get selected product names for bulk delete modal
  const getSelectedProductNames = () => {
    return cartItems
      .filter(item => selectedItems.has(getProductId(item)))
      .map(item => getItemName(item));
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch(currentStep) {
      case 1: // Cart
        return (
          <div className="cart-items-section">
            <div className="content-card">
              <div className="card-header">
                <div className="cart-header-actions">
                  <h3 className="card-title">
                    Cart Items ({cartItems.length})
                    {selectedItems.size > 0 && (
                      <span className="selected-count">
                        ({selectedItems.size} selected)
                      </span>
                    )}
                  </h3>
                  {cartItems.length > 0 && (
                    <div className="bulk-actions">
                      <label className="select-all-label">
                        <input
                          type="checkbox"
                          checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                          onChange={handleSelectAll}
                          disabled={isLoading}
                        />
                        <span className="checkmark"></span>
                        Select All
                      </label>
                      {selectedItems.size > 0 && (
                        <button 
                          className="remove-selected-btn"
                          onClick={showBulkDeleteConfirmation}
                          disabled={isLoading}
                        >
                          Remove Selected ({selectedItems.size})
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
                    {cartItems.map(item => {
                      const productId = getProductId(item);
                      const isSelected = selectedItems.has(productId);
                      const productName = getItemName(item);
                      
                      return (
                        <div key={item.id || productId} className={`cart-item-card ${isSelected ? 'selected' : ''}`}>
                          <div className="cart-item-checkbox">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectItem(productId)}
                              disabled={isLoading}
                            />
                          </div>
                          
                          <button 
                            className="delete-btn-x"
                            onClick={() => showDeleteConfirmation(productId, productName)}
                            disabled={isLoading}
                            title="Remove item"
                          >
                            ×
                          </button>
                          
                          <div className="cart-item-image">
                            <img 
                              src={getProductImage(item)} 
                              alt={productName}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://via.placeholder.com/80x80/8B4513/ffffff?text=${encodeURIComponent(productName.charAt(0))}`;
                              }}
                            />
                          </div>
                          
                          <div className="cart-item-details">
                            <div className="product-info-section">
                              <div className="product-name-section">
                                <h4 className="product-name">{productName}</h4>
                                {getItemCategory(item) && (
                                  <span className="product-category-badge">{getItemCategory(item)}</span>
                                )}
                              </div>
                              <div className="price-section">
                                <p className="unit-price">₱{getItemPrice(item).toFixed(2)} each</p>
                              </div>
                            </div>
                            
                            <div className="quantity-section">
                              <div className="quantity-controls">
                                <button 
                                  onClick={() => handleQuantityUpdate(productId, item.quantity - 1)}
                                  className="quantity-btn"
                                  disabled={isLoading}
                                >
                                  -
                                </button>
                                <span className="quantity">{item.quantity}</span>
                                <button 
                                  onClick={() => handleQuantityUpdate(productId, item.quantity + 1)}
                                  className="quantity-btn"
                                  disabled={isLoading}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            <div className="total-section">
                              <div className="item-total">
                                ₱{(getItemPrice(item) * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2: // Customer Information - CENTERED
      return (
        <div className="centered-step-container">
          {/* Back Button at the top of the card */}
          <div className="top-back-button-container">
            <button 
              className="top-back-button"
              onClick={handlePrevStep}
              disabled={isLoading}
            >
              <FaArrowLeft className="back-icon" />
              Back to Cart
            </button>
          </div>
          
          <div className="content-card centered-card">
            <div className="card-header">
              <h3 className="card-title">Customer Information</h3>
            </div>
            <div className="card-content">
              <div className="checkout-form">
                <div className="form-section">
                  <h4 className="form-section-title">Contact Details</h4>
                  <div className="form-group">
                    <label className="form-label">
                      <FaUser className="form-icon" />
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter your full name" 
                      className="form-input"
                      value={customerInfo.name}
                      onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <FaPhone className="form-icon" />
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      placeholder="Enter your phone number" 
                      className="form-input"
                      value={customerInfo.phone}
                      onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="card-actions">
              <button 
                className="card-btn" 
                onClick={handleNextStep}
                disabled={isLoading || !customerInfo.name || !customerInfo.phone}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      );

      case 3: // Payment - CENTERED
        return (
          <div className="centered-step-container">
            <div className="content-card centered-card">
              <div className="card-header with-back-button">
                <button 
                  className="back-button"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                >
                  <FaArrowLeft className="back-icon" />
                  Back
                </button>
                <h3 className="card-title centered-title">Payment Method</h3>
                <div className="header-spacer"></div>
              </div>
              <div className="card-content">
                <div className="payment-section">
                  <h4 className="form-section-title">Select Payment Method</h4>
                  <div className="payment-methods">
                    <div className="payment-option">
                      <input type="radio" id="card" name="payment" defaultChecked />
                      <label htmlFor="card">
                        <FaCreditCard className="payment-icon" />
                        Credit/Debit Card
                      </label>
                    </div>
                    <div className="payment-option">
                      <input type="radio" id="gcash" name="payment" />
                      <label htmlFor="gcash">
                        <FaMobile className="payment-icon" />
                        Gcash
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="card-details-section">
                  <h4 className="form-section-title">Payment Details</h4>
                  <div className="form-group">
                    <input type="text" placeholder="Card Number" className="form-input" />
                  </div>
                  <div className="form-row">
                    <input type="text" placeholder="Expiry Date (MM/YY)" className="form-input" />
                    <input type="text" placeholder="CVV" className="form-input" />
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="card-btn" 
                  onClick={handleNextStep}
                  disabled={isLoading}
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        );

      case 4: // Confirmation - CENTERED
        return (
          <div className="centered-step-container">
            <div className="content-card centered-card">
              <div className="card-header with-back-button">
                <button 
                  className="back-button"
                  onClick={() => setCurrentStep(1)}
                  disabled={isLoading}
                >
                  <FaArrowLeft className="back-icon" />
                  Back to Cart
                </button>
                <h3 className="card-title centered-title">Order Confirmation</h3>
                <div className="header-spacer"></div>
              </div>
              <div className="card-content">
                <div className="confirmation-message">
                  <div className="success-icon">
                    <FaCheck />
                  </div>
                  <h3>Order Placed Successfully!</h3>
                  <p>Thank you for your purchase. Your order has been confirmed and you will be notified if it is ready to pick up.</p>
                  <div className="order-details">
                    <p><strong>Order ID:</strong> #ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="card-btn" 
                  onClick={() => {
                    // Reset and go back to cart
                    setCurrentStep(1);
                    setSelectedItems(new Set());
                    setCustomerInfo({ name: '', phone: '' });
                    fetchCart();
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="customer-cart">
      {/* Single Item Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3>Remove Item</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to remove <strong>"{productToDelete?.name}"</strong> from your cart?</p>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel-btn"
                onClick={cancelDelete}
                disabled={isLoading}
              >
                No, Keep It
              </button>
              <button 
                className="modal-btn confirm-btn"
                onClick={confirmDelete}
                disabled={isLoading}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3>Remove Selected Items</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to remove {selectedItems.size} item(s) from your cart?</p>
              <div className="selected-items-list">
                {getSelectedProductNames().map((name, index) => (
                  <div key={index} className="selected-item-name">• {name}</div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel-btn"
                onClick={cancelBulkDelete}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="modal-btn confirm-btn"
                onClick={removeSelectedItems}
                disabled={isLoading}
              >
                {isLoading ? 'Removing...' : `Remove ${selectedItems.size} Items`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>Review your items and proceed to checkout</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-step">
          <div className={`circle ${currentStep >= 1 ? 'active' : ''}`}>1</div>
          <span>Cart</span>
        </div>

        <div className="progress-line"></div>

        <div className="progress-step">
          <div className={`circle ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          <span>Information</span>
        </div>

        <div className="progress-line"></div>

        <div className="progress-step">
          <div className={`circle ${currentStep >= 3 ? 'active' : ''}`}>3</div>
          <span>Payment</span>
        </div>

        <div className="progress-line"></div>

        <div className="progress-step">
          <div className={`circle ${currentStep >= 4 ? 'active' : ''}`}>4</div>
          <span>Confirmation</span>
        </div>
      </div>

      <div className={`cart-content ${currentStep === 1 ? 'cart-layout' : 'centered-layout'}`}>
        {renderStepContent()}

        {/* Order Summary - Only show in Cart step */}
        {currentStep === 1 && (
          <div className="order-summary">
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">
                  Order Summary
                  {selectedItems.size > 0 && (
                    <span className="selected-summary">(Selected Items)</span>
                  )}
                </h3>
              </div>
              <div className="card-content">
                <div className="summary-row">
                  <span>
                    Items ({selectedItems.size > 0 ? getSelectedTotalQuantity() : cartItems.reduce((total, item) => total + item.quantity, 0)}):
                  </span>
                  <span>
                    ₱{selectedItems.size > 0 ? getSelectedTotalPrice().toFixed(2) : getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>
                    ₱{(selectedItems.size > 0 ? selectedItems.size : cartItems.length) > 0 ? '50.00' : '0.00'}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Voucher:</span>
                  <span>
                    ₱{((selectedItems.size > 0 ? getSelectedTotalPrice() : getTotalPrice()) * 0.12).toFixed(2)}
                  </span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>
                    ₱{(
                      (selectedItems.size > 0 ? getSelectedTotalPrice() : getTotalPrice()) * 1.12 + 
                      ((selectedItems.size > 0 ? selectedItems.size : cartItems.length) > 0 ? 50 : 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="card-btn" 
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || isLoading || selectedItems.size === 0}
                >
                  {isLoading ? 'Processing...' : `Checkout (${selectedItems.size})`}
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
        )}
      </div>
    </div>
  );
};

export default CustomerCart;