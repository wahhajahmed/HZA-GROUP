'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { resetPassword } from '@/services/auth.service';
import { resetPasswordSchema, type ResetPasswordSchema } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    const { error } = await resetPassword(data.password);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Password updated successfully!');
    router.push('/login');
  };

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
