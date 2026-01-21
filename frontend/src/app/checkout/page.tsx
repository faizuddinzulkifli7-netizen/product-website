'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutData } from '@/types';
import { mockApi } from '@/lib/mockApi';
import Container from '@/components/layout/Container';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';
import OrderSummary from '@/components/cart/OrderSummary';

const countryOptions = [
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Germany', label: 'Germany' },
];

export default function CheckoutPage() {
  const router = useRouter();
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
    country: 'United States',
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
      const guestId = localStorage.getItem('guestId') || undefined;
      
      const response = await mockApi.initiateCheckout(
        formData,
        user?.id,
        guestId
      );

      if (response.paymentUrl) {
        alert('Redirecting to payment gateway...\n\nIn production, this would redirect to B2BINPAY On-Ramp payment gateway.');
        await clearCart();
        router.push('/checkout/success');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process checkout');
    } finally {
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
