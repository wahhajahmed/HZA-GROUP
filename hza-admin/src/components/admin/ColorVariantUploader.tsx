'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { X, Plus, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ColorVariantEntry {
  tempId: string;
  colorName: string;
  colorHex: string;
  files: File[];
  previews: string[];
}

interface Props {
  variants: ColorVariantEntry[];
  onChange: (variants: ColorVariantEntry[]) => void;
}

const DEFAULT_COLORS = [
  { name: 'Red', hex: '#ef4444', twClass: 'bg-red-500' },
  { name: 'Blue', hex: '#3b82f6', twClass: 'bg-blue-500' },
  { name: 'Green', hex: '#22c55e', twClass: 'bg-green-500' },
  { name: 'Black', hex: '#000000', twClass: 'bg-black' },
  { name: 'White', hex: '#ffffff', twClass: 'bg-white' },
  { name: 'Yellow', hex: '#eab308', twClass: 'bg-yellow-500' },
  { name: 'Pink', hex: '#ec4899', twClass: 'bg-pink-500' },
  { name: 'Brown', hex: '#92400e', twClass: 'bg-amber-900' },
  { name: 'Gray', hex: '#6b7280', twClass: 'bg-gray-500' },
  { name: 'Navy', hex: '#1e3a8a', twClass: 'bg-blue-900' },
];

export function ColorVariantUploader({ variants, onChange }: Props) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addVariant = () => {
    const tempId = `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    onChange([
      ...variants,
      { tempId, colorName: '', colorHex: '#000000', files: [], previews: [] },
    ]);
  };

  const removeVariant = (tempId: string) => {
    const v = variants.find((x) => x.tempId === tempId);
    if (v) v.previews.forEach((p) => URL.revokeObjectURL(p));
    onChange(variants.filter((x) => x.tempId !== tempId));
  };

  const updateVariant = (tempId: string, patch: Partial<ColorVariantEntry>) => {
    onChange(variants.map((v) => (v.tempId === tempId ? { ...v, ...patch } : v)));
  };

  const handleFilesSelected = (tempId: string, newFiles: File[]) => {
    const v = variants.find((x) => x.tempId === tempId);
    if (!v) return;
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    updateVariant(tempId, {
      files: [...v.files, ...newFiles],
      previews: [...v.previews, ...newPreviews],
    });
  };

  const removeImage = (tempId: string, idx: number) => {
    const v = variants.find((x) => x.tempId === tempId);
    if (!v) return;
    URL.revokeObjectURL(v.previews[idx]);
    const files = v.files.filter((_, i) => i !== idx);
    const previews = v.previews.filter((_, i) => i !== idx);
    updateVariant(tempId, { files, previews });
  };

  const selectQuickColor = (tempId: string, hex: string, name: string) => {
    updateVariant(tempId, { colorHex: hex, colorName: name });
  };

  return (
    <div className="space-y-4">
      {variants.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No color variants yet. Click "Add Color Variant" to begin.
        </p>
      )}

      {variants.map((v, vi) => (
        <div
          key={v.tempId}
          className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-gray-700">
              Color Variant {vi + 1}
            </span>
            <button
              type="button"
              onClick={() => removeVariant(v.tempId)}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Remove this variant"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Color Name + Hex picker */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Color Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Red, Ocean Blue, Off-White…"
                value={v.colorName}
                onChange={(e) => updateVariant(v.tempId, { colorName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-medium text-gray-600">
                Color Swatch
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={v.colorHex}
                  onChange={(e) => updateVariant(v.tempId, { colorHex: e.target.value })}
                  className="h-9 w-14 cursor-pointer rounded border border-gray-300 p-0.5 bg-white"
                  title="Pick color"
                />
                <span className="text-xs text-gray-500 font-mono">{v.colorHex}</span>
              </div>
            </div>
          </div>

          {/* Quick color chips */}
          <div className="flex flex-wrap gap-2">
            {DEFAULT_COLORS.map((dc) => (
              <button
                key={dc.hex}
                type="button"
                onClick={() => selectQuickColor(v.tempId, dc.hex, dc.name)}
                title={dc.name}
                className={cn(
                  'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                  dc.twClass,
                  v.colorHex === dc.hex
                    ? 'border-blue-500 scale-110'
                    : 'border-gray-300',
                )}
              />
            ))}
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Images for this color
            </label>

            {/* Preview grid */}
            {v.previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {v.previews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative group h-20 w-20 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <Image
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1 rounded">
                        MAIN
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(v.tempId, idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload zone */}
            <button
              type="button"
              onClick={() => fileInputRefs.current[v.tempId]?.click()}
              className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors w-full justify-center"
            >
              <Upload className="h-4 w-4" />
              Click to upload images for this color
            </button>
            <input
              ref={(el) => { fileInputRefs.current[v.tempId] = el; }}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              aria-label={`Upload images for ${v.colorName || 'this color'}`}
              title={`Upload images for ${v.colorName || 'this color'}`}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) handleFilesSelected(v.tempId, files);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addVariant}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Color Variant
      </Button>
    </div>
  );
}
