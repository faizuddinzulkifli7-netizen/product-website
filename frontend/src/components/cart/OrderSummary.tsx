'use client';

import { useCart } from '@/contexts/CartContext';
import Button from '@/components/ui/Button';

interface OrderSummaryProps {
  onCheckout?: () => void;
  showCheckoutButton?: boolean;
  checkoutButtonText?: string;
}

export default function OrderSummary({
  onCheckout,
  showCheckoutButton = true,
  checkoutButtonText = 'Proceed to Checkout',
}: OrderSummaryProps) {
  const { cart, getTotalPrice } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${getTotalPrice().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between text-lg font-semibold text-gray-900">
            <span>Total</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>
        </div>
      </div>
      {showCheckoutButton && onCheckout && (
        <>
          <Button onClick={onCheckout} fullWidth className="mb-4">
            {checkoutButtonText}
          </Button>
          <Button
            asLink
            href="/"
            variant="outline"
            fullWidth
            size="sm"
          >
            Continue Shopping
          </Button>
        </>
      )}
    </div>
  );
}

