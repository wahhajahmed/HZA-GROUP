'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { createPromotion, updatePromotion } from '@/services/promotion.service';
import { createClient } from '@/lib/supabase/client';
import type { Promotion } from '@/types';

interface PromotionFormProps {
  promotion?: Promotion | null;
  onClose: () => void;
  onSaved: () => void;
}

const DEFAULT_BG = '#2563eb';

export default function PromotionForm({ promotion, onClose, onSaved }: PromotionFormProps) {
  const isEdit = !!promotion;

  const [title, setTitle] = useState(promotion?.title ?? '');
  const [description, setDescription] = useState(promotion?.description ?? '');
  const [imageUrl, setImageUrl] = useState(promotion?.image_url ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [buttonText, setButtonText] = useState(promotion?.button_text ?? '');
  const [redirectUrl, setRedirectUrl] = useState(promotion?.redirect_url ?? '');
  const [bgColor, setBgColor] = useState(promotion?.bg_color ?? DEFAULT_BG);
  const [startDatetime, setStartDatetime] = useState(
    promotion?.start_datetime
      ? promotion.start_datetime.slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  );
  const [endDatetime, setEndDatetime] = useState(
    promotion?.end_datetime ? promotion.end_datetime.slice(0, 16) : '',
  );
  const [displayMode, setDisplayMode] = useState<'popup' | 'slide'>(
    promotion?.display_mode ?? 'popup',
  );
  const [audienceType, setAudienceType] = useState<'all' | 'logged_in' | 'guest'>(
    promotion?.audience_type ?? 'all',
  );
  const [celebrationMode, setCelebrationMode] = useState(promotion?.celebration_mode ?? false);
  const [showFrequency, setShowFrequency] = useState<'session' | 'daily' | 'always'>(
    promotion?.show_frequency ?? 'session',
  );
  const [isActive, setIsActive] = useState(promotion?.is_active ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!startDatetime) { setError('Start date/time is required.'); return; }

    setLoading(true);
    setError('');

    let finalImageUrl = imageUrl;
    if (imageFile) {
      setUploading(true);
      // Upload to Supabase Storage
      const supabase = createClient();
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `promo-${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage.from('promotions').upload(fileName, imageFile);
      setUploading(false);
      if (uploadError) { setError('Image upload failed.'); return; }
      const { data: urlData } = supabase.storage.from('promotions').getPublicUrl(fileName);
      finalImageUrl = urlData.publicUrl;
      setImageUrl(urlData.publicUrl);
    }
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      image_url: finalImageUrl || null,
      button_text: buttonText.trim() || null,
      redirect_url: redirectUrl.trim() || null,
      bg_color: bgColor,
      start_datetime: new Date(startDatetime).toISOString(),
      end_datetime: endDatetime ? new Date(endDatetime).toISOString() : null,
      is_active: isActive,
      display_mode: displayMode,
      audience_type: audienceType,
      celebration_mode: celebrationMode,
      show_frequency: showFrequency,
    };

    const { error: err } = isEdit
      ? await updatePromotion(promotion!.id, payload)
      : await createPromotion(payload);

    setLoading(false);
    if (err) { setError(err); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Edit Promotion' : 'New Promotion'}
          </h2>
          <button onClick={onClose} title="Close" aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ramadan Mubarak, Eid Sale, Flash Sale"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="desc">Description / Subtitle</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short promotional message…"
              rows={3}
              className="mt-1 resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label htmlFor="image">Banner Image</Label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="mt-1"
              title="Upload banner image"
              placeholder="Choose image file"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                  setImageUrl('');
                }
              }}
            />
            {uploading && <p className="text-xs text-blue-600 mt-2">Uploading image...</p>}
            {imageUrl && <img src={imageUrl} alt="Banner Preview" className="mt-2 rounded w-full max-w-xs" />}
          </div>

          {/* Button Text + Redirect */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="btn">Button Text</Label>
              <Input
                id="btn"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. Shop Now"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="redirect">Redirect URL</Label>
              <Input
                id="redirect"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="/categories or https://…"
                className="mt-1"
              />
            </div>
          </div>

          {/* BG Color */}
          <div className="flex items-center gap-4">
            <div>
              <Label htmlFor="bg">Background Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <Label htmlFor="bg">Background Color</Label>
                <input
                  type="color"
                  id="bg"
                  title="Pick background color"
                  aria-label="Pick background color"
                  placeholder="#2563eb"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-16 rounded border cursor-pointer"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-32 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">Start Date & Time *</Label>
              <Input
                id="start"
                type="datetime-local"
                value={startDatetime}
                onChange={(e) => setStartDatetime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end">End Date & Time</Label>
              <Input
                id="end"
                type="datetime-local"
                value={endDatetime}
                onChange={(e) => setEndDatetime(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">Leave blank = no expiry</p>
            </div>
          </div>

          {/* Display Mode + Audience */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Display Mode</Label>
              <Select
                className="mt-1"
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as 'popup' | 'slide')}
                options={[
                  { value: 'popup', label: 'Center Modal Popup' },
                  { value: 'slide', label: 'Slide-in Banner (bottom-right)' },
                ]}
              />
            </div>
            <div>
              <Label>Target Audience</Label>
              <Select
                className="mt-1"
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value as 'all' | 'logged_in' | 'guest')}
                options={[
                  { value: 'all', label: 'All Users' },
                  { value: 'logged_in', label: 'Logged-in Only' },
                  { value: 'guest', label: 'Guests Only' },
                ]}
              />
            </div>
          </div>

          {/* Show Frequency */}
          <div>
            <Label>Show Frequency</Label>
              <Select
                className="mt-1"
                value={showFrequency}
                onChange={(e) => setShowFrequency(e.target.value as 'session' | 'daily' | 'always')}
                options={[
                  { value: 'session', label: 'Once per session' },
                  { value: 'daily', label: 'Once per day' },
                  { value: 'always', label: 'Always show' },
                ]}
              />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setIsActive((v) => !v)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setCelebrationMode((v) => !v)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${celebrationMode ? 'bg-yellow-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${celebrationMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Celebration Mode (Confetti 🎉)</span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-24">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Create Promotion'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
