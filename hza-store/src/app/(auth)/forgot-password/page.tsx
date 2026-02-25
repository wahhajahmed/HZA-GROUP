'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { forgotPassword } from '@/services/auth.service';
import { forgotPasswordSchema, type ForgotPasswordSchema } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MailCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    const { error } = await forgotPassword(data.email);
    if (error) {
      toast.error(error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100">
            <MailCheck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 mb-6">
            If an account exists with that email, we&apos;ve sent a password reset link.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">Back to Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <BrandLogo size="lg" variant="light" href="/" className="mx-auto mb-1" />
        <CardTitle>Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            size="lg"
          >
            Send Reset Link
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
