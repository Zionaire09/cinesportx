import React, { useEffect, useRef } from 'react';

const SportsBanner = ({ className = 'mb-8' }: { className?: string }) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;

    const adWindow = window as Window & {
      atOptions?: {
        key: string;
        format: string;
        height: number;
        width: number;
        params: Record<string, unknown>;
      };
    };

    adWindow.atOptions = {
      key: '0094e8b6ab0ae7b1c688593cbd0fcfe7',
      format: 'iframe',
      height: 90,
      width: 728,
      params: {},
    };

    const script = document.createElement('script');
    script.src = 'https://www.highrevenueformat.com/0094e8b6ab0ae7b1c688593cbd0fcfe7/invoke.js';
    script.async = true;
    banner.appendChild(script);

    return () => {
      script.remove();
      delete adWindow.atOptions;
    };
  }, []);

  return (
    <div className={`${className} flex justify-center px-1`} aria-label="Advertisement">
      <div ref={bannerRef} className="sports-banner h-[90px] w-full max-w-[728px] overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-lg">
        <style>{`.sports-banner iframe { display: block; max-width: 100%; border: 0; }`}</style>
      </div>
    </div>
  );
};

export default SportsBanner;
