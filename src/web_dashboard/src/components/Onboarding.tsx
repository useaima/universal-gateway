import { useState, useEffect } from 'react';
import { Mail, Phone, Wallet, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { auth, db, setupRecaptcha } from '../lib/firebase';
import { sendEmailVerification, signInWithPhoneNumber, PhoneAuthProvider, linkWithCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface OnboardingProps {
  userEmail: string;
  onComplete: () => void;
}

export default function Onboarding({ userEmail, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wagmi hook to detect when wallet is connected
  const { isConnected, address } = useAccount();

  useEffect(() => {
    // If we're on step 3 (wallet connection) and it connects, auto-complete
    if (step === 3 && isConnected && address) {
      handleWalletLinked(address);
    }
  }, [isConnected, address, step]);

  const handleSendEmailVerification = async () => {
    setIsLoading(true);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        alert('Verification email sent! Check your inbox.');
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneVerification = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!auth.currentUser) throw new Error("No user logged in.");
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!auth.currentUser) throw new Error("No user logged in.");
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await linkWithCredential(auth.currentUser, credential);
      setIsLoading(false);
      setStep(3); // Move to Wallet Connection
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleWalletLinked = async (walletAddress: string) => {
    setIsLoading(true);
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          email: userEmail,
          walletAddress: walletAddress,
          onboardedAt: new Date().toISOString()
        }, { merge: true });
        setIsLoading(false);
        onComplete();
      }
    } catch (err: any) {
      console.error("Failed to save wallet to DB:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col font-sans items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-10 border border-brand-beige">
        
        <div className="text-center mb-10">
          <ShieldCheck className="w-16 h-16 text-brand-gold mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold mb-2">Secure Onboarding</h1>
          <p className="text-brand-muted font-medium">Complete these security steps to access your Gateway.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-500 rounded-full z-0 transition-all duration-500`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[1, 2, 3].map((num) => (
            <div key={num} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= num ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
              {step > num ? <CheckCircle className="w-6 h-6" /> : num}
            </div>
          ))}
        </div>

        <div className="min-h-[300px]">
          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Verify Email</h2>
              </div>
              <p className="text-brand-muted mb-8 font-medium">
                We need to verify that <strong>{userEmail}</strong> belongs to you before granting API access.
              </p>
              <button 
                onClick={handleSendEmailVerification}
                disabled={isLoading}
                className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center space-x-2 group disabled:opacity-70"
              >
                <span>{isLoading ? 'Sending...' : 'Send Verification Link'}</span>
                {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          )}

          {/* STEP 2: PHONE / MFA */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <Phone className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Phone Verification</h2>
              </div>
              <p className="text-brand-muted mb-6 font-medium">
                Add an extra layer of security. We will send an SMS with a one-time passcode.
              </p>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 mb-4">
                  {error}
                </div>
              )}

              {!verificationId ? (
                <div className="space-y-4">
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none font-medium"
                  />
                  <div id="recaptcha-container"></div>
                  <button 
                    onClick={handleSendPhoneVerification}
                    disabled={isLoading || phone.length < 5}
                    className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                  >
                    <span>{isLoading ? 'Sending...' : 'Send SMS Code'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none font-medium text-center text-xl tracking-widest"
                  />
                  <button 
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otp.length < 6}
                    className="w-full bg-brand-gold text-yellow-900 py-4 rounded-xl font-bold hover:bg-amber-500 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                  >
                    <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: WALLET */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-brand-gold/20 text-yellow-800 rounded-full mb-6">
                <Wallet className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Link Your Vault Wallet</h2>
              <p className="text-brand-muted mb-8 font-medium">
                Connect the Web3 wallet that will be used to physically authorize AI agent transactions via the Safety Sandwich.
              </p>
              
              <div className="flex justify-center w-full">
                {/* RainbowKit Connect Button will handle the UI and trigger the Wagmi hook above */}
                <ConnectButton />
              </div>

              {isLoading && (
                <p className="mt-6 text-sm text-brand-muted animate-pulse">Saving secure configuration to database...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
