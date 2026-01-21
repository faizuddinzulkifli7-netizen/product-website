import { ReactNode } from 'react';
import Loading from '../ui/Loading';

interface PageLayoutProps {
  children?: ReactNode;
  loading?: boolean;
  error?: string | null;
}

export default function PageLayout({ children, loading, error }: PageLayoutProps) {
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return <div className="space-y-6">{children}</div>;
}

