'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { replyToQuery, closeQuery } from '@/services/query.service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function QueryReplyForm({ queryId, currentStatus }: { queryId: string; currentStatus: string }) {
  const router = useRouter();
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setLoading(true);
    try {
      await replyToQuery(queryId, reply);
      toast.success('Reply sent!');
      setReply('');
      setShowForm(false);
      router.refresh();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  async function handleClose() {
    setClosing(true);
    try {
      await closeQuery(queryId);
      toast.success('Query closed');
      router.refresh();
    } catch (err: any) { toast.error(err.message); }
    finally { setClosing(false); }
  }

  return (
    <div className="space-y-2">
      {!showForm ? (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>Reply</Button>
          <Button size="sm" variant="ghost" isLoading={closing} onClick={handleClose}>Close Query</Button>
        </div>
      ) : (
        <form onSubmit={handleReply} className="space-y-2">
          <Label className="text-xs text-gray-500">Your Reply</Label>
          <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply..." rows={3} required />
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={loading}>Send Reply</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
