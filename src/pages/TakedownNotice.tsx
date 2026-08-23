import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';

const TakedownNotice = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-red-950/20 text-foreground">
      <Navbar />

      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-16 sm:px-6">
        <section
          aria-labelledby="takedown-title"
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl"
        >
          <div className="h-1 bg-gradient-to-r from-red-500 via-rose-400 to-orange-400" />

          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 text-red-300">
              <ShieldCheck aria-hidden="true" className="h-8 w-8" />
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
              Copyright compliance notice
            </p>

            <h1 id="takedown-title" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Content unavailable
            </h1>

            <div className="mx-auto mt-6 max-w-xl space-y-4 text-base leading-7 text-white/75 sm:text-lg">
              <p>
                This site does not have the legal right to display this content, and it will not be made available on this site.
              </p>
              <p>
                We respect the rights of copyright owners and have therefore decided to take it down.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-xl rounded-xl border border-white/10 bg-black/20 px-5 py-4 text-sm leading-6 text-white/60">
              Thank you for your understanding as we work to respect copyright and remove content when appropriate.
            </div>

            <Button asChild className="mt-8 gap-2">
              <Link to="/">
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                Return to home
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TakedownNotice;

// This is intentionally a separate page from the existing /dmca notice page.
// It is used only for content that has been removed from this site.
  
