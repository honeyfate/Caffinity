import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaPhone, FaCreditCard, FaMobile, FaCheck, FaArrowLeft } from 'react-icons/fa';
import '../css/CustomerCart.css';

const CustomerCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
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

  // FIXED: Use cartItemId as the unique identifier
  const getCartItemId = (item) => {
    return item.cartItemId || item.id;
  };

  // Safe function to get product ID (for API calls)
  const getProductId = (item) => {
    return item.product?.productId || item.productId;
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

  // FIXED: Handle checkbox selection using cartItemId
  const handleSelectItem = (cartItemId) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(cartItemId)) {
        newSelected.delete(cartItemId);
      } else {
        newSelected.add(cartItemId);
      }
      return newSelected;
    });
  };

  // FIXED: Select all items using cartItemId
  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      const allItemIds = cartItems.map(item => getCartItemId(item));
      setSelectedItems(new Set(allItemIds));
    }
  };

  // FIXED: Simplified quantity update without loading
  const handleQuantityUpdate = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      const item = cartItems.find(item => getCartItemId(item) === cartItemId);
      showDeleteConfirmation(cartItemId, getItemName(item));
      return;
    }

    // Find the item to get productId for API call
    const item = cartItems.find(item => getCartItemId(item) === cartItemId);
    if (!item) return;

    // Optimistic update - update UI immediately
    setCartItems(prevItems => 
      prevItems.map(item => 
        getCartItemId(item) === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );

    // Update in database silently in background
    try {
      const sessionId = getSessionId();
      const productId = getProductId(item);
      
      await axios.put('http://localhost:8080/api/cart/update', 
        { productId, quantity: newQuantity },
        { headers: { 'X-Session-Id': sessionId } }
      );
      
      // Success - no UI feedback needed
    } catch (error) {
      console.error('Error updating cart:', error);
      // Revert optimistic update on error
      setCartItems(prevItems => 
        prevItems.map(item => 
          getCartItemId(item) === cartItemId ? { ...item, quantity: item.quantity } : item
        )
      );
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (cartItemId, productName) => {
    setProductToDelete({ id: cartItemId, name: productName });
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

  // FIXED: Remove item using proper identifiers
  const removeFromCart = async (cartItemId) => {
    try {
      const sessionId = getSessionId();
      const item = cartItems.find(item => getCartItemId(item) === cartItemId);
      
      if (item) {
        const productId = getProductId(item);
        await axios.delete(`http://localhost:8080/api/cart/remove/${productId}`, {
          headers: { 'X-Session-Id': sessionId }
        });
      }
      
      // Update UI
      setCartItems(prevItems => prevItems.filter(item => getCartItemId(item) !== cartItemId));
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(cartItemId);
        return newSelected;
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Update UI even if API fails
      setCartItems(prevItems => prevItems.filter(item => getCartItemId(item) !== cartItemId));
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(cartItemId);
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

  // FIXED: Remove selected items using proper identifiers
  const removeSelectedItems = async () => {
    // Get all items to be removed for API calls
    const itemsToRemove = cartItems.filter(item => 
      selectedItems.has(getCartItemId(item))
    );
    
    // Remove from UI immediately
    setCartItems(prevItems => 
      prevItems.filter(item => !selectedItems.has(getCartItemId(item)))
    );
    
    // Remove from API in background
    const sessionId = getSessionId();
    for (const item of itemsToRemove) {
      const productId = getProductId(item);
      try {
        await axios.delete(`http://localhost:8080/api/cart/remove/${productId}`, {
          headers: { 'X-Session-Id': sessionId }
        });
      } catch (error) {
        console.error('Error removing item:', error);
      }
    }
    
    setSelectedItems(new Set());
    setShowBulkDeleteModal(false);
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

  // FIXED: Get total price for selected items using cartItemId
  const getSelectedTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.has(getCartItemId(item))) {
        const price = getItemPrice(item);
        return total + (price * item.quantity);
      }
      return total;
    }, 0);
  };

  // FIXED: Get total quantity for selected items using cartItemId
  const getSelectedTotalQuantity = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.has(getCartItemId(item))) {
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
    
    setCurrentStep(2);
    const selectedCartItems = cartItems.filter(item => selectedItems.has(getCartItemId(item)));
    localStorage.setItem('checkoutItems', JSON.stringify(selectedCartItems));
    console.log('Proceeding to checkout with items:', selectedCartItems);
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

  // FIXED: Get selected product names using cartItemId
  const getSelectedProductNames = () => {
    return cartItems
      .filter(item => selectedItems.has(getCartItemId(item)))
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
                        />
                        <span className="checkmark"></span>
                        Select All
                      </label>
                      {selectedItems.size > 0 && (
                        <button 
                          className="remove-selected-btn"
                          onClick={showBulkDeleteConfirmation}
                        >
                          Remove Selected ({selectedItems.size})
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
                  <div className="cart-items-list">
                    {cartItems.map(item => {
                      const cartItemId = getCartItemId(item);
                      const isSelected = selectedItems.has(cartItemId);
                      const productName = getItemName(item);
                      
                      return (
                        <div key={cartItemId} className={`cart-item-card ${isSelected ? 'selected' : ''}`}>
                          <div className="cart-item-checkbox">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectItem(cartItemId)}
                            />
                          </div>
                          
                          <button 
                            className="delete-btn-x"
                            onClick={() => showDeleteConfirmation(cartItemId, productName)}
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
                                  onClick={() => handleQuantityUpdate(cartItemId, item.quantity - 1)}
                                  className="quantity-btn"
                                >
                                  -
                                </button>
                                <span className="quantity">
                                  {item.quantity}
                                </span>
                                <button 
                                  onClick={() => handleQuantityUpdate(cartItemId, item.quantity + 1)}
                                  className="quantity-btn"
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
            <div className="top-back-button-container">
              <button 
                className="top-back-button"
                onClick={handlePrevStep}
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
                  disabled={!customerInfo.name || !customerInfo.phone}
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
              >
                No, Keep It
              </button>
              <button 
                className="modal-btn confirm-btn"
                onClick={confirmDelete}
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
              >
                Cancel
              </button>
              <button 
                className="modal-btn confirm-btn"
                onClick={removeSelectedItems}
              >
                Remove {selectedItems.size} Items
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
                {/* REMOVED SHIPPING ROW */}
                <div className="summary-row">
                  <span>Discount:</span>
                  <span>₱0.00</span>
                </div>
                <div className="summary-row">
                  <span>Voucher:</span>
                  <span>₱0.00</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>
                    ₱{(
                      (selectedItems.size > 0 ? getSelectedTotalPrice() : getTotalPrice())
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="card-btn" 
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || selectedItems.size === 0}
                >
                  Checkout ({selectedItems.size})
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
        )}
      </div>
    </div>
  );
};

export default CustomerCart;