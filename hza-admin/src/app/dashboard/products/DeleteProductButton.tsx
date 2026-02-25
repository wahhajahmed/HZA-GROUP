'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { deleteProduct } from '@/services/product.service';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="destructive" size="sm" isLoading={loading} onClick={handleDelete}>
      <Trash2 className="h-3 w-3" />
    </Button>
  );
}
