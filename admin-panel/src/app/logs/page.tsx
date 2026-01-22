'use client';

import { useState, useMemo } from 'react';
import { useAuthRedirect, useDataLoader } from '@/hooks';
import { adminApi } from '@/lib/mockApi';
import { ActivityLog } from '@/types';
import { PageHeader, PageLayout, FilterBar, Card } from '@/components/layout';
import { Select } from '@/components/ui';
import { StatusBadge } from '@/components/table';

export default function LogsPage() {
  const { user } = useAuthRedirect();
  const loadLogs = useMemo(() => () => adminApi.getActivityLogs(500), []);
  const { data: logs, loading } = useDataLoader<ActivityLog[]>({
    loadFn: loadLogs,
    enabled: !!user,
  });
  const [filterEntity, setFilterEntity] = useState<string>('all');

  const filteredLogs = (logs || []).filter((log) => {
    if (filterEntity !== 'all' && log.entityType !== filterEntity) return false;
    return true;
  });

  const getEntityIcon = (type: ActivityLog['entityType']) => {
    switch (type) {
      case 'product':
        return '📦';
      case 'order':
        return '🛒';
      case 'user':
        return '👥';
      case 'review':
        return '⭐';
      case 'system':
        return '⚙️';
      default:
        return '📝';
    }
  };

  return (
    <PageLayout loading={loading}>
      <PageHeader
        title="Activity Logs"
        description="View all administrative actions and system events"
      />

      <FilterBar>
        <Select
          label="Entity Type"
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'product', label: 'Products' },
            { value: 'order', label: 'Orders' },
            { value: 'user', label: 'Users' },
            { value: 'review', label: 'Reviews' },
            { value: 'system', label: 'System' },
          ]}
          className="max-w-xs"
        />
      </FilterBar>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {log.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <span className="mr-1">{getEntityIcon(log.entityType)}</span>
                      {log.entityType}
                      {log.entityId && ` #${log.entityId.slice(-6)}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {log.details || '-'}
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
