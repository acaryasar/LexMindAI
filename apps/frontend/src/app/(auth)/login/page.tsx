'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/i18n/provider';
import { 
  ArrowRight,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  Lock,
  Mail,
  Play,
  Search,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoRoles, setDemoRoles] = useState<any>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const t = useTranslations('login');
  const { locale, setLocale } = useLocale();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', data);
      const { access_token, refresh_token, user } = response.data;

      sessionStorage.setItem('accessToken', access_token);
      sessionStorage.setItem('refreshToken', refresh_token);

      setAuth(user, access_token, refresh_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async () => {
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;

    if (!email || !password) {
      setError(t('emailRequired'));
      return;
    }

    setIsDemoLoading(true);
    setError('');
    setDemoRoles(null);

    try {
      const response = await api.post('/auth/demo-roles', { email, password });
      setDemoRoles(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('userNotFound'));
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login");
  };

  return (
    <main className="h-screen w-full bg-[#f7f9fc] overflow-hidden">
      <div className="h-screen grid lg:grid-cols-2">

        {/* LEFT SIDE - BRAND / FEATURES */}
        <section className="relative hidden lg:flex h-screen overflow-hidden bg-[#071a38] text-white">

          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#d9a441]/10 blur-3xl" />
            <div className="absolute bottom-[-200px] left-[-100px] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(217,164,65,0.12),transparent_30%)]" />
          </div>

          {/* Decorative network */}
          <div className="absolute inset-0 opacity-[0.06]">
            <svg
              className="h-full w-full"
              viewBox="0 0 800 1000"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M50 150L250 300L450 150L700 350L500 550L750 750"
                stroke="white"
                strokeWidth="1"
              />
              <path
                d="M100 700L300 500L550 650L720 500"
                stroke="white"
                strokeWidth="1"
              />
              <circle cx="50" cy="150" r="4" fill="white" />
              <circle cx="250" cy="300" r="4" fill="white" />
              <circle cx="450" cy="150" r="4" fill="white" />
              <circle cx="700" cy="350" r="4" fill="white" />
              <circle cx="500" cy="550" r="4" fill="white" />
              <circle cx="750" cy="750" r="4" fill="white" />
            </svg>
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between px-5 py-3 lg:px-6 lg:py-5 xl:px-10 xl:py-7">

            {/* Logo */}
            <div>
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="flex h-7 w-7 lg:h-9 lg:w-9 xl:h-11 xl:w-11 items-center justify-center rounded-lg border border-[#d9a441]/30 bg-[#d9a441]/10">
                  <Scale className="h-3.5 w-3.5 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-[#e1b45b]" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl xl:text-2xl font-bold tracking-tight">
                    LexMind{" "}
                    <span className="text-[#d9a441]">AI</span>
                  </h1>
                  <p className="mt-0.5 text-[8px] lg:text-[9px] xl:text-[10px] text-slate-300 font-medium tracking-wide">
                    {t('enterpriseKit')}
                  </p>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-xl py-2 lg:py-3 xl:py-5">
              <div className="mb-1.5 lg:mb-2 inline-flex items-center gap-1 lg:gap-1.5 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 lg:px-2 lg:py-1 text-[8px] lg:text-[10px] text-slate-300">
                <Sparkles className="h-2 w-2 lg:h-2.5 lg:w-2.5 text-[#d9a441]" />
                <span className="hidden sm:inline">Yapay Zeka Destekli Hukuk Teknolojisi</span>
                <span className="sm:hidden">AI Hukuk Teknolojisi</span>
              </div>

              <h2 className="font-serif text-lg lg:text-2xl xl:text-3xl font-semibold leading-[1.1]">
                {t('heroTitle')}
                <span className="mt-0.5 lg:mt-1 block text-[#d9a441]">
                  {t('heroTitleHighlight')}
                </span>
              </h2>

              <p className="mt-1.5 lg:mt-3 max-w-lg text-[10px] lg:text-xs xl:text-sm leading-4 lg:leading-6 text-slate-300 line-clamp-2">
                {t('heroDescription')}
              </p>

              {/* Features */}
              <div className="mt-3 lg:mt-5 xl:mt-6 space-y-2 lg:space-y-3 xl:space-y-4">
                <Feature
                  icon={<FileText />}
                  title={t('feature1Title')}
                  description={t('feature1Desc')}
                />
                <Feature
                  icon={<Search />}
                  title={t('feature2Title')}
                  description={t('feature2Desc')}
                />
                <Feature
                  icon={<Scale />}
                  title={t('feature3Title')}
                  description={t('feature3Desc')}
                />
                <Feature
                  icon={<ShieldCheck />}
                  title={t('feature4Title')}
                  description={t('feature4Desc')}
                />
              </div>

              {/* Explore button */}
              <button
                type="button"
                className="group mt-3 lg:mt-5 xl:mt-6 inline-flex items-center gap-1.5 lg:gap-2 rounded-full bg-[#d9a441] px-2.5 py-1.5 lg:px-4 lg:py-2 xl:px-5 xl:py-2.5 font-semibold text-[#071a38] transition-all duration-200 hover:bg-[#e8bd68] hover:shadow-lg hover:shadow-[#d9a441]/20 text-[9px] lg:text-[10px] xl:text-xs"
              >
                <span className="flex h-3.5 w-3.5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 items-center justify-center rounded-full bg-[#071a38]/10">
                  <Play className="h-1.5 w-1.5 lg:h-2 lg:w-2 xl:h-2.5 xl:w-2.5 fill-current" />
                </span>
                {t('discoverButton')}
                <ArrowRight className="h-2 w-2 lg:h-2.5 lg:w-2.5 xl:h-3 xl:w-3 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[8px] lg:text-[9px] xl:text-[10px] text-slate-500">
              <span>© {new Date().getFullYear()} LexMind AI</span>
              <div className="flex items-center gap-1 lg:gap-1.5">
                <ShieldCheck className="h-2 w-2 lg:h-2.5 lg:w-2.5 xl:h-3 xl:w-3" />
                <span className="hidden sm:inline">Kurumsal Güvenlik</span>
                <span className="sm:hidden">Güvenlik</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE - LOGIN */}
        <section className="relative flex h-screen items-center justify-center px-2 py-3 sm:px-3 sm:py-4 lg:px-5 lg:py-6 overflow-hidden">

          {/* Language selector */}
          <button
            type="button"
            onClick={() => setLocale(locale === 'tr' ? 'en' : 'tr')}
            className="absolute right-2 top-2 sm:right-3 sm:top-3 lg:right-5 lg:top-5 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-3 lg:py-1.5 text-[9px] sm:text-[10px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <Globe2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#17345f]" />
            {locale === 'tr' ? 'TR' : 'EN'}
            <svg
              className="h-2 w-2 sm:h-2.5 sm:w-2.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Demo Button */}
          <button
            onClick={handleDemoClick}
            disabled={isDemoLoading}
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 lg:bottom-5 lg:right-5 bg-[#071a38]/10 hover:bg-[#071a38]/20 text-[#071a38] font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full transition text-[9px] sm:text-[10px]"
          >
            {isDemoLoading ? t('loading') : t('demo')}
          </button>

          {/* Demo Roles Display */}
          {demoRoles && (
            <div className="fixed bottom-10 right-2 sm:bottom-14 sm:right-3 lg:bottom-18 lg:right-5 z-50 bg-white p-1.5 sm:p-2 lg:p-3 rounded-lg shadow-lg max-w-md max-h-[40vh] overflow-y-auto">
              <h3 className="font-bold mb-1.5 sm:mb-2 text-gray-900 text-[9px] sm:text-[10px]">{t('demoUsers')}</h3>
              <div className="text-[8px] sm:text-[9px] text-gray-600">
                {demoRoles.demoUsers && demoRoles.demoUsers.length > 0 ? (
                  <div className="space-y-1 sm:space-y-1.5">
                    {demoRoles.demoUsers.map((user: any, index: number) => (
                      <div key={index} className="p-1 sm:p-1.5 bg-gray-50 rounded-md">
                        <p className="font-medium text-gray-900 text-[8px] sm:text-[9px]">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[7px] sm:text-[8px] text-gray-500">{user.email}</p>
                        <p className="text-[7px] sm:text-[8px] text-gray-600">
                          <strong>{t('passwordLabel')}:</strong> {user.password}
                        </p>
                        <p className="text-[7px] sm:text-[8px] text-gray-600">
                          <strong>{t('roles')}:</strong> {user.roles.join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">{t('userNotFound')}</p>
                )}
              </div>
              <button
                onClick={() => setDemoRoles(null)}
                className="mt-1.5 sm:mt-2 w-full text-[8px] sm:text-[9px] text-gray-600 hover:text-gray-900"
              >
                {t('close')}
              </button>
            </div>
          )}

          <div className="w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[440px]">

            {/* Mobile logo */}
            <div className="mb-2 sm:mb-3 lg:mb-4 flex justify-center lg:hidden">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#071a38]">
                  <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#d9a441]" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-[#071a38]">
                    LexMind{" "}
                    <span className="text-[#d9a441]">AI</span>
                  </h1>
                  <p className="text-[8px] sm:text-[9px] text-slate-500">
                    {t('enterpriseKit')}
                  </p>
                </div>
              </div>
            </div>

            {/* Login card */}
            <div className="rounded-[12px] sm:rounded-[16px] lg:rounded-[20px] border border-slate-200/80 bg-white p-2 sm:p-3 lg:p-4 shadow-[0_25px_70px_-20px_rgba(15,35,70,0.18)]">

              {/* Card logo */}
              <div className="mb-2 sm:mb-3 lg:mb-4 hidden items-center justify-center gap-1 sm:gap-1.5 sm:flex">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#071a38]">
                  <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#d9a441]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#071a38]">
                    LexMind{" "}
                    <span className="text-[#d9a441]">AI</span>
                  </h2>
                  <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-slate-500">
                    {t('enterpriseKit')}
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-2 sm:mb-3 lg:mb-4 text-center">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-[#0b2347]">
                  {t('formTitle')}
                </h3>
                <p className="mx-auto mt-1 sm:mt-1.5 lg:mt-2 max-w-sm text-[9px] sm:text-[10px] lg:text-xs leading-3 sm:leading-4 lg:leading-5 text-slate-500 line-clamp-2">
                  {t('formDescription')}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                {error && (
                  <div className="p-1 sm:p-1.5 lg:p-2 text-[9px] sm:text-[10px] lg:text-xs text-red-600 bg-red-50 rounded-md">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-0.5 sm:mb-1 lg:mb-1.5 block text-[9px] sm:text-[10px] lg:text-xs font-semibold text-slate-700"
                  >
                    {t('email')}
                  </label>
                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-2 sm:left-2.5 lg:left-3 top-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#b98c36]" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      {...register('email')}
                      placeholder={t('emailPlaceholderNew')}
                      className="h-8 sm:h-9 lg:h-10 w-full rounded-lg border border-slate-200 bg-white pl-7 sm:pl-8 lg:pl-10 pr-2 sm:pr-2.5 lg:pr-3 text-[9px] sm:text-[10px] lg:text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d9a441] focus:ring-4 focus:ring-[#d9a441]/10"
                    />
                    {errors.email && (
                      <p className="text-[9px] sm:text-[10px] lg:text-xs text-red-600 mt-0.5">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-0.5 sm:mb-1 lg:mb-1.5 block text-[9px] sm:text-[10px] lg:text-xs font-semibold text-slate-700"
                  >
                    {t('password')}
                  </label>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-2 sm:left-2.5 lg:left-3 top-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#b98c36]" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      {...register('password')}
                      placeholder={t('passwordPlaceholderNew')}
                      className="h-8 sm:h-9 lg:h-10 w-full rounded-lg border border-slate-200 bg-white pl-7 sm:pl-8 lg:pl-10 pr-7 sm:pr-8 lg:pr-10 text-[9px] sm:text-[10px] lg:text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d9a441] focus:ring-4 focus:ring-[#d9a441]/10"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 sm:right-2.5 lg:right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#17345f]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                      ) : (
                        <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                      )}
                    </button>
                    {errors.password && (
                      <p className="text-[9px] sm:text-[10px] lg:text-xs text-red-600 mt-0.5">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between gap-1 sm:gap-1.5 lg:gap-2">
                  <label className="flex cursor-pointer items-center gap-1 sm:gap-1.5 lg:gap-2 text-[9px] sm:text-[10px] lg:text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5 rounded border-slate-300 accent-[#17345f]"
                    />
                    {t('remember')}
                  </label>
                  <button
                    type="button"
                    className="text-[9px] sm:text-[10px] lg:text-xs font-semibold text-[#17345f] transition hover:text-[#b98c36] hover:underline"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-8 sm:h-9 lg:h-10 w-full items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 rounded-lg bg-[#0b2347] font-semibold text-white shadow-lg shadow-[#0b2347]/15 transition-all duration-200 hover:bg-[#123563] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 text-[9px] sm:text-[10px] lg:text-xs"
                >
                  {isLoading ? (
                    <>
                      <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {t('loggingIn')}
                    </>
                  ) : (
                    <>
                      {t('loginButton')}
                      <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 py-0.5">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-medium text-slate-400">
                    {t('or')}
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex h-8 sm:h-9 lg:h-10 w-full items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 text-[9px] sm:text-[10px] lg:text-xs"
                >
                  <GoogleIcon />
                  {t('googleLogin')}
                </button>
              </form>
            </div>

            {/* Security message */}
            <div className="mt-2 sm:mt-3 lg:mt-4 flex items-center justify-center gap-1 sm:gap-1.5 text-center text-[8px] sm:text-[9px] lg:text-[10px] text-slate-500">
              <Lock className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3 text-[#17345f]" />
              {t('secureConnection')}
            </div>

            {/* Bottom links */}
            <div className="mt-1.5 sm:mt-2 lg:mt-3 flex justify-center gap-1.5 sm:gap-2 lg:gap-3 text-[8px] sm:text-[9px] lg:text-[10px] text-slate-400">
              <button className="transition hover:text-slate-700">
                Yardım
              </button>
              <span>•</span>
              <button className="transition hover:text-slate-700">
                Gizlilik
              </button>
              <span>•</span>
              <button className="transition hover:text-slate-700">
                KVKK
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* FEATURE COMPONENT */
function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex items-start gap-2 lg:gap-3">
      <div className="flex h-7 w-7 lg:h-9 lg:w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-[#d9a441] transition-all duration-200 group-hover:border-[#d9a441]/30 group-hover:bg-[#d9a441]/10">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white text-[10px] lg:text-xs">
          {title}
        </h3>
        <p className="mt-0.5 text-[9px] lg:text-[11px] leading-4 lg:leading-5 text-slate-400 line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
}

/* GOOGLE ICON */
function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.22a4.46 4.46 0 01-1.94 2.92v2.42h3.14c1.84-1.69 2.93-4.18 2.93-7.37z"
      />
      <path
        fill="#34A853"
        d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.42c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.74 9.74 0 0012 21.7z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.81a5.85 5.85 0 010-3.62V7.69H3.3a9.74 9.74 0 000 8.62l3.24-2.5z"
      />
      <path
        fill="#EA4335"
        d="M12 6.16c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.28 14.63 2.3 12 2.3a9.74 9.74 0 00-8.7 5.39l3.24 2.5C7.31 7.88 9.46 6.16 12 6.16z"
      />
    </svg>
  );
}
