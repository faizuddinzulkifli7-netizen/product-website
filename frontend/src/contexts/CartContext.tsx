'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, Product } from '@/types';
import { api, generateGuestId } from '@/lib/api';

interface CartContextType {
  cart: Cart;
  loading: boolean;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    // Get or create guest ID
    let gId = localStorage.getItem('guestId');
    if (!gId) {
      gId = generateGuestId();
      localStorage.setItem('guestId', gId);
    }
    setGuestId(gId);
  }, []);

  useEffect(() => {
    if (guestId) {
      loadCart();
    }
  }, [guestId]);

  const loadCart = async () => {
    if (!guestId) return;
    try {
      setLoading(true);
      const cartData = await api.getCart(guestId);
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number) => {
    if (!guestId) return;
    try {
      const updatedCart = await api.addToCart(product.id, quantity, guestId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!guestId) return;
    try {
      const updatedCart = await api.updateCartItem(productId, quantity, guestId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!guestId) return;
    try {
      const updatedCart = await api.removeFromCart(productId, guestId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!guestId) return;
    try {
      await api.clearCart(guestId);
      setCart({ items: [] });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const getTotalItems = (): number => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = (): number => {
    return cart.items.reduce((total, item) => {
      const productPrice = item.product?.price || 0;
      return total + productPrice * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

