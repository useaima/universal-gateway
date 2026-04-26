import { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Lock, ArrowRight, Phone, ShieldCheck, CheckCircle } from 'lucide-react';
import { auth, db, setupRecaptcha } from '../lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signInWithPhoneNumber, PhoneAuthProvider, linkWithCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface RegistrationFlowProps {
  onRegistrationComplete: (email: string) => void;
}

type EnterpriseGrecaptcha = {
  enterprise?: {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
  };
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export default function RegistrationFlow({ onRegistrationComplete }: RegistrationFlowProps) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState('');

  // Step 2: Polling for email verification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && auth.currentUser) {
      interval = setInterval(async () => {
        await auth.currentUser?.reload();
        if (auth.currentUser?.emailVerified) {
          setStep(3); // Move to Phone Verification
          clearInterval(interval);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Utility to handle Enterprise reCAPTCHA
  const executeEnterpriseRecaptcha = async (action: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const grecaptcha = (window as Window & { grecaptcha?: EnterpriseGrecaptcha }).grecaptcha;
      if (grecaptcha?.enterprise) {
        grecaptcha.enterprise.ready(async () => {
          try {
            const token = await grecaptcha.enterprise.execute('6LeDEsgsAAAAAHglydox2_TQEPUDR0k6ZFm8ILUy', { action });
            resolve(token);
          } catch (e) {
            console.error("Enterprise reCAPTCHA failed", e);
            resolve(null);
          }
        });
      } else {
        console.warn("Enterprise reCAPTCHA not loaded");
        resolve(null);
      }
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Execute Enterprise reCAPTCHA (as requested by user)
    const token = await executeEnterpriseRecaptcha('register');
    if (!token) {
      console.log("No enterprise token generated, proceeding with Firebase Auth.");
    } else {
      console.log("Enterprise Token generated:", token);
      
      // Verify token on the backend
      try {
        const verifyRes = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, action: 'register' })
        });
        
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(verifyData.error || "reCAPTCHA verification failed. Risk score too low.");
        }
        console.log("reCAPTCHA Verification Success:", verifyData);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        setIsLoading(false);
        return; // Block registration
      }
    }

    try {
      // 2. Create Firebase User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 3. Update Profile with Full Name
      await updateProfile(userCredential.user, { displayName: fullName });
      
      // 4. Save initial user record to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName,
        email,
        createdAt: new Date().toISOString()
      }, { merge: true });

      // 5. Send Verification Email & Magic Link
      await sendEmailVerification(userCredential.user);
      
      setStep(2); // Move to Email Verification Check
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Enterprise reCAPTCHA on the button click
    const token = await executeEnterpriseRecaptcha('send_sms');
    if (token) console.log("Enterprise Token generated for SMS:", token);

    try {
      if (!auth.currentUser) throw new Error("User session lost.");
      
      // 2. Firebase's required invisible reCAPTCHA for SMS
      const recaptchaVerifier = setupRecaptcha('firebase-recaptcha-container');
      const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      
      setVerificationId(confirmationResult.verificationId);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!auth.currentUser) throw new Error("User session lost.");
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await linkWithCredential(auth.currentUser, credential);
      
      // Registration and Phone Verification complete!
      onRegistrationComplete(email);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="page-shell min-h-screen flex flex-col font-sans">
      <header className="px-4 pt-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center rounded-full border border-defi-border bg-[rgba(13,17,23,0.78)] px-5 py-4 backdrop-blur-xl md:px-7">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Aima Logo" className="h-10 w-10 rounded-full border border-defi-border bg-white/5 p-1.5 object-contain" />
            <div>
              <span className="block text-xl font-semibold text-white">Aima Protocol</span>
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-defi-muted">Identity Enrollment</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-grow items-center justify-center px-4 py-12">
        <div className="section-panel relative w-full max-w-md overflow-hidden p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(207,169,93,0.16),transparent_40%)]" />
          
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <div className="eyebrow mb-5">Secure onboarding</div>
              <h2 className="mb-2 text-3xl font-semibold text-white">Initialize Enclave</h2>
              <p className="mb-8 text-sm font-mono text-defi-muted">Create your cryptographic identity.</p>

              <form onSubmit={handleRegister} className="space-y-4">
                {error && <div className="p-3 bg-red-900/30 text-red-400 text-sm rounded-lg border border-red-500/50 font-mono">{error}</div>}
                
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-defi-muted" />
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Developer Name" className="input-chrome w-full pl-12 font-mono text-gray-200" />
                </div>
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-defi-muted" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dev@protocol.com" className="input-chrome w-full pl-12 font-mono text-gray-200" />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-defi-muted" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-chrome w-full pl-12 font-mono text-gray-200" />
                </div>

                <button disabled={isLoading} type="submit" className="button-primary g-recaptcha flex w-full justify-center py-4 disabled:opacity-70">
                  <span>{isLoading ? 'Encrypting...' : 'Deploy Identity'}</span>
                  {!isLoading && <ArrowRight className="h-5 w-5" />}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in zoom-in duration-500 text-center py-8">
              <Mail className="mx-auto mb-6 h-16 w-16 animate-pulse text-defi-goldBright" />
              <h2 className="mb-4 text-2xl font-semibold text-white">Verify Node Connection</h2>
              <p className="mb-8 text-sm font-mono text-defi-muted">
                We've routed a verification protocol to <strong>{email}</strong>. Please confirm to proceed.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 font-mono">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-defi-gold border-t-transparent"></div>
                <span>Awaiting handshake...</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="eyebrow mb-5">Two-factor confirmation</div>
              <h2 className="mb-2 text-3xl font-semibold text-white">2FA Setup</h2>
              <p className="mb-8 text-sm font-mono text-defi-muted">Secure the enclave with SMS multi-factor authentication.</p>

              <form onSubmit={!verificationId ? handleSendSMS : handleVerifyOTP} className="space-y-4">
                {error && <div className="p-3 bg-red-900/30 text-red-400 text-sm rounded-lg border border-red-500/50 font-mono">{error}</div>}
                
                {!verificationId ? (
                  <>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-defi-muted" />
                      <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="input-chrome w-full pl-12 font-mono text-gray-200" />
                    </div>
                    <div id="firebase-recaptcha-container"></div>
                    <button disabled={isLoading} type="submit" className="button-primary g-recaptcha flex w-full justify-center py-4 disabled:opacity-70">
                      <span>{isLoading ? 'Routing SMS...' : 'Transmit Code'}</span>
                      {!isLoading && <ArrowRight className="h-5 w-5" />}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-defi-muted" />
                      <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" className="input-chrome w-full pl-12 text-center font-mono text-lg tracking-[1em] text-white" />
                    </div>
                    <button disabled={isLoading} type="submit" className="flex w-full items-center justify-center space-x-2 rounded-xl bg-defi-emerald py-4 font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500 disabled:opacity-70">
                      <span>{isLoading ? 'Verifying...' : 'Authenticate'}</span>
                      {!isLoading && <CheckCircle className="h-5 w-5" />}
                    </button>
                  </>
                )}
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
