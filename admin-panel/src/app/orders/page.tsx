'use client';

import { useState } from 'react';
import { useAuthRedirect, useDataLoader } from '@/hooks';
import { adminApi } from '@/lib/mockApi';
import { Order } from '@/types';
import { PageHeader, PageLayout, FilterBar, Card } from '@/components/layout';
import { Select, Button } from '@/components/ui';
import { StatusBadge } from '@/components/table';
import { OrderStatusSelect, PaymentStatusSelect } from '@/components/features/orders';
import Link from 'next/link';

export default function OrdersPage() {
  const { user } = useAuthRedirect();
  const { data: orders, loading, refetch } = useDataLoader<Order[]>({
    loadFn: adminApi.getOrders,
    enabled: !!user,
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      refetch();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    try {
      await adminApi.updatePaymentStatus(orderId, paymentStatus);
      refetch();
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const filteredOrders = (orders || []).filter((order) => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    if (filterPayment !== 'all' && order.paymentStatus !== filterPayment) return false;
    return true;
  });

  return (
    <PageLayout loading={loading}>
      <PageHeader
        title="Orders"
        description="Manage and track all orders"
      />

      <FilterBar>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Order Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <Select
            label="Payment Status"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            options={[
              { value: 'all', label: 'All Payments' },
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'failed', label: 'Failed' },
              { value: 'refunded', label: 'Refunded' },
            ]}
          />
        </div>
      </FilterBar>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{order.customerName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.items.length} item(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OrderStatusSelect
                      order={order}
                      onStatusChange={(status) => handleStatusUpdate(order.id, status)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentStatusSelect
                      order={order}
                      onStatusChange={(status) => handlePaymentStatusUpdate(order.id, status)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageLayout>
  );
}
