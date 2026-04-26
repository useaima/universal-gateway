import { useCallback, useEffect, useMemo, useState } from 'react';
import { applyActionCode, onAuthStateChanged, reload, signOut, type User } from 'firebase/auth';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { WagmiProvider, http } from 'wagmi';
import { mainnet, sepolia, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';
import Footer from './components/Footer';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import RegistrationFlow from './components/RegistrationFlow';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import ProtocolShowcase from './components/landing/ProtocolShowcase';
import DocsExperience from './components/docs/DocsExperience';
import { auth } from './lib/firebase';
import { syncUserProgress, type UserProgress } from './lib/userProgress';

const PENDING_EMAIL_STORAGE_KEY = 'utg-pending-email';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '11111111111111111111111111111111';

const config = getDefaultConfig({
  appName: 'Aima UTG',
  projectId,
  chains: [mainnet, sepolia, base],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.hash, location.pathname]);

  return null;
}

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="landing-shell min-h-screen flex flex-col font-sans">
      <Navbar onStart={onStart} />
      <Hero onOpenAuth={onStart} />
      <HowItWorks />
      <FeatureGrid />
      <ProtocolShowcase />
      <Testimonials />
      <Footer />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="auth-shell flex min-h-screen items-center justify-center px-4 font-sans">
      <div className="light-panel w-full max-w-md px-8 py-10 text-center">
        <p className="light-eyebrow mb-5">Secure session</p>
        <h1 className="text-3xl font-semibold text-slate-900">Checking your gateway state</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          We are syncing Firebase authentication, verification status, and onboarding progress.
        </p>
      </div>
    </div>
  );
}

function AppRoutes({
  authUser,
  userProgress,
  emailActionNotice,
  emailActionError,
  onBackToLanding,
  onLogout,
  onStart,
  onProgressChange,
  onOnboardingComplete,
}: {
  authUser: User | null;
  userProgress: UserProgress | null;
  emailActionNotice: string | null;
  emailActionError: string | null;
  onBackToLanding: () => Promise<void> | void;
  onLogout: () => Promise<void> | void;
  onStart: () => void;
  onProgressChange: () => Promise<void> | void;
  onOnboardingComplete: () => Promise<void> | void;
}) {
  const currentEmail = useMemo(
    () => authUser?.email || userProgress?.email || localStorage.getItem(PENDING_EMAIL_STORAGE_KEY) || '',
    [authUser?.email, userProgress?.email],
  );

  const needsEmailVerification = !!authUser && !authUser.emailVerified;
  const needsPhoneVerification = !!authUser?.emailVerified && !userProgress?.phoneVerifiedAt;
  const needsOnboarding = !!authUser?.emailVerified && !!userProgress?.phoneVerifiedAt && !userProgress?.onboardingCompletedAt;
  const verificationView = needsEmailVerification ? 'email_verification' : 'phone_verification';

  return (
    <Routes>
      <Route path="/" element={<LandingPage onStart={onStart} />} />
      <Route
        path="/welcome"
        element={
          authUser ? (
            needsEmailVerification || needsPhoneVerification ? (
              <RegistrationFlow
                view={verificationView}
                user={authUser}
                userProgress={userProgress}
                emailActionNotice={emailActionNotice}
                emailActionError={emailActionError}
                onBackToLanding={onBackToLanding}
                onProgressChange={onProgressChange}
              />
            ) : (
              <Navigate to="/app" replace />
            )
          ) : (
            <RegistrationFlow
              view="welcome"
              user={null}
              userProgress={null}
              emailActionNotice={emailActionNotice}
              emailActionError={emailActionError}
              onBackToLanding={onBackToLanding}
              onProgressChange={onProgressChange}
            />
          )
        }
      />
      <Route
        path="/app"
        element={
          authUser ? (
            needsEmailVerification || needsPhoneVerification ? (
              <RegistrationFlow
                view={verificationView}
                user={authUser}
                userProgress={userProgress}
                emailActionNotice={emailActionNotice}
                emailActionError={emailActionError}
                onBackToLanding={onBackToLanding}
                onProgressChange={onProgressChange}
              />
            ) : needsOnboarding ? (
              <Onboarding userEmail={currentEmail} onComplete={onOnboardingComplete} />
            ) : (
              <Dashboard onLogout={onLogout} userEmail={currentEmail} />
            )
          ) : (
            <Navigate to="/welcome" replace />
          )
        }
      />
      <Route path="/docs" element={<DocsExperience onStart={onStart} />} />
      <Route path="/docs/:pageSlug" element={<DocsExperience onStart={onStart} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [emailActionNotice, setEmailActionNotice] = useState<string | null>(null);
  const [emailActionError, setEmailActionError] = useState<string | null>(null);

  const refreshUserProgress = useCallback(async (user: User | null) => {
    if (!user) {
      setAuthUser(null);
      setUserProgress(null);
      setIsBootstrapping(false);
      return;
    }

    const currentUser = auth.currentUser || user;

    try {
      await reload(currentUser);
    } catch (error) {
      console.warn('UTG: Failed to reload current user before syncing progress.', error);
    }

    const syncedUser = auth.currentUser || currentUser;
    try {
      const progress = await syncUserProgress(syncedUser);
      setAuthUser(syncedUser);
      setUserProgress(progress);
    } catch (error) {
      console.error('UTG: Failed to sync user progress from Firestore.', error);
      setAuthUser(syncedUser);
      setUserProgress(null);
    }
    setIsBootstrapping(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');

    const handleEmailAction = async () => {
      if (mode !== 'verifyEmail' || !oobCode) {
        return;
      }

      try {
        await applyActionCode(auth, oobCode);
        if (auth.currentUser) {
          await reload(auth.currentUser);
        }
        if (!ignore) {
          setEmailActionNotice('Email verified. We resumed your secure gateway flow in the same window.');
          setEmailActionError(null);
        }
      } catch (error) {
        if (!ignore) {
          setEmailActionError(error instanceof Error ? error.message : 'Verification link could not be applied.');
        }
      } finally {
        if (!ignore) {
          navigate(location.pathname, { replace: true });
        }
      }
    };

    void handleEmailAction();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (ignore) {
        return;
      }

      await refreshUserProgress(user);
    });

    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [location.pathname, location.search, navigate, refreshUserProgress]);

  const handleStart = () => {
    navigate(auth.currentUser ? '/app' : '/welcome');
  };

  const handleBackToLanding = async () => {
    localStorage.removeItem(PENDING_EMAIL_STORAGE_KEY);
    setEmailActionError(null);
    setEmailActionNotice(null);

    if (auth.currentUser) {
      await signOut(auth);
    }

    navigate('/');
  };

  const handleLogout = async () => {
    localStorage.removeItem(PENDING_EMAIL_STORAGE_KEY);
    setEmailActionError(null);
    setEmailActionNotice(null);
    await signOut(auth);
    navigate('/');
  };

  const handleOnboardingComplete = async () => {
    await refreshUserProgress(auth.currentUser);
    navigate('/app', { replace: true });
  };

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  return (
    <>
      <ScrollToTop />
      <AppRoutes
        authUser={authUser}
        userProgress={userProgress}
        emailActionNotice={emailActionNotice}
        emailActionError={emailActionError}
        onBackToLanding={handleBackToLanding}
        onLogout={handleLogout}
        onStart={handleStart}
        onProgressChange={() => refreshUserProgress(auth.currentUser)}
        onOnboardingComplete={handleOnboardingComplete}
      />
    </>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AppShell />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
