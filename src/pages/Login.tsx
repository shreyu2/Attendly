import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
  import { isSupabaseConfigured } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Logo } from '../components/ui/Logo';

export const Login: React.FC = () => {
  const { signInWithGoogle, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // Auth state change will redirect via ProtectedRoute
    } catch (err) {
      console.error('Sign in failed:', err);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-margin-mobile lg:px-margin-desktop">
      <div className="w-full max-w-xl">
        
        {/* Hero */}
        <div className="text-center mb-space-3xl">
          <div className="flex justify-center mb-space-lg">
            <Logo size={56} />
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Attendly
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-sm">
            Your academic attendance intelligence.
          </p>
        </div>

        {/* Sign In Card */}
        <GlassCard variant="elevated" className="p-space-2xl space-y-space-lg">
          
          <div className="text-center mb-space-md">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-container/20 text-primary mb-space-md">
              <span className="material-symbols-outlined text-[28px]">login</span>
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Sign in to continue
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Secure Google authentication. Your data stays private.
            </p>
          </div>

          <GlassButton
            variant="primary"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isSigningIn}
            className="group"
          >
            {isSigningIn ? (
              <>
                <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </GlassButton>

          {!isSupabaseConfigured && (
            <div className="p-space-md rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-body-sm space-y-1">
              <div className="flex items-center gap-2 font-title-sm font-semibold">
                <span className="material-symbols-outlined text-[18px]">settings_alert</span>
                <span>Supabase Configuration Required</span>
              </div>
              <p className="text-on-surface-variant text-body-sm">
                Add <code className="text-primary font-mono text-xs">VITE_SUPABASE_URL</code> and <code className="text-primary font-mono text-xs">VITE_SUPABASE_ANON_KEY</code> to your <code className="text-primary font-mono text-xs">.env</code> file to enable Google OAuth.
              </p>
            </div>
          )}

          <p className="text-center font-body-sm text-body-sm text-outline mt-space-md">
            By continuing, you agree to Attendly's
            <span className="text-primary underline underline-offset-2 hover:text-on-surface cursor-default mx-1">
              Terms of Service
            </span>
            and
            <span className="text-primary underline underline-offset-2 hover:text-on-surface cursor-default ml-1">
              Privacy Policy
            </span>
          </p>

        </GlassCard>

        {/* Feature Highlights */}
        

        <p className="text-center font-label-caps text-label-caps text-outline mt-space-2xl uppercase tracking-wider">
          Built for students, by students.
        </p>

      </div>
    </div>
  );
};
