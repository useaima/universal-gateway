import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Sparkles,
} from 'lucide-react';
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, getEmailActionSettings, googleProvider, verifyEnterpriseRecaptcha } from '../lib/firebase';
import { mergeUserProgress, type UserProgress } from '../lib/userProgress';
import welcomeVisual from '../assets/welcome-visual.svg';

type RegistrationView = 'welcome' | 'email_verification';

interface RegistrationFlowProps {
  view: RegistrationView;
  user: User | null;
  userProgress: UserProgress | null;
  emailActionNotice: string | null;
  emailActionError: string | null;
  onBackToLanding: () => void;
  onProgressChange: () => Promise<void> | void;
}

const PENDING_EMAIL_STORAGE_KEY = 'utg-pending-email';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M21.6 12.227c0-.82-.073-1.606-.209-2.364H12v4.473h5.382a4.605 4.605 0 0 1-2 3.02v2.506h3.237c1.894-1.744 2.981-4.315 2.981-7.635Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.964-.895 6.618-2.429l-3.237-2.506c-.895.6-2.04.956-3.381.956-2.598 0-4.799-1.754-5.584-4.11H3.07v2.58A9.998 9.998 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.416 13.911A5.992 5.992 0 0 1 6.104 12c0-.664.114-1.307.312-1.911V7.509H3.07A9.998 9.998 0 0 0 2 12c0 1.611.386 3.135 1.07 4.491l3.346-2.58Z" />
      <path fill="#EA4335" d="M12 5.979c1.469 0 2.788.505 3.827 1.498l2.872-2.872C16.96 2.986 14.696 2 12 2A9.998 9.998 0 0 0 3.07 7.509l3.346 2.58C7.201 7.733 9.402 5.979 12 5.979Z" />
    </svg>
  );
}

export default function RegistrationFlow({
  view,
  user,
  userProgress,
  emailActionNotice,
  emailActionError,
  onBackToLanding,
  onProgressChange,
}: RegistrationFlowProps) {
  const [email, setEmail] = useState(user?.email || localStorage.getItem(PENDING_EMAIL_STORAGE_KEY) || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const currentEmail = useMemo(
    () => user?.email || userProgress?.email || localStorage.getItem(PENDING_EMAIL_STORAGE_KEY) || email,
    [email, user?.email, userProgress?.email],
  );

  const syncAppState = async () => {
    setError(null);
    await onProgressChange();
  };

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsLoading(true);

    try {
      await verifyEnterpriseRecaptcha('auth_email_submit');

      const methods = await fetchSignInMethodsForEmail(auth, email.trim());
      const isPasswordAccount = methods.includes(EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD);
      const isGoogleOnly = methods.length > 0 && !isPasswordAccount;

      if (isGoogleOnly) {
        throw new Error('This email is already linked to Google sign-in. Continue with Google to resume your account.');
      }

      const credential = isPasswordAccount
        ? await signInWithEmailAndPassword(auth, email.trim(), password)
        : await createUserWithEmailAndPassword(auth, email.trim(), password);

      localStorage.setItem(PENDING_EMAIL_STORAGE_KEY, email.trim());

      await mergeUserProgress(credential.user.uid, {
        authProvider: isPasswordAccount ? 'password' : 'password',
        email: credential.user.email || email.trim(),
        lastLoginAt: new Date().toISOString(),
      });

      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user, getEmailActionSettings());
        setInfo(
          isPasswordAccount
            ? 'Your account is signed in. We sent a fresh verification link so you can continue securely.'
            : 'Your account is created. We sent a verification link to continue in the same window.',
        );
      }

      await syncAppState();
    } catch (authError) {
      setError(getErrorMessage(authError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfo(null);
    setIsGoogleLoading(true);

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      localStorage.setItem(PENDING_EMAIL_STORAGE_KEY, credential.user.email || '');

      const googlePayload: Record<string, string> = {
        authProvider: 'google',
        email: credential.user.email || '',
        lastLoginAt: new Date().toISOString(),
      };

      if (credential.user.emailVerified) {
        googlePayload.emailVerifiedAt = new Date().toISOString();
      }

      await mergeUserProgress(credential.user.uid, googlePayload);

      await syncAppState();
    } catch (googleError) {
      setError(getErrorMessage(googleError));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) {
      return;
    }

    setError(null);
    setInfo(null);
    setIsLoading(true);

    try {
      await sendEmailVerification(user, getEmailActionSettings());
      setInfo(`We sent a fresh verification link to ${user.email || currentEmail}.`);
    } catch (verificationError) {
      setError(getErrorMessage(verificationError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseAnotherAccount = async () => {
    localStorage.removeItem(PENDING_EMAIL_STORAGE_KEY);
    await signOut(auth);
    onBackToLanding();
  };

  const heading =
    view === 'welcome'
      ? 'Welcome to the Universal Transaction Gateway'
      : 'Verify your email to continue';

  const description =
    view === 'welcome'
      ? 'Sign in with Email, Password, or Google. We automatically resume the right step for existing and new users.'
      : 'We sent a Firebase verification link. Open it from the same browser window and we will resume the flow automatically.';
  const infoBanner = info || emailActionNotice;

  return (
    <div className="auth-shell min-h-screen px-4 py-4 font-sans md:px-8">
      <header className="mx-auto max-w-7xl">
        <div className="light-nav flex items-center justify-between px-5 py-4 md:px-7">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Aima Logo" className="h-10 w-10 rounded-full border border-[#eadfcf] bg-white/80 p-1.5 object-contain" />
            <div>
              <span className="block text-lg font-semibold text-slate-900 md:text-xl">Aima Protocol</span>
              <span className="hidden text-[11px] font-mono uppercase tracking-[0.24em] text-[#9a8357] md:block">
                Universal Transaction Gateway
              </span>
            </div>
          </div>

          <button type="button" onClick={onBackToLanding} className="light-button-secondary px-4 py-2 text-sm font-mono">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl items-center py-12">
        <div className="grid w-full gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="light-panel px-6 py-8 md:px-8 md:py-10">
            <div className="light-eyebrow mb-5">
              <Sparkles className="h-4 w-4" />
              Secure identity flow
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">{heading}</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">{description}</p>

            {infoBanner && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {infoBanner}
              </div>
            )}

            {(error || emailActionError) && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error || emailActionError}
              </div>
            )}

            {view === 'welcome' && (
              <div className="mt-8 space-y-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="light-button-secondary w-full justify-center py-4 text-sm font-medium text-slate-700 disabled:opacity-70"
                >
                  <GoogleMark />
                  <span>{isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.24em] text-slate-400">
                  <span className="h-px flex-1 bg-[#eadfcf]" />
                  <span>Email and password</span>
                  <span className="h-px flex-1 bg-[#eadfcf]" />
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-xs font-mono uppercase tracking-[0.2em] text-[#9a8357]">Email</span>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="team@useaima.com"
                        className="light-input pl-12"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-mono uppercase tracking-[0.2em] text-[#9a8357]">Password</span>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Minimum 6 characters"
                        className="light-input pl-12"
                      />
                    </div>
                  </label>

                  <button disabled={isLoading || isGoogleLoading} type="submit" className="light-button-primary w-full justify-center py-4 disabled:opacity-70">
                    <span>{isLoading ? 'Securing session...' : 'Get Started'}</span>
                    {!isLoading && <ArrowRight className="h-5 w-5" />}
                  </button>
                </form>
              </div>
            )}

            {view === 'email_verification' && (
              <div className="mt-8 space-y-6">
                <div className="rounded-3xl border border-[#eadfcf] bg-white/88 p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-[0.22em] text-[#9a8357]">Verification address</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{currentEmail}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Once the verification link is opened, this window will route you to onboarding or the dashboard automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={handleResendVerification} disabled={isLoading} className="light-button-primary justify-center py-4 disabled:opacity-70">
                    <span>{isLoading ? 'Sending...' : 'Send Verification Link'}</span>
                  </button>
                  <button type="button" onClick={handleUseAnotherAccount} className="light-button-secondary justify-center py-4">
                    Use Another Account
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="light-panel relative overflow-hidden p-4 md:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(207,169,93,0.18),transparent_32%),radial-gradient(circle_at_85%_16%,rgba(245,158,11,0.12),transparent_24%)]" />
            <div className="relative flex h-full flex-col justify-between rounded-[24px] border border-[#eadfcf] bg-[#fffaf1] p-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#9a8357]">Identity and approvals</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-900">
                  Secure every agent action before it reaches settlement.
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
                  This welcome surface is intentionally quieter and more editorial, with the same premium trust cues as a modern protocol docs experience.
                </p>
              </div>

              <div className="mt-8 rounded-[28px] border border-[#eadfcf] bg-white/88 p-4 shadow-[0_24px_54px_rgba(108,83,39,0.08)]">
                <img
                  src={welcomeVisual}
                  alt="Aima UTG welcome illustration"
                  className="aspect-[4/3] w-full rounded-[22px] border border-[#efe2cc] object-cover"
                />
              </div>

              <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#eadfcf] bg-white/84 p-4">
                  <p className="text-xs font-mono uppercase tracking-[0.22em] text-[#9a8357]">Email verification</p>
                  <p className="mt-2 leading-6">Firebase verification links resume the same browser flow automatically.</p>
                </div>
                <div className="rounded-2xl border border-[#eadfcf] bg-white/84 p-4">
                  <p className="text-xs font-mono uppercase tracking-[0.22em] text-[#9a8357]">Session routing</p>
                  <p className="mt-2 leading-6">Returning users continue directly into onboarding or the live dashboard without extra identity loops.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
