export default function Testimonials() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-16 text-center">
          <div className="eyebrow mb-6">Social proof</div>
          <h2 className="text-4xl font-semibold text-white md:text-5xl">Trusted by teams building real agentic finance</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-defi-muted">
            The message stays practical: trust comes from transparency, not spectacle.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="section-panel p-10">
            <div className="mb-6 text-defi-goldBright">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
            </div>
            <p className="mb-8 text-xl leading-9 text-defi-cream">
              "We wanted to let our trading agents execute on Solana, but holding private keys in the backend was a massive liability. The UTG's Human-In-The-Loop firewall solved our legal and security nightmares overnight."
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-defi-gold/30 bg-defi-gold/10 font-bold text-defi-goldBright">SR</div>
              <div>
                <div className="font-semibold text-white">Sarah R.</div>
                <div className="text-sm text-defi-muted">Lead Engineer, DeFi Automations</div>
              </div>
            </div>
          </div>

          <div className="section-panel p-10">
            <div className="mb-6 text-defi-amber">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
            </div>
            <p className="mb-8 text-xl leading-9 text-defi-cream">
              "The dynamic Pay-As-You-Go spread is genius. I don't have to worry about fiat payment gateways or Stripe bans. The fee is settled natively on-chain when my agent executes."
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-defi-amber/30 bg-defi-amber/10 font-bold text-defi-amber">JD</div>
              <div>
                <div className="font-semibold text-white">James D.</div>
                <div className="text-sm text-defi-muted">Founder, OpenClaw</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
