import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { CanISkipTomorrowModal } from '../modals/CanISkipTomorrowModal';

export const Layout: React.FC = () => {
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);

  return (
    <div className="bg-background text-on-surface min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Chromatic Atmospheric Radial Light Orbs (L0 Substrate Canvas) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-[550px] h-[550px] rounded-full bg-secondary-container/20 blur-[140px] animate-pulse-glow" />
        <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] rounded-full bg-primary-container/15 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-tertiary-container/15 blur-[150px]" />
      </div>

      {/* Fixed Top Glass Header */}
      <Header onOpenCanSkipTomorrow={() => setIsSkipModalOpen(true)} />

      {/* Main Content Area */}
      <main className="relative z-10 w-full pt-28 pb-28 xl:pb-16 max-w-[1440px] mx-auto px-margin-mobile lg:px-margin-desktop">
        <Outlet />
      </main>

      {/* Floating Bottom Mobile Nav */}
      <MobileNav onOpenCanSkipTomorrow={() => setIsSkipModalOpen(true)} />

      {/* Footer */}
      <footer className="relative z-10 w-full pb-space-2xl pt-space-xl text-on-surface-variant hidden md:block">
        <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin-desktop">
          <div className="p-space-lg rounded-xl bg-surface-container-lowest/40 backdrop-blur-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-md text-headline-md text-on-surface">Attendly</span>
              <span className="font-body-sm text-body-sm text-outline">• Precision Academic Intelligence</span>
            </div>
            <p className="font-body-sm text-body-sm text-center md:text-right">
              © 2025 Attendly. Engineered with optical liquid glass clarity for modern university scholars.
            </p>
          </div>
        </div>
      </footer>

      {/* Global "Can I Skip Tomorrow?" Modal */}
      <CanISkipTomorrowModal
        isOpen={isSkipModalOpen}
        onClose={() => setIsSkipModalOpen(false)}
      />
    </div>
  );
};
