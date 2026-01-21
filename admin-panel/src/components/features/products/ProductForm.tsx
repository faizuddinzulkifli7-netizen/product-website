import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Input, Select, Checkbox, Button } from '@/components/ui';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ProductForm({ product, onSubmit, onCancel, loading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    category: '',
    inStock: true,
    stockLevel: 0,
    isActive: true,
    isVisible: true,
    image: '',
    specifications: '',
    usage: '',
    storage: '',
    warnings: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        category: product.category,
        inStock: product.inStock,
        stockLevel: product.stockLevel || 0,
        isActive: product.isActive,
        isVisible: product.isVisible,
        image: product.image,
        specifications: product.extendedInfo?.specifications?.join('\n') || '',
        usage: product.extendedInfo?.usage || '',
        storage: product.extendedInfo?.storage || '',
        warnings: product.extendedInfo?.warnings?.join('\n') || '',
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      extendedInfo: {
        specifications: formData.specifications.split('\n').filter((s) => s.trim()),
        usage: formData.usage,
        storage: formData.storage,
        warnings: formData.warnings.split('\n').filter((w) => w.trim()),
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          label="Category"
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
      </div>

      <Input
        label="Short Description"
        required
        value={formData.shortDescription}
        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
      />

      <Input
        as="textarea"
        label="Description"
        required
        rows={3}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Price"
          type="number"
          step="0.01"
          required
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
        />
        <Input
          label="Stock Level"
          type="number"
          value={formData.stockLevel}
          onChange={(e) => setFormData({ ...formData, stockLevel: parseInt(e.target.value) || 0 })}
        />
        <Input
          label="Image URL"
          type="text"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Checkbox
          label="In Stock"
          checked={formData.inStock}
          onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
        />
        <Checkbox
          label="Active"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
        />
        <Checkbox
          label="Visible"
          checked={formData.isVisible}
          onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
        />
      </div>

      <Input
        as="textarea"
        label="Specifications (one per line)"
        rows={3}
        value={formData.specifications}
        onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
      />

      <Input
        as="textarea"
        label="Usage Instructions"
        rows={2}
        value={formData.usage}
        onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
      />

      <Input
        as="textarea"
        label="Storage Instructions"
        rows={2}
        value={formData.storage}
        onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
      />

      <Input
        as="textarea"
        label="Warnings (one per line)"
        rows={2}
        value={formData.warnings}
        onChange={(e) => setFormData({ ...formData, warnings: e.target.value })}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

