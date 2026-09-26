/**
 * WhatsApp Chat Parser — Dark Romance Dashboard
 * Supports: iOS, Android, Android-dot, 12h/24h, AM/PM, Spanish a. m./p. m., multi-line
 */

// ─── Clean invisible Unicode control characters ──────────────────────────────
function cleanUnicode(str) {
  if (!str) return '';
  return str.replace(/[\u200E\u200F\u202A-\u202E\uFEFF\u200B-\u200D]/g, '');
}

// ─── Pure system announcements (not authored by either partner) ───────────────
const PURE_SYSTEM_PATTERNS = [
  /cifrados? de extremo a extremo/i,
  /end-to-end encrypt/i,
  /se uni[oó] mediante el enlace/i,
  /joined using/i,
  /cre[oó] el grupo/i,
  /created group/i,
  /cambi[oó] el (asunto|icono|la descripci[oó]n)/i,
  /changed the (subject|icon|description)/i,
  /te a[nñ]adi[oó]/i,
  /te elimin[oó]/i,
  /eliminaste a/i,
  /a[nñ]adiste a/i,
  /abandonaste el grupo/i,
  /left the group/i,
  /llamada de voz perdida/i,
  /llamada de video perdida/i,
  /missed (voice|video) call/i,
  /este mensaje fue eliminado/i,
  /elimin[oó] este mensaje/i,
  /this message was deleted/i,
  /^null$/i,
];

const isPureSystem = (text) => {
  if (!text || text.trim() === '') return true;
  return PURE_SYSTEM_PATTERNS.some((p) => p.test(text.trim()));
};

// ─── Flexible Regex for WhatsApp Message Headers ──────────────────────────────
// Supports:
// [10/12/25, 3:30:00 a. m.] Name: Message
// [10/12/25, 3:30:00] Name: Message
// 10/12/25, 3:30 - Name: Message
// 10.12.25, 3:30 - Name: Message
const MSG_REGEX = /^(?:\[)?(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:[\s\u202F\u00A0]*[ap]\.?\s*m\.?)?)(?:\])?(?:\s*-\s*|\s*:\s*|\s+)?([^:]+?):\s*([\s\S]*)$/i;

// ─── Date & Time Parser ───────────────────────────────────────────────────────
const parseDate = (dateStr, timeStr) => {
  try {
    const d = dateStr.replace(/[.-]/g, '/');
    const parts = d.split('/');
    if (parts.length !== 3) return null;
    let [p0, p1, p2] = parts.map(Number);
    const year = p2 < 100 ? 2000 + p2 : p2;
    // Format is DD/MM/YYYY
    const day = p0, month = p1 - 1;

    // Normalize whitespace & narrow spaces, lowercase
    const cleanTime = timeStr.replace(/[\u202F\u00A0\s]+/g, ' ').toLowerCase().trim();
    const isPM = /p\.?\s*m\.?/i.test(cleanTime);
    const isAM = /a\.?\s*m\.?/i.test(cleanTime);

    const match = cleanTime.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return null;

    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const s = match[3] ? parseInt(match[3], 10) : 0;

    if (isPM && h !== 12) h += 12;
    if (isAM && h === 12) h = 0;

    const date = new Date(year, month, day, h, m, s);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
};

// ─── Parse raw string into messages array ─────────────────────────────────────
export function parseWhatsApp(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split('\n');
  const messages = [];
  let current = null;

  for (const rawLine of lines) {
    const line = cleanUnicode(rawLine.replace(/\r$/, ''));
    if (!line.trim()) continue;

    const m = line.match(MSG_REGEX);
    if (m) {
      if (current && current.date && current.author && !isPureSystem(current.text)) {
        messages.push(current);
      }
      const [, dateStr, timeStr, authorRaw, textRaw] = m;
      const date = parseDate(dateStr, timeStr);
      const author = authorRaw.trim();
      const text = textRaw.trim();
      current = { date, author, text, raw: line };
    } else if (current) {
      // Multi-line message continuation
      current.text += '\n' + line;
    }
  }

  if (current && current.date && current.author && !isPureSystem(current.text)) {
    messages.push(current);
  }

  return messages;
}

// ─── Stop words (Spanish + chat common) ───────────────────────────────────────
const STOPWORDS = new Set([
  'de','la','que','el','en','y','a','los','del','se','las','por','un','para',
  'con','no','una','su','al','lo','como','más','pero','sus','le','ya','o','este',
  'sí','porque','esta','entre','cuando','muy','sin','sobre','también','me','hasta',
  'hay','donde','quien','desde','todo','nos','durante','todos','uno','les','ni',
  'contra','otros','ese','eso','ante','ellos','e','esto','mí','antes','algunos',
  'qué','unos','yo','otro','otras','otra','él','tanto','esa','estos','mucho',
  'quienes','nada','muchos','cual','sea','poco','ella','estar','estas','algunas',
  'algo','nosotros','mi','mis','tus','tu','te','si','fue','era','son','han',
  'tiene','hacer','cada','bien','así','van','ver','les','ha','ser','ya','si',
  'que','https','http','www','com','omitida','omitido','mensaje','eliminado',
  'hola','ok','oye','claro','bueno','vale','entonces','ahora','aquí','hay',
  'acá','pa','na','nah','mm','jj','ja','je','jaja','jeje','xd','xDD',
  'emoji','sticker','gif','media','null','omitido','omitida',
  'imagen','video','audio','foto','sticker',
  'aja','ah','oh','eh','em','um','uh',
]);

// ─── Love keywords ─────────────────────────────────────────────────────────────
const LOVE_KEYWORDS = [
  { label: 'Te amo',    patterns: [/\bte\s+amo\b/gi] },
  { label: 'Te quiero', patterns: [/\bte\s+quiero\b/gi] },
  { label: 'Amor',      patterns: [/\bamor\b/gi] },
  { label: 'Mi vida',   patterns: [/\bmi\s+vida\b/gi] },
  { label: 'Bebé',      patterns: [/\bbeb[eé]\b/gi] },
  { label: 'Corazón',   patterns: [/\bcoraz[oó]n\b/gi] },
  { label: 'Hermosa',   patterns: [/\bhermosa?\b/gi] },
  { label: 'Precioso',  patterns: [/\bprecioso?a?\b/gi] },
  { label: 'Cariño',    patterns: [/\bcari[nñ]o\b/gi] },
  { label: 'Extraño',   patterns: [/\bextra[nñ]o\b/gi] },
  { label: 'Feliz',     patterns: [/\bfeliz\b/gi] },
  { label: 'Bonita',    patterns: [/\bbonitoa?\b/gi] },
];

// ─── Emoji extractor with Intl.Segmenter & Skin tone filter ───────────────────
const SKIN_TONES = new Set(['🏻', '🏼', '🏽', '🏾', '🏿']);
let segmenter = null;
try {
  segmenter = new Intl.Segmenter('es', { granularity: 'grapheme' });
} catch {
  // Intl.Segmenter not supported in legacy environment
}

const extractEmojis = (text) => {
  if (!text) return [];
  if (segmenter) {
    const list = [];
    for (const { segment } of segmenter.segment(text)) {
      if (/\p{Extended_Pictographic}/u.test(segment) && !SKIN_TONES.has(segment)) {
        list.push(segment);
      }
    }
    return list;
  }
  const found = [];
  let m;
  const re = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
  while ((m = re.exec(text)) !== null) {
    if (!SKIN_TONES.has(m[0])) found.push(m[0]);
  }
  return found;
};

const topN = (map, n = 5) =>
  [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

// ─── Compute all analytics ────────────────────────────────────────────────────
export function computeAnalytics(messages) {
  if (!messages || messages.length === 0) return null;

  // Detect participants (top 2 by message count)
  const authorCount = {};
  for (const msg of messages) {
    authorCount[msg.author] = (authorCount[msg.author] || 0) + 1;
  }
  const participants = Object.entries(authorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name);

  if (participants.length < 1) return null;

  const [p1, p2 = participants[0]] = participants;
  const sortedMsgs = [...messages].sort((a, b) => a.date - b.date);
  const firstDate  = sortedMsgs[0].date;
  const lastDate   = sortedMsgs[sortedMsgs.length - 1].date;
  const daysTotal  = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

  // Per-author stats
  const stats = {};
  for (const p of participants) {
    stats[p] = {
      messages:   0,
      words:      0,
      chars:      0,
      emojis:     {},
      wordFreq:   {},
      loveWords:  Object.fromEntries(LOVE_KEYWORDS.map((k) => [k.label, 0])),
    };
  }

  // Media counters
  const MEDIA_RE = /\.(jpg|jpeg|png|gif|mp4|mp3|ogg|opus|webp|pdf|doc)|(imagen|audio|video|sticker|documento|gif)\s+omitid/i;
  let totalMedia = { [p1]: 0, [p2]: 0 };

  // Daily message counts
  const dailyMap = {};
  // Hourly
  const hourly = Array(24).fill(0);
  // Weekly
  const weekly = Array(7).fill(0);
  // Monthly
  const monthlyMap = {};
  // Response times
  const responseTimes = { [p1]: [], [p2]: [] };
  // Day starters
  const dayStarters = {};

  let lastMsg = null;
  const seenDays = {};

  for (const msg of sortedMsgs) {
    const { author, text, date } = msg;
    if (!stats[author]) continue;

    const s = stats[author];
    s.messages++;

    const isMedia = MEDIA_RE.test(text);
    if (isMedia) {
      totalMedia[author] = (totalMedia[author] || 0) + 1;
    }

    // Word counts only for non-media text
    if (!/omitid/i.test(text)) {
      const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w) && /[a-záéíóúüñ]/i.test(w));
      const rawWords = text.split(/\s+/).filter(Boolean);
      s.words += rawWords.length;
      s.chars += text.length;

      for (const w of words) {
        const clean = w.replace(/[^a-záéíóúüñ]/gi, '');
        if (clean.length > 2 && !STOPWORDS.has(clean)) {
          s.wordFreq[clean] = (s.wordFreq[clean] || 0) + 1;
        }
      }
    }

    // Emojis
    for (const em of extractEmojis(text)) {
      s.emojis[em] = (s.emojis[em] || 0) + 1;
    }

    // Love keywords
    for (const kw of LOVE_KEYWORDS) {
      for (const pat of kw.patterns) {
        const matches = text.match(pat) || [];
        s.loveWords[kw.label] += matches.length;
      }
    }

    // Daily
    const dayKey = date.toISOString().slice(0, 10);
    dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1;

    // Day starter
    if (!seenDays[dayKey]) {
      seenDays[dayKey] = author;
      dayStarters[author] = (dayStarters[author] || 0) + 1;
    }

    // Hourly / Weekly / Monthly
    hourly[date.getHours()]++;
    weekly[date.getDay()]++;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { total: 0, [p1]: 0, [p2]: 0 };
    monthlyMap[monthKey].total++;
    monthlyMap[monthKey][author] = (monthlyMap[monthKey][author] || 0) + 1;

    // Response time
    if (lastMsg && lastMsg.author !== author) {
      const diff = (date - lastMsg.date) / 60000; // minutes
      if (diff > 0 && diff < 720) { // max 12h
        responseTimes[author].push(diff);
      }
    }
    lastMsg = msg;
  }

  // Aggregate love words across both participants
  const loveWordsTotals = {};
  for (const kw of LOVE_KEYWORDS) {
    loveWordsTotals[kw.label] = {
      [p1]: stats[p1]?.loveWords[kw.label] || 0,
      [p2]: stats[p2]?.loveWords[kw.label] || 0,
      total: (stats[p1]?.loveWords[kw.label] || 0) + (stats[p2]?.loveWords[kw.label] || 0),
    };
  }

  // Avg response time
  const avgResponse = (arr) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

  // Busiest day
  const busiestDayEntry = Object.entries(dailyMap).sort((a, b) => b[1] - a[1])[0];
  const busiestDay   = busiestDayEntry ? busiestDayEntry[0] : null;
  const busiestCount = busiestDayEntry ? busiestDayEntry[1] : 0;

  // Monthly array sorted
  const monthlyArray = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));

  // Weekly labels
  const weekLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const weeklyData = weekly.map((count, i) => ({ day: weekLabels[i], count }));

  // Hourly data
  const hourlyData = hourly.map((count, i) => ({
    hour: i,
    label: `${String(i).padStart(2, '0')}:00`,
    count,
  }));

  // Peak hour
  const peakHour = hourly.indexOf(Math.max(...hourly));

  // Top emojis per person
  const emojiTop = {
    [p1]: topN(new Map(Object.entries(stats[p1]?.emojis || {}))),
    [p2]: stats[p2] ? topN(new Map(Object.entries(stats[p2]?.emojis || {}))) : [],
  };

  // Top words per person
  const wordTop = {
    [p1]: topN(new Map(Object.entries(stats[p1]?.wordFreq || {})), 30),
    [p2]: stats[p2] ? topN(new Map(Object.entries(stats[p2]?.wordFreq || {})), 30) : [],
  };

  // Total messages
  const totalMessages = messages.length;
  const totalWords    = (stats[p1]?.words || 0) + (stats[p2]?.words || 0);
  const totalMediaAll = (totalMedia[p1] || 0) + (totalMedia[p2] || 0);

  // Day starters total days
  const totalDays = Object.keys(seenDays).length;

  // Random message pool (filter short/media ones)
  const msgPool = sortedMsgs.filter(
    (m) => m.text.length > 20 && !/omitid/i.test(m.text) && participants.includes(m.author)
  );

  return {
    participants,
    firstDate,
    lastDate,
    daysTotal,
    totalMessages,
    totalWords,
    totalMediaAll,
    stats: {
      [p1]: { ...stats[p1], emojiTop: emojiTop[p1], wordTop: wordTop[p1] },
      [p2]: stats[p2] ? { ...stats[p2], emojiTop: emojiTop[p2], wordTop: wordTop[p2] } : null,
    },
    loveWordsTotals,
    response: {
      [p1]: avgResponse(responseTimes[p1]),
      [p2]: avgResponse(responseTimes[p2]),
    },
    dayStarters,
    totalDays,
    busiestDay,
    busiestCount,
    hourlyData,
    weeklyData,
    monthlyData: monthlyArray,
    peakHour,
    msgPool,
    dailyMap,
  };
}
