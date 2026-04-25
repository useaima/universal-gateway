export default function Navbar() {
  return (
    <header className="w-full px-8 py-6 flex justify-between items-center z-10 bg-defi-dark/80 backdrop-blur-md sticky top-0 border-b border-defi-border">
      <div className="flex items-center space-x-3">
        <img src="/logo.png" alt="Aima Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
        <span className="text-2xl font-bold tracking-tight text-white">Aima Protocol</span>
      </div>
      <nav className="hidden md:flex space-x-8 text-sm font-mono tracking-wide text-defi-muted">
        <a href="#features" className="hover:text-white transition-colors">Architecture</a>
        <a href="#developers" className="hover:text-white transition-colors">Smart Contracts</a>
        <a href="/docs/index.html" className="hover:text-white transition-colors">Documentation</a>
        <a href="#support" className="hover:text-white transition-colors text-defi-accent">Discord</a>
      </nav>
      <div className="flex items-center space-x-4">
        {/* Wallet connection moved to Onboarding/Dashboard per requirements */}
      </div>
    </header>
  );
}
