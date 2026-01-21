import Link from 'next/link';
import { Product } from '@/types';

interface ProductInfoProps {
  product: Product;
  showDescription?: boolean;
  showPrice?: boolean;
  className?: string;
}

export default function ProductInfo({
  product,
  showDescription = true,
  showPrice = true,
  className = '',
}: ProductInfoProps) {
  return (
    <div className={className}>
      <Link href={`/products/${product.id}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
      </Link>
      {showDescription && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.shortDescription}
        </p>
      )}
      {showPrice && (
        <p className="text-2xl font-bold text-blue-600">
          ${product.price.toFixed(2)}
        </p>
      )}
    </div>
  );
}

