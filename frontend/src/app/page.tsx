'use client';

import { useEffect, useState } from 'react';
import { Product, Review } from '@/types';
import { mockApi } from '@/lib/mockApi';
import ProductCard from '@/components/ProductCard';
import ReviewCard from '@/components/ReviewCard';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import PageHeader from '@/components/layout/PageHeader';
import Loading from '@/components/ui/Loading';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, allReviews] = await Promise.all([
          mockApi.getProducts(),
          Promise.all(
            ['1', '2', '3', '4'].map(id => mockApi.getProductReviews(id))
          ).then(results => results.flat())
        ]);
        setProducts(productsData);
        setReviews(allReviews.slice(0, 4));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Container>
        <Loading />
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <PageHeader
        title="Premium Peptide Products"
        subtitle="Discover our collection of high-quality peptides for research and wellness"
      />

      <Section title="Featured Products" className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Section>

      <div className="bg-white rounded-lg shadow-md p-8">
        <Section title="Customer Reviews">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </Section>
      </div>
    </Container>
  );
}
