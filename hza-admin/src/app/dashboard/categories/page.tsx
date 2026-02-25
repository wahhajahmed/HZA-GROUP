import { getCategories } from '@/services/category.service';
import CategoriesManager from './CategoriesManager';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categories ({categories.length})</h1>
      <CategoriesManager categories={categories} />
    </div>
  );
}
