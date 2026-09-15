import { APIMatch } from '@/utils/sports-types';
import SportsMatchCard from './SportsMatchCard';
import { motion } from 'framer-motion';
import { ExternalLink, Radio } from 'lucide-react';

interface SportMatchGridProps { matches: APIMatch[]; title?: string; emptyMessage?: string; backupStreamHref?: string }

const SportsMatchGrid = ({ matches, title, emptyMessage = 'No matches found.', backupStreamHref }: SportMatchGridProps) => {
  if (!matches || matches.length === 0) return <motion.div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-500"><Radio className="h-5 w-5" /></span><p className="text-sm font-semibold text-slate-300">{emptyMessage}</p><p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">Try another sport or switch the fixture view to find a different event.</p>{backupStreamHref && <a href={backupStreamHref} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-200 transition hover:border-cyan-300/60"><span>Alternate stream: rmppv.xyz</span><ExternalLink className="h-3.5 w-3.5" /></a>}</motion.div>;
  return <div className="pt-1">{title && <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-slate-300">{title}</h2>}<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{matches.map((match, index) => <motion.div key={match.id} className="sports-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(index * 0.035, 0.3) }}><SportsMatchCard match={match} /></motion.div>)}</div>{backupStreamHref && <div className="mt-7 flex justify-center"><a href={backupStreamHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-cyan-300"><span>Alternate stream: rmppv.xyz</span><ExternalLink className="h-3.5 w-3.5" /></a></div>}</div>;
};

export default SportsMatchGrid;
