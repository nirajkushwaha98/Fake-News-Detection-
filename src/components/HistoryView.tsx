import React from 'react';
import {
  History,
  Trash2,
  Download,
  Search,
  FileText,
  Image as ImageIcon,
  Mic,
  ExternalLink
} from 'lucide-react';
import { HistoryEntry } from '../types';

interface HistoryViewProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  onSelectEntry: (entry: HistoryEntry) => void;
  accessibilityMode: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onSelectEntry,
  accessibilityMode
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = history.filter(h =>
    h.claim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.assessment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `truthlens-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'image': return <ImageIcon className="w-4 h-4 text-cyan-400" />;
      case 'voice': return <Mic className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className={`space-y-6 ${accessibilityMode ? 'text-white' : 'text-slate-100'}`}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Local Verification History
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Persisted securely in local storage. Never uploaded to third-party ad trackers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                title="Export History as JSON"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                type="button"
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 text-xs font-semibold transition-colors"
                title="Clear all stored logs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past claims or assessments..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
          />
        </div>
      )}

      {/* Table / Cards */}
      {filtered.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          accessibilityMode ? 'bg-black border-cyan-400' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-300">No verification records found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No historical logs match your search query.'
              : 'Screen news text, images, or audio voice messages in the Screening Console to build your local audit log.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isHigh = item.riskLevel === 'HIGH';
            const isLow = item.riskLevel === 'LOW';

            const badgeColor = isLow
              ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
              : isHigh
              ? 'text-rose-400 bg-rose-950/60 border-rose-800'
              : 'text-amber-400 bg-amber-950/60 border-amber-800';

            return (
              <div
                key={item.id}
                onClick={() => onSelectEntry(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  accessibilityMode
                    ? 'bg-black border-cyan-400 hover:bg-slate-950'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-semibold uppercase">
                      {getModeIcon(item.inputType)}
                      {item.inputType}
                    </span>
                    <span>·</span>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="font-semibold text-sm sm:text-base text-slate-100 line-clamp-2">
                    &ldquo;{item.claim}&rdquo;
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-400">Risk Score</div>
                    <div className={`text-lg font-black ${
                      isLow ? 'text-emerald-400' : isHigh ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {item.riskScore}/100
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeColor}`}>
                    {item.assessment}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
