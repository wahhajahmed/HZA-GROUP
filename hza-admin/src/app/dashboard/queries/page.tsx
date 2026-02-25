import { getQueries, markAllQueriesRead } from '@/services/query.service';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { QUERY_STATUS_LABELS } from '@/lib/constants';
import QueryReplyForm from './QueryReplyForm';

export const dynamic = 'force-dynamic';

const statusVariant: Record<string, any> = {
  open: 'warning',
  replied: 'success',
  closed: 'secondary',
};

export default async function QueriesPage() {
  // Fetch first so we can highlight unread ones, then mark all as read
  const queries = await getQueries();
  await markAllQueriesRead();
  const open = queries.filter((q) => q.status === 'open').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Customer Queries</h1>
        {open > 0 && <Badge variant="warning">{open} open</Badge>}
      </div>

      <div className="space-y-4">
        {queries.map((query) => (
          <div
            key={query.id}
            className={`rounded-xl border p-5 shadow-sm space-y-3 ${!query.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {!query.is_read && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                  <h3 className="font-semibold">{query.subject}</h3>
                  {!query.is_read && <Badge variant="default">New</Badge>}
                  <Badge variant={statusVariant[query.status] ?? 'secondary'}>
                    {QUERY_STATUS_LABELS[query.status] ?? query.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{query.name} &bull; {query.email} &bull; {formatDate(query.created_at)}</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{query.message}</p>

            {query.admin_reply && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-700 mb-1">Admin Reply:</p>
                <p className="text-sm text-blue-800">{query.admin_reply}</p>
              </div>
            )}

            {query.status !== 'closed' && (
              <QueryReplyForm queryId={query.id} currentStatus={query.status} />
            )}
          </div>
        ))}
        {queries.length === 0 && (
          <div className="rounded-xl border bg-white p-12 text-center text-gray-400">
            No customer queries yet.
          </div>
        )}
      </div>
    </div>
  );
}
