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
      const rawAuthor = authorRaw.trim();
      const author = /maria\s*paula/i.test(rawAuthor) || /mi\s*amor/i.test(rawAuthor) || /^pau$/i.test(rawAuthor)
        ? 'Pau'
        : (/juan/i.test(rawAuthor) ? 'Juanes' : rawAuthor);
      const text = textRaw.trim();
      current = { date, author, text, raw: line, originalAuthor: rawAuthor };
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
  // System WhatsApp strings & call metadata
  'llamada','llamadas','videollamada','videollamadas','min','minutos','seg','segundos',
  'respuesta','editó','edito','código','codigo','confirmación','confirmacion',
  'ubicación','ubicacion','contacto','cifrado','seguridad','cambió','cambio',
  'inició','inicio','archivo','adjunto',
  // Vulgarities and anti-romantic slang
  'chimba','marica','mk','mierda','puta','puto','gonorrea','joda','guevon','guevona','hpta','hpt',
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

  // ─── Official Relationship Anniversary: 28 de Febrero de 2020 ──────────────
  const anniversaryDate = new Date(2020, 1, 28);
  const now = new Date();
  const diffAnniversaryMs = Math.max(0, now.getTime() - anniversaryDate.getTime());
  const daysTogetherAnniversary = Math.floor(diffAnniversaryMs / (1000 * 60 * 60 * 24));
  const yearsTogether = (daysTogetherAnniversary / 365.25).toFixed(1);

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

  // Media counters & detailed media breakdown
  const MEDIA_RE = /\.(jpg|jpeg|png|gif|mp4|mp3|ogg|opus|webp|pdf|doc)|(imagen|audio|video|sticker|documento|gif)\s+omitid/i;
  let totalMedia = { [p1]: 0, [p2]: 0 };

  const mediaBreakdown = {
    [p1]: { stickers: 0, photos: 0, audios: 0, videos: 0, total: 0 },
    [p2]: { stickers: 0, photos: 0, audios: 0, videos: 0, total: 0 },
  };

  // Calls analytics
  const callsStats = {
    totalCalls: 0,
    answeredCalls: 0,
    missedCalls: 0,
    totalMinutes: 0,
    byAuthor: {
      [p1]: { calls: 0, minutes: 0 },
      [p2]: { calls: 0, minutes: 0 },
    },
  };

  // Laughter count (jaja, jeje, 😂, 🤣, xd)
  const laughterStats = { [p1]: 0, [p2]: 0, total: 0 };

  // Time of day segments
  const timeOfDayStats = {
    nightOwls:  { [p1]: 0, [p2]: 0, total: 0 }, // 00:00 - 05:59
    earlyBirds: { [p1]: 0, [p2]: 0, total: 0 }, // 06:00 - 09:59
    daytime:    { [p1]: 0, [p2]: 0, total: 0 }, // 10:00 - 18:59
    evening:    { [p1]: 0, [p2]: 0, total: 0 }, // 19:00 - 23:59
  };

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

    // Calls detection & duration extraction
    if (/^Llamada|^Videollamada|^Llamada de/i.test(text)) {
      callsStats.totalCalls++;
      if (/sin respuesta|cancelada|perdida/i.test(text)) {
        callsStats.missedCalls++;
      } else {
        callsStats.answeredCalls++;
        let mins = 0;
        const hr = text.match(/(\d+)\s*(?:h|hr|hora)/i);
        const min = text.match(/(\d+)\s*min/i);
        const sec = text.match(/(\d+)\s*s/i);
        if (hr) mins += parseInt(hr[1], 10) * 60;
        if (min) mins += parseInt(min[1], 10);
        if (sec && !hr && !min) mins += 1;

        callsStats.totalMinutes += mins;
        if (callsStats.byAuthor[author]) {
          callsStats.byAuthor[author].calls++;
          callsStats.byAuthor[author].minutes += mins;
        }
      }
    }

    // Media categorization
    const isMedia = MEDIA_RE.test(text);
    if (isMedia) {
      totalMedia[author] = (totalMedia[author] || 0) + 1;
    }

    if (/sticker\s+omitido|\.webp/i.test(text)) {
      mediaBreakdown[author].stickers++;
      mediaBreakdown[author].total++;
    } else if (/imagen\s+omitida|\.(jpe?g|png)/i.test(text)) {
      mediaBreakdown[author].photos++;
      mediaBreakdown[author].total++;
    } else if (/audio\s+omitido|\.(opus|mp3|ogg|m4a)/i.test(text)) {
      mediaBreakdown[author].audios++;
      mediaBreakdown[author].total++;
    } else if (/video\s+omitido|\.mp4/i.test(text)) {
      mediaBreakdown[author].videos++;
      mediaBreakdown[author].total++;
    }

    // Laughter count
    const laughs = (text.match(/jaja+|jeje+|jiji+|😂|🤣|xd|xdd+/gi) || []).length;
    if (laughs > 0) {
      laughterStats[author] = (laughterStats[author] || 0) + laughs;
      laughterStats.total += laughs;
    }

    // Time of day classification
    const hour = date.getHours();
    if (hour >= 0 && hour < 6) {
      timeOfDayStats.nightOwls[author]++;
      timeOfDayStats.nightOwls.total++;
    } else if (hour >= 6 && hour < 10) {
      timeOfDayStats.earlyBirds[author]++;
      timeOfDayStats.earlyBirds.total++;
    } else if (hour >= 10 && hour < 19) {
      timeOfDayStats.daytime[author]++;
      timeOfDayStats.daytime.total++;
    } else {
      timeOfDayStats.evening[author]++;
      timeOfDayStats.evening.total++;
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

  // Random message pool (filtering junk, vulgarities and selecting authentic sweet, romantic, warm messages)
  const UNROMANTIC_OR_JUNK = /omitid|cifrado|http|www\.|\.com|github|npm|react|archivo|tarea|parcial|profesor|chimba|marica|mk|mierda|puta|gonorrea|joda|guevon|hpta/i;
  const msgPool = sortedMsgs.filter(
    (m) =>
      m.text.length >= 25 &&
      m.text.length <= 350 &&
      !UNROMANTIC_OR_JUNK.test(m.text) &&
      participants.includes(m.author) &&
      /amor|te amo|vida|lindo|linda|hermosa|bebe|bb|coraz[oó]n|feliz|beso|abrazo|tqm|extraño|cariño|gracias|quiero|reina|princesa|precios[ao]|siempre|juntos/i.test(m.text)
  );

  // Longest emotional letters (filtering out homework, assignments, and keeping authentic heartfelt letters)
  const UNWANTED_LETTERS = /omitid|cifrado|import\s+|function\s+|const\s+|http|www\.|\.com|encuesta|formulario|tarea|entrega|evaluaci[oó]n|parcial|profesor|universidad|diagn[oó]stico|campa[nñ]a|entregable|datos personales|wintour|cond[eé] nast|vogue|editorial|hospital militar|c[oó]digo lila|chimba|marica|mierda/i;
  const EMOTIONAL_KEYWORDS = /te amo|mi amor|amor de mi vida|te quiero|mi vida|mi cielo|coraz[oó]n|enamorad[ao]|a tu lado|juntos|mi reina|mi princesa|eres lo mejor|te adoro|sue[nñ]o contigo|disculpas|agradecid[ao]|apoyarme/i;
  const loveLetters = sortedMsgs
    .filter((m) =>
      m.text.length > 250 &&
      participants.includes(m.author) &&
      !UNWANTED_LETTERS.test(m.text) &&
      EMOTIONAL_KEYWORDS.test(m.text)
    )
    .sort((a, b) => b.text.length - a.text.length)
    .slice(0, 6)
    .map((m) => ({
      author: m.author,
      text: m.text,
      length: m.text.length,
      words: m.text.split(/\s+/).length,
      date: m.date,
      dateStr: m.date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
    }));

  // ─── 1. LOVE STREAK: Max consecutive days both sent messages ─────────────────
  const activeDaySet = new Set(Object.keys(dailyMap));
  let maxStreak = 0;
  let currentStreak = 0;
  let streakStartDate = null;
  let bestStreakStart = null;
  let bestStreakEnd = null;

  if (activeDaySet.size > 0) {
    const sortedDays = [...activeDaySet].sort();
    let prev = null;
    for (const dayStr of sortedDays) {
      if (!prev) {
        currentStreak = 1;
        streakStartDate = dayStr;
      } else {
        const prevD = new Date(prev);
        const currD = new Date(dayStr);
        const diffDays = Math.round((currD - prevD) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else {
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
            bestStreakStart = streakStartDate;
            bestStreakEnd = prev;
          }
          currentStreak = 1;
          streakStartDate = dayStr;
        }
      }
      prev = dayStr;
    }
    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
      bestStreakStart = streakStartDate;
      bestStreakEnd = prev;
    }
  }

  const loveStreak = {
    maxDays: maxStreak,
    startDate: bestStreakStart,
    endDate: bestStreakEnd,
  };

  // ─── 2. CANONICAL GOODNIGHT HOUR: Avg hour of last daily message & who sleeps first ──
  const lastMsgPerDay = {};
  for (const msg of sortedMsgs) {
    if (!participants.includes(msg.author)) continue;
    const dayKey = msg.date.toISOString().slice(0, 10);
    lastMsgPerDay[dayKey] = msg;
  }

  const goodnightHours = Object.values(lastMsgPerDay).map((m) => m.date.getHours());
  const goodnightHourAvg = goodnightHours.length
    ? Math.round(goodnightHours.reduce((a, b) => a + b, 0) / goodnightHours.length)
    : 22;

  const sleepFirstCount = { [p1]: 0, [p2]: 0 };
  for (const msg of Object.values(lastMsgPerDay)) {
    if (sleepFirstCount[msg.author] !== undefined) sleepFirstCount[msg.author]++;
  }
  // The person with fewer last messages is the one who usually "initiates sleep" (sends last msg less)
  const sleepsFirst = sleepFirstCount[p1] <= sleepFirstCount[p2] ? p1 : p2;
  const goodnightStats = { avgHour: goodnightHourAvg, sleepsFirst, sleepFirstCount };

  // ─── 3. TELEPATHY INDEX: Messages sent within 60s of each other ──────────────
  let telepathyCount = 0;
  for (let i = 1; i < sortedMsgs.length; i++) {
    const curr = sortedMsgs[i];
    const prev = sortedMsgs[i - 1];
    if (!participants.includes(curr.author) || !participants.includes(prev.author)) continue;
    if (curr.author !== prev.author) continue; // must be same-author consecutive? No — we want cross-author
    // Recheck: telepathy = different authors, near-simultaneous
  }
  // Correct approach: sort by time, check consecutive pairs from different authors < 60s
  telepathyCount = 0;
  for (let i = 1; i < sortedMsgs.length; i++) {
    const curr = sortedMsgs[i];
    const prev = sortedMsgs[i - 1];
    if (!participants.includes(curr.author) || !participants.includes(prev.author)) continue;
    if (curr.author === prev.author) continue;
    const diffSec = (curr.date - prev.date) / 1000;
    if (diffSec >= 0 && diffSec <= 60) {
      telepathyCount++;
    }
  }

  // ─── 4. MESSAGE LENGTH METRICS: Testaments vs. Direct ────────────────────────
  const textMsgs = sortedMsgs.filter(
    (m) => participants.includes(m.author) && !/omitid/i.test(m.text) && m.text.length > 0
  );
  const charsByAuthor = { [p1]: [], [p2]: [] };
  for (const msg of textMsgs) {
    if (charsByAuthor[msg.author]) charsByAuthor[msg.author].push(msg.text.length);
  }

  const avgChars = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
  const avgCharsP1 = avgChars(charsByAuthor[p1]);
  const avgCharsP2 = avgChars(charsByAuthor[p2]);
  const testament = avgCharsP1 >= avgCharsP2 ? p1 : p2;

  const messageLengthStats = {
    [p1]: { avg: avgCharsP1, total: charsByAuthor[p1].length },
    [p2]: { avg: avgCharsP2, total: charsByAuthor[p2].length },
    testamentWriter: testament,
  };

  // ─── 5. COUPLE-EXCLUSIVE VOCABULARY (words used ≥5x that aren't in stopwords) ─
  const coupleVocab = [];
  const allWords = {};

  for (const p of participants) {
    const freq = stats[p]?.wordFreq || {};
    for (const [word, count] of Object.entries(freq)) {
      if (!allWords[word]) allWords[word] = { [p1]: 0, [p2]: 0 };
      allWords[word][p] = count;
    }
  }

  // Couple-exclusive: distinctive words used ≥3 times total, not in stopwords
  const EXTRA_STOP = new Set([
    'bien', 'hola', 'jaja', 'jeje', 'xd', 'para', 'este', 'esta', 'todo',
    'eso', 'esa', 'ahh', 'aah', 'entonces', 'bueno', 'pues', 'igual',
    'ahora', 'aquí', 'acá', 'cosa', 'cosas', 'dia', 'dias', 'hoy', 'más', 'mucho', 'saber',
    'cómo', 'como', 'vas', 'voy', 'está', 'esta', 'estoy', 'estás', 'estas', 'creo',
    'dijo', 'hace', 'solo', 'hacer', 'dije', 'va', 'fue', 'sé', 'van', 'dice',
    'llamada', 'llamadas', 'min', 'minutos', 'seg', 'respuesta', 'videollamada',
    'editó', 'edito', 'código', 'confirmación', 'ubicación', 'contacto', 'cifrado',
    'marica', 'mk', 'chimba', 'mierda', 'puta', 'puto', 'gonorrea', 'joda', 'guevon',
  ]);

  for (const [word, counts] of Object.entries(allWords)) {
    const total = (counts[p1] || 0) + (counts[p2] || 0);
    if (total >= 3 && word.length <= 12 && !EXTRA_STOP.has(word)) {
      coupleVocab.push({ word, total, [p1]: counts[p1] || 0, [p2]: counts[p2] || 0 });
    }
  }
  // Sort by total, take top 20 most distinctive (high total but short — signals nickname/slang)
  coupleVocab.sort((a, b) => b.total - a.total);
  const topCoupleVocab = coupleVocab.slice(0, 20);

  // ─── 6. GOOD MORNING RITUAL: First message per day & who wakes up first ───
  const firstMsgPerDay = {};
  for (const msg of sortedMsgs) {
    if (!participants.includes(msg.author)) continue;
    const dayKey = msg.date.toISOString().slice(0, 10);
    if (!firstMsgPerDay[dayKey]) {
      firstMsgPerDay[dayKey] = msg;
    }
  }

  const morningHours = Object.values(firstMsgPerDay).map((m) => m.date.getHours() + m.date.getMinutes() / 60);
  const avgMorningDec = morningHours.length
    ? morningHours.reduce((a, b) => a + b, 0) / morningHours.length
    : 8.5;
  const avgMorningHour = Math.floor(avgMorningDec);
  const avgMorningMin = Math.round((avgMorningDec - avgMorningHour) * 60);
  const morningLabel = `${String(avgMorningHour).padStart(2, '0')}:${String(avgMorningMin).padStart(2, '0')}`;

  const morningFirstCount = { [p1]: 0, [p2]: 0 };
  for (const msg of Object.values(firstMsgPerDay)) {
    if (morningFirstCount[msg.author] !== undefined) morningFirstCount[msg.author]++;
  }
  const wakesUpFirst = morningFirstCount[p1] >= morningFirstCount[p2] ? p1 : p2;
  const goodMorningStats = {
    avgHour: avgMorningHour,
    avgMin: avgMorningMin,
    label: morningLabel,
    wakesUpFirst,
    morningFirstCount,
    totalDays: Object.keys(firstMsgPerDay).length,
  };

  // ─── 7. UNIVERSO DE CORAZONES: All hearts sent throughout the relationship ─
  const HEART_REGEX = /(?:[\u2764\uFE0F]|\uD83D[\uDC93-\uDC9F]|\uD83E[\uDD0D\uDD0E\uDE75\uDE77]|❤️|💖|💕|💜|💗|💓|💞|💘|🤍|🖤|🧡|💛|💚|💙|🤎|💝|💌)/gu;
  const heartCounts = { [p1]: 0, [p2]: 0, total: 0, byType: {} };
  for (const msg of sortedMsgs) {
    if (!participants.includes(msg.author)) continue;
    const matches = msg.text.match(HEART_REGEX) || [];
    for (const h of matches) {
      heartCounts[msg.author] = (heartCounts[msg.author] || 0) + 1;
      heartCounts.total++;
      if (!heartCounts.byType[h]) heartCounts.byType[h] = { [p1]: 0, [p2]: 0, total: 0 };
      heartCounts.byType[h][msg.author] = (heartCounts.byType[h][msg.author] || 0) + 1;
      heartCounts.byType[h].total++;
    }
  }
  const p1FavoriteHeart = Object.entries(heartCounts.byType).sort((a, b) => (b[1][p1] || 0) - (a[1][p1] || 0))[0]?.[0] || '❤️';
  const p2FavoriteHeart = Object.entries(heartCounts.byType).sort((a, b) => (b[1][p2] || 0) - (a[1][p2] || 0))[0]?.[0] || '💜';
  const heartStats = {
    total: heartCounts.total,
    [p1]: heartCounts[p1] || 0,
    [p2]: heartCounts[p2] || 0,
    p1FavoriteHeart,
    p2FavoriteHeart,
    topHearts: Object.entries(heartCounts.byType)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 6)
      .map(([emoji, data]) => ({ emoji, ...data })),
  };

  // ─── 8. VELOCIDAD DE INTERÉS: Respuestas rápidas (<3 min) ───────────────────
  const p1Responses = responseTimes[p1] || [];
  const p2Responses = responseTimes[p2] || [];
  const p1Fast = p1Responses.filter((t) => t <= 3).length;
  const p2Fast = p2Responses.filter((t) => t <= 3).length;
  const p1AvgResp = avgResponse(p1Responses) || 0;
  const p2AvgResp = avgResponse(p2Responses) || 0;
  const fastestResponder = p1AvgResp <= p2AvgResp ? p1 : p2;
  const responseVelocity = {
    [p1]: { avgMinutes: p1AvgResp, fastCount: p1Fast, totalResponses: p1Responses.length },
    [p2]: { avgMinutes: p2AvgResp, fastCount: p2Fast, totalResponses: p2Responses.length },
    fastestResponder,
  };

  // ─── 9. DÍA RÉCORD HISTÓRICO: El día más intenso de amor ────────────────────
  let recordDayWords = 0;
  if (busiestDay) {
    const dayMsgs = sortedMsgs.filter(
      (m) => m.date.toISOString().slice(0, 10) === busiestDay && participants.includes(m.author)
    );
    for (const m of dayMsgs) {
      recordDayWords += m.text.split(/\s+/).filter(Boolean).length;
    }
  }
  const recordDayDate = busiestDay ? new Date(busiestDay + 'T12:00:00') : null;
  const recordDayFormatted = recordDayDate
    ? recordDayDate.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Día especial';
  const bookPagesEquivalent = Math.max(1, Math.round(recordDayWords / 250));
  const recordDayStats = {
    date: busiestDay,
    formattedDate: recordDayFormatted,
    messagesCount: busiestCount,
    wordsCount: recordDayWords,
    bookPages: bookPagesEquivalent,
  };

  // ─── 10. APODOS Y TERNURA: Desglose de apodos cariñosos ───────────────────────
  const PET_NAMES = [
    { key: 'amor', regex: /\b(amor|amorcito|amorcitu|amorsote|amorsito)\b/gi, label: 'Amor' },
    { key: 'vida', regex: /\b(mi vida|vidita|vida mía)\b/gi, label: 'Mi Vida' },
    { key: 'bebe', regex: /\b(beb[eé]|bb|bebesito|bebesita)\b/gi, label: 'Bebé' },
    { key: 'cielo', regex: /\b(cielo|cielito)\b/gi, label: 'Cielo' },
    { key: 'hermosa', regex: /\b(hermosa|preciosa|bella|princesa|reina)\b/gi, label: 'Hermosa/Reina' },
    { key: 'lindo', regex: /\b(lindo|rey|guapo|pr[ií]ncipe)\b/gi, label: 'Lindo/Rey' },
    { key: 'corazon', regex: /\b(coraz[oó]n|corazoncito)\b/gi, label: 'Corazón' },
    { key: 'teamo', regex: /\b(te amo|te re amo|te amo tanto)\b/gi, label: 'Te amo' },
  ];
  const petNameCounts = PET_NAMES.map((pn) => {
    let c1 = 0, c2 = 0;
    for (const msg of sortedMsgs) {
      if (!participants.includes(msg.author)) continue;
      const m = msg.text.match(pn.regex) || [];
      if (msg.author === p1) c1 += m.length;
      else if (msg.author === p2) c2 += m.length;
    }
    return { label: pn.label, [p1]: c1, [p2]: c2, total: c1 + c2 };
  })
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);
  const totalAffectionWords = petNameCounts.reduce((acc, curr) => acc + curr.total, 0);

  // ─── 11. PROMESAS Y FUTURO: Palabras de trascendencia ───────────────────────
  const FUTURE_PATTERNS = /\b(siempre|para siempre|toda la vida|nuestro futuro|cuando nos casemos|nuestra casa|hijos|viajar juntos|prometo|te prometo)\b/gi;
  let futureCountP1 = 0;
  let futureCountP2 = 0;
  for (const msg of sortedMsgs) {
    if (!participants.includes(msg.author)) continue;
    const m = msg.text.match(FUTURE_PATTERNS) || [];
    if (msg.author === p1) futureCountP1 += m.length;
    else if (msg.author === p2) futureCountP2 += m.length;
  }
  const futurePromisesStats = {
    total: futureCountP1 + futureCountP2,
    [p1]: futureCountP1,
    [p2]: futureCountP2,
  };

  // ─── 12. RADAR DE CONFIDENCIAS & NOTICIAS ("¿Quién comparte más novedades?") ───────
  const CHISME_PATTERNS = /\b(no sabes|no te imaginas|imag[ií]nate|te tengo que contar|tengo un chisme|el chisme|adivina|viste que|supiste|omg|literal|no te lo vas a creer|te cuento|te enteraste|te tengo que mostrar)\b/gi;
  let chismeP1 = 0;
  let chismeP2 = 0;
  for (const msg of sortedMsgs) {
    if (!participants.includes(msg.author)) continue;
    const m = msg.text.match(CHISME_PATTERNS) || [];
    if (msg.author === p1) chismeP1 += m.length;
    else if (msg.author === p2) chismeP2 += m.length;
  }
  const chismeStats = {
    total: chismeP1 + chismeP2,
    [p1]: chismeP1,
    [p2]: chismeP2,
    topChismoso: chismeP1 >= chismeP2 ? p1 : p2,
  };

  // ─── 13. DETECTOR DE ANTOJOS 24/7 ("¿Quién tiene más hambre?") ──────────────
  const CRAVING_PATTERNS = /\b(hambre|tengo hambre|antojo|antojada|antojado|pizza|hamburguesa|sushi|helado|postre|chocolate|dulce|comidita|pidamos|domicilio|rappi|salgamos a comer|quiero comer|vamos por algo|antojitos)\b/gi;
  let foodP1 = 0;
  let foodP2 = 0;
  for (const msg of sortedMsgs) {
    if (!participants.includes(msg.author)) continue;
    const m = msg.text.match(CRAVING_PATTERNS) || [];
    if (msg.author === p1) foodP1 += m.length;
    else if (msg.author === p2) foodP2 += m.length;
  }
  const cravingStats = {
    total: foodP1 + foodP2,
    [p1]: foodP1,
    [p2]: foodP2,
    topFoodie: foodP1 >= foodP2 ? p1 : p2,
  };

  // ─── 14. EL BUCLE DE PREGUNTAS CLÁSICAS ────────────────────────────────────
  const QUESTION_TYPES = [
    { label: '¿Dónde estás / vas?', regex: /\b(d[oó]nde est[aá]s|ya saliste|por d[oó]nde vas|d[oó]nde andas|ya llegaste)\b/gi },
    { label: '¿Qué haces?', regex: /\b(qu[eé] haces|qu[eé] hac[ií]as|en qu[eé] andas|qu[eé] haciendo)\b/gi },
    { label: '¿Ya comiste?', regex: /\b(ya comiste|ya almorzaste|ya desayunaste|ya cenaste|qu[eé] almorzaste)\b/gi },
    { label: '¿Cómo te fue?', regex: /\b(c[oó]mo te fue|c[oó]mo va todo|qu[eé] tal tu d[ií]a|c[oó]mo est[aá]s)\b/gi },
    { label: '¿Me amas / extrañas?', regex: /\b(me amas|cu[aá]nto me amas|me quieres|me extra[nñ]as|te hago falta)\b/gi },
  ];
  const questionLoops = QUESTION_TYPES.map((q) => {
    let c1 = 0, c2 = 0;
    for (const msg of sortedMsgs) {
      if (!participants.includes(msg.author)) continue;
      const m = msg.text.match(q.regex) || [];
      if (msg.author === p1) c1 += m.length;
      else if (msg.author === p2) c2 += m.length;
    }
    return { label: q.label, [p1]: c1, [p2]: c2, total: c1 + c2 };
  }).filter((q) => q.total > 0).sort((a, b) => b.total - a.total);

  // ─── 15. BATALLA DE AUDIOS (PODCASTS) ──────────────────────────────────────
  const audiosP1 = mediaBreakdown[p1]?.audios || 0;
  const audiosP2 = mediaBreakdown[p2]?.audios || 0;
  const estMinutesP1 = Math.round(audiosP1 * 0.7);
  const estMinutesP2 = Math.round(audiosP2 * 0.7);
  const audioPodcastStats = {
    totalAudios: audiosP1 + audiosP2,
    [p1]: { audios: audiosP1, estMinutes: estMinutesP1 },
    [p2]: { audios: audiosP2, estMinutes: estMinutesP2 },
    podcastKing: audiosP1 >= audiosP2 ? p1 : p2,
    totalMinutes: estMinutesP1 + estMinutesP2,
    spotifyEpisodes: Math.round((estMinutesP1 + estMinutesP2) / 20) || 1,
  };

  // ─── 16. SIMULADOR DE COMPATIBILIDAD CÓSMICA ───────────────────────────────
  const cosmicCompatibility = {
    globalScore: 99.8,
    traits: [
      { name: 'Sincronía de Confidencias & Charlas', score: 99 },
      { name: 'Afinidad de Antojos & Comida', score: 100 },
      { name: 'Paciencia en Audios & Mensajes', score: 98 },
      { name: 'Telepatía & Presencia Diaria', score: 99 },
      { name: 'Química de Ternura & Romance', score: 100 },
    ],
    verdict: 'Almas Gemelas Cósmicas — Destinados a amarse para toda la vida ✨💍',
  };

  // ─── 17. ÍNDICE DE AMOR DIARIO & LLAMADAS COMPARTIDAS ──────────────────────
  const daysWithLove = new Set();
  for (const msg of sortedMsgs) {
    if (participants.includes(msg.author) && /te amo|te quiero|mi vida|mi amor/i.test(msg.text)) {
      daysWithLove.add(msg.date.toISOString().slice(0, 10));
    }
  }
  const loveDayRatio = totalDays > 0 ? Math.round((daysWithLove.size / totalDays) * 1000) / 10 : 93.1;
  const totalCallHours = Math.round((callsStats.totalMinutes / 60) * 10) / 10;
  const callDaysEquivalent = (totalCallHours / 24).toFixed(1);

  const dailyLoveRatioStats = {
    daysWithLove: daysWithLove.size,
    totalDays,
    ratioPercent: loveDayRatio,
    totalCallHours,
    callDaysEquivalent,
    answeredCalls: callsStats.answeredCalls,
  };

  return {
    participants,
    firstDate,
    lastDate,
    daysTotal,
    anniversaryDate,
    daysTogetherAnniversary,
    yearsTogether,
    callsStats,
    mediaBreakdown,
    laughterStats,
    timeOfDayStats,
    loveLetters,
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
    // ─── Advanced Secret Analytics ────────────────────────────────────────────
    loveStreak,
    goodnightStats,
    goodMorningStats,
    telepathyCount,
    messageLengthStats,
    topCoupleVocab,
    heartStats,
    responseVelocity,
    recordDayStats,
    petNameCounts,
    totalAffectionWords,
    futurePromisesStats,
    chismeStats,
    cravingStats,
    questionLoops,
    audioPodcastStats,
    cosmicCompatibility,
    dailyLoveRatioStats,
  };
}
