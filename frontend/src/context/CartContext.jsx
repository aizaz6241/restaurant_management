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

  const addToCart = (item) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.menuItem === item._id);
      if (existingItem) {
        return prev.map((i) =>
          i.menuItem === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      const activePrice = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
      return [...prev, { menuItem: item._id, name: item.name, price: activePrice, quantity: 1, image: item.image }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.menuItem !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.menuItem === id ? { ...i, quantity } : i))
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
