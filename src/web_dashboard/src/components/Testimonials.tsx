export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-16 text-center">
          <div className="light-eyebrow mb-6">Operator fit</div>
          <h2 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            Shaped for teams that need automation without blind trust
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-9 text-[#2b2b2b]">
            Instead of invented endorsements, the product now says clearly who it is for and what each team can rely on.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="light-card p-10">
            <p className="reading-label">Stable users</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-900">OpenClaw and custom MCP operators</h3>
            <p className="mt-4 text-lg leading-9 text-[#242424]">
              Teams that already have an agent runtime and need a trustworthy settlement layer should start here: Base
              and Ethereum execution, HITL pauses, replay protection, and live telemetry.
            </p>
          </div>

          <div className="light-card p-10">
            <p className="reading-label">Beta and experimental users</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-900">Commerce and regional payment builders</h3>
            <p className="mt-4 text-lg leading-9 text-[#242424]">
              Teams exploring browser-assisted commerce or M-Pesa can build on UTG too, but those capabilities are
              intentionally labeled beta or experimental until the provider wiring and operator runbooks are fully in
              place.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
