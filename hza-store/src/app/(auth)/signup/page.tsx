'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { signUp } from '@/services/auth.service';
import { signupSchema, type SignupSchema } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupSchema) => {
    const { error } = await signUp(data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Account created! Please check your email to verify your account.');
    router.push('/verify-email');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <BrandLogo size="lg" variant="light" href="/" className="mx-auto mb-1" />
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Join us and start shopping</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              error={errors.full_name?.message}
              {...register('full_name')}
            />
          </div>

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

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="03001234567"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
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
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Repeat your password"
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
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
