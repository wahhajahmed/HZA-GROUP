import { adminGetAllUsers } from '@/services/auth.service';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const users = await adminGetAllUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Customers ({users.length})</h1>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{user.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{user.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{user.phone ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3"><Badge variant="success">Active</Badge></td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
