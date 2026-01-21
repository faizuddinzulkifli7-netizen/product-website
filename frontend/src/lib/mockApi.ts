import { Product, Review, User, CartItem, Cart, CheckoutData, AuthResponse } from '@/types';

// Mock data storage (simulating backend)
let users: User[] = [];
let carts: Map<string, Cart> = new Map();
let currentUser: User | null = null;

// Generate guest ID
export const generateGuestId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Mock products data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'BPC-157',
    description: 'Body Protection Compound-157 is a synthetic peptide known for its healing properties.',
    shortDescription: 'Healing peptide for tissue repair and recovery',
    price: 89.99,
    image: '/api/placeholder/400/400',
    category: 'Recovery',
    inStock: true,
    extendedInfo: {
      specifications: ['Purity: 99%', 'Molecular Weight: 1419.61 g/mol', 'Sequence: 15 amino acids'],
      usage: 'Reconstitute with bacteriostatic water. Administer subcutaneously.',
      storage: 'Store in freezer at -20°C. Keep away from light.',
      warnings: ['For research purposes only', 'Not for human consumption']
    }
  },
  {
    id: '2',
    name: 'TB-500',
    description: 'Thymosin Beta-4 fragment promotes cell migration and tissue repair.',
    shortDescription: 'Tissue repair and regeneration peptide',
    price: 129.99,
    image: '/api/placeholder/400/400',
    category: 'Recovery',
    inStock: true,
    extendedInfo: {
      specifications: ['Purity: 98%', 'Molecular Weight: 496.7 g/mol', 'Sequence: 4 amino acids'],
      usage: 'Reconstitute with sterile water. Subcutaneous injection recommended.',
      storage: 'Store frozen at -20°C. Protect from light.',
      warnings: ['Research use only', 'Handle with care']
    }
  },
  {
    id: '3',
    name: 'GHK-Cu',
    description: 'Copper peptide complex that supports skin health and collagen production.',
    shortDescription: 'Anti-aging and skin health peptide',
    price: 79.99,
    image: '/api/placeholder/400/400',
    category: 'Beauty',
    inStock: true,
    extendedInfo: {
      specifications: ['Purity: 99%', 'Molecular Weight: 340.8 g/mol', 'Copper complex'],
      usage: 'Topical application or reconstitute for injection.',
      storage: 'Store in refrigerator at 2-8°C.',
      warnings: ['For research purposes', 'Avoid direct sunlight']
    }
  },
  {
    id: '4',
    name: 'Ipamorelin',
    description: 'Growth hormone secretagogue that stimulates natural GH release.',
    shortDescription: 'Growth hormone releasing peptide',
    price: 99.99,
    image: '/api/placeholder/400/400',
    category: 'Performance',
    inStock: true,
    extendedInfo: {
      specifications: ['Purity: 98%', 'Molecular Weight: 711.9 g/mol', '5 amino acids'],
      usage: 'Reconstitute with bacteriostatic water. Subcutaneous injection.',
      storage: 'Store frozen at -20°C.',
      warnings: ['Research use only', 'Not for human consumption']
    }
  },
  {
    id: '5',
    name: 'CJC-1295',
    description: 'Long-acting growth hormone releasing hormone analog.',
    shortDescription: 'Long-acting growth hormone peptide',
    price: 149.99,
    image: '/api/placeholder/400/400',
    category: 'Performance',
    inStock: true,
    extendedInfo: {
      specifications: ['Purity: 99%', 'Molecular Weight: 3367.9 g/mol', '30 amino acids'],
      usage: 'Reconstitute with sterile water. Subcutaneous injection.',
      storage: 'Store in freezer at -20°C.',
      warnings: ['For research purposes only']
    }
  },
  {
    id: '6',
    name: 'Melanotan II',
    description: 'Synthetic peptide that stimulates melanin production for tanning.',
    shortDescription: 'Tanning and skin pigmentation peptide',
    price: 69.99,
    image: '/api/placeholder/400/400',
    category: 'Beauty',
    inStock: true,
    extendedInfo: {
      specifications: ['Purity: 98%', 'Molecular Weight: 1023.2 g/mol', '10 amino acids'],
      usage: 'Reconstitute with bacteriostatic water. Subcutaneous injection.',
      storage: 'Store frozen at -20°C. Protect from light.',
      warnings: ['Research use only', 'Handle with care']
    }
  }
];

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: '1',
    productId: '1',
    userName: 'John D.',
    rating: 5,
    comment: 'Excellent product! Helped with my recovery significantly.',
    date: '2024-01-15'
  },
  {
    id: '2',
    productId: '1',
    userName: 'Sarah M.',
    rating: 4,
    comment: 'Good quality, fast shipping. Would recommend.',
    date: '2024-01-20'
  },
  {
    id: '3',
    productId: '2',
    userName: 'Mike T.',
    rating: 5,
    comment: 'Amazing results! Very satisfied with the purchase.',
    date: '2024-02-01'
  },
  {
    id: '4',
    productId: '3',
    userName: 'Emma L.',
    rating: 4,
    comment: 'Great for skin health. Noticed improvements after a few weeks.',
    date: '2024-02-10'
  },
  {
    id: '5',
    productId: '4',
    userName: 'David K.',
    rating: 5,
    comment: 'Top quality peptide. Works as expected.',
    date: '2024-02-15'
  }
];

// API Functions
export const mockApi = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return [...mockProducts];
  },

  getProduct: async (id: string): Promise<Product | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockProducts.find(p => p.id === id) || null;
  },

  getProductReviews: async (productId: string): Promise<Review[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockReviews.filter(r => r.productId === productId);
  },

  // Authentication
  signUp: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    users.push(newUser);
    currentUser = newUser;

    return {
      user: newUser,
      token: newUser.token!
    };
  },

  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    user.token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    currentUser = user;

    return {
      user,
      token: user.token
    };
  },

  signOut: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    currentUser = null;
  },

  getCurrentUser: async (): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return currentUser;
  },

  // Cart
  getCart: async (userId?: string, guestId?: string): Promise<Cart> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const cartKey = userId || guestId || 'default';
    const cart = carts.get(cartKey);
    
    if (cart) {
      // Enrich cart items with product data
      const enrichedItems = cart.items.map(item => ({
        ...item,
        product: mockProducts.find(p => p.id === item.productId)
      }));
      return { ...cart, items: enrichedItems };
    }

    return { items: [] };
  },

  addToCart: async (productId: string, quantity: number, userId?: string, guestId?: string): Promise<Cart> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cartKey = userId || guestId || 'default';
    let cart = carts.get(cartKey) || { items: [] };

    const existingItem = cart.items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    if (userId) cart.userId = userId;
    if (guestId) cart.guestId = guestId;

    carts.set(cartKey, cart);
    return mockApi.getCart(userId, guestId);
  },

  updateCartItem: async (productId: string, quantity: number, userId?: string, guestId?: string): Promise<Cart> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const cartKey = userId || guestId || 'default';
    const cart = carts.get(cartKey);
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.find(item => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter(item => item.productId !== productId);
      } else {
        item.quantity = quantity;
      }
    }

    carts.set(cartKey, cart);
    return mockApi.getCart(userId, guestId);
  },

  removeFromCart: async (productId: string, userId?: string, guestId?: string): Promise<Cart> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const cartKey = userId || guestId || 'default';
    const cart = carts.get(cartKey);
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(item => item.productId !== productId);
    carts.set(cartKey, cart);
    return mockApi.getCart(userId, guestId);
  },

  clearCart: async (userId?: string, guestId?: string): Promise<Cart> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const cartKey = userId || guestId || 'default';
    carts.delete(cartKey);
    return { items: [] };
  },

  // Checkout
  initiateCheckout: async (checkoutData: CheckoutData, userId?: string, guestId?: string): Promise<{ paymentUrl: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get cart to calculate total
    const cart = await mockApi.getCart(userId, guestId);
    const total = cart.items.reduce((sum, item) => {
      const product = mockProducts.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    
    // In a real implementation, this would call the backend which then redirects to B2BINPAY
    // For mock, we'll return a mock payment URL
    const orderId = `order_${Date.now()}`;
    const paymentUrl = `https://b2binpay.com/on-ramp?order=${orderId}&amount=${total.toFixed(2)}`;
    
    // Clear cart after checkout initiation
    await mockApi.clearCart(userId, guestId);
    
    return { paymentUrl };
  }
};

