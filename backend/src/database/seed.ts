import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { Product } from '../entities/product.entity';

export async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const productRepository = dataSource.getRepository(Product);

  // Create default admin user
  const adminExists = await userRepository.findOne({
    where: { email: 'admin@example.com' },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepository.save(admin);
    console.log('✅ Default admin user created (admin@example.com / admin123)');
  }

  // Create sample products
  const productCount = await productRepository.count();
  if (productCount === 0) {
    const products = [
      {
        name: 'BPC-157',
        description: 'Body Protection Compound-157 is a synthetic peptide known for its healing properties.',
        shortDescription: 'Healing peptide for tissue repair and recovery',
        price: 89.99,
        image: '/api/placeholder/400/400',
        category: 'Recovery',
        inStock: true,
        stockLevel: 50,
        isActive: true,
        isVisible: true,
        specifications: JSON.stringify(['Purity: 99%', 'Molecular Weight: 1419.61 g/mol', 'Sequence: 15 amino acids']),
        usage: 'Reconstitute with bacteriostatic water. Administer subcutaneously.',
        storage: 'Store in freezer at -20°C. Keep away from light.',
        warnings: JSON.stringify(['For research purposes only', 'Not for human consumption']),
      },
      {
        name: 'TB-500',
        description: 'Thymosin Beta-4 fragment promotes cell migration and tissue repair.',
        shortDescription: 'Tissue repair and regeneration peptide',
        price: 129.99,
        image: '/api/placeholder/400/400',
        category: 'Recovery',
        inStock: true,
        stockLevel: 30,
        isActive: true,
        isVisible: true,
        specifications: JSON.stringify(['Purity: 98%', 'Molecular Weight: 496.7 g/mol', 'Sequence: 4 amino acids']),
        usage: 'Reconstitute with sterile water. Subcutaneous injection recommended.',
        storage: 'Store frozen at -20°C. Protect from light.',
        warnings: JSON.stringify(['Research use only', 'Handle with care']),
      },
      {
        name: 'GHK-Cu',
        description: 'Copper peptide complex that supports skin health and collagen production.',
        shortDescription: 'Anti-aging and skin health peptide',
        price: 79.99,
        image: '/api/placeholder/400/400',
        category: 'Beauty',
        inStock: true,
        stockLevel: 75,
        isActive: true,
        isVisible: true,
        specifications: JSON.stringify(['Purity: 99%', 'Molecular Weight: 340.8 g/mol', 'Copper complex']),
        usage: 'Topical application or reconstitute for injection.',
        storage: 'Store in refrigerator at 2-8°C.',
        warnings: JSON.stringify(['For research purposes', 'Avoid direct sunlight']),
      },
      {
        name: 'Ipamorelin',
        description: 'Growth hormone secretagogue that stimulates natural GH release.',
        shortDescription: 'Growth hormone releasing peptide',
        price: 99.99,
        image: '/api/placeholder/400/400',
        category: 'Performance',
        inStock: true,
        stockLevel: 40,
        isActive: true,
        isVisible: true,
        specifications: JSON.stringify(['Purity: 98%', 'Molecular Weight: 711.9 g/mol', '5 amino acids']),
        usage: 'Reconstitute with bacteriostatic water. Subcutaneous injection.',
        storage: 'Store frozen at -20°C.',
        warnings: JSON.stringify(['Research use only', 'Not for human consumption']),
      },
    ];

    for (const productData of products) {
      const product = productRepository.create(productData);
      await productRepository.save(product);
    }
    console.log('✅ Sample products created');
  }
}

