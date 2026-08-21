export function InviteBanner({ children }) {
  if (!children) return null;
  return (
    <div className="mb-4 rounded-[12px] border border-warning-border bg-warning-bg px-[10px] py-[10px]">
      <p className="text-[14px] text-warning">{children}</p>
    </div>
  );
}
