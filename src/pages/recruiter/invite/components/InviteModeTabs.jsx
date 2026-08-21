import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/tabs.jsx';

const PILL_LIST = 'w-full justify-between gap-1 rounded-full border border-border-subtle bg-surface-muted p-1';
const PILL_TRIGGER =
  'flex-1 rounded-full px-4 py-2.5 text-[14px] font-medium text-text-primary opacity-60 data-[state=active]:border data-[state=active]:border-border-default data-[state=active]:bg-surface data-[state=active]:font-semibold data-[state=active]:opacity-100 data-[state=active]:shadow-none';

export function InviteModeTabs({ mode, onModeChange, children }) {
  return (
    <Tabs value={mode} onValueChange={onModeChange} className="mb-5 w-full">
      <TabsList className={PILL_LIST}>
        <TabsTrigger value="individual" className={PILL_TRIGGER}>Individual</TabsTrigger>
        <TabsTrigger value="bulk" className={PILL_TRIGGER}>Bulk paste</TabsTrigger>
        <TabsTrigger value="csv" className={PILL_TRIGGER}>Upload file</TabsTrigger>
        <TabsTrigger value="ats" disabled className={PILL_TRIGGER}>
          Connect ATS <span className="ml-1 text-[10px] text-text-muted">Soon</span>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}

export { TabsContent };
