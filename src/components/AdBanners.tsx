import { useEffect, useRef, useState } from 'react';

const DESKTOP_AD_SCRIPT_URLS = [
  'https://prizefamily.com/b_XQVus/d.GYlV0EY-WBcE/Bejm_9AuDZsU/lkk/PKTuct1AOuDrEr3oNCDaU/tQNCzBU/4VM/T/c/0pOdQZ',
  'https://prizefamily.com/bcX/V/s.dXGml/0PYQWqcS/aeYmU9cuqZmUClpk/PIThc/1jOJD/Ez3/NyjCEKtBN-zqUH4DMwTncv2CNUQT',
  'https://prizefamily.com/bYXGVys.dZG/lh0CYzWcce/DeFm/9kuRZ-UdlMk/PPTic/1TOTDXEL3/OsT/MntZNJzeUV4DMsTjcz5ONNwV',
];
const MOBILE_AD_SCRIPT_URL =
  'https://prizefamily.com/bWXpVSssd.GnlV0CYIWgcx/feAmm9FuXZeUEl_kTP/TJcJ1SOQDlEd4/MFjIU/t/NIzoUM4PMdT-g/yUOvQE';

// Keep initialized creatives detached between route changes and reattach them
// when another page mounts the banners.
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

const AdBanners = ({ className = 'mb-4' }: { className?: string }) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );
  const bannerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bannerCount = isMobile ? 1 : 3;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    const scriptUrls = isMobile ? [MOBILE_AD_SCRIPT_URL] : DESKTOP_AD_SCRIPT_URLS;
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
