import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const buildTitle = (title, moment) => {
  if (title) {
    return title;
  }

  if (!moment) {
    return 'Growth Edge';
  }

  return moment.length > 40 ? `${moment.slice(0, 40)}...` : moment;
};

export default function GrowthEdgeCard({ title, moment, alternative, why }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-xl border border-[#1e2130] bg-[#13151f]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <p className="text-sm font-medium text-white">{buildTitle(title, moment)}</p>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-[#1e2130] px-5 py-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">The Moment</p>
              <p className="text-sm text-gray-400">{moment || 'No moment provided.'}</p>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                What A Stronger Engineer Would Do
              </p>
              <p className="text-sm text-gray-400">{alternative || 'No alternative provided.'}</p>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Why It Matters</p>
              <p className="text-sm text-gray-400">{why || 'No rationale provided.'}</p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}