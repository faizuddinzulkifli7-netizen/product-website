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

  // Product catalog. Prices below are PLACEHOLDERS ($TBD) — update via the
  // admin panel before launch. Re-running the seed replaces the catalog with
  // this list, so it stays in sync with whatever ships here.
  const products = [
    {
      name: 'Retatrutide 1mg Research Kit',
      description:
        'Retatrutide is a triple-agonist peptide (GLP-1/GIP/glucagon receptor) referenced in metabolic research literature. This kit includes a 1mg vial, a companion bacteriostatic water vial for reconstitution, and a syringe.',
      shortDescription: 'Triple-agonist peptide kit — 1mg vial, bac water, 1 syringe',
      price: 149.99,
      image: '/api/placeholder/400/400',
      category: 'GLP-1 Research Peptides',
      inStock: true,
      stockLevel: 50,
      isActive: true,
      isVisible: true,
      specifications: JSON.stringify([
        'Peptide: Retatrutide',
        'Vial size: 1mg',
        'Kit includes: 1x Bacteriostatic Water vial, 1x Syringe',
        'Purity: see Certificate of Analysis',
      ]),
      usage:
        'For laboratory research use only. Reconstitute with the included bacteriostatic water following standard laboratory protocol.',
      storage:
        'Store lyophilized vial frozen at -20°C. Once reconstituted, refrigerate at 2-8°C.',
      warnings: JSON.stringify([
        'For laboratory research use only',
        'Not for human or veterinary use',
        'Not approved for human consumption',
      ]),
    },
    {
      name: 'Retatrutide 10mg Research Kit',
      description:
        'Retatrutide is a triple-agonist peptide (GLP-1/GIP/glucagon receptor) referenced in metabolic research literature. This kit includes a 10mg vial, a companion bacteriostatic water vial for reconstitution, and 3 syringes.',
      shortDescription: 'Triple-agonist peptide kit — 10mg vial, bac water, 3 syringes',
      price: 349.99,
      image: '/api/placeholder/400/400',
      category: 'GLP-1 Research Peptides',
      inStock: true,
      stockLevel: 40,
      isActive: true,
      isVisible: true,
      specifications: JSON.stringify([
        'Peptide: Retatrutide',
        'Vial size: 10mg',
        'Kit includes: 1x Bacteriostatic Water vial, 3x Syringes',
        'Purity: see Certificate of Analysis',
      ]),
      usage:
        'For laboratory research use only. Reconstitute with the included bacteriostatic water following standard laboratory protocol.',
      storage:
        'Store lyophilized vial frozen at -20°C. Once reconstituted, refrigerate at 2-8°C.',
      warnings: JSON.stringify([
        'For laboratory research use only',
        'Not for human or veterinary use',
        'Not approved for human consumption',
      ]),
    },
    {
      name: 'Tirzepatide 10mg Research Kit',
      description:
        'Tirzepatide is a dual GIP/GLP-1 receptor agonist peptide referenced in metabolic research literature. This kit includes a 10mg vial, a companion bacteriostatic water vial for reconstitution, and 3 syringes.',
      shortDescription: 'Dual GIP/GLP-1 agonist kit — 10mg vial, bac water, 3 syringes',
      price: 299.99,
      image: '/api/placeholder/400/400',
      category: 'GLP-1 Research Peptides',
      inStock: true,
      stockLevel: 40,
      isActive: true,
      isVisible: true,
      specifications: JSON.stringify([
        'Peptide: Tirzepatide',
        'Vial size: 10mg',
        'Kit includes: 1x Bacteriostatic Water vial, 3x Syringes',
        'Purity: see Certificate of Analysis',
      ]),
      usage:
        'For laboratory research use only. Reconstitute with the included bacteriostatic water following standard laboratory protocol.',
      storage:
        'Store lyophilized vial frozen at -20°C. Once reconstituted, refrigerate at 2-8°C.',
      warnings: JSON.stringify([
        'For laboratory research use only',
        'Not for human or veterinary use',
        'Not approved for human consumption',
      ]),
    },
    {
      name: 'Semaglutide (Ozempic) 10mg Research Kit',
      description:
        'Semaglutide is a GLP-1 receptor agonist peptide widely referenced in metabolic research literature. This kit includes a 10mg vial, a companion bacteriostatic water vial for reconstitution, and 3 syringes.',
      shortDescription: 'GLP-1 agonist peptide kit — 10mg vial, bac water, 3 syringes',
      price: 279.99,
      image: '/api/placeholder/400/400',
      category: 'GLP-1 Research Peptides',
      inStock: true,
      stockLevel: 40,
      isActive: true,
      isVisible: true,
      specifications: JSON.stringify([
        'Peptide: Semaglutide',
        'Vial size: 10mg',
        'Kit includes: 1x Bacteriostatic Water vial, 3x Syringes',
        'Purity: see Certificate of Analysis',
      ]),
      usage:
        'For laboratory research use only. Reconstitute with the included bacteriostatic water following standard laboratory protocol.',
      storage:
        'Store lyophilized vial frozen at -20°C. Once reconstituted, refrigerate at 2-8°C.',
      warnings: JSON.stringify([
        'For laboratory research use only',
        'Not for human or veterinary use',
        'Not approved for human consumption',
      ]),
    },
    {
      name: 'Glow Peptide 70mg Blend Kit',
      description:
        'Glow is a multi-peptide blend referenced in cosmetic and tissue-support peptide research. This kit includes a 70mg vial, a companion bacteriostatic water vial for reconstitution, and 5 syringes.',
      shortDescription: 'Multi-peptide research blend — 70mg vial, bac water, 5 syringes',
      price: 199.99,
      image: '/api/placeholder/400/400',
      category: 'Peptide Blends',
      inStock: true,
      stockLevel: 35,
      isActive: true,
      isVisible: true,
      specifications: JSON.stringify([
        'Blend: Glow',
        'Vial size: 70mg',
        'Kit includes: 1x Bacteriostatic Water vial, 5x Syringes',
        'Purity: see Certificate of Analysis',
      ]),
      usage:
        'For laboratory research use only. Reconstitute with the included bacteriostatic water following standard laboratory protocol.',
      storage:
        'Store lyophilized vial frozen at -20°C. Once reconstituted, refrigerate at 2-8°C.',
      warnings: JSON.stringify([
        'For laboratory research use only',
        'Not for human or veterinary use',
        'Not approved for human consumption',
      ]),
    },
    {
      name: 'Klow Peptide 70mg Blend Kit',
      description:
        'Klow is a multi-peptide blend referenced in cosmetic and pigmentation-pathway peptide research. This kit includes a 70mg vial, a companion bacteriostatic water vial for reconstitution, and 5 syringes.',
      shortDescription: 'Multi-peptide research blend — 70mg vial, bac water, 5 syringes',
      price: 199.99,
      image: '/api/placeholder/400/400',
      category: 'Peptide Blends',
      inStock: true,
      stockLevel: 35,
      isActive: true,
      isVisible: true,
      specifications: JSON.stringify([
        'Blend: Klow',
        'Vial size: 70mg',
        'Kit includes: 1x Bacteriostatic Water vial, 5x Syringes',
        'Purity: see Certificate of Analysis',
      ]),
      usage:
        'For laboratory research use only. Reconstitute with the included bacteriostatic water following standard laboratory protocol.',
      storage:
        'Store lyophilized vial frozen at -20°C. Once reconstituted, refrigerate at 2-8°C.',
      warnings: JSON.stringify([
        'For laboratory research use only',
        'Not for human or veterinary use',
        'Not approved for human consumption',
      ]),
    },
  ];

  // Soft-hide any previously-seeded demo products that aren't part of this
  // catalog, rather than deleting them — old orders/reviews still reference
  // them by id, and a hard delete would violate those foreign keys.
  const catalogNames = products.map((p) => p.name);
  await productRepository
    .createQueryBuilder()
    .update(Product)
    .set({ isActive: false, isVisible: false })
    .where('name NOT IN (:...names)', { names: catalogNames })
    .execute();

  // Insert only what's missing so re-running this never clobbers prices an
  // admin has already edited for these products.
  for (const productData of products) {
    const existing = await productRepository.findOne({ where: { name: productData.name } });
    if (!existing) {
      const product = productRepository.create(productData);
      await productRepository.save(product);
    }
  }
  console.log('✅ Product catalog synced (placeholder prices on new items — update before launch)');
}

