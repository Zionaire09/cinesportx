import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Sparkles, Film, Tv, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface WelcomeDialogProps {
  onClose: () => void;
  isOpen: boolean;
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ onClose, isOpen }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isOpen, hasAnimated]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Dialog */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              className="relative w-full max-w-md bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 rounded-3xl shadow-2xl border border-red-500/20 overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 opacity-40">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-700/20 rounded-full blur-3xl" />
              </div>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                <X className="h-5 w-5 text-white" />
              </motion.button>

              {/* Content */}
              <div className="relative z-10 px-8 py-10 text-center">
                {/* Logo */}
                <motion.div
                  variants={logoVariants}
                  className="mb-6 flex justify-center"
                >
                  <motion.div
                    variants={pulseVariants}
                    animate="animate"
                    className="relative"
                  >
                    <img
                      src="/logo.png"
                      alt="MSportsX"
                      className="h-28 w-28 object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    />
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-rose-500/0 rounded-full blur-2xl" />
                  </motion.div>
                </motion.div>

                {/* Title */}
                <motion.div variants={itemVariants} className="mb-4">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-red-400 via-rose-500 to-red-600 bg-clip-text text-transparent mb-2">
                    Welcome to MSportsX
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-red-400/80">
                    <Sparkles className="h-3 w-3" />
                    <span>Premium Entertainment</span>
                    <Sparkles className="h-3 w-3" />
                  </div>
                </motion.div>

                {/* Description */}
                <motion.div
                  variants={itemVariants}
                  className="text-white/70 text-sm leading-relaxed mb-8 space-y-2"
                >
                  <p>
                    Experience ultimate streaming with <span className="text-red-400 font-semibold text-base">16 working servers</span> for your favorite Movies and TV Shows.
                  </p>
                  <p className="text-white/60">
                    Stay ahead with <span className="text-rose-400 font-medium">regularly updated live sports</span> events from around the globe.
                  </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-3 gap-3 mb-8"
                >
                  {[
                    { icon: <Film className="h-6 w-6" />, label: 'Movies', path: '/movie', color: 'text-red-400' },
                    { icon: <Tv className="h-6 w-6" />, label: 'TV Shows', path: '/tv', color: 'text-rose-400' },
                    { icon: <Trophy className="h-6 w-6" />, label: 'Sports', path: '/sports', color: 'text-orange-400' },
                  ].map((feature, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigation(feature.path)}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-300 group"
                    >
                      <div className={`mb-2 flex justify-center ${feature.color} group-hover:scale-110 transition-transform`}>
                        {feature.icon}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-tight text-white/70 group-hover:text-white transition-colors">
                        {feature.label}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={onClose}
                      className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-6 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-red-900/20 border border-red-400/20"
                    >
                      <Play className="h-5 w-5 fill-current" />
                      Start Watching
                    </Button>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full py-3 rounded-xl text-white/40 hover:text-white/60 text-xs font-medium transition-all duration-300"
                  >
                    Dismiss for now
                  </motion.button>
                </motion.div>
              </div>

              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-red-500/10 rounded-br-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-red-500/10 rounded-tl-3xl pointer-events-none" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WelcomeDialog;
