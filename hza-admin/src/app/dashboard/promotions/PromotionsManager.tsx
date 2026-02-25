'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Power, PowerOff, Monitor, PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { togglePromotionActive, deletePromotion } from '@/services/promotion.service';
import PromotionForm from './PromotionForm';
import type { Promotion } from '@/types';

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'All Users',
  logged_in: 'Logged-in Only',
  guest: 'Guests Only',
};

const FREQ_LABEL: Record<string, string> = {
  session: 'Per Session',
  daily: 'Per Day',
  always: 'Always',
};

function formatDt(dt: string | null) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function PromotionsManager({ initialPromotions }: { initialPromotions: Promotion[] }) {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function openCreate() {
    setEditingPromotion(null);
    setShowForm(true);
  }

  function openEdit(p: Promotion) {
    setEditingPromotion(p);
    setShowForm(true);
  }

  function handleSaved() {
    setShowForm(false);
    // Reload by router refresh would be cleaner, but for instant feedback we reload
    window.location.reload();
  }

  async function handleToggle(p: Promotion) {
    setLoadingId(p.id);
    await togglePromotionActive(p.id, !p.is_active);
    setPromotions((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, is_active: !p.is_active } : x)),
    );
    setLoadingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this promotion? This cannot be undone.')) return;
    setLoadingId(id);
    const { error } = await deletePromotion(id);
    if (!error) setPromotions((prev) => prev.filter((x) => x.id !== id));
    setLoadingId(null);
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Promotions ({promotions.length})</h1>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="h-4 w-4" />
          New Promotion
        </Button>
      </div>

      {/* Table */}
      {promotions.length === 0 ? (
        <div className="rounded-xl border bg-white shadow-sm p-12 text-center text-gray-400">
          <Monitor className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No promotions yet.</p>
          <p className="text-sm mt-1">Create your first campaign to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Mode</th>
                <th className="px-4 py-3 text-left">Audience</th>
                <th className="px-4 py-3 text-left">Frequency</th>
                <th className="px-4 py-3 text-left">Start</th>
                <th className="px-4 py-3 text-left">End</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <style>{promotions.map((pr) => `#pdot-${pr.id}{background-color:${pr.bg_color}}`).join('')}</style>
              {promotions.map((p) => {
                const now = new Date();
                const started = new Date(p.start_datetime) <= now;
                const expired = p.end_datetime ? new Date(p.end_datetime) < now : false;
                const live = p.is_active && started && !expired;

                return (
                  <tr key={p.id} className={`hover:bg-gray-50 ${!p.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          id={`pdot-${p.id}`}
                          className="w-3 h-3 rounded-full flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium text-gray-900 max-w-[180px] truncate">{p.title}</p>
                          {p.celebration_mode && (
                            <span className="text-xs text-yellow-600">🎉 Confetti</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-600">
                        {p.display_mode === 'popup' ? (
                          <Monitor className="h-3.5 w-3.5" />
                        ) : (
                          <PanelRight className="h-3.5 w-3.5" />
                        )}
                        {p.display_mode === 'popup' ? 'Modal' : 'Slide-in'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{AUDIENCE_LABEL[p.audience_type]}</td>
                    <td className="px-4 py-3 text-gray-600">{FREQ_LABEL[p.show_frequency]}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDt(p.start_datetime)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDt(p.end_datetime)}</td>
                    <td className="px-4 py-3">
                      {live ? (
                        <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                          Live
                        </Badge>
                      ) : expired ? (
                        <Badge variant="secondary">Expired</Badge>
                      ) : !started ? (
                        <Badge variant="outline">Scheduled</Badge>
                      ) : (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loadingId === p.id}
                          onClick={() => handleToggle(p)}
                          title={p.is_active ? 'Disable' : 'Enable'}
                        >
                          {p.is_active ? (
                            <PowerOff className="h-3.5 w-3.5 text-orange-500" />
                          ) : (
                            <Power className="h-3.5 w-3.5 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loadingId === p.id}
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loadingId === p.id}
                          onClick={() => handleDelete(p.id)}
                          className="text-red-500 hover:text-red-600 hover:border-red-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <PromotionForm
          promotion={editingPromotion}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
