import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Mail,
  Shield,
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
import { useConnect, useDisconnect } from 'wagmi';
import {
  auth,
  getEmailActionSettings,
  googleProvider,
  verifyEnterpriseRecaptcha,
} from '../lib/firebase';
import {
  ensureBaseFirebaseSession,
  isLikelyBaseApp,
  requestBaseNonce,
  verifyBaseSignature,
} from '../lib/baseAuth';
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
  baseMode: boolean;
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

function BaseMark() {
  return <span className="inline-block h-5 w-5 rounded-[4px] bg-[#0000FF]" aria-hidden="true" />;
}

export default function RegistrationFlow({
  view,
  user,
  userProgress,
  emailActionNotice,
  emailActionError,
  onBackToLanding,
  onProgressChange,
  baseMode,
}: RegistrationFlowProps) {
  const [email, setEmail] = useState(user?.email || localStorage.getItem(PENDING_EMAIL_STORAGE_KEY) || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isBaseLoading, setIsBaseLoading] = useState(false);
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();

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
        authMode: 'firebase',
        authProvider: 'password',
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
        authMode: 'firebase',
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

  const handleBaseSignIn = async () => {
    setError(null);
    setInfo(null);
    setIsBaseLoading(true);

    try {
      await verifyEnterpriseRecaptcha('auth_base_submit');

      const baseConnector = connectors.find((connector) => connector.id === 'baseAccount');

      if (!baseConnector) {
        throw new Error('Base Account connector not found in the current wallet configuration.');
      }

      const nonce = await requestBaseNonce();

      await connectAsync({ connector: baseConnector });

      const provider =
        (await (baseConnector as { getProvider?: () => Promise<unknown> }).getProvider?.()) ||
        (baseConnector as { provider?: { request?: (payload: unknown) => Promise<unknown> } }).provider;

      const authResult = (await (provider as { request: (payload: unknown) => Promise<unknown> }).request({
        method: 'wallet_connect',
        params: [
          {
            version: '1',
            capabilities: {
              signInWithEthereum: {
                nonce,
                chainId: '0x2105',
              },
            },
          },
        ],
      })) as {
        accounts?: Array<{
          address: string;
          capabilities?: {
            signInWithEthereum?: {
              message: string;
              signature: string;
            };
          };
        }>;
      };

      const account = authResult.accounts?.[0];
      const message = account?.capabilities?.signInWithEthereum?.message;
      const signature = account?.capabilities?.signInWithEthereum?.signature;

      if (!account?.address || !message || !signature) {
        throw new Error('Base authentication did not return the required wallet signature payload.');
      }

      const verifiedSession = await verifyBaseSignature({
        address: account.address,
        message,
        signature,
      });

      const firebaseUser = await ensureBaseFirebaseSession(verifiedSession);

      await mergeUserProgress(firebaseUser.uid, {
        authMode: 'base',
        authProvider: 'base',
        primaryWallet: verifiedSession.address,
        walletAddress: verifiedSession.address,
        evmAddresses: [verifiedSession.address],
        baseAppInstalledAt: verifiedSession.baseAppInstalledAt || new Date().toISOString(),
      });

      setInfo('Base wallet verified. We resumed your operator session using the linked wallet identity.');
      await syncAppState();
    } catch (baseError) {
      try {
        await disconnect();
      } catch {
        // ignore cleanup error
      }
      setError(getErrorMessage(baseError));
    } finally {
      setIsBaseLoading(false);
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
      ? 'Use Sign in with Base inside the Base App, or continue with Google or email/password in the standard web flow.'
      : 'We sent a Firebase verification link. Open it from the same browser window and we will resume the flow automatically.';
  const infoBanner = info || emailActionNotice;
  const baseRecommended = baseMode || isLikelyBaseApp();

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
              Hybrid operator identity
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
                <div className="rounded-2xl border border-[#d7e0ff] bg-[#f5f7ff] px-4 py-3 text-sm text-[#1f3bb3]">
                  {baseRecommended
                    ? 'Base App detected. Wallet-native sign-in is the recommended path for this session.'
                    : 'Base-native sign-in is available here too. Use it when you want a wallet-led operator session.'}
                </div>

                <button
                  type="button"
                  onClick={handleBaseSignIn}
                  disabled={isBaseLoading || isGoogleLoading || isLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#d6dcff] bg-white px-5 py-4 text-sm font-medium text-slate-800 shadow-[0_16px_34px_rgba(28,46,150,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(28,46,150,0.12)] disabled:opacity-70"
                >
                  <BaseMark />
                  <span>{isBaseLoading ? 'Verifying Base wallet...' : 'Sign in with Base'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading || isBaseLoading}
                  className="light-button-secondary w-full justify-center py-4 text-sm font-medium text-slate-700 disabled:opacity-70"
                >
                  <GoogleMark />
                  <span>{isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.24em] text-slate-400">
                  <span className="h-px flex-1 bg-[#eadfcf]" />
                  <span>Standard web auth</span>
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
                        minLength={6}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Minimum 6 characters"
                        className="light-input pl-12"
                      />
                    </div>
                  </label>

                  <button type="submit" disabled={isLoading || isGoogleLoading || isBaseLoading} className="light-button-primary w-full justify-center py-4 disabled:opacity-70">
                    <span>{isLoading ? 'Processing...' : 'Continue with Email'}</span>
                  </button>
                </form>
              </div>
            )}

            {view === 'email_verification' && (
              <div className="mt-8 space-y-6">
                <div className="rounded-2xl border border-[#eadfcf] bg-[#fff9ee] px-5 py-4">
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#9a8357]">Verification target</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{currentEmail || 'Pending email address'}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Firebase action links return to this same deployment and continue the onboarding or dashboard route automatically.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e5f2e7] bg-[#f5fcf6] px-5 py-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Session routing</p>
                      <p className="mt-1 text-sm leading-7 text-slate-500">
                        After verification, the app routes you to onboarding if it is incomplete, otherwise straight to the live dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    className="light-button-primary flex-1 justify-center py-4 disabled:opacity-70"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{isLoading ? 'Sending...' : 'Send Verification Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUseAnotherAccount}
                    className="light-button-secondary flex-1 justify-center py-4 text-sm font-mono"
                  >
                    Use another account
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="light-panel overflow-hidden p-4 md:p-5">
            <div className="relative h-full overflow-hidden rounded-[30px] border border-[#eadfcf] bg-[linear-gradient(180deg,#fff9ef,#fff5e2)]">
              <div className="grid h-full gap-0 lg:grid-cols-[0.64fr_0.36fr]">
                <div className="min-h-[420px] overflow-hidden border-b border-[#eadfcf] lg:min-h-full lg:border-b-0 lg:border-r">
                  <img
                    src={welcomeVisual}
                    alt="Aima Protocol network editorial illustration"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between p-6">
                  <div>
                    <div className="light-eyebrow mb-4">
                      <Shield className="h-4 w-4 text-[#b3842f]" />
                      Base-ready operator surface
                    </div>
                    <h2 className="text-2xl font-semibold leading-tight text-slate-900">
                      Wallet-native for the Base App, Firebase-backed for the open web.
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      The Base path stays inside the app experience with SIWE and wallet identity. The standard web path keeps Google and email/password for broader operator access.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {[
                      'Sign in with Base uses SIWE verification on Base mainnet.',
                      'Base sessions land in the same Firestore and RTDB-backed app state.',
                      'Base-denominated payments and dashboard telemetry stay aligned with the gateway.',
                    ].map((entry, index) => (
                      <div key={entry} className="rounded-2xl border border-[#eadfcf] bg-white/90 px-4 py-3">
                        <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
                          <span>{entry}</span>
                          <span className="font-mono text-[#b3842f]">0{index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
