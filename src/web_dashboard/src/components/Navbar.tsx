import { Link } from 'react-router-dom';

interface NavbarProps {
  onStart: () => void;
}

export default function Navbar({ onStart }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 px-4 pt-4 md:px-8">
      <div className="light-nav mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-7">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Aima Logo" className="h-10 w-10 rounded-full border border-[#eadfcf] bg-white/80 p-1.5 object-contain" />
          <div>
            <span className="block text-lg font-semibold text-slate-900 md:text-xl">Aima Protocol</span>
            <span className="hidden text-[12px] font-mono uppercase tracking-[0.22em] text-[#6f4e17] md:block">
              Universal Transaction Gateway
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-mono tracking-wide text-[#2d2d2d] lg:flex">
          <a href="#overview" className="transition hover:text-black">Overview</a>
          <a href="#how-it-works" className="transition hover:text-black">Flow</a>
          <a href="#features" className="transition hover:text-black">Capabilities</a>
          <a href="#protocol-media" className="transition hover:text-black">Media</a>
          <Link to="/docs" className="transition hover:text-black">Documentation</Link>
          <a href="#support" className="transition hover:text-[#7c5512]">Support</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/docs" className="light-button-secondary px-4 py-2 text-sm font-mono">
            Read Docs
          </Link>
          <button type="button" onClick={onStart} className="light-button-primary px-4 py-2 text-sm">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
