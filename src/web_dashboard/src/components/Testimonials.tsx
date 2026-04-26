export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-16 text-center">
          <div className="light-eyebrow mb-6">Institutional trust</div>
          <h2 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            Built for teams that need both speed and control
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-500">
            The message stays practical: trust is earned through visibility, approvals, and reliable execution paths.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="light-card p-10">
            <div className="mb-6 text-[#b3842f]">
              <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <p className="mb-8 text-xl leading-9 text-slate-700">
              &quot;We needed our AI workflows to reach on-chain liquidity without turning the backend into a secret vault. UTG gave us a reviewable path instead of a blind one.&quot;
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e3d1b0] bg-[#fff4da] font-bold text-[#b3842f]">
                SR
              </div>
              <div>
                <div className="font-semibold text-slate-900">Sarah R.</div>
                <div className="text-sm text-slate-500">Lead Engineer, DeFi Automations</div>
              </div>
            </div>
          </div>

          <div className="light-card p-10">
            <div className="mb-6 text-amber-600">
              <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <p className="mb-8 text-xl leading-9 text-slate-700">
              &quot;What changed for us was the continuity. Identity, verification, onboarding, and transaction visibility now feel like one deliberate experience instead of stitched-together steps.&quot;
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-amber-50 font-bold text-amber-700">
                JD
              </div>
              <div>
                <div className="font-semibold text-slate-900">James D.</div>
                <div className="text-sm text-slate-500">Founder, OpenClaw</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
