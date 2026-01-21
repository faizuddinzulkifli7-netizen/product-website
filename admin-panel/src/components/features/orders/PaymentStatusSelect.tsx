import { Order } from '@/types';
import { Select } from '@/components/ui';

interface PaymentStatusSelectProps {
  order: Order;
  onStatusChange: (status: Order['paymentStatus']) => Promise<void>;
}

export default function PaymentStatusSelect({ order, onStatusChange }: PaymentStatusSelectProps) {
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ];

  return (
    <Select
      value={order.paymentStatus}
      onChange={(e) => onStatusChange(e.target.value as Order['paymentStatus'])}
      options={statusOptions}
      className="text-xs"
    />
  );
}

