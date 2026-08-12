import { APIMatch } from '@/utils/sports-types';
import SportsMatchCard from './SportsMatchCard';
import { motion, Variants } from 'framer-motion';
import { ExternalLink, Zap } from 'lucide-react';

interface SportMatchGridProps {
  matches: APIMatch[];
  title?: string;
  emptyMessage?: string;
  backupStreamHref?: string;
}

const SportsMatchGrid = ({
  matches,
  title,
  emptyMessage = 'No matches found.',
  backupStreamHref,
}: SportMatchGridProps) => {
  if (!matches || matches.length === 0) {
    return (
      <motion.div
        className="py-24 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex max-w-xl flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-6 py-8 shadow-2xl backdrop-blur-sm">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className="mx-auto mb-4 h-12 w-12 text-white/50 drop-shadow-lg" />
          </motion.div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 drop-shadow-lg">{emptyMessage}</p>
          {backupStreamHref && (
            <a
              href={backupStreamHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-cyan-100 transition-all hover:border-cyan-200/80 hover:bg-cyan-400/20 hover:text-white"
            >
              No stream signal? Try rmppv.xyz
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </motion.div>
    );
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.5,
      },
    },
  };

  return (
    <div className="py-4">
      {title && (
        <motion.h2
          className="mb-8 flex items-center gap-2 border-b border-white/20 pb-3 text-sm font-black uppercase tracking-widest text-white drop-shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {title}
        </motion.h2>
      )}

      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {matches.map((match) => (
          <motion.div key={match.id} variants={item}>
            <SportsMatchCard match={match} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default SportsMatchGrid;
