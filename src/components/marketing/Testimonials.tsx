"use client";

import { useTranslations } from 'next-intl';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const t = useTranslations('Marketing.testimonials');
  const reviews = [
    {
      name: t('items.amira.name'),
      role: t('items.amira.role'),
      content: t('items.amira.content'),
      rating: 5,
    },
    {
      name: t('items.omar.name'),
      role: t('items.omar.role'),
      content: t('items.omar.content'),
      rating: 5,
    },
    {
      name: t('items.sarah.name'),
      role: t('items.sarah.role'),
      content: t('items.sarah.content'),
      rating: 5,
    }
  ];

  return (
    <section className="py-24 bg-brand-violet/5 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-violet/10 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t('title')}</h2>
          <p className="text-lg text-slate-600">{t('description')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-white p-10 rounded-3xl shadow-premium border border-white hover:-translate-y-4 transition-transform duration-500 relative group"
            >
              <Quote className="absolute top-6 right-8 w-12 h-12 text-brand-violet/5 group-hover:text-brand-violet/10 rotate-180 transition-colors" />
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand-yellow text-brand-yellow scale-110" />
                ))}
              </div>
              <p className="text-slate-600 font-medium italic mb-8 leading-relaxed tracking-tight">
                &quot;{review.content}&quot;
              </p>
              <div className="flex items-center gap-4 border-t pt-6 border-slate-50">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-brand-violet text-lg">
                  {review.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 text-sm">{review.name}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
