import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { Logo } from '../components/ui/Logo';

const benefits = [
  ['today', 'Track daily attendance'],
  ['insights', 'See overall and subject-wise attendance'],
  ['event_busy', 'Know how many classes you can safely skip'],
  ['trending_up', 'Plan the classes needed to recover'],
  ['calendar_month', 'Manage your timetable'],
  ['notifications', 'Get useful attendance reminders'],
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return <main className="min-h-screen bg-background px-margin-mobile py-space-xl lg:px-margin-desktop lg:py-space-2xl">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-space-2xl">
      <header className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-space-sm" aria-label="Attendly home">
          <Logo size={42} />
          <span className="font-headline-md text-headline-md font-semibold text-on-surface">Attendly</span>
        </Link>
        <Link to="/login" className="font-title-sm text-title-sm text-on-surface-variant hover:text-primary">
          Sign in
        </Link>
      </header>

      <section className="grid items-center gap-space-2xl lg:grid-cols-[1.1fr_0.9fr] lg:py-space-2xl">
        <div className="max-w-2xl">
          <div className="mb-space-md inline-flex items-center gap-space-xs rounded-full border border-white/10 bg-surface-container-high/70 px-space-sm py-space-2xs font-label-caps text-label-caps uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Attendance, made clear
          </div>
          <h1 className="font-display-hero text-4xl leading-tight text-on-surface sm:text-6xl">
            Track your attendance. Know exactly where you stand.
          </h1>
          <p className="mt-space-lg max-w-xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
            Attendly helps students track classes, understand subject-wise attendance, and make confident decisions about what to attend next.
          </p>
          <div className="mt-space-xl flex flex-wrap gap-space-sm">
            <GlassButton variant="primary" size="lg" icon="login" onClick={() => navigate('/login')}>Sign In</GlassButton>
            <GlassButton variant="secondary" size="lg" icon="person_add" onClick={() => navigate('/signup')}>Sign Up</GlassButton>
          </div>
        </div>

      </section>

      <section className="grid gap-space-sm sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map(([icon, label]) => (
          <div key={label} className="flex items-center gap-space-sm rounded-xl border border-white/5 bg-surface-container-low/60 p-space-md">
            <span className="material-symbols-outlined text-primary">{icon}</span>
            <span className="font-title-sm text-title-sm text-on-surface">{label}</span>
          </div>
        ))}
      </section>
    </div>
  </main>;
};
