export default function UserPageLayout({ sidebar, topbar, children }) {
  return (
    <div className="h-screen overflow-hidden bg-[#040813] font-sans text-[#d8e4ff]">
      {sidebar}

      <div className="flex h-screen min-w-0 flex-col md:ml-[174px]">
        <div className="shrink-0">{topbar}</div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}