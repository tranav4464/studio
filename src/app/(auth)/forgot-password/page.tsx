
"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Password Reset Email Sent',
      description: `If an account exists for ${email}, you will receive an email with instructions.`,
    });
    setIsLoading(false);
    setIsSubmitted(true);
    setEmail(''); // Clear email field after submission
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Forgot Your Password?</CardTitle>
        <CardDescription>
          {isSubmitted 
            ? "Check your email for the reset link." 
            : "Enter your email address and we'll send you a link to reset your password."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? <Icons.Spinner className="animate-spin" /> : <Icons.Email className="mr-2" />}
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <Icons.Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <p className="text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again later.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" passHref>
           <Button variant="link">
              <Icons.ChevronLeft className="mr-2 h-4 w-4" /> Back to Sign In
            </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
