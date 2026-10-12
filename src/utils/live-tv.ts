export interface LiveChannel {
  id: string;
  name: string;
  country: string;
  language: string;
  logo: string;
  category: string;
  status: string;
  url: string;
}

export interface LiveCountry {
  name: string;
  code: string;
  languages?: string[];
  flag?: string;
}

export const LIVE_TV_SOURCES = {
  countries: 'https://iptv-org.github.io/api/countries.json',
  countryPlaylist: (code: string) => `https://raw.githubusercontent.com/abhijeet620380/freetvgarden-data-v2/main/iptv/countries/${code.toLowerCase()}.m3u`,
  directory: 'https://github.com/iptv-org/iptv',
};

const attribute = (line: string, key: string) => line.match(new RegExp(`${key}="([^"]*)"`, 'i'))?.[1] || '';

export const parseLivePlaylist = (text: string, countryCode = ''): LiveChannel[] => {
  const channels: LiveChannel[] = [];
  let metadata: Omit<LiveChannel, 'url'> | null = null;

  text.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (line.startsWith('#EXTINF:')) {
      const commaIndex = line.indexOf(',');
      const header = commaIndex >= 0 ? line.slice(0, commaIndex) : line;
      const name = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : 'Unknown channel';
      metadata = {
        id: attribute(header, 'tvg-id') || `${name}-${countryCode}`,
        name,
        country: attribute(header, 'tvg-country') || countryCode.toUpperCase(),
        language: attribute(header, 'tvg-language'),
        logo: attribute(header, 'tvg-logo'),
        category: attribute(header, 'group-title') || 'General',
        status: attribute(header, 'tvg-status'),
      };
    } else if (metadata && line && !line.startsWith('#')) {
      if (line.startsWith('http')) channels.push({ ...metadata, url: line });
      metadata = null;
    }
  });

  return channels;
};

export const fetchCountries = async (): Promise<LiveCountry[]> => {
  const response = await fetch(LIVE_TV_SOURCES.countries);
  if (!response.ok) throw new Error('Country list unavailable');
  return response.json();
};

export const fetchCountryChannels = async (countryCode: string): Promise<LiveChannel[]> => {
  const response = await fetch(LIVE_TV_SOURCES.countryPlaylist(countryCode), { cache: 'no-store' });
  if (!response.ok) throw new Error('Channel playlist unavailable');
  return parseLivePlaylist(await response.text(), countryCode);
};

export const channelKey = (channel: LiveChannel) => channel.id || `${channel.name}|${channel.url}`;

export const countryName = (countries: LiveCountry[], code: string) => countries.find((country) => country.code === code)?.name || code || 'Unknown location';
