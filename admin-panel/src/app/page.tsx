'use client';

import { useAuthRedirect, useDataLoader } from '@/hooks';
import { adminApi } from '@/lib/mockApi';
import { DashboardMetrics } from '@/types';
import { PageHeader, PageLayout, Card } from '@/components/layout';
import { Button } from '@/components/ui';
import { StatusBadge } from '@/components/table';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuthRedirect();
  const { data: metrics, loading } = useDataLoader<DashboardMetrics>({
    loadFn: adminApi.getDashboardMetrics,
    enabled: !!user,
  });

  if (!metrics) {
    return <PageLayout loading={loading} />;
  }

  return (
    <PageLayout loading={loading}>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.name}!`}
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sales"
          value={`$${metrics.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="💰"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toString()}
          icon="🛒"
        />
        <MetricCard
          title="Pending Orders"
          value={metrics.pendingOrders.toString()}
          icon="⏳"
          highlight
        />
        <MetricCard
          title="Active Products"
          value={metrics.activeProducts.toString()}
          icon="📦"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sales by Month">
          <div className="space-y-3">
            {metrics.salesByMonth.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.month}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${item.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${
                        metrics.salesByMonth.reduce((max, m) => Math.max(max, m.sales), 0) > 0
                          ? (item.sales / metrics.salesByMonth.reduce((max, m) => Math.max(max, m.sales), 0)) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Orders by Status">
          <div className="space-y-3">
            {metrics.ordersByStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="capitalize text-gray-700 dark:text-gray-300">{item.status}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${
                          metrics.totalOrders > 0 ? (item.count / metrics.totalOrders) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card
        title="Recent Orders"
        action={
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              View all →
            </Button>
          </Link>
        }
      >
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
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} type="order" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.paymentStatus} type="payment" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
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

function MetricCard({
  title,
  value,
  icon,
  highlight,
}: {
  title: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'ring-2 ring-indigo-500' : ''}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </Card>
  );
}
