import { useState, useEffect } from 'react';
import { Loader, MoreHorizontal } from 'lucide-react';
import { getDashboardActivity } from '../../../../api/recruiter/dashboard';

const TAG_COLORS = {
  create: '#5D6EF6',
  invite: '#FB7414',
  draft:  '#E02281',
};
const DEFAULT_TAG_COLOR = '#707F93';

const AVATAR_COLORS = ['#FFB320', '#FB8E2C', '#5D6EF6', '#E02281', '#359200'];

function avatarColorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
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
    <span className="inline-flex items-center gap-[3px]">
      <span className="w-3 h-3 rounded-lg flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[11px]" style={{ color }}>#{tag}</span>
    </span>
  );
}

function ActivityItem({ item, isLast }) {
  const userName = item.user?.name ?? 'Someone';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className={`flex gap-2 py-2.5 ${isLast ? '' : 'border-b'}`} style={{ borderColor: '#F7F7F7' }}>
      <span
        className="w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold text-white"
        style={{ backgroundColor: avatarColorFor(userName) }}
      >
        {initial}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] leading-[1.4]">
          <span className="text-black">{userName} </span>
          <span style={{ color: '#959595' }}>{item.action ?? 'updated'} </span>
          <span className="text-black">{item.description ?? ''}</span>
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[11px]" style={{ color: '#B0B0B0' }}>
            {formatActivityTime(item.created_at)}
          </span>
          {item.tag && <span style={{ color: '#B0B0B0' }}>•</span>}
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
