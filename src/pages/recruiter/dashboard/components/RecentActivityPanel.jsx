import { useState, useEffect } from 'react';
import { Loader, MoreHorizontal } from 'lucide-react';
import { getDashboardActivity } from '../../../../api/recruiter/dashboard';

const TAG_COLORS = {
  create: '#5D6EF6',
  invite: '#FB7414',
  draft:  '#E02281',
};
const DEFAULT_TAG_COLOR = '#707F93';

// [from, to] gradient stops per avatar — same hues as AVATAR_COLORS used to be,
// just with a paired shade so the avatar reads as a soft badge, not a flat dot.
const AVATAR_GRADIENTS = [
  ['#FFC24D', '#FF9800'],
  ['#FDA85C', '#F0730F'],
  ['#7C89FF', '#4453E8'],
  ['#F0479E', '#C41368'],
  ['#5FBF3A', '#28810A'],
];

function avatarGradientFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function initialsFor(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatActivityTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const now = new Date();

  const isToday = d.toDateString() === now.toDateString();
  const yesterdayD = new Date(now);
  yesterdayD.setDate(yesterdayD.getDate() - 1);
  const isYesterday = d.toDateString() === yesterdayD.toDateString();

  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (isToday) return `Today · ${timeStr}`;
  if (isYesterday) return `Yesterday · ${timeStr}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + timeStr;
}

function TagBadge({ tag }) {
  if (!tag) return null;
  const color = TAG_COLORS[tag.toLowerCase()] ?? DEFAULT_TAG_COLOR;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-semibold capitalize"
      style={{ backgroundColor: `${color}1F`, color }}
    >
      {tag}
    </span>
  );
}

function ActivityItem({ item, isLast }) {
  const userName = item.user?.name ?? 'Someone';
  const [from, to] = avatarGradientFor(userName);

  return (
    <div className={`flex gap-2 py-2.5 ${isLast ? '' : 'border-b'}`} style={{ borderColor: '#F7F7F7' }}>
      <span
        className="w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white ring-2 ring-white shadow-sm"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {initialsFor(userName)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] leading-[1.4]">
          <span className="text-black">{userName} </span>
          <span style={{ color: '#959595' }}>{item.action ?? 'updated'} </span>
          <span className="text-black">{item.description ?? ''}</span>
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-[11px]" style={{ color: '#B0B0B0' }}>
            {formatActivityTime(item.created_at)}
          </span>
          {item.tag && <span style={{ color: '#D8D8D8' }}>•</span>}
          <TagBadge tag={item.tag} />
        </div>
      </div>
    </div>
  );
}

export default function RecentActivityPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardActivity({ page: 1, pageSize: 4 })
      .then(res => {
        const list = res?.data?.items ?? res?.items ?? [];
        setItems(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full h-full rounded-2xl border p-3 flex flex-col gap-1.5" style={{ backgroundColor: '#FAFAFA', borderColor: '#EDEDED' }}>
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-[14px] font-medium text-black" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
          Recent activity
        </h2>
        <MoreHorizontal className="w-5 h-5 text-text-muted flex-shrink-0" strokeWidth={1.8} />
      </div>

      <div className="flex-1 min-h-0 bg-white border rounded-2xl overflow-y-auto px-3" style={{ borderColor: '#F1F1F1' }}>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader
              className="w-4 h-4 animate-spin"
              style={{ color: 'var(--color-assessment-accent)' }}
            />
          </div>
        ) : items.length === 0 ? (
          <p className="text-[12px] text-text-muted text-center py-10">No activity yet.</p>
        ) : (
          <div>
            {items.map((item, i) => (
              <ActivityItem key={item.id} item={item} isLast={i === items.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
