import { Toaster as Sonner } from 'sonner';

function Toaster(props) {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast bg-surface text-text-primary border border-border-default shadow-modal rounded-[8px] text-[13px]',
          description: 'text-text-secondary',
          actionButton: 'bg-brand text-on-brand',
          cancelButton: 'bg-surface-muted text-text-secondary',
          error: 'border-error-border bg-error-bg text-error',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
