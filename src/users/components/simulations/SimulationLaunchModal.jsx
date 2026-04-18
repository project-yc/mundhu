import { AlertTriangle, ArrowRight, Info, Loader2, X } from 'lucide-react';

const SIGNALS_TRACKED = ['Code Quality', 'Debug Discipline', 'AI Collaboration', 'Edge Case Coverage'];

function Pill({ children, className }) {
  return (
    <span className={`inline-flex rounded-md border px-3 py-1 text-[11px] font-semibold tracking-[0.12em] ${className}`}>
      {children}
    </span>
  );
}

export default function SimulationLaunchModal({
  open,
  simulation,
  loading,
  detailError,
  launchError,
  isLaunching,
  onClose,
  onRetryDetail,
  onLaunch,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030814]/70 p-4 backdrop-blur-[3px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[900px] overflow-hidden rounded-2xl border border-[#1a2946] bg-[#040914] shadow-[0_34px_120px_rgba(2,6,18,0.78)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Simulation launch modal"
      >
        <div className="border-b border-[#0e1c34] px-8 py-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-8 w-80 animate-pulse rounded bg-[#0d1b33]" />
                  <div className="h-5 w-72 animate-pulse rounded bg-[#0b1730]" />
                </div>
              ) : (
                <>
                  <h2 className="truncate text-3xl font-semibold tracking-tight text-[#e8f0ff] md:text-4xl">{simulation?.name || 'Simulation'}</h2>
                  <p className="mt-1 text-base text-[#8ca2ca]">{simulation?.description || 'Resolve production-grade issues under real engineering constraints.'}</p>
                </>
              )}
            </div>

            {!loading && (
              <div className="flex shrink-0 items-center gap-2">
                <Pill className="border-[#23395f] bg-[#0b162b] text-[#94a8cd]">{simulation?.domain || 'INFRA'}</Pill>
                <Pill className="border-[#23395f] bg-[#0b162b] text-[#94a8cd]">{(simulation?.difficulty || 'Mid').toUpperCase()}</Pill>
              </div>
            )}
          </div>

        </div>

        <div className="grid gap-8 px-8 py-8 text-[#c4d4f2] md:grid-cols-2">
          <section>
            <h3 className="text-[12px] font-semibold tracking-[0.18em] text-[#6e84ae]">SIMULATION DETAILS</h3>
            {loading ? (
              <div className="mt-5 space-y-3">
                <div className="h-4 w-44 animate-pulse rounded bg-[#0b1730]" />
                <div className="h-7 w-24 animate-pulse rounded bg-[#0d1b33]" />
                <div className="h-4 w-40 animate-pulse rounded bg-[#0b1730]" />
                <div className="h-7 w-56 animate-pulse rounded bg-[#0d1b33]" />
              </div>
            ) : (
              <div className="mt-5 space-y-6">
                <div>
                  <p className="text-sm text-[#8096bf]">Estimated Time</p>
                  <p className="mt-1 text-3xl text-[#f0f6ff]">{simulation?.duration_minutes ? `${simulation.duration_minutes} min` : '--'}</p>
                </div>
                <div>
                  <p className="text-sm text-[#8096bf]">Assessment Id</p>
                  <p className="mt-1 break-all font-mono text-xl text-[#e4edff] md:text-2xl">{simulation?.id || '--'}</p>
                </div>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-[12px] font-semibold tracking-[0.18em] text-[#6e84ae]">SIGNALS TRACKED</h3>
            <ul className="mt-5 space-y-4">
              {SIGNALS_TRACKED.map((signal) => (
                <li key={signal} className="flex items-center gap-3 text-2xl text-[#d7e6ff] md:text-[28px]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0dd5ff] shadow-[0_0_10px_rgba(16,213,255,0.85)]" />
                  {signal}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {(detailError || launchError) && (
          <div className="mx-8 mb-4 rounded-lg border border-[#5f2134] bg-[#1a0e16] px-4 py-3 text-sm text-[#ff9cb2]">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <div>
                <p className="font-semibold">Unable to continue</p>
                <p className="mt-1 text-[#f7bfd0]">{detailError || launchError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mx-8 mb-3 rounded-xl border border-[#163159] bg-[#071022] px-5 py-4 text-sm text-[#90a5ca]">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 text-[#7f95bd]" />
            <p>
              Your coding environment will open in a new browser tab. All engineering signals are tracked
              automatically through the integrated telemetry pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-[radial-gradient(95%_140%_at_50%_0%,rgba(44,63,99,0.36)_0%,rgba(6,11,21,0.9)_58%,rgba(6,11,21,1)_100%)] px-8 py-7">
          <button
            type="button"
            onClick={detailError ? onRetryDetail : onClose}
            className="rounded-lg border border-transparent px-3 py-2 text-base text-[#95a8cc] transition hover:border-[#294166] hover:text-[#d2e3ff]"
          >
            {detailError ? 'Try Again' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={onLaunch}
            disabled={loading || !!detailError || isLaunching}
            className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-xl bg-[#10c6e8] px-6 py-3 text-lg font-semibold text-[#041425] shadow-[0_0_18px_rgba(16,198,232,0.42)] transition hover:bg-[#18d8fb] disabled:cursor-not-allowed disabled:bg-[#2c3a53] disabled:text-[#8ea2c8]"
          >
            {isLaunching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Launching...
              </>
            ) : (
              <>
                Launch Workspace
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md border border-[#1d3050] bg-[#061024] p-2 text-[#8aa0c8] transition hover:border-[#2f4a74] hover:text-[#d7e7ff]"
          aria-label="Close simulation modal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}