'use client';

import { useAuthRedirect, useDataLoader, useModal, useConfirm } from '@/hooks';
import { adminApi } from '@/lib/api';
import { Faq } from '@/types';
import { PageHeader, PageLayout, Card } from '@/components/layout';
import { Button, Modal, Badge } from '@/components/ui';
import { FaqForm } from '@/components/features/faqs';

export default function FaqsPage() {
  const { user } = useAuthRedirect();
  const { data: faqs, loading, refetch } = useDataLoader<Faq[]>({
    loadFn: adminApi.getFaqs,
    enabled: !!user,
  });
  const modal = useModal<Faq>();
  const { confirm } = useConfirm();

  const handleToggleActive = async (faq: Faq) => {
    try {
      await adminApi.updateFaq(faq.id, { isActive: !faq.isActive });
      refetch();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      alert('Failed to update FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await adminApi.deleteFaq(id);
        refetch();
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        alert('Failed to delete FAQ');
      }
    }
  };

  const handleSave = async (data: Omit<Faq, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (modal.data) {
        await adminApi.updateFaq(modal.data.id, data);
      } else {
        await adminApi.createFaq(data);
      }
      modal.close();
      refetch();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Failed to save FAQ');
      throw error;
    }
  };

  const sortedFaqs = [...(faqs || [])].sort((a, b) => a.order - b.order);

  return (
    <PageLayout loading={loading}>
      <PageHeader
        title="FAQs"
        description="Manage the questions and answers shown on the website's FAQ page"
        action={{
          label: '+ Add FAQ',
          onClick: () => modal.open(),
        }}
      />

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedFaqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {faq.order}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {faq.question}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {faq.answer}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={faq.isActive ? 'success' : 'default'}>
                      {faq.isActive ? 'Visible' : 'Hidden'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => modal.open(faq)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleActive(faq)}>
                      {faq.isActive ? 'Hide' : 'Show'}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(faq.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {sortedFaqs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No FAQs yet. Click &quot;Add FAQ&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.data ? 'Edit FAQ' : 'Add FAQ'}
        size="lg"
      >
        <FaqForm faq={modal.data} onSubmit={handleSave} onCancel={modal.close} />
      </Modal>
    </PageLayout>
  );
}
