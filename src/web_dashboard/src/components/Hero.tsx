import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import welcomeVisual from '../assets/welcome-visual.svg';

interface HeroProps {
  onOpenAuth: () => void;
}

const slides = [
  {
    label: 'OSS self-hosted gateway',
    title: 'Connect OpenClaw, Claude, or a custom MCP client without surrendering wallet custody.',
    detail:
      'UTG is an open-source control layer between agent intent and value movement. Operators keep the approval boundary in their own environment while agents still get a clean execution surface.',
    metrics: ['MCP-first integration', 'Self-hosted operator control', 'Non-custodial by design'],
  },
  {
    label: 'Stable execution',
    title: 'Run Base and Ethereum transfers through one consistent HITL and idempotency path.',
    detail:
      'The stable path is deliberately narrow: Base and Ethereum execution, enforced approvals, dashboard telemetry, and retry-safe settlement logic that real operators can trust.',
    metrics: ['Base + Ethereum', 'HITL always enforced', 'Receipt-ready execution trail'],
  },
  {
    label: 'Truthful support tiers',
    title: 'Keep commerce in beta and M-Pesa experimental until the providers are actually wired.',
    detail:
      'UTG now tells the truth about what is stable, what needs a browser or provider adapter, and what should stay off until the runtime is fully provisioned.',
    metrics: ['Stable, beta, experimental', 'Provider-gated handover', 'No fake marketplace data'],
  },
];

export default function Hero({ onOpenAuth }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = useMemo(() => slides[activeSlide], [activeSlide]);

  return (
    <main
      id="overview"
      className="mx-auto flex w-full max-w-7xl flex-grow flex-col px-4 pb-24 pt-16 md:px-8 md:pt-20"
    >
      <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <div className="light-eyebrow mb-8">
            <Shield className="h-4 w-4 text-[#b68b38]" />
            Self-hosted settlement control for autonomous finance
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] text-slate-900 md:text-7xl xl:text-[5.4rem]">
            The Autonomous
            <br />
            <span className="bg-[linear-gradient(135deg,#4a3410_0%,#b7862f_38%,#e0b458_88%)] bg-clip-text text-transparent">
              Transaction Gateway
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-9 text-[#222222] md:text-[1.35rem]">
            Aima Protocol turns UTG into an MCP-first gateway for real operators: Base and Ethereum execution,
            human approval gates, live telemetry, and honest support tiers for everything that still needs extra wiring.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button onClick={onOpenAuth} className="light-button-primary px-8 py-4 text-base">
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <Link to="/docs" className="light-button-secondary px-8 py-4 text-sm font-mono">
              Read Docs
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="light-card p-5">
              <p className="reading-label">Approvals</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">HITL</p>
              <p className="mt-2 text-base leading-7 text-[#333333]">Threshold-driven signature enforcement and auditable interrupts.</p>
            </div>
            <div className="light-card p-5">
              <p className="reading-label">Security</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">Guardrails</p>
              <p className="mt-2 text-base leading-7 text-[#333333]">Deterministic replay protection, policy validation, and domain controls.</p>
            </div>
            <div className="light-card p-5">
              <p className="reading-label">Support</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">Tiered</p>
              <p className="mt-2 text-base leading-7 text-[#333333]">Stable Base and Ethereum flows, beta commerce adapters, and explicit experimental rails.</p>
            </div>
          </div>
        </div>

        <div className="light-panel relative overflow-hidden p-4 md:p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(207,169,93,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,250,240,0.3))]" />
          <div className="relative rounded-[28px] border border-[#eadfcf] bg-[#fffaf1] p-5">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="overflow-hidden rounded-[24px] border border-[#efe2cc] bg-white shadow-[0_28px_70px_rgba(110,82,28,0.12)]">
                <img
                  src={welcomeVisual}
                  alt="Aima Protocol network illustration"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-[26px] border border-[#eadfcf] bg-white/92 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="light-eyebrow">
                      <Sparkles className="h-4 w-4 text-[#b3842f]" />
                      Slide {activeSlide + 1}
                    </div>
                    <div className="flex gap-2">
                      {slides.map((slide, index) => (
                        <button
                          key={slide.label}
                          type="button"
                          onClick={() => setActiveSlide(index)}
                          className={`h-2.5 w-8 rounded-full transition ${
                            index === activeSlide ? 'bg-[#cfa95d]' : 'bg-[#eadfcf]'
                          }`}
                          aria-label={`Show ${slide.label}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="reading-label">
                    {currentSlide.label}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-900">
                    {currentSlide.title}
                  </h2>
                  <p className="mt-3 text-base leading-8 text-[#2f2f2f]">{currentSlide.detail}</p>
                </div>

                <div className="grid gap-3">
                  {currentSlide.metrics.map((metric, index) => (
                    <div key={metric} className="rounded-2xl border border-[#eadfcf] bg-[#fff7e7] px-4 py-3">
                      <div className="flex items-center justify-between gap-4 text-[15px] text-[#232323]">
                        <span>{metric}</span>
                        <span className="font-mono text-[#8c6319]">0{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-[#eadfcf] bg-white/92 p-4">
                  <p className="reading-label">Preview payload</p>
                  <div className="mt-3 grid gap-2 text-[15px] text-[#232323]">
                    <div className="flex items-center justify-between">
                      <span>Primary path</span>
                      <span className="font-mono text-[#8c6319]">MCP integration</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Payments rail</span>
                      <span className="font-mono text-[#8c6319]">Base + x402</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Execution scope</span>
                      <span className="font-mono text-[#8c6319]">Base + Ethereum</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
