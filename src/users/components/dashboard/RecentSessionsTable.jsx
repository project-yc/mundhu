import { History } from 'lucide-react';
import { formatDate, getSessionStatusClass } from '../../utils/formatters';

export default function RecentSessionsTable({ sessions }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 text-[#d9e6ff]">
        <History className="h-4 w-4 text-[#90a5cb]" />
        <h2 className="text-lg font-semibold">Recent Sessions</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#142340] bg-[#070f20]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#142340] bg-[#091327]">
              <tr>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.16em] text-[#7282a4]">SIMULATION NAME</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.16em] text-[#7282a4]">DOMAIN</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.16em] text-[#7282a4]">SIGNAL SCORE</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.16em] text-[#7282a4]">DATE</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.16em] text-[#7282a4]">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const scoreValue = session.signal_score === null ? '--' : session.signal_score;
                const isLowScore = typeof session.signal_score === 'number' && session.signal_score < 50;

                return (
                  <tr key={session.session_id} className="border-b border-[#121f38] text-[#d6e4ff] last:border-none">
                    <td className="px-4 py-3.5 text-[13px]">{session.simulation_name}</td>
                    <td className="px-4 py-3.5 text-[13px] text-[#8ca0c2]">{session.domain}</td>
                    <td
                      className={`px-4 py-3.5 text-[13px] font-semibold ${
                        scoreValue === '--' ? 'text-[#8ca0c2]' : isLowScore ? 'text-[#ff5f7e]' : 'text-[#1dd7ff]'
                      }`}
                    >
                      {scoreValue}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-[#8ca0c2]">{formatDate(session.date)}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] ${getSessionStatusClass(
                          session.status,
                        )}`}
                      >
                        {session.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
