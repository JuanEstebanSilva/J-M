/**
 * WhatsApp Chat Parser — Dark Romance Dashboard
 * Supports: iOS, Android, Android-dot, 12h/24h, AM/PM, multi-line, Spanish
 */

// ─── System message patterns ──────────────────────────────────────────────────
const SYSTEM_PATTERNS = [
  /imagen omitida/i, /audio omitido/i, /video omitido/i, /sticker omitido/i,
  /documento omitido/i, /gif omitido/i, /contact card omitted/i,
  /image omitted/i, /audio omitted/i, /video omitted/i, /sticker omitted/i,
  /document omitted/i, /gif omitted/i,
  /\u200e?(los mensajes|messages) (y las llamadas|and calls)/i,
  /cifrado de extremo a extremo/i, /end-to-end encrypted/i,
  /llamada de voz perdida/i, /missed voice call/i,
  /llamada de video perdida/i, /missed video call/i,
  /llamada de voz/i, /voice call/i,
  /llamada de video/i, /video call/i,
  /te añadió/i, /te eliminó/i,
  /cambió el (asunto|icono)/i, /changed the (subject|icon)/i,
  /se unió mediante el enlace/i, /joined using this group/i,
  /creó el grupo/i, /created the group/i,
  /añadiste a/i, /you added/i,
  /eliminaste a/i, /you removed/i,
  /abandonaste el grupo/i, /you left/i,
  /eliminó este mensaje/i, /deleted this message/i,
  /este mensaje fue eliminado/i, /this message was deleted/i,
  /\u200e/,  // LTR mark at start = system
  /^null$/i,
];

const isSystemMessage = (text) => {
  if (!text || text.trim() === '') return true;
  return SYSTEM_PATTERNS.some((p) => p.test(text.trim()));
};

// ─── Regex patterns for message lines ─────────────────────────────────────────
const PATTERNS = [
  // iOS: [DD/MM/YY, HH:mm:ss] Name: Message
  // iOS: [DD/MM/YY, HH:mm:ss a] Name: Message
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]\s*([^:]+?):\s*([\s\S]*)/i,
  // Android: DD/MM/YYYY, HH:mm - Name: Message
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?:\s*[ap]m)?) -\s*([^:]+?):\s*([\s\S]*)/i,
  // Android dot: DD.MM.YYYY, HH:mm - Name: Message
  /^(\d{1,2}\.\d{1,2}\.\d{2,4}),\s*(\d{1,2}:\d{2}(?:\s*[ap]m)?) -\s*([^:]+?):\s*([\s\S]*)/i,
  // Android US: MM/DD/YYYY, HH:mm AM/PM - Name: Message
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}\s*[AP]M) -\s*([^:]+?):\s*([\s\S]*)/i,
];

const NEW_LINE_STARTS = [
  /^\[\d{1,2}\/\d{1,2}\/\d{2,4},/,
  /^\d{1,2}\/\d{1,2}\/\d{2,4},/,
  /^\d{1,2}\.\d{1,2}\.\d{2,4},/,
];

const isNewMessage = (line) => NEW_LINE_STARTS.some((p) => p.test(line));

const parseDate = (dateStr, timeStr) => {
  try {
    const d = dateStr.replace(/\./g, '/');
    const parts = d.split('/');
    if (parts.length !== 3) return null;
    let [p0, p1, p2] = parts.map(Number);
    const year = p2 < 100 ? 2000 + p2 : p2;
    // Assume DD/MM/YYYY
    const day = p0, month = p1 - 1;
    const t = timeStr.trim();
    let [hStr, rest] = t.split(':');
    let h = parseInt(hStr, 10);
    let m = 0, s = 0;
    if (rest) {
      const isPM = /pm/i.test(rest);
      const isAM = /am/i.test(rest);
      const mStr = rest.replace(/[^0-9]/g, '').slice(0, 2);
      const sStr = rest.replace(/[^0-9]/g, '').slice(2, 4);
      m = parseInt(mStr, 10) || 0;
      s = sStr ? parseInt(sStr, 10) : 0;
      if (isPM && h !== 12) h += 12;
      if (isAM && h === 12) h = 0;
    }
    const date = new Date(year, month, day, h, m, s);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch { return null; }
};

// ─── Parse raw string ─────────────────────────────────────────────────────────
export function parseWhatsApp(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split('\n');
  const messages = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    if (!line.trim()) continue;

    let matched = false;
    for (const pat of PATTERNS) {
      const m = line.match(pat);
      if (m) {
        // Save previous
        if (current) messages.push(current);
        const [, dateStr, timeStr, authorRaw, textRaw] = m;
        const date = parseDate(dateStr, timeStr);
        const author = authorRaw.trim().replace(/^\u200e/, '');
        const text = textRaw.trim().replace(/^\u200e/, '');
        current = { date, author, text, raw: line };
        matched = true;
        break;
      }
    }

    if (!matched && current) {
      // Multi-line continuation
      current.text += '\n' + line;
    } else if (!matched && !current) {
      // Ignore pre-header garbage
    }
  }
  if (current) messages.push(current);

  // Filter invalid/system messages
  return messages.filter(
    (msg) => msg.date && msg.author && !isSystemMessage(msg.text)
  );
}

// ─── Stop words (Spanish + common) ───────────────────────────────────────────
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

// ─── Emoji extractor ──────────────────────────────────────────────────────────
const EMOJI_RE = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
const extractEmojis = (text) => {
  const found = [];
  let m;
  const re = new RegExp(EMOJI_RE.source, 'gu');
  while ((m = re.exec(text)) !== null) found.push(m[0]);
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

  const [p1, p2] = participants;
  const sortedMsgs = [...messages].sort((a, b) => a.date - b.date);
  const firstDate  = sortedMsgs[0].date;
  const lastDate   = sortedMsgs[sortedMsgs.length - 1].date;
  const daysTotal  = Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24));

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
  const MEDIA_RE = /\.(jpg|jpeg|png|gif|mp4|mp3|ogg|opus|webp|pdf|doc)/i;
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

    // Media
    if (MEDIA_RE.test(text) || /omitid/i.test(text)) {
      totalMedia[author] = (totalMedia[author] || 0) + 1;
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
  const busiestDay  = busiestDayEntry ? busiestDayEntry[0] : null;
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
    [p2]: topN(new Map(Object.entries(stats[p2]?.emojis || {}))),
  };

  // Top words per person
  const wordTop = {
    [p1]: topN(new Map(Object.entries(stats[p1]?.wordFreq || {})), 30),
    [p2]: topN(new Map(Object.entries(stats[p2]?.wordFreq || {})), 30),
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
