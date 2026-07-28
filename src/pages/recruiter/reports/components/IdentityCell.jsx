import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../../components/ui/avatar';
import { getInitials } from '../utils/reportRows';

/**
 * Avatar + name + email. Figma: 32px avatar, 8px gap, 18px line boxes.
 * Shared with the detailed report screen.
 */
export function IdentityCell({ name, email, avatarUrl }) {
  const displayName = name || 'Unknown';

  return (
    <div className="flex min-w-0 items-center gap-[8px]">
      <Avatar className="h-[32px] w-[32px]">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-[14px] font-bold leading-[18px] text-text-primary">
          {displayName}
        </p>
        <p className="truncate text-[12px] leading-[18px] text-[var(--color-report-email-text)]">
          {email || '-'}
        </p>
      </div>
    </div>
  );
}
