export default function Footer() {
  return (
    <footer id="support" className="w-full py-16 border-t border-brand-beige text-center bg-brand-cream">
      <div className="max-w-4xl mx-auto px-8">
        <h3 className="text-2xl font-bold mb-6">Connect with Aima</h3>
        <p className="text-brand-muted mb-8">For support, partnership inquiries, or developer questions, reach out on our official channels.</p>
        
        <div className="flex justify-center space-x-6 mb-12">
          <a href="https://youtube.com/@aima" target="_blank" rel="noopener noreferrer" className="p-3 glass-panel hover:bg-brand-gold hover:text-white transition-colors flex items-center justify-center font-bold">
            YouTube
          </a>
          <a href="https://instagram.com/aima.ai123" target="_blank" rel="noopener noreferrer" className="p-3 glass-panel hover:bg-brand-gold hover:text-white transition-colors flex items-center justify-center font-bold">
            Instagram
          </a>
          <a href="https://linkedin.com/in/alvinsmukabane" target="_blank" rel="noopener noreferrer" className="p-3 glass-panel hover:bg-brand-gold hover:text-white transition-colors flex items-center justify-center font-bold">
            LinkedIn
          </a>
          <a href="https://facebook.com/techtrends" target="_blank" rel="noopener noreferrer" className="p-3 glass-panel hover:bg-brand-gold hover:text-white transition-colors flex items-center justify-center font-bold">
            Facebook
          </a>
          <a href="https://reddit.com/r/aima58" target="_blank" rel="noopener noreferrer" className="p-3 glass-panel hover:bg-brand-gold hover:text-white transition-colors flex items-center justify-center font-bold text-xl group">
            <span className="text-brand-dark group-hover:text-white">r/aima58</span>
          </a>
        </div>
        
        <p className="text-sm font-semibold text-brand-muted">© 2026 Engineering at Aima. All rights reserved.</p>
      </div>
    </footer>
  );
}
