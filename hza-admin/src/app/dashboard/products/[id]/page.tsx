import { notFound } from 'next/navigation';
import { getProductById } from '@/services/product.service';
import { getCategories } from '@/services/category.service';
import EditProductForm from './EditProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);
  if (!product) notFound();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <EditProductForm product={product} categories={categories} />
    </div>
  );
}
