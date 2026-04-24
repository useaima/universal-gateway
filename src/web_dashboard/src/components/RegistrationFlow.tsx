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
    <div className="min-h-screen bg-brand-cream flex flex-col font-sans">
      <header className="w-full px-8 py-6 flex justify-between items-center z-10 glass-panel sticky top-0 rounded-none border-t-0 border-x-0">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Aima Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold tracking-tight text-brand-dark">Aima UTG</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 relative overflow-hidden border border-brand-beige">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Create Account</h2>
              <p className="text-brand-muted mb-8 font-medium">Join the Universal Transaction Gateway.</p>

              <form onSubmit={handleRegister} className="space-y-4">
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
                
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none font-medium text-brand-dark" />
                </div>
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="developer@company.com" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none font-medium text-brand-dark" />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none font-medium text-brand-dark" />
                </div>

                <button disabled={isLoading} type="submit" className="g-recaptcha w-full bg-brand-dark text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-70">
                  <span>{isLoading ? 'Processing...' : 'Sign Up'}</span>
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>

                <button 
                  type="button"
                  onClick={() => onRegistrationComplete(email || "test@aima.com")}
                  className="w-full mt-4 py-2 text-xs font-bold text-gray-400 hover:text-brand-dark transition-colors border border-dashed border-gray-200 rounded-lg"
                >
                  Skip to Dashboard (Test Mode)
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in zoom-in duration-500 text-center py-8">
              <Mail className="w-16 h-16 text-brand-gold mx-auto mb-6 animate-pulse" />
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Verify Your Email</h2>
              <p className="text-brand-muted font-medium mb-8">
                We've sent a magic link to <strong>{email}</strong>. Please click the link to verify your account.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                <span>Waiting for verification...</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Phone Verification</h2>
              <p className="text-brand-muted mb-8 font-medium">Secure your account with SMS multi-factor authentication.</p>

              <form onSubmit={!verificationId ? handleSendSMS : handleVerifyOTP} className="space-y-4">
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
                
                {!verificationId ? (
                  <>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none font-medium text-brand-dark" />
                    </div>
                    {/* Firebase Invisible Recaptcha Container */}
                    <div id="firebase-recaptcha-container"></div>
                    <button disabled={isLoading} type="submit" className="g-recaptcha w-full bg-brand-dark text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-70">
                      <span>{isLoading ? 'Sending SMS...' : 'Send Verification Code'}</span>
                      {!isLoading && <ArrowRight className="w-5 h-5" />}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit code" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none font-medium text-brand-dark tracking-widest text-lg" />
                    </div>
                    <button disabled={isLoading} type="submit" className="w-full bg-brand-gold text-yellow-900 py-4 rounded-xl font-bold hover:bg-amber-500 transition-all flex items-center justify-center space-x-2 disabled:opacity-70">
                      <span>{isLoading ? 'Verifying...' : 'Verify Phone'}</span>
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
