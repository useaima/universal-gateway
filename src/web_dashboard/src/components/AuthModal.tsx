import { useState } from 'react';
import { X, Mail, Lock, ArrowRight } from 'lucide-react';
// import { auth, googleProvider } from '../lib/firebase';
// import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Temporary mock for UI testing. When firebase is fully active, uncomment imports.
      console.log(isSignUp ? "Signing up:" : "Logging in:", email);
      // if (isSignUp) {
      //   await createUserWithEmailAndPassword(auth, email, password);
      // } else {
      //   await signInWithEmailAndPassword(auth, email, password);
      // }
      // onClose();
      setTimeout(() => {
        setIsLoading(false);
        alert(isSignUp ? "Account created successfully!" : "Logged in successfully!");
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // await signInWithPopup(auth, googleProvider);
      alert("Google Sign In flow triggered");
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-10">
          <h2 className="text-3xl font-extrabold text-brand-dark mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-brand-muted mb-8 font-medium">
            {isSignUp ? 'Get your API key and start executing Web3 transactions.' : 'Sign in to manage your agents and liquidity.'}
          </p>

          <button 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-3 bg-gray-50 border border-gray-200 text-brand-dark py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-4 text-sm text-gray-400 font-medium">or email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all font-medium text-brand-dark placeholder-gray-400"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all font-medium text-brand-dark placeholder-gray-400"
              />
            </div>

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center space-x-2 group disabled:opacity-70"
            >
              <span>{isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}</span>
              {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted mt-8 font-medium">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-amber-600 font-bold hover:text-amber-700 transition-colors underline decoration-amber-600/30 underline-offset-4"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
