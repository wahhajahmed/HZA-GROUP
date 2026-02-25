import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { getOrderForReview } from '@/services/review.service';
import ReviewForm from './ReviewForm';

interface ReviewPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const { token } = await searchParams;

  // No token
  if (!token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Review Link</h1>
          <p className="text-gray-500 mb-6">This review link is missing a valid order token.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { data, error } = await getOrderForReview(token);

  // Not logged in → redirect to login with return URL
  if (error === 'login_required') {
    redirect(`/login?next=/review%3Ftoken%3D${token}`);
  }

  // Generic error or order not found
  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Valid</h1>
          <p className="text-gray-500 mb-6">{error ?? 'This review link appears to be invalid or expired.'}</p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const { orderId, orderNumber, alreadyReviewed, isDelivered } = data;

  // Already reviewed
  if (alreadyReviewed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Reviewed</h1>
          <p className="text-gray-500 mb-6">
            You have already submitted a review for order{' '}
            <span className="font-semibold text-blue-600">#{orderNumber}</span>. Thank you!
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  // Order not yet delivered
  if (!isDelivered) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Yet Delivered</h1>
          <p className="text-gray-500 mb-6">
            You can only submit a review after your order{' '}
            <span className="font-semibold text-blue-600">#{orderNumber}</span> has been delivered.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Track My Order
          </Link>
        </div>
      </div>
    );
  }

  // All good — render the form
  return (
    <div className="min-h-[60vh] py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Share Your Experience</h1>
          <p className="text-gray-500 mt-2">
            How was your order? We&apos;d love to hear from you.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <ReviewForm orderId={orderId} orderNumber={orderNumber} />
        </div>
      </div>
    </div>
  );
}
