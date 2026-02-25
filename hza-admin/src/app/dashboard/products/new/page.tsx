import { getCategories } from '@/services/category.service';
import NewProductForm from './NewProductForm';

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Add New Product</h1>
      <NewProductForm categories={categories} />
    </div>
  );
}
