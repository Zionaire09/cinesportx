// Change to 'prizefamily' to switch back to the current 3-desktop / 1-mobile scripts.
export const ACTIVE_AD_PROFILE: 'former' | 'prizefamily' = 'former';

export const AD_BANNER_PROFILES = {
  former: {
    kind: 'atOptions',
    key: '0094e8b6ab0ae7b1c688593cbd0fcfe7',
    scriptUrl: 'https://www.highrevenueformat.com/0094e8b6ab0ae7b1c688593cbd0fcfe7/invoke.js',
    width: 728,
    height: 90,
  },
  prizefamily: {
    kind: 'prizefamily',
    desktopScriptUrls: [
      'https://prizefamily.com/b_XQVus/d.GYlV0EY-WBcE/Bejm_9AuDZsU/lkk/PKTuct1AOuDrEr3oNCDaU/tQNCzBU/4VM/T/c/0pOdQZ',
      'https://prizefamily.com/bcX/V/s.dXGml/0PYQWqcS/aeYmU9cuqZmUClpk/PIThc/1jOJD/Ez3/NyjCEKtBN-zqUH4DMwTncv2CNUQT',
      'https://prizefamily.com/bYXGVys.dZG/lh0CYzWcce/DeFm/9kuRZ-UdlMk/PPTic/1TOTDXEL3/OsT/MntZNJzeUV4DMsTjcz5ONNwV',
    ],
    mobileScriptUrls: [
      'https://prizefamily.com/bWXpVSssd.GnlV0CYIWgcx/feAmm9FuXZeUEl_kTP/TJcJ1SOQDlEd4/MFjIU/t/NIzoUM4PMdT-g/yUOvQE',
    ],
    desktopHeight: 300,
    mobileHeight: 90,
  },
} as const;
