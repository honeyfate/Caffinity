import React, { useState, useEffect } from 'react';
import '../css/CoffeeSection.css';
import cappuccinoImg from '../../cappuccino.jpeg';
import espressoImg from '../../espresso.jpeg';
import caramelMacchiatoImg from '../../caramel-macchiato.jpeg';
import latteImg from '../../latte.jpeg';
import mochaImg from '../../mocha.jpeg';
import coldBrewImg from '../../cold-brew.jpeg';

const initialItems = [
  { id: 1, name: 'Cappuccino', description: 'Rich espresso with steamed milk foam and a touch of cinnamon', price: '₱125.00', image: cappuccinoImg },
  { id: 2, name: 'Espresso', description: 'Pure Italian espresso shot with perfect crema', price: '₱90.00', image: espressoImg },
  { id: 3, name: 'Iced Caramel Macchiato', description: 'Espresso with vanilla-flavored syrup, milk, and caramel drizzle over ice', price: '₱170.00', image: caramelMacchiatoImg },
  { id: 4, name: 'Latte', description: 'Smooth espresso with steamed milk and a light foam layer', price: '₱130.00', image: latteImg },
  { id: 5, name: 'Mocha', description: 'Chocolate-flavored espresso drink topped with whipped cream', price: '₱150.00', image: mochaImg },
  { id: 6, name: 'Cold Brew', description: 'Slow-steeped coffee served chilled for a bold and smooth flavor', price: '₱160.00', image: coldBrewImg },
];

const CoffeeSection = () => {
  const [coffeeItems, setCoffeeItems] = useState(initialItems);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedPrice, setEditedPrice] = useState('');
  const [editedImage, setEditedImage] = useState(null);
  const [editedType, setEditedType] = useState('');

  useEffect(() => {
    if (isEditing || isAdding) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [isEditing, isAdding]);

  const handleEditClick = (item) => {
    setCurrentItem(item);
    setEditedName(item.name);
    setEditedDescription(item.description);
    setEditedPrice(item.price);
    setEditedImage(item.image);
    setIsEditing(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setEditedImage(imageURL);
    }
  };

  const handleSave = () => {
    if (!currentItem) return;
    const updatedItems = coffeeItems.map((item) =>
      item.id === currentItem.id
        ? { ...item, name: editedName, description: editedDescription, price: editedPrice, image: editedImage }
        : item
    );
    setCoffeeItems(updatedItems);
    setIsEditing(false);
    setCurrentItem(null);
  };

  const handleAddProduct = () => {
    setEditedName('');
    setEditedDescription('');
    setEditedPrice('');
    setEditedImage(null);
    setIsAdding(true);
  };

  const handleAddConfirm = () => {
    const newProduct = {
      id: coffeeItems.length + 1,
      name: editedName || 'Untitled Product',
      description: editedDescription || 'No description provided.',
      price: editedPrice || '₱0.00',
      image: editedImage || cappuccinoImg,
    };
    setCoffeeItems([...coffeeItems, newProduct]);
    setIsAdding(false);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentItem(null);
  };

  return (
    <section id="coffee" className={`coffee-section ${(isEditing || isAdding) ? 'editing-mode' : ''}`}>
      <h2 className="section-title">Admin Mode</h2>
            <div className="coffee-cards">
        {coffeeItems.map((item) => (
          <div
            key={item.id}
            className={`coffee-card ${currentItem?.id === item.id ? 'active-card' : ''}`}
          >
            <img src={item.image} alt={item.name} className="coffee-image" />
            <h3 className="coffee-name">{item.name}</h3>
            <p className="coffee-description">{item.description}</p>
            <p className="coffee-price">{item.price}</p>
            <button className="edit-menu-button" onClick={() => handleEditClick(item)}>
              Edit Menu
            </button>
          </div>
        ))}
      </div>

      {/* === Add Product Button inside section === */}
      <div className="add-product-container">
        <button className="add-product-button" onClick={handleAddProduct}>
          + Add Product
        </button>
      </div>
      {/* === Edit Modal === */}
      {isEditing && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="exit-button" onClick={handleCloseModal}>×</button>
            <h3>Edit Product</h3>
            <p className="modal-subtitle">Make changes to the product details below</p>

            <div className="image-upload-container">
              <label htmlFor="imageUploadEdit">
                <img src={editedImage} alt="preview" className="modal-image" />
                <div className="image-overlay">Change Image</div>
              </label>
              <input id="imageUploadEdit" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>

            <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="modal-input" placeholder="Product Name" />
            <textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} className="modal-input description" placeholder="Description" />
            <input type="text" value={editedPrice} onChange={(e) => setEditedPrice(e.target.value)} className="modal-input" placeholder="Price" />

            <div className="modal-actions">
              <button className="cancel-button" onClick={handleCloseModal}>Cancel</button>
              <button className="save-button" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* === Add Modal === */}
      {isAdding && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="exit-button" onClick={handleCloseModal}>×</button>
            <h3>Add Product</h3>
            <p className="modal-subtitle">Fill in the details below to add a new product</p>

            <div className="image-upload-container">
              <label htmlFor="imageUploadAdd">
                {editedImage ? (
                  <img src={editedImage} alt="preview" className="modal-image" />
                ) : (
                  <div className="empty-image-placeholder">Add Photo</div>
                )}
                <div className="image-overlay">Upload Image</div>
              </label>
              <input
                id="imageUploadAdd"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* === Input fields === */}
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="modal-input"
              placeholder="Product Name"
            />
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="modal-input description"
              placeholder="Description"
            />
            <input
              type="text"
              value={editedPrice}
              onChange={(e) => setEditedPrice(e.target.value)}
              className="modal-input"
              placeholder="Price"
            />

            {/* === TEXTBOX FOR TYPE === */}
            <input
              type="text"
              value={editedType}
              onChange={(e) => setEditedType(e.target.value)}
              className="modal-input"
              placeholder="Type (e.g. Coffee or Dessert)"
            />

            <div className="modal-actions">
              <button className="cancel-button" onClick={handleCloseModal}>Cancel</button>
              <button className="save-button" onClick={handleAddConfirm}>Add</button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default CoffeeSection;
