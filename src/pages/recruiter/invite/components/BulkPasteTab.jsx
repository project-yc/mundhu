export function BulkPasteTab({ bulkText, onChange, onApply }) {
  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={bulkText}
        onChange={e => onChange(e.target.value)}
        rows={4}
        className="w-full resize-none rounded-[8px] border border-border-default bg-surface px-[10px] py-3 text-[14px] text-text-secondary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/25"
        placeholder={'· Alice Foo <alice@co.com>\n· Alice Foo, alice@co.com\n· alice@co.com'}
      />
      <button
        type="button"
        onClick={onApply}
        disabled={!bulkText.trim()}
        className="w-fit text-[14px] font-semibold text-[#3859ff] transition-colors hover:text-[#2d47cc] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Apply &amp; preview
      </button>
    </div>
  );
}
