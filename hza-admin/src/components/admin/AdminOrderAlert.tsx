'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function AdminOrderAlert() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin-order-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new as { id: string; shipping_name?: string };
          toast.info(`New order received!`, {
            description: `From: ${order.shipping_name ?? 'Customer'}`,
            action: {
              label: 'View',
              onClick: () => router.push(`/dashboard/orders/${order.id}`),
            },
            duration: 8000,
          });
          router.refresh();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  return null;
}
