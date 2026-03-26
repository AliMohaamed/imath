"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Home, HelpCircle } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center space-y-12">
        {/* Animated 404 Visual */}
        <div className="relative">
          <div className="text-[12rem] md:text-[16rem] font-black text-brand-violet/5 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl shadow-premium border border-brand-violet/10 flex items-center justify-center animate-bounce">
                <HelpCircle className="w-12 h-12 md:w-16 md:h-16 text-brand-violet" />
             </div>
          </div>
          
          {/* Floating Math Symbols */}
          <div className="absolute top-10 left-10 text-brand-orange/20 text-4xl font-black animate-pulse">+</div>
          <div className="absolute bottom-20 right-10 text-brand-yellow text-4xl font-black animate-bounce delay-700">÷</div>
          <div className="absolute top-20 right-20 text-brand-violet/30 text-3xl font-black animate-pulse delay-300">Σ</div>
          <div className="absolute bottom-10 left-20 text-brand-orange/40 text-2xl font-black rotate-12">π</div>
        </div>

        <div className="space-y-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-md mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-4 bg-brand-violet text-white rounded-full font-black text-sm shadow-premium hover:opacity-90 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            {t('goHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
