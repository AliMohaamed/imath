"use client";

import { Home, HelpCircle } from "lucide-react";

export default function RootNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased bg-white text-slate-900 font-sans">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-xl w-full text-center space-y-8">
            <div className="relative">
              <div className="text-[12rem] font-black text-brand-violet/5 leading-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-premium border border-brand-violet/10 flex items-center justify-center">
                  <HelpCircle className="w-12 h-12 text-brand-violet" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-slate-900">
                المعادلة غير مكتملة! (404)
              </h1>
              <p className="text-lg text-slate-600">
                الصفحة التي تبحث عنها غير موجودة.
              </p>
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-violet text-white rounded-full font-black text-sm shadow-premium"
            >
              <Home className="w-4 h-4" />
              العودة للرئيسية
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
