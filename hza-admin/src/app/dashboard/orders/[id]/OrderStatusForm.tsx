'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateOrderStatus, updateOrderTracking } from '@/services/order.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ORDER_STATUS_OPTIONS } from '@/lib/constants';

export default function OrderStatusForm({ orderId, currentStatus, trackingNumber }: {
  orderId: string; currentStatus: string; trackingNumber: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(trackingNumber);
  const [statusLoading, setStatusLoading] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);

  async function handleStatusUpdate() {
    setStatusLoading(true);
    try {
      await updateOrderStatus(orderId, status);
      toast.success('Status updated');
      router.refresh();
    } catch (err: any) { toast.error(err.message); }
    finally { setStatusLoading(false); }
  }

  async function handleTrackingUpdate(e: React.FormEvent) {
    e.preventDefault();
    setTrackingLoading(true);
    try {
      await updateOrderTracking(orderId, tracking);
      toast.success('Tracking updated');
      router.refresh();
    } catch (err: any) { toast.error(err.message); }
    finally { setTrackingLoading(false); }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Update Status</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select options={ORDER_STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
          <Button onClick={handleStatusUpdate} isLoading={statusLoading} className="w-full">Update Status</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Tracking Info</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleTrackingUpdate} className="space-y-3">
              <div className="space-y-1">
                <Label>Tracking Number</Label>
                <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="CN123456" />
              </div>
              <Button type="submit" isLoading={trackingLoading} className="w-full">Save Tracking</Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
