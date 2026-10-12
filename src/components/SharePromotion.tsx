import { Share2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type SharePromotionProps = {
  kind: 'movie' | 'sports';
  sportsTone?: 'red' | 'cyan';
};

const SharePromotion = ({ kind, sportsTone = 'red' }: SharePromotionProps) => {
  const { toast } = useToast();
  const isSports = kind === 'sports';
  const isCyan = sportsTone === 'cyan';
  const shareTitle = isSports ? 'RabbitMeow — Don’t miss the moment' : 'RabbitMeow — Your next watch party';
  const shareText = isSports
    ? 'Don’t let your crew miss the moment. Join me for this match on RabbitMeow.'
    : 'Your next watch party starts here. Pick a movie with me on RabbitMeow.';

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
      ? { title: 'Link copied — pass it on!', description: 'Send it to your crew and make it a plan.' }
      : { title: 'Could not copy the link', description: 'Copy the page address from your browser and send it to your friends.' }
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
      aria-label="Share RabbitMeow with friends"
      className={`relative isolate overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur sm:p-5 md:p-6 ${cardClasses}`}
    >
      <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-3xl ${glowClasses}`} />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${highlightClasses}`}>
            <Users className="h-4 w-4" /> {isSports ? 'Make it a group-chat moment' : 'Good picks travel fast'}
          </p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-white sm:text-xl md:text-2xl">
            {isSports ? 'Don’t let your crew miss the moment.' : 'Your next watch party starts with a link.'}
          </h3>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-white/75 sm:text-sm">
            {isSports
              ? 'Send this match now. Celebrate every goal together.'
              : 'Found the one? Send it to your crew and make movie night happen.'}
          </p>
          {isSports && (
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="/movies" className={`rounded-lg px-3 py-2 text-xs font-black transition hover:bg-white ${isCyan ? 'bg-cyan-300 text-slate-950' : 'bg-red-300 text-slate-950'}`}>Explore Movies</a>
              <a href="/tv" className={`rounded-lg border px-3 py-2 text-xs font-black transition ${isCyan ? 'border-cyan-300/40 text-cyan-100 hover:bg-cyan-300/10' : 'border-red-300/40 text-red-100 hover:bg-red-300/10'}`}>Browse TV Shows</a>
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={handleShare}
          className={`w-full shrink-0 gap-2 rounded-xl font-bold text-white shadow-lg sm:w-auto ${buttonClasses}`}
        >
          <Share2 className="h-4 w-4" />
          <span className="sm:hidden">{isSports ? 'Send the match' : 'Share the pick'}</span>
          <span className="hidden sm:inline">{isSports ? 'Bring your crew' : 'Start a watch party'}</span>
        </Button>
      </div>
    </section>
  );
};

export default SharePromotion;
