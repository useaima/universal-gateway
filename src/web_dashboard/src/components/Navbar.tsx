export default function Navbar() {
  return (
    <header className="w-full px-8 py-6 flex justify-between items-center z-10 glass-panel sticky top-0 rounded-none border-t-0 border-x-0">
      <div className="flex items-center space-x-3">
        <img src="/logo.png" alt="Aima Logo" className="w-10 h-10 object-contain" />
        <span className="text-2xl font-bold tracking-tight">Aima UTG</span>
      </div>
      <nav className="hidden md:flex space-x-8 text-sm font-semibold tracking-wide text-brand-muted">
        <a href="#features" className="hover:text-brand-dark transition-colors">Features</a>
        <a href="#developers" className="hover:text-brand-dark transition-colors">Developers</a>
        <a href="/docs/index.html" className="hover:text-brand-dark transition-colors">Documentation</a>
        <a href="#support" className="hover:text-brand-dark transition-colors text-brand-gold">Support</a>
      </nav>
      <div className="flex items-center space-x-4">
        {/* Wallet connection moved to Onboarding/Dashboard per requirements */}
      </div>
    </header>
  );
}
