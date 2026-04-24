export default function Testimonials() {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-4">Trusted by Web3 Innovators</h2>
          <p className="text-brand-muted max-w-xl mx-auto">See how the Aima UTG is accelerating the deployment of autonomous financial agents.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-amber-50 rounded-3xl p-10 border border-amber-100 shadow-sm relative">
            <div className="text-amber-500 mb-6">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
            </div>
            <p className="text-xl font-medium text-brand-dark mb-8 leading-relaxed">
              "We wanted to let our trading agents execute on Solana, but holding private keys in the backend was a massive liability. The UTG's Human-In-The-Loop firewall solved our legal and security nightmares overnight."
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center font-bold text-amber-700">SR</div>
              <div>
                <div className="font-bold text-brand-dark">Sarah R.</div>
                <div className="text-sm text-brand-muted">Lead Engineer, DeFi Automations</div>
              </div>
            </div>
          </div>

          <div className="bg-brand-cream rounded-3xl p-10 border border-brand-beige shadow-sm relative">
            <div className="text-brand-gold mb-6">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
            </div>
            <p className="text-xl font-medium text-brand-dark mb-8 leading-relaxed">
              "The dynamic Pay-As-You-Go spread is genius. I don't have to worry about fiat payment gateways or Stripe bans. The fee is settled natively on-chain when my agent executes."
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-brand-gold/30 rounded-full flex items-center justify-center font-bold text-yellow-800">JD</div>
              <div>
                <div className="font-bold text-brand-dark">James D.</div>
                <div className="text-sm text-brand-muted">Founder, OpenClaw</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
