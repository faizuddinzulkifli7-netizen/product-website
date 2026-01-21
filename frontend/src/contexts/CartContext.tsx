'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, Product } from '@/types';
import { mockApi, generateGuestId } from '@/lib/mockApi';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
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
    loadCart();
  }, [user, guestId]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await mockApi.getCart(user?.id, guestId || undefined);
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number) => {
    try {
      const updatedCart = await mockApi.addToCart(
        product.id,
        quantity,
        user?.id,
        guestId || undefined
      );
      setCart(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const updatedCart = await mockApi.updateCartItem(
        productId,
        quantity,
        user?.id,
        guestId || undefined
      );
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const updatedCart = await mockApi.removeFromCart(
        productId,
        user?.id,
        guestId || undefined
      );
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await mockApi.clearCart(user?.id, guestId || undefined);
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

