import { Share2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type SharePromotionProps = {
  kind: 'player' | 'sports';
  sportsTone?: 'red' | 'cyan';
};

const SharePromotion = ({ kind, sportsTone = 'red' }: SharePromotionProps) => {
  const { toast } = useToast();
  const isSports = kind === 'sports';
  const isCyan = sportsTone === 'cyan';
  const shareTitle = isSports ? 'Share this sports stream on CineSportX' : 'Help CineSportX grow';
  const shareText = isSports
    ? 'Share this sports stream with friends and help the developer keep CineSportX growing.'
    : 'Enjoying CineSportX? Share this link with a friend to help the developer keep building.';

  const copyCurrentPage = async () => {
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        copied = true;
      }
    } catch {
      // Fall back to the legacy copy command when clipboard access is unavailable.
    }

    if (!copied) {
      const input = document.createElement('textarea');
      input.value = window.location.href;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      try {
        copied = document.execCommand('copy');
      } finally {
        input.remove();
      }
    }

    toast(copied
      ? { title: 'Link copied — thanks for helping!', description: 'Send it to a friend to support the developer.' }
      : { title: 'Could not copy the link', description: 'Copy the page address from your browser and share it with a friend.' }
    );
  };

  const handleShare = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: window.location.href });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }

    await copyCurrentPage();
  };

  const cardClasses = isSports
    ? isCyan
      ? 'border-cyan-400/25 bg-gradient-to-r from-cyan-500/[0.16] via-white/[0.04] to-blue-500/[0.12]'
      : 'border-red-300/25 bg-gradient-to-r from-red-500/[0.16] via-white/[0.04] to-blue-500/[0.12]'
    : 'border-accent/25 bg-gradient-to-r from-accent/[0.16] via-white/[0.04] to-accent/[0.08]';
  const highlightClasses = isSports ? (isCyan ? 'text-cyan-200' : 'text-red-200') : 'text-accent/90';
  const glowClasses = isSports ? (isCyan ? 'bg-cyan-400/15' : 'bg-red-400/15') : 'bg-accent/15';
  const buttonClasses = isSports
    ? isCyan
      ? 'bg-cyan-500 hover:bg-cyan-400'
      : 'bg-red-500 hover:bg-red-400'
    : 'bg-accent hover:bg-accent/90';

  return (
    <section
      aria-label="Share this CineSportX link to help the developer"
      className={`relative isolate overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur sm:p-5 md:p-6 ${cardClasses}`}
    >
      <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-3xl ${glowClasses}`} />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${highlightClasses}`}>
            <Users className="h-4 w-4" /> {isSports ? 'Pass along the sports stream' : 'Support the developer'}
          </p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-white sm:text-xl md:text-2xl">
            {isSports ? 'Share this sports stream with friends.' : 'Enjoying CineSportX? Share the link.'}
          </h3>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-white/75 sm:text-sm">
            {isSports
              ? 'Pass the stream link along and help the developer keep CineSportX growing.'
              : 'Send this page to a friend—every share helps the developer keep CineSportX growing.'}
          </p>
        </div>
        <Button
          type="button"
          onClick={handleShare}
          className={`w-full shrink-0 gap-2 rounded-xl font-bold text-white shadow-lg sm:w-auto ${buttonClasses}`}
        >
          <Share2 className="h-4 w-4" />
          <span className="sm:hidden">{isSports ? 'Share stream' : 'Share the link'}</span>
          <span className="hidden sm:inline">{isSports ? 'Share with friends' : 'Help the developer'}</span>
        </Button>
      </div>
    </section>
  );
};

export default SharePromotion;
