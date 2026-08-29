export interface SportColor {
  bg: string;
  border: string;
  text: string;
  glow: string;
  gradient: string;
}

export const sportColors: { [key: string]: SportColor } = {
  all: {
    bg: 'from-violet-600 to-fuchsia-500',
    border: 'border-violet-300',
    text: 'text-violet-100',
    glow: 'rgba(168, 85, 247, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(124, 58, 237), rgb(217, 70, 239))'
  },
  football: {
    bg: 'from-emerald-700 to-green-500',
    border: 'border-emerald-300',
    text: 'text-emerald-100',
    glow: 'rgba(16, 185, 129, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(4, 120, 87), rgb(34, 197, 94))'
  },
  soccer: {
    bg: 'from-lime-600 to-teal-500',
    border: 'border-lime-300',
    text: 'text-lime-100',
    glow: 'rgba(132, 204, 22, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(101, 163, 13), rgb(20, 184, 166))'
  },
  basketball: {
    bg: 'from-orange-700 to-amber-500',
    border: 'border-orange-300',
    text: 'text-orange-100',
    glow: 'rgba(249, 115, 22, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(194, 65, 12), rgb(245, 158, 11))'
  },
  tennis: {
    bg: 'from-yellow-500 to-green-400',
    border: 'border-yellow-200',
    text: 'text-yellow-50',
    glow: 'rgba(234, 179, 8, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(234, 179, 8), rgb(74, 222, 128))'
  },
  cricket: {
    bg: 'from-fuchsia-700 to-purple-500',
    border: 'border-fuchsia-300',
    text: 'text-fuchsia-100',
    glow: 'rgba(217, 70, 239, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(162, 28, 175), rgb(168, 85, 247))'
  },
  hockey: {
    bg: 'from-red-700 to-rose-500',
    border: 'border-red-300',
    text: 'text-red-100',
    glow: 'rgba(244, 63, 94, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(185, 28, 28), rgb(244, 63, 94))'
  },
  volleyball: {
    bg: 'from-pink-700 to-rose-400',
    border: 'border-pink-300',
    text: 'text-pink-100',
    glow: 'rgba(236, 72, 153, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(190, 24, 93), rgb(251, 113, 133))'
  },
  baseball: {
    bg: 'from-sky-700 to-cyan-500',
    border: 'border-sky-300',
    text: 'text-sky-100',
    glow: 'rgba(14, 165, 233, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(3, 105, 161), rgb(6, 182, 212))'
  },
  fighting: {
    bg: 'from-slate-800 to-zinc-600',
    border: 'border-slate-300',
    text: 'text-slate-100',
    glow: 'rgba(148, 163, 184, 0.4)',
    gradient: 'linear-gradient(135deg, rgb(30, 41, 59), rgb(82, 82, 91))'
  },
  motorsport: {
    bg: 'from-black to-yellow-700',
    border: 'border-yellow-500',
    text: 'text-yellow-100',
    glow: 'rgba(234, 179, 8, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(24, 24, 27), rgb(161, 98, 7))'
  },
  'american-football': {
    bg: 'from-red-900 to-amber-600',
    border: 'border-amber-300',
    text: 'text-amber-100',
    glow: 'rgba(245, 158, 11, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(127, 29, 29), rgb(217, 119, 6))'
  },
  'motor-sports': {
    bg: 'from-black to-yellow-700',
    border: 'border-yellow-500',
    text: 'text-yellow-100',
    glow: 'rgba(234, 179, 8, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(24, 24, 27), rgb(161, 98, 7))'
  },
  fight: {
    bg: 'from-zinc-900 to-red-700',
    border: 'border-red-300',
    text: 'text-red-100',
    glow: 'rgba(220, 38, 38, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(24, 24, 27), rgb(185, 28, 28))'
  },
  rugby: {
    bg: 'from-teal-800 to-cyan-500',
    border: 'border-teal-300',
    text: 'text-teal-100',
    glow: 'rgba(20, 184, 166, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(17, 94, 89), rgb(6, 182, 212))'
  },
  golf: {
    bg: 'from-stone-700 to-lime-600',
    border: 'border-lime-300',
    text: 'text-lime-100',
    glow: 'rgba(132, 204, 22, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(68, 64, 60), rgb(101, 163, 13))'
  },
  billiards: {
    bg: 'from-emerald-900 to-teal-500',
    border: 'border-emerald-300',
    text: 'text-emerald-100',
    glow: 'rgba(5, 150, 105, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(6, 78, 59), rgb(20, 184, 166))'
  },
  afl: {
    bg: 'from-pink-800 to-orange-500',
    border: 'border-pink-300',
    text: 'text-pink-100',
    glow: 'rgba(236, 72, 153, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(157, 23, 77), rgb(249, 115, 22))'
  },
  darts: {
    bg: 'from-slate-700 to-orange-500',
    border: 'border-orange-300',
    text: 'text-orange-100',
    glow: 'rgba(249, 115, 22, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(51, 65, 85), rgb(249, 115, 22))'
  },
  ufc: {
    bg: 'from-zinc-900 to-red-700',
    border: 'border-red-300',
    text: 'text-red-100',
    glow: 'rgba(220, 38, 38, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(24, 24, 27), rgb(185, 28, 28))'
  },
  boxing: {
    bg: 'from-zinc-900 to-red-700',
    border: 'border-red-300',
    text: 'text-red-100',
    glow: 'rgba(220, 38, 38, 0.45)',
    gradient: 'linear-gradient(135deg, rgb(24, 24, 27), rgb(185, 28, 28))'
  },
  other: {
    bg: 'from-stone-700 to-neutral-500',
    border: 'border-stone-300',
    text: 'text-stone-100',
    glow: 'rgba(168, 162, 158, 0.4)',
    gradient: 'linear-gradient(135deg, rgb(68, 64, 60), rgb(115, 115, 115))'
  },
};

export const getColorForSport = (sportId: string): SportColor => {
  const normalizedId = sportId?.toLowerCase().trim().replace(/[\s_]+/g, '-');
  const aliases: Record<string, string> = {
    motorsport: 'motor-sports',
    motor: 'motor-sports',
    ufc: 'fight',
    boxing: 'fight',
    mma: 'fight',
    americanfootball: 'american-football',
  };
  const resolvedId = aliases[normalizedId] || normalizedId;
  return sportColors[resolvedId] || sportColors.other;
};
