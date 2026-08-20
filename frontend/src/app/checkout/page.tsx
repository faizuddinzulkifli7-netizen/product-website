'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CURRENCY_OPTIONS, DISPLAY_CURRENCY } from '@/contexts/CurrencyContext';
import { CheckoutData } from '@/types';
import { api } from '@/lib/api';
import Container from '@/components/layout/Container';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';
import OrderSummary from '@/components/cart/OrderSummary';

const countryOptions = [
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Finland', label: 'Finland' },
  { value: 'Norway', label: 'Norway' },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Germany', label: 'Germany' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'France', label: 'France' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'Serbia', label: 'Serbia' },
];

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<CheckoutData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Sweden',
    paymentType: 'card',
    currency: DISPLAY_CURRENCY,
  });

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const guestId = localStorage.getItem('guestId');
      if (!guestId) {
        throw new Error('Missing cart session, please refresh and try again');
      }

      const response = await api.checkout(formData, guestId);

      if (response.paymentUrl) {
        await clearCart();
        // Send the customer to BTCPay's hosted invoice to pay; BTCPay redirects
        // back to /checkout/success once the payment settles.
        window.location.href = response.paymentUrl;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process checkout');
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <Container className="py-12">
        <EmptyState
          title="Your Cart is Empty"
          message="Add items to your cart before checkout."
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="4xl" className="py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    label="Last Name"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    label="State"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    label="ZIP Code"
                    name="zipCode"
                    type="text"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Select
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  options={countryOptions}
                  required
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>

              <div className="mb-4 max-w-xs">
                <Select
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  options={CURRENCY_OPTIONS}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Local payment options (e.g. Klarna for SEK) are shown based on your currency.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    formData.paymentType === 'card'
                      ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value="card"
                    checked={formData.paymentType === 'card'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium text-gray-900">Card / Bank</span>
                    <span className="block text-sm text-gray-500">
                      Pay by card, Klarna, or other local options — settled to us in crypto behind the scenes.
                    </span>
                  </span>
                </label>

                <label
                  className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    formData.paymentType === 'crypto'
                      ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value="crypto"
                    checked={formData.paymentType === 'crypto'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium text-gray-900">Pay with Crypto</span>
                    <span className="block text-sm text-gray-500">
                      Already hold crypto? Pay directly from your own wallet (Bitcoin or EVM chains).
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              fullWidth
              size="lg"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <OrderSummary showCheckoutButton={false} />
        </div>
      </div>
    </Container>
  );
}
