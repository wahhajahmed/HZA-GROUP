import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/constants';

export default function VerifyEmailPage() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8 pb-8 text-center">
        <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-blue-100">
          <MailCheck className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Check your email
        </h1>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          We&apos;ve sent a verification link to your email address. Please click
          on it to activate your account before signing in.
        </p>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Back to Sign In
          </Button>
        </Link>
        <p className="mt-4 text-xs text-gray-400">
          Didn&apos;t receive an email? Check your spam folder or{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            try signing up again
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
