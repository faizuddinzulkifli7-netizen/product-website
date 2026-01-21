import { Order } from '@/types';
import { Select } from '@/components/ui';

interface OrderStatusSelectProps {
  order: Order;
  onStatusChange: (status: Order['status']) => Promise<void>;
}

export default function OrderStatusSelect({ order, onStatusChange }: OrderStatusSelectProps) {
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <Select
      value={order.status}
      onChange={(e) => onStatusChange(e.target.value as Order['status'])}
      options={statusOptions}
      className="text-xs"
    />
  );
}

