import Badge from '../ui/Badge';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment' | 'review' | 'product' | 'user';
}

export default function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const getVariant = (status: string, type: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    if (type === 'order') {
      if (status === 'delivered') return 'success';
      if (status === 'shipped') return 'info';
      if (status === 'processing') return 'warning';
      if (status === 'cancelled') return 'danger';
      return 'default';
    }
    
    if (type === 'payment') {
      if (status === 'paid') return 'success';
      if (status === 'failed') return 'danger';
      if (status === 'refunded') return 'warning';
      return 'default';
    }
    
    if (type === 'review') {
      if (status === 'approved') return 'success';
      if (status === 'rejected') return 'danger';
      return 'warning';
    }
    
    if (type === 'product') {
      if (status === 'active' || status === 'visible') return 'success';
      if (status === 'inactive' || status === 'hidden') return 'danger';
      return 'default';
    }
    
    if (type === 'user') {
      if (status === 'active') return 'success';
      return 'danger';
    }
    
    return 'default';
  };

  return (
    <Badge variant={getVariant(status, type)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

