import { Product } from '@/types';

interface ProductSpecificationsProps {
  product: Product;
}

export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
  if (!product.extendedInfo) return null;

  return (
    <div className="space-y-4">
      {product.extendedInfo.specifications.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Specifications:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {product.extendedInfo.specifications.map((spec, idx) => (
              <li key={idx}>{spec}</li>
            ))}
          </ul>
        </div>
      )}
      
      {product.extendedInfo.usage && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Usage:</h3>
          <p className="text-gray-700">{product.extendedInfo.usage}</p>
        </div>
      )}
      
      {product.extendedInfo.storage && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Storage:</h3>
          <p className="text-gray-700">{product.extendedInfo.storage}</p>
        </div>
      )}
      
      {product.extendedInfo.warnings && product.extendedInfo.warnings.length > 0 && (
        <div>
          <h3 className="font-semibold text-red-600 mb-2">Warnings:</h3>
          <ul className="list-disc list-inside text-red-600 space-y-1">
            {product.extendedInfo.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

