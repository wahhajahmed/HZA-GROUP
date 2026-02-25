import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 max-w-sm">{description}</p>
      )}
      {(actionLabel && actionHref) && (
        <Link href={actionHref} className="mt-6">
          <Button>{actionLabel}</Button>
        </Link>
      )}
      {(actionLabel && onAction) && (
        <Button className="mt-6" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
