'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  upsertAreaCharge,
  deleteAreaCharge,
} from '@/services/delivery.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Pencil, Trash2, X, ChevronDown, ChevronRight,
  MapPin, Package, Search,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  PAKISTAN_CITIES,
  getCitiesByProvince,
  getAreasByCity,
} from '@/lib/pakistan-areas';
import {
  SHIPPING_CATEGORY_LABELS,
} from '@/lib/dc-calculator';
import type { AreaDeliveryCharge } from '@/types';

interface Props {
  charges: AreaDeliveryCharge[];
}

type FormState = {
  city: string;
  area: string;
  small_parcel_charge: string;
  medium_parcel_charge: string;
  bulky_cargo_charge: string;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  city: '',
  area: '',
  small_parcel_charge: '0',
  medium_parcel_charge: '0',
  bulky_cargo_charge: '0',
  is_active: true,
};

export default function DeliveryChargesManager({ charges }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AreaDeliveryCharge | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Search / filter state
  const [search, setSearch] = useState('');
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  const citiesByProvince = useMemo(() => getCitiesByProvince(), []);
  const provinces = useMemo(
    () => ['all', ...Object.keys(citiesByProvince).sort()],
    [citiesByProvince]
  );

  // Map for fast charge lookup: city+area → record
  const chargeMap = useMemo(() => {
    const m = new Map<string, AreaDeliveryCharge>();
    for (const c of charges) m.set(`${c.city}::${c.area}`, c);
    return m;
  }, [charges]);

  // Distinct configured cities
  const configuredCities = useMemo(
    () => [...new Set(charges.map((c) => c.city))].sort(),
    [charges]
  );

  // Area options change when form city changes
  const areaOptions = useMemo(
    () => (form.city ? getAreasByCity(form.city) : []),
    [form.city]
  );

  function openCreate(preCity = '', preArea = '') {
    setEditing(null);
    setForm({ ...EMPTY_FORM, city: preCity, area: preArea });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEdit(c: AreaDeliveryCharge) {
    setEditing(c);
    setForm({
      city: c.city,
      area: c.area,
      small_parcel_charge: String(c.small_parcel_charge),
      medium_parcel_charge: String(c.medium_parcel_charge),
      bulky_cargo_charge: String(c.bulky_cargo_charge),
      is_active: c.is_active,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.city || !form.area) {
      toast.error('Please select both a city and an area.');
      return;
    }
    setLoading(true);
    try {
      await upsertAreaCharge({
        city: form.city,
        area: form.area,
        small_parcel_charge: Number(form.small_parcel_charge) || 0,
        medium_parcel_charge: Number(form.medium_parcel_charge) || 0,
        bulky_cargo_charge: Number(form.bulky_cargo_charge) || 0,
        is_active: form.is_active,
      });
      toast.success(editing ? 'Delivery charge updated!' : 'Delivery charge saved!');
      closeForm();
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(c: AreaDeliveryCharge) {
    if (!confirm(`Delete DC for ${c.city} — ${c.area}?`)) return;
    try {
      await deleteAreaCharge(c.id);
      toast.success('Deleted');
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  function toggleCity(city: string) {
    setExpandedCities((prev) => {
      const next = new Set(prev);
      if (next.has(city)) next.delete(city);
      else next.add(city);
      return next;
    });
  }

  // Filtered cities to display in the table section
  const filteredCities = useMemo(() => {
    let cities = configuredCities;
    if (selectedProvince !== 'all') {
      const provinceCities = new Set(citiesByProvince[selectedProvince] ?? []);
      cities = cities.filter((c) => provinceCities.has(c));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      cities = cities.filter(
        (city) =>
          city.toLowerCase().includes(q) ||
          charges.some(
            (ch) => ch.city === city && ch.area.toLowerCase().includes(q)
          )
      );
    }
    return cities;
  }, [configuredCities, selectedProvince, search, citiesByProvince, charges]);

  return (
    <div className="space-y-6">
      {/* ── Add / Edit Form ─────────────────────────────────────── */}
      {!showForm && (
        <Button onClick={() => openCreate()}>
          <Plus className="h-4 w-4 mr-1" /> Add Area Charge
        </Button>
      )}

      {showForm && (
        <Card className="border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {editing ? 'Edit' : 'New'} Area Delivery Charge
            </CardTitle>
            <button title="Close" onClick={closeForm}>
              <X className="h-4 w-4 text-gray-400 hover:text-gray-700" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* City + Area Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>City *</Label>
                  <select
                    aria-label="City"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value, area: '' }))
                    }
                    required
                    disabled={!!editing}
                  >
                    <option value="">— Select City —</option>
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city} ({c.province})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Area *</Label>
                  <select
                    aria-label="Area"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.area}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, area: e.target.value }))
                    }
                    required
                    disabled={!form.city || !!editing}
                  >
                    <option value="">— Select Area —</option>
                    {areaOptions.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  {!form.city && (
                    <p className="text-xs text-gray-400">Select a city first</p>
                  )}
                </div>
              </div>

              {/* Charges Row */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> Charges per Shipping Category (PKR)
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {(
                    [
                      {
                        key: 'small_parcel_charge',
                        label: 'Small Parcel',
                        hint: 'Fixed — does not scale with qty',
                        color: 'bg-green-100 text-green-700',
                      },
                      {
                        key: 'medium_parcel_charge',
                        label: 'Medium Parcel',
                        hint: 'Base charge (2 items = 1.5×)',
                        color: 'bg-blue-100 text-blue-700',
                      },
                      {
                        key: 'bulky_cargo_charge',
                        label: 'Bulky Cargo',
                        hint: 'Base charge (2 items = 1.5×)',
                        color: 'bg-orange-100 text-orange-700',
                      },
                    ] as const
                  ).map(({ key, label, hint, color }) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
                        >
                          {label}
                        </span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={form[key]}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-400">{hint}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                  className="rounded"
                />
                Active (visible to customers)
              </label>

              <div className="flex gap-3">
                <Button type="submit" isLoading={loading}>
                  {editing ? 'Save Changes' : 'Add Charge'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Summary stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Cities Configured', value: configuredCities.length },
          { label: 'Areas Configured', value: charges.length },
          {
            label: 'Active Areas',
            value: charges.filter((c) => c.is_active).length,
          },
          {
            label: 'Pakistan Cities',
            value: PAKISTAN_CITIES.length,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border bg-white px-4 py-3 shadow-sm text-center"
          >
            <div className="text-2xl font-bold text-primary">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search city or area…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          aria-label="Filter by province"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p === 'all' ? 'All Provinces' : p}
            </option>
          ))}
        </select>
      </div>

      {/* ── Province / City / Area blocks ────────────────────────── */}
      {filteredCities.length === 0 ? (
        <div className="rounded-xl border bg-white px-6 py-12 text-center text-gray-400">
          <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No configured areas found.</p>
          <p className="text-sm mt-1">
            Click <strong>&quot;Add Area Charge&quot;</strong> to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCities.map((city) => {
            const cityCharges = charges
              .filter((c) => c.city === city)
              .sort((a, b) => a.area.localeCompare(b.area));
            const isOpen = expandedCities.has(city);

            return (
              <div key={city} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                {/* City header */}
                <div className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleCity(city)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="font-semibold">{city}</span>
                    <Badge variant="secondary" className="text-xs">
                      {cityCharges.length} area{cityCharges.length !== 1 ? 's' : ''}
                    </Badge>
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openCreate(city)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Area
                  </Button>
                </div>

                {/* Areas table */}
                {isOpen && (
                  <div className="border-t overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Area
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-green-600">
                            Small Parcel
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-blue-600">
                            Medium Parcel
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-orange-600">
                            Bulky Cargo
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                            Status
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {cityCharges.map((c) => (
                          <tr key={c.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-medium">{c.area}</td>
                            <td className="px-4 py-2.5 text-center">
                              {formatCurrency(c.small_parcel_charge)}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              {formatCurrency(c.medium_parcel_charge)}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              {formatCurrency(c.bulky_cargo_charge)}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <Badge
                                variant={c.is_active ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {c.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEdit(c)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(c)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {/* Unconfigured areas hint */}
                        {(() => {
                          const allAreas = getAreasByCity(city);
                          const configuredAreas = new Set(
                            cityCharges.map((c) => c.area)
                          );
                          const missing = allAreas.filter(
                            (a) => !configuredAreas.has(a)
                          );
                          if (missing.length === 0) return null;
                          return (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-4 py-2 bg-amber-50"
                              >
                                <p className="text-xs text-amber-600">
                                  <strong>{missing.length}</strong> unconfigured area
                                  {missing.length !== 1 ? 's' : ''}:{' '}
                                  {missing.slice(0, 5).join(', ')}
                                  {missing.length > 5 &&
                                    ` +${missing.length - 5} more`}
                                  {' — '}
                                  <button
                                    className="underline"
                                    onClick={() => openCreate(city)}
                                  >
                                    Add now
                                  </button>
                                </p>
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Scaling Reference Card ───────────────────────────────── */}
      <Card className="bg-blue-50 border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-blue-800">
            📦 DC Scaling Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-blue-700">
            <div>
              <div className="font-semibold mb-1 text-green-700">🟢 Small Parcel</div>
              <p>Always fixed — never scales regardless of quantity.</p>
              <p className="mt-1 font-mono">1+ items → base × 1.0</p>
            </div>
            <div>
              <div className="font-semibold mb-1 text-blue-700">🔵 Medium Parcel</div>
              <p>Scales with quantity (+50% per extra item).</p>
              <p className="mt-1 font-mono">
                1 item → ×1.0 | 2 → ×1.5 | 3 → ×2.0
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1 text-orange-700">🟠 Bulky Cargo</div>
              <p>Scales with quantity (same formula as Medium).</p>
              <p className="mt-1 font-mono">
                1 item → ×1.0 | 2 → ×1.5 | 3 → ×2.0
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-blue-600 border-t border-blue-200 pt-2">
            <strong>Mixed cart rule:</strong> top 2 highest categories are billed (Small ignored when Medium/Bulky present).
            Example: 1 Bulky + 2 Medium → Bulky×1.0 + Medium×1.5.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
