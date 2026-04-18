import { Activity } from 'lucide-react';

export default function SignalScoreCard({ signalScore }) {
  const score = signalScore?.score ?? '--';
  const outOf = signalScore?.out_of ?? 100;
  const basedOn = signalScore?.based_on_last_n_simulations ?? 0;

  return (
    <section className="rounded-xl border border-[#13233f] bg-[#070f20] px-5 py-6 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.18em] text-[#7a8aa8]">ENGINEERING SIGNAL SCORE</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[56px] font-bold leading-none tracking-[-0.03em] text-[#edf4ff]">{score}</span>
            <span className="text-[33px] font-medium text-[#7e8eaf]">/{outOf}</span>
          </div>
          <p className="mt-2 text-[15px] text-[#5e6f90]">"Based on your last {basedOn} simulations"</p>
        </div>

        <div className="mr-2 flex h-[94px] w-[94px] items-center justify-center rounded-full border-[5px] border-[#18d3ff]">
          <Activity className="h-8 w-8 text-[#18d3ff]" />
        </div>
      </div>
    </section>
  );
}
