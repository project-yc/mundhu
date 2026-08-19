import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // No colored ring or outline on open/focus. `!outline-none` (important)
      // because src/index.css has a global `*:focus-visible { outline: 2px
      // solid var(--color-brand) }` rule — same specificity as a plain
      // `outline-none` utility and declared later in the stylesheet, so on
      // keyboard focus it was winning the cascade and drawing an orange ring
      // straight through the unqualified override. The only visible change on
      // interaction is the border darkening.
      'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border-default bg-surface px-3 py-2 text-[13px] text-text-primary shadow-sm !outline-none placeholder:text-text-muted focus:border-border-strong disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        // The popper itself is a Radix focus-scope root and can pick up the
        // same global focus-visible ring as the trigger/items.
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-border-default bg-surface !outline-none text-text-primary shadow-md data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut',
        position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pl-8 pr-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      // `data-[highlighted]` rather than `focus:` — Radix marks the
      // pointer/keyboard-active option with this attribute regardless of
      // whether real DOM focus lands on it, so `focus:` styling missed mouse
      // hover and left the browser's own (blue) default showing through.
      // Highlighted option is solid black with white text (design reference),
      // not a tinted hover — the selected-but-idle item just goes bold with
      // its checkmark, same as everywhere else in this file.
      // Same `!outline-none` reasoning as SelectTrigger — items get real
      // keyboard focus via Radix's roving tabindex, which would otherwise
      // pick up the global orange focus-visible ring.
      'relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-[13px] text-text-primary !outline-none data-[state=checked]:font-semibold data-[highlighted]:bg-black data-[highlighted]:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem };
