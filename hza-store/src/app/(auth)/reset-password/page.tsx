'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { resetPassword } from '@/services/auth.service';
import { resetPasswordSchema, type ResetPasswordSchema } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const validateLink = async () => {
      try {
        // Small delay to ensure cookies/state is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const code = searchParams.get('code');
        const tokenHash = searchParams.get('token'); 

        if (!code && !tokenHash) {
          // Check if user is already signed in (transition from callback)
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsValidating(false);
            return;
          }
          
          setError('Invalid or missing reset token. Please request a new link.');
          setIsValidating(false);
          return;
        }

        const supabase = createClient();
        
        if (code) {
          // Handle PKCE code flow (Standard Supabase redirect)
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setError('The reset link is invalid or has expired.');
            setIsValidating(false);
            return;
          }
        } else if (tokenHash) {
          // Handle direct token_hash flow (if configured in email template)
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });
          if (verifyError) {
            setError('The reset link is invalid or has expired.');
            setIsValidating(false);
            return;
          }
        }

        setIsValidating(false);
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        setIsValidating(false);
      }
    };

    validateLink();
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordSchema) => {
    const { error: submitError } = await resetPassword(data.password);
    if (submitError) {
      toast.error(submitError);
      return;
    }
    toast.success('Password updated successfully!');
    router.push('/login');
  };

  if (isValidating) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium text-center">Validating your reset link...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md border-red-100">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600">Verification Failed</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => router.push('/forgot-password')} variant="outline" className="w-full">
            Back to Forgot Password
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Set new password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 characters, 1 uppercase, 1 number"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Repeat your new password"
              autoComplete="new-password"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            size="lg"
          >
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
