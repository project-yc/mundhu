import { Loader, Send } from 'lucide-react';
import { Button } from '../../../../components/ui/button.jsx';

export function InviteActionRow({ onSend, onClear, sending, disabled, validCount, showClear }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        onClick={onSend}
        disabled={disabled || sending}
        className="bg-brand text-white hover:bg-brand-hover"
      >
        {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {sending ? 'Sending…' : 'Send invites'}
        {!sending && validCount > 0 ? ` (${validCount})` : ''}
      </Button>
      {showClear && (
        <Button type="button" variant="secondary" onClick={onClear}>
          Clear all
        </Button>
      )}
    </div>
  );
}
