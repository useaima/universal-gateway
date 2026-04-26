export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 px-4 pt-4 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-defi-border bg-[rgba(13,17,23,0.78)] px-5 py-4 backdrop-blur-xl md:px-7">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Aima Logo" className="h-10 w-10 rounded-full border border-defi-border bg-white/5 p-1.5 object-contain" />
          <div>
            <span className="block text-lg font-semibold text-white md:text-xl">Aima Protocol</span>
            <span className="hidden text-[11px] font-mono uppercase tracking-[0.24em] text-defi-muted md:block">Universal Transaction Gateway</span>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-mono tracking-wide text-defi-muted lg:flex">
          <a href="#features" className="transition hover:text-white">Overview</a>
          <a href="#how-it-works" className="transition hover:text-white">Security</a>
          <a href="#developers" className="transition hover:text-white">Developers</a>
          <a href="/docs/index.html" className="transition hover:text-white">Documentation</a>
          <a href="#support" className="transition hover:text-defi-goldBright">Support</a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a href="/docs/index.html" className="button-secondary px-4 py-2 text-sm font-mono">
            Read Docs
          </a>
        </div>
      </div>
    </header>
  );
}
