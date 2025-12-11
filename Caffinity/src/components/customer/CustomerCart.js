import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCreditCard, FaMobile, FaCheck, FaArrowLeft, FaWallet, FaUniversity, FaListAlt } from 'react-icons/fa';
import '../css/CustomerCart.css';

const CustomerCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderId, setOrderId] = useState(null);
  const [orderedItems, setOrderedItems] = useState([]);
  const [orderDate, setOrderDate] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'CREDIT_CARD',
  });

  // Payment methods
  const paymentMethods = [
    { id: 'CREDIT_CARD', label: 'Credit Card', icon: <FaCreditCard /> },
    { id: 'DEBIT_CARD', label: 'Debit Card', icon: <FaCreditCard /> },
    { id: 'GCASH', label: 'Gcash', icon: <FaMobile /> },
    { id: 'PAYMAYA', label: 'PayMaya', icon: <FaWallet /> },
    { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: <FaUniversity /> }
  ];

  // Generate or get session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  // Get logged-in user ID
  const getUserId = () => {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      console.error('No user found. User must be logged in to place orders.');
      return null;
    }
    try {
      const user = JSON.parse(userData);
      if (!user.userId) {
        console.error('User ID not found in user data');
        return null;
      }
      return user.userId;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  // Load cart from database
  const fetchCart = async () => {
    try {
      const sessionId = getSessionId();
      const userId = getUserId();
      
      if (!userId) {
        console.warn('No user ID found, user might not be logged in');
        setCartItems([]);
        return;
      }

      const headers = { 'X-Session-Id': sessionId, 'X-User-Id': userId };

      const response = await axios.get('http://localhost:8080/api/cart', { headers });
      
      console.log('Cart API Response:', response.data);
      
      if (response.data && response.data.cartItems) {
        setCartItems(response.data.cartItems || []);
      } else if (response.data && Array.isArray(response.data)) {
        setCartItems(response.data);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    }
  };

  // Load cart on component mount
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

  // Use cartItemId as the unique identifier
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

  // Handle checkbox selection using cartItemId
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

  // Select all items using cartItemId
  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      const allItemIds = cartItems.map(item => getCartItemId(item));
      setSelectedItems(new Set(allItemIds));
    }
  };

  // Simplified quantity update
  const handleQuantityUpdate = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      const item = cartItems.find(item => getCartItemId(item) === cartItemId);
      showDeleteConfirmation(cartItemId, getItemName(item));
      return;
    }

    const item = cartItems.find(item => getCartItemId(item) === cartItemId);
    if (!item) return;

    // Optimistic update
    setCartItems(prevItems => 
      prevItems.map(item => 
        getCartItemId(item) === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      const sessionId = getSessionId();
      const userId = getUserId();
      if (!userId) {
        console.error('User must be logged in to update cart');
        return;
      }
      
      const productId = getProductId(item);
      
      await axios.put('http://localhost:8080/api/cart/update', 
        { productId, quantity: newQuantity },
        { 
          headers: {
            'X-Session-Id': sessionId,
            'X-User-Id': userId
          }
        }
      );
      
    } catch (error) {
      console.error('Error updating cart:', error);
      fetchCart(); // Refresh on error
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

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    try {
      const sessionId = getSessionId();
      const userId = getUserId();
      if (!userId) {
        console.error('User must be logged in to remove from cart');
        return;
      }
      
      const item = cartItems.find(item => getCartItemId(item) === cartItemId);
      
      if (item) {
        const productId = getProductId(item);
        await axios.delete(`http://localhost:8080/api/cart/remove/${productId}`, {
          headers: {
            'X-Session-Id': sessionId,
            'X-User-Id': userId
          }
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
      fetchCart(); // Refresh on error
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

  // **REMOVED removeSelectedItems() - Backend will handle cart item deletion**

  // Bulk delete from cart (not for checkout)
  const removeSelectedItemsFromCart = async () => {
    const itemsToRemove = cartItems.filter(item => 
      selectedItems.has(getCartItemId(item))
    );
    
    // Update UI immediately
    setCartItems(prevItems => 
      prevItems.filter(item => !selectedItems.has(getCartItemId(item)))
    );
    
    // Remove from API in background
    const sessionId = getSessionId();
    const userId = getUserId();
    
    if (!userId) {
      console.error('User must be logged in to remove items');
      setShowBulkDeleteModal(false);
      return;
    }

    for (const item of itemsToRemove) {
      const productId = getProductId(item);
      try {
        await axios.delete(`http://localhost:8080/api/cart/remove/${productId}`, {
          headers: {
            'X-Session-Id': sessionId,
            'X-User-Id': userId
          }
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

  // Get total price for selected items
  const getSelectedTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.has(getCartItemId(item))) {
        const price = getItemPrice(item);
        return total + (price * item.quantity);
      }
      return total;
    }, 0);
  };

  // Get total quantity for selected items
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
    
    const userId = getUserId();
    if (!userId) {
      alert('You must be logged in to place an order!');
      window.location.href = '/login';
      return;
    }
    
    setCurrentStep(2);
    const selectedCartItems = cartItems.filter(item => selectedItems.has(getCartItemId(item)));
    localStorage.setItem('checkoutItems', JSON.stringify(selectedCartItems));
  };

  const handlePlaceOrder = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item to checkout!');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      alert('You must be logged in to place an order!');
      window.location.href = '/login';
      return;
    }

    try {
      const sessionId = getSessionId();
      
      const userData = localStorage.getItem('currentUser');
      if (!userData) {
        throw new Error('User data not found');
      }
      
      const user = JSON.parse(userData);
      
      const customerName = user.name || 
                         `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                         user.username || 
                         user.email?.split('@')[0] || 
                         'Customer';
      
      const customerEmail = user.email || '';
      const customerPhone = user.phone || user.phoneNumber || user.mobile || '';
      
      const selectedCartItems = cartItems.filter(item => selectedItems.has(getCartItemId(item)));
      
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const orderedItemsData = selectedCartItems.map(item => ({
        ...item,
        orderDate: currentDate,
        name: getItemName(item),
        price: getItemPrice(item),
        imageUrl: getProductImage(item)
      }));
      
      setOrderedItems(orderedItemsData);
      setOrderDate(currentDate);
      
      const selectedTotal = getSelectedTotalPrice();
      setOrderTotal(selectedTotal);
      
      const orderData = {
        totalAmount: selectedTotal,
        orderItems: selectedCartItems.map(item => ({
          productId: getProductId(item),
          productName: getItemName(item),
          quantity: item.quantity,
          price: getItemPrice(item),
          totalPrice: getItemPrice(item) * item.quantity
        })),
        paymentMethod: paymentInfo.method,
        paymentStatus: 'PENDING',
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        userId: userId,
        orderDate: currentDate
      };

      console.log('Placing order with data:', orderData);

      const headers = {
        'X-Session-Id': sessionId, // ADDED: Send session ID
        'X-User-Id': userId,
        'Content-Type': 'application/json'
      };

      const response = await axios.post('http://localhost:8080/api/orders', orderData, {
        headers
      });

      console.log('✅ Order created:', response.data);

      setOrderId(response.data.orderId);

      // --- FIX STARTS HERE ---
      // Filter out the ordered items from the local state immediately after successful order
      // The backend should have deleted them from the DB, so this update is safe.
      setCartItems(prevItems => 
        prevItems.filter(item => !selectedItems.has(getCartItemId(item)))
      );
      
      // Clear selections
      setSelectedItems(new Set());
      // --- FIX ENDS HERE ---
      
      setCurrentStep(3);
      
    } catch (error) {
      console.error('❌ Error creating order:', error);
      
      if (error.response?.data?.message) {
        alert(`Failed to place order: ${error.response.data.message}`);
      } else {
        alert('Failed to place order. Please try again.');
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentInfo(prev => ({
      ...prev,
      method: method
    }));
  };

  const getSelectedProductNames = () => {
    return cartItems
      .filter(item => selectedItems.has(getCartItemId(item)))
      .map(item => getItemName(item));
  };

  const getUserInfo = () => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return {
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Customer',
          phone: user.phoneNumber || user.phone || '',
          email: user.email || ''
        };
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return { name: 'Customer', phone: '', email: '' };
  };

  const formatPrice = (price) => {
    return `₱${parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const handleViewOrders = () => {
    window.location.href = '/customer/orders';
  };

  const renderStepContent = () => {
    const userInfo = getUserInfo();
    
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

      case 2: // Payment
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
                <h3 className="card-title centered-title">Payment Method</h3>
              </div>
              <div className="card-content">
                <div className="customer-info-section">
                  <h4 className="form-section-title">Customer Information</h4>
                  <div className="customer-info-display">
                    <div className="info-row">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{userInfo.name}</span>
                    </div>
                    {userInfo.phone && (
                      <div className="info-row">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">{userInfo.phone}</span>
                      </div>
                    )}
                    {userInfo.email && (
                      <div className="info-row">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{userInfo.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="payment-section">
                  <h4 className="form-section-title">Select Payment Method</h4>
                  <div className="payment-methods-grid">
                    {paymentMethods.map(method => (
                      <div 
                        key={method.id}
                        className={`payment-method-card ${paymentInfo.method === method.id ? 'selected' : ''}`}
                        onClick={() => handlePaymentMethodChange(method.id)}
                      >
                        <div className="payment-method-icon">
                          {method.icon}
                        </div>
                        <div className="payment-method-label">
                          {method.label}
                        </div>
                        <div className="payment-method-check">
                          {paymentInfo.method === method.id && <FaCheck />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="order-summary-preview">
                  <h4 className="form-section-title">Order Summary</h4>
                  <div className="preview-items">
                    {cartItems
                      .filter(item => selectedItems.has(getCartItemId(item)))
                      .map(item => (
                        <div key={getCartItemId(item)} className="preview-item">
                          <span>{getItemName(item)} x {item.quantity}</span>
                          <span>₱{(getItemPrice(item) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))
                    }
                  </div>
                  <div className="preview-total">
                    <strong>Total: ₱{getSelectedTotalPrice().toFixed(2)}</strong>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="card-btn" 
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        );

      case 3: // Confirmation
        return (
          <div className="centered-step-container">
            <div className="content-card centered-card">
              <div className="card-header">
                <h3 className="card-title centered-title">Order Confirmation</h3>
              </div>
              <div className="card-content">
                <div className="confirmation-message">
                  <div className="confirmation-header">
                    <div className="success-icon">
                      <FaCheck />
                    </div>
                    <h3>Order Placed Successfully!</h3>
                    <p>Thank you for your purchase. Your order has been confirmed and you will be notified if it is ready to pick up.</p>
                  </div>
                  
                  <div className="ordered-items-list">
                    {orderedItems.map((item, index) => (
                      <div key={index} className="ordered-item">
                        <div className="ordered-item-image">
                          <img 
                            src={getProductImage(item)} 
                            alt={getItemName(item)}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://via.placeholder.com/80x80/8B4513/ffffff?text=${encodeURIComponent(getItemName(item).charAt(0))}`;
                            }}
                          />
                        </div>
                        <div className="ordered-item-details">
                          <div className="ordered-item-info">
                            <h4 className="ordered-item-name">{getItemName(item)}</h4>
                            <div className="ordered-item-date">
                              {orderDate}
                            </div>
                            <div className="ordered-item-quantity">
                              Quantity: {item.quantity}
                            </div>
                          </div>
                          <div className="ordered-item-total">
                            <div className="ordered-item-price">
                              {formatPrice(getItemPrice(item) * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary-total">
                    <div className="order-summary-total-row">
                      <span>Subtotal:</span>
                      <span>{formatPrice(orderTotal)}</span>
                    </div>
                    <div className="order-summary-total-row">
                      <span>Discount:</span>
                      <span>₱0.00</span>
                    </div>
                    <div className="order-summary-total-row grand-total">
                      <span>Total Amount:</span>
                      <span>{formatPrice(orderTotal)}</span>
                    </div>
                  </div>

                  <div className="order-details">
                    <p><strong>Order ID:</strong> #{orderId || Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    <p><strong>Customer Name:</strong> {userInfo.name}</p>
                    <p><strong>Payment Method:</strong> {paymentInfo.method.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="card-btn secondary"
                  onClick={handleViewOrders}
                >
                  <FaListAlt style={{ marginRight: '8px' }} />
                  View Orders
                </button>
                <button 
                  className="card-btn" 
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedItems(new Set());
                    setPaymentInfo({ method: 'CREDIT_CARD' });
                    setOrderId(null);
                    setOrderedItems([]);
                    setOrderTotal(0);
                    // Cart state is already updated locally. A page refresh/re-mount will fetch the correct persistent state.
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
                onClick={removeSelectedItemsFromCart}
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

      <div className="progress-container">
        <div className="progress-step">
          <div className={`circle ${currentStep >= 1 ? 'active' : ''}`}>1</div>
          <span>Cart</span>
        </div>

        <div className="progress-line"></div>

        <div className="progress-step">
          <div className={`circle ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          <span>Payment</span>
        </div>

        <div className="progress-line"></div>

        <div className="progress-step">
          <div className={`circle ${currentStep >= 3 ? 'active' : ''}`}>3</div>
          <span>Confirmation</span>
        </div>
      </div>

      <div className={`cart-content ${currentStep === 1 ? 'cart-layout' : 'centered-layout'}`}>
        {renderStepContent()}

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
                  <span>Discount:</span>
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