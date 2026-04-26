'use client';
// ============================================================
// FORGOT PASSWORD PAGE
// ============================================================
// Sends a password reset email via Supabase Auth.
// After the user clicks the link in their email, they are
// redirected to /auth/callback which handles the reset session.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ChefHat, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    setIsLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      // The user will be redirected here after clicking the reset link in email
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setIsSuccess(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-warm-gradient flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-dots opacity-50" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center shadow-warm mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground text-sm mt-1">We'll send a reset link to your email</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card-hover border border-border p-8">
          {isSuccess ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="font-bold text-lg mb-2">Email Sent!</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Check your inbox for a password reset link. It may take a few minutes to arrive.
              </p>
              <Link href="/auth/login" className="text-primary-600 font-semibold hover:text-primary-700 text-sm">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input-base pl-10" autoComplete="email" />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all hover:shadow-warm disabled:opacity-60 flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
              <p className="text-center text-sm text-muted-foreground mt-4">
                <Link href="/auth/login" className="text-primary-600 font-semibold hover:text-primary-700">← Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
