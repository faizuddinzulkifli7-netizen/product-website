'use client';

import { useState } from 'react';
import { useAuthRedirect, useDataLoader, useModal, useConfirm } from '@/hooks';
import { adminApi } from '@/lib/mockApi';
import { AdminUser } from '@/types';
import { PageHeader, PageLayout, Card } from '@/components/layout';
import { Button, Modal, Input, Select, Checkbox } from '@/components/ui';
import { StatusBadge } from '@/components/table';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useAuthRedirect();
  const { user } = useAuth();
  const { data: users, loading, refetch } = useDataLoader<AdminUser[]>({
    loadFn: adminApi.getUsers,
    enabled: !!currentUser,
  });
  const modal = useModal<AdminUser>();
  const { confirm } = useConfirm();

  const handleDelete = async (id: string) => {
    if (await confirm('Are you sure you want to delete this user?')) {
      try {
        await adminApi.deleteUser(id);
        refetch();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleSave = async (data: Partial<AdminUser>) => {
    try {
      if (modal.data) {
        await adminApi.updateUser(modal.data.id, data);
      } else {
        await adminApi.createUser(data as Omit<AdminUser, 'id' | 'createdAt'>);
      }
      modal.close();
      refetch();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user');
      throw error;
    }
  };

  return (
    <PageLayout loading={loading}>
      <PageHeader
        title="Users"
        description="Manage admin users and permissions"
        action={
          user?.role === 'admin'
            ? {
                label: '+ Add User',
                onClick: () => modal.open(),
              }
            : undefined
        }
      />

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {u.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={u.role} type="user" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={u.isActive ? 'active' : 'inactive'} type="user" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {user?.role === 'admin' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => modal.open(u)}>
                          Edit
                        </Button>
                        {u.id !== user?.id && (
                          <Button variant="danger" size="sm" onClick={() => handleDelete(u.id)}>
                            Delete
                          </Button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.data ? 'Edit User' : 'Create User'}
      >
        <UserForm user={modal.data} onSubmit={handleSave} onCancel={modal.close} />
      </Modal>
    </PageLayout>
  );
}

function UserForm({
  user,
  onSubmit,
  onCancel,
}: {
  user?: AdminUser | null;
  onSubmit: (data: Partial<AdminUser>) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: (user?.role || 'manager') as 'admin' | 'manager',
    isActive: user?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Input
        label="Email"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <Select
        label="Role"
        required
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' })}
        options={[
          { value: 'manager', label: 'Manager' },
          { value: 'admin', label: 'Admin' },
        ]}
      />
      <Checkbox
        label="Active"
        checked={formData.isActive}
        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
      />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
