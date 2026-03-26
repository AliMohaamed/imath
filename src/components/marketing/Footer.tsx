import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import Image from 'next/image';
import logo from "../../../public/logo.png";
import { SITE_EMAIL, SITE_PHONE_NUMBER } from '@/lib/site';

export default async function Footer() {
  const t = await getTranslations('Marketing.footer');
  const common = await getTranslations('Common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-border pt-12 md:pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center mb-6">
              <Image 
                src={logo} 
                alt="iMath Logo" 
                width={100} 
                height={32} 
                className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              {t('description')}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">{t('academy')}</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#why-imath" className="hover:text-brand-violet transition-colors">{common('sections.whyImath')}</Link></li>
              <li><Link href="#how-it-works" className="hover:text-brand-violet transition-colors">{common('sections.howItWorks')}</Link></li>
              <li><Link href="#pricing" className="hover:text-brand-violet transition-colors">{common('sections.pricing')}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">{t('contact')}</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>{t('email', { email: SITE_EMAIL })}</li>
              <li>{t('whatsapp', { phone: SITE_PHONE_NUMBER })}</li>
              <li>{t('instagram')}</li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
          <p>{t('copyright', { year: currentYear })}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">{t('privacyPolicy')}</Link>
            <Link href="/terms" className="hover:underline">{t('termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
