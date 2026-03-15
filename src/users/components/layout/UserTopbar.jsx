import { Bell, Search, UserCircle2 } from 'lucide-react';

export default function UserTopbar({ title = 'Dashboard', searchPlaceholder = 'Search simulations...' }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#121f38] bg-[#050b17] px-4 md:px-6">
      <h1 className="text-lg font-semibold text-[#e7f0ff]">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="relative hidden w-[340px] max-w-[44vw] md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7182a5]" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded border border-[#1a2945] bg-[#060d1b] pl-9 pr-3 text-sm text-[#dce8ff] placeholder:text-[#6f7f9f] focus:border-[#18d3ff] focus:outline-none"
          />
        </div>

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded text-[#93a4c7] transition hover:bg-[#0d182c] hover:text-[#dce8ff]"
        >
          <Bell className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded text-[#93a4c7] transition hover:bg-[#0d182c] hover:text-[#dce8ff]"
        >
          <UserCircle2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
