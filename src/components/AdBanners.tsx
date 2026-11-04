import { useEffect, useRef, useState } from 'react';
import { ACTIVE_AD_PROFILE, AD_BANNER_PROFILES } from '@/config/adBanners';

const profile = AD_BANNER_PROFILES[ACTIVE_AD_PROFILE];
const parkedAdFragments = new Map<string, DocumentFragment>();

const getParkedHost = (src: string) => {
  let host = parkedAdFragments.get(src);
  if (host) return host;
  host = document.createDocumentFragment();
  parkedAdFragments.set(src, host);
  return host;
};

const moveChildren = (from: ParentNode, to: Node) => {
  while (from.firstChild) to.appendChild(from.firstChild);
};

type AtOptionsWindow = Window & {
  atOptions?: {
    key: string;
    format: string;
    height: number;
    width: number;
    params: Record<string, unknown>;
  };
};

const AdBanners = ({ className = 'mb-4' }: { className?: string }) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );
  const bannerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scriptUrls =
    profile.kind === 'prizefamily'
      ? isMobile
        ? profile.mobileScriptUrls
        : profile.desktopScriptUrls
      : [];
  const bannerCount = profile.kind === 'atOptions' ? 1 : scriptUrls.length;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (profile.kind !== 'atOptions') return;
    const slot = bannerRefs.current[0];
    if (!slot) return;

    const adWindow = window as AtOptionsWindow;
    adWindow.atOptions = {
      key: profile.key,
      format: 'iframe',
      height: profile.height,
      width: profile.width,
      params: {},
    };
    const script = document.createElement('script');
    script.src = profile.scriptUrl;
    script.async = true;
    slot.appendChild(script);

    return () => {
      script.remove();
      slot.replaceChildren();
      delete adWindow.atOptions;
    };
  }, []);

  useEffect(() => {
    if (profile.kind !== 'prizefamily') return;
    const mountedAds = scriptUrls.map((src, index) => {
      const slot = bannerRefs.current[index];
      if (!slot) return null;

      const parkedHost = getParkedHost(src);
      if (parkedHost.firstChild) {
        moveChildren(parkedHost, slot);
      } else {
        const script = document.createElement('script');
        Object.assign(script, {
          settings: {},
          src,
          async: true,
          referrerPolicy: 'no-referrer-when-downgrade',
        });
        slot.appendChild(script);
      }
      return { parkedHost, slot };
    });

    return () => {
      mountedAds.forEach((ad) => {
        if (ad) moveChildren(ad.slot, ad.parkedHost);
      });
    };
  }, [isMobile]);

  if (profile.kind === 'atOptions') {
    return (
      <div className={`relative isolate z-0 flex w-full justify-center px-1 ${className}`} aria-label="Advertisement">
        <style>{`.former-ad-banner iframe { display: block; max-width: 100%; border: 0; }`}</style>
        <div
          className="former-ad-banner flex min-h-[90px] w-full max-w-[728px] items-center justify-center"
          ref={(element) => {
            bannerRefs.current[0] = element;
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`ad-banners-row relative isolate z-0 flex flex-nowrap items-start justify-start gap-4 overflow-x-auto ${className}`}
      aria-label="Advertisement"
    >
      <style>{`.ad-banner-slot iframe { display: block; border: 0; } @media (min-width: 964px) { .ad-banners-row { justify-content: center; } }`}</style>
      {Array.from({ length: bannerCount }, (_, index) => (
        <div
          className={`ad-banner-slot relative flex w-fit min-w-[300px] shrink-0 ${isMobile ? 'min-h-[90px]' : 'min-h-[300px]'} items-center justify-center`}
          key={index}
          ref={(element) => {
            bannerRefs.current[index] = element;
          }}
        />
      ))}
    </div>
  );
};

export default AdBanners;
