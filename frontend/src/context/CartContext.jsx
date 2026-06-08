import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, versionObj = null) => {
    setCart((prev) => {
      const versionName = versionObj ? versionObj.name : null;
      const existingItem = prev.find(
        (i) => i.menuItem === item._id && i.version === versionName
      );
      if (existingItem) {
        return prev.map((i) =>
          i.menuItem === item._id && i.version === versionName
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      
      let activePrice = 0;
      if (versionObj) {
        activePrice = versionObj.discountPrice && versionObj.discountPrice > 0 
          ? versionObj.discountPrice 
          : versionObj.price;
      } else {
        activePrice = item.discountPrice && item.discountPrice > 0 
          ? item.discountPrice 
          : item.price;
      }

      return [
        ...prev,
        {
          menuItem: item._id,
          name: item.name,
          version: versionName,
          price: activePrice,
          quantity: 1,
          image: item.image,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id, version = null) => {
    setCart((prev) =>
      prev.filter((i) => !(i.menuItem === id && i.version === version))
    );
  };

  const updateQuantity = (id, version, quantity) => {
    const targetVersion = typeof version === 'number' ? null : version;
    const targetQty = typeof version === 'number' ? version : quantity;
    
    if (targetQty < 1) {
      removeFromCart(id, targetVersion);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.menuItem === id && i.version === targetVersion ? { ...i, quantity: targetQty } : i
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        toggleCart,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
