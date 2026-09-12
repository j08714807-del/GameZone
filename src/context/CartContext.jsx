import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('gamezone_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('gamezone_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (game) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === game.id);
      if (existing) {
        return prev.map(item =>
          item.id === game.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...game, quantity: 1 }];
    });
  };

  const removeFromCart = (gameId) => {
    setCart(prev => prev.filter(item => item.id !== gameId));
  };

  const increaseQuantity = (gameId) => {
    setCart(prev =>
      prev.map(item =>
        item.id === gameId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (gameId) => {
    setCart(prev => {
      const item = prev.find(i => i.id === gameId);
      if (item && item.quantity === 1) {
        return prev.filter(i => i.id !== gameId);
      }
      return prev.map(item =>
        item.id === gameId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const clearCart = () => setCart([]);

  const isInCart = (gameId) => cart.some(item => item.id === gameId);

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      isInCart,
      getTotal,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
