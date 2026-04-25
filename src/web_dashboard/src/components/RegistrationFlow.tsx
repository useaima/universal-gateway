import { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Lock, ArrowRight, Phone, ShieldCheck, CheckCircle } from 'lucide-react';
import { auth, db, setupRecaptcha } from '../lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signInWithPhoneNumber, PhoneAuthProvider, linkWithCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface RegistrationFlowProps {
  onRegistrationComplete: (email: string) => void;
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
      // @ts-ignore
      if (window.grecaptcha && window.grecaptcha.enterprise) {
        // @ts-ignore
        window.grecaptcha.enterprise.ready(async () => {
          try {
            // @ts-ignore
            const token = await window.grecaptcha.enterprise.execute('6LeDEsgsAAAAAHglydox2_TQEPUDR0k6ZFm8ILUy', {action: action});
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
      // We will proceed for demo purposes even if token fails to load locally, 
      // but in production, you would block here or send token to backend.
      console.log("No enterprise token generated, proceeding with Firebase Auth.");
    } else {
      console.log("Enterprise Token generated:", token);
      // In a real app, send `token` to your backend to verify BEFORE creating the user.
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
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-defi-dark flex flex-col font-sans">
      <header className="w-full px-8 py-6 flex justify-between items-center z-10 sticky top-0 bg-defi-dark/80 backdrop-blur-md border-b border-defi-border">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Aima Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
          <span className="text-2xl font-bold tracking-tight text-white">Aima Protocol</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-defi-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="bg-defi-surface/80 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.15)] w-full max-w-md p-10 relative overflow-hidden border border-defi-border">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-extrabold text-white mb-2">Initialize Enclave</h2>
              <p className="text-defi-muted mb-8 font-mono text-sm">Create your cryptographic identity.</p>

              <form onSubmit={handleRegister} className="space-y-4">
                {error && <div className="p-3 bg-red-900/30 text-red-400 text-sm rounded-lg border border-red-500/50 font-mono">{error}</div>}
                
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-defi-muted" />
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Developer Name" className="w-full pl-12 pr-4 py-3 bg-defi-dark border border-defi-border rounded-xl focus:ring-1 focus:ring-defi-accent outline-none font-mono text-gray-200 placeholder-defi-muted" />
                </div>
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-defi-muted" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dev@protocol.com" className="w-full pl-12 pr-4 py-3 bg-defi-dark border border-defi-border rounded-xl focus:ring-1 focus:ring-defi-accent outline-none font-mono text-gray-200 placeholder-defi-muted" />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-defi-muted" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-defi-dark border border-defi-border rounded-xl focus:ring-1 focus:ring-defi-accent outline-none font-mono text-gray-200 placeholder-defi-muted" />
                </div>

                <button disabled={isLoading} type="submit" className="g-recaptcha w-full bg-defi-accent text-white py-4 rounded-xl font-bold hover:bg-violet-600 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center justify-center space-x-2 disabled:opacity-70">
                  <span>{isLoading ? 'Encrypting...' : 'Deploy Identity'}</span>
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in zoom-in duration-500 text-center py-8">
              <Mail className="w-16 h-16 text-defi-accent mx-auto mb-6 animate-pulse drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
              <h2 className="text-2xl font-bold text-white mb-4">Verify Node Connection</h2>
              <p className="text-defi-muted font-mono text-sm mb-8">
                We've routed a verification protocol to <strong>{email}</strong>. Please confirm to proceed.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 font-mono">
                <div className="w-4 h-4 border-2 border-defi-accent border-t-transparent rounded-full animate-spin"></div>
                <span>Awaiting handshake...</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-extrabold text-white mb-2">2FA Setup</h2>
              <p className="text-defi-muted mb-8 font-mono text-sm">Secure the enclave with SMS multi-factor authentication.</p>

              <form onSubmit={!verificationId ? handleSendSMS : handleVerifyOTP} className="space-y-4">
                {error && <div className="p-3 bg-red-900/30 text-red-400 text-sm rounded-lg border border-red-500/50 font-mono">{error}</div>}
                
                {!verificationId ? (
                  <>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-defi-muted" />
                      <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full pl-12 pr-4 py-3 bg-defi-dark border border-defi-border rounded-xl focus:ring-1 focus:ring-defi-accent outline-none font-mono text-gray-200 placeholder-defi-muted" />
                    </div>
                    {/* Firebase Invisible Recaptcha Container */}
                    <div id="firebase-recaptcha-container"></div>
                    <button disabled={isLoading} type="submit" className="g-recaptcha w-full bg-defi-accent text-white py-4 rounded-xl font-bold hover:bg-violet-600 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center justify-center space-x-2 disabled:opacity-70">
                      <span>{isLoading ? 'Routing SMS...' : 'Transmit Code'}</span>
                      {!isLoading && <ArrowRight className="w-5 h-5" />}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-defi-muted" />
                      <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" className="w-full pl-12 pr-4 py-3 bg-defi-dark border border-defi-border rounded-xl focus:ring-1 focus:ring-defi-accent outline-none font-mono text-white tracking-[1em] text-lg text-center" />
                    </div>
                    <button disabled={isLoading} type="submit" className="w-full bg-defi-emerald text-white py-4 rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-2 disabled:opacity-70">
                      <span>{isLoading ? 'Verifying...' : 'Authenticate'}</span>
                      {!isLoading && <CheckCircle className="w-5 h-5" />}
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
