'use client';

import { useState } from 'react';
import { useAuthRedirect, useDataLoader, useConfirm } from '@/hooks';
import { adminApi } from '@/lib/mockApi';
import { Review } from '@/types';
import { PageHeader, PageLayout, FilterBar, Card } from '@/components/layout';
import { Select, Button } from '@/components/ui';
import { StatusBadge } from '@/components/table';

export default function ReviewsPage() {
  const { user } = useAuthRedirect();
  const { data: reviews, loading, refetch } = useDataLoader<Review[]>({
    loadFn: adminApi.getReviews,
    enabled: !!user,
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { confirm } = useConfirm();

  const handleStatusUpdate = async (id: string, status: Review['status']) => {
    try {
      await adminApi.updateReviewStatus(id, status);
      refetch();
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirm('Are you sure you want to delete this review?')) {
      try {
        await adminApi.deleteReview(id);
        refetch();
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review');
      }
    }
  };

  const filteredReviews = (reviews || []).filter((review) => {
    if (filterStatus !== 'all' && review.status !== filterStatus) return false;
    return true;
  });

  return (
    <PageLayout loading={loading}>
      <PageHeader
        title="Reviews"
        description="Moderate customer reviews"
      />

      <FilterBar>
        <Select
          label="Review Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          className="max-w-xs"
        />
      </FilterBar>

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{review.userName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {review.product?.name || 'Unknown Product'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <StatusBadge status={review.status} type="review" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(review.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <Select
                  value={review.status}
                  onChange={(e) => handleStatusUpdate(review.id, e.target.value as Review['status'])}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                  className="text-xs"
                />
                <Button variant="danger" size="sm" onClick={() => handleDelete(review.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
