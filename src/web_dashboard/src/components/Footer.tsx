import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="support" className="py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="light-panel p-10 text-center">
          <h3 className="text-3xl font-semibold text-slate-900">Stay close to the protocol</h3>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-500">
            Support, partnership, and developer conversations should feel like part of the same polished product surface.
          </p>

          <div className="mb-10 mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/docs" className="light-button-secondary min-w-32">
              Documentation
            </Link>
            <a href="/docs/skill.md" target="_blank" rel="noopener noreferrer" className="light-button-secondary min-w-32">
              skill.md
            </a>
            <a href="https://github.com/useaima/universal-gateway" target="_blank" rel="noopener noreferrer" className="light-button-secondary min-w-32">
              GitHub
            </a>
            <a href="https://youtube.com/@aima" target="_blank" rel="noopener noreferrer" className="light-button-secondary min-w-32">
              YouTube
            </a>
            <a href="https://linkedin.com/in/alvinsmukabane" target="_blank" rel="noopener noreferrer" className="light-button-secondary min-w-32">
              LinkedIn
            </a>
          </div>

          <p className="text-sm font-medium text-slate-500">© 2026 Aima Protocol. Built for the future of agentic commerce.</p>
        </div>
      </div>
    </footer>
  );
}
