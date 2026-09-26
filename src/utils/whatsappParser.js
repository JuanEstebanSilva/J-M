/**
 * whatsappParser.js
 * Robust WhatsApp chat export parser supporting iOS, Android,
 * 12h/24h formats, multi-line messages, and system message filtering.
 */

// ─── REGEX PATTERNS ────────────────────────────────────────────────────────────

/**
 * iOS format: [DD/MM/YY, HH:mm:ss] Name: Message
 * Also handles [DD/MM/YYYY, HH:mm:ss] and [DD/MM/YY, HH:mm:ss AM/PM]
 */
const IOS_PATTERN = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)\]\s([^:]+?):\s([\s\S]*)/;

/**
 * Android format: DD/MM/YYYY, HH:mm - Name: Message
 * Also handles M/D/YY, 12h format with AM/PM
 */
const ANDROID_PATTERN = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)\s[-–]\s([^:]+?):\s([\s\S]*)/;

/**
 * Android format alternative (some locales): DD.MM.YYYY, HH:mm
 */
const ANDROID_DOT_PATTERN = /^(\d{1,2}\.\d{1,2}\.\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)\s[-–]\s([^:]+?):\s([\s\S]*)/;

/**
 * System message detection patterns (multilingual)
 */
const SYSTEM_MSG_PATTERNS = [
  /imagen omitida/i,
  /image omitted/i,
  /audio omitido/i,
  /audio omitted/i,
  /video omitido/i,
  /video omitted/i,
  /gif omitido/i,
  /gif omitted/i,
  /sticker omitido/i,
  /sticker omitted/i,
  /documento omitido/i,
  /document omitted/i,
  /archivo adjunto omitido/i,
  /file attached omitted/i,
  /contacto omitido/i,
  /contact omitted/i,
  /ubicaci[oó]n omitida/i,
  /location omitted/i,
  /llamada de voz perdida/i,
  /missed voice call/i,
  /llamada de video perdida/i,
  /missed video call/i,
  /videollamada perdida/i,
  /llamada perdida/i,
  /los mensajes y las llamadas en este chat/i,
  /messages and calls are end-to-end encrypted/i,
  /cifrado de extremo a extremo/i,
  /end-to-end encrypted/i,
  /tu c[oó]digo de seguridad/i,
  /your security code/i,
  /cambió a/i,
  /changed to/i,
  /se uni[oó] usando el enlace/i,
  /joined using this group/i,
  /eliminó este mensaje/i,
  /deleted this message/i,
  /este mensaje fue eliminado/i,
  /this message was deleted/i,
  /<multimedia omitido>/i,
  /\u200e/,  // zero-width LTR mark often in system messages
];

// ─── PARSE DATE ────────────────────────────────────────────────────────────────

function parseDate(dateStr, timeStr) {
  // Normalize separators
  const dateParts = dateStr.replace(/\./g, '/').split('/');
  if (dateParts.length !== 3) return null;

  let [day, month, year] = dateParts.map(Number);

  // Fix 2-digit years
  if (year < 100) {
    year += year < 50 ? 2000 : 1900;
  }

  // Parse time with AM/PM support
  let hours = 0, minutes = 0, seconds = 0;
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s?([AaPp][Mm])?/);
  if (!timeMatch) return null;

  hours = parseInt(timeMatch[1]);
  minutes = parseInt(timeMatch[2]);
  seconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0;

  const ampm = timeMatch[4]?.toLowerCase();
  if (ampm === 'pm' && hours !== 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;

  const date = new Date(year, month - 1, day, hours, minutes, seconds);
  return isNaN(date.getTime()) ? null : date;
}

// ─── IS SYSTEM MESSAGE ──────────────────────────────────────────────────────────

function isSystemMessage(text) {
  return SYSTEM_MSG_PATTERNS.some(pattern => pattern.test(text));
}

// ─── PARSE LINE ─────────────────────────────────────────────────────────────────

function parseLine(line) {
  let match;

  // Try iOS format first
  match = IOS_PATTERN.exec(line);
  if (match) {
    return {
      date: parseDate(match[1], match[2]),
      author: match[3].trim(),
      text: match[4],
      raw: line,
    };
  }

  // Try Android format
  match = ANDROID_PATTERN.exec(line);
  if (match) {
    return {
      date: parseDate(match[1], match[2]),
      author: match[3].trim(),
      text: match[4],
      raw: line,
    };
  }

  // Try Android dot format
  match = ANDROID_DOT_PATTERN.exec(line);
  if (match) {
    return {
      date: parseDate(match[1], match[2]),
      author: match[3].trim(),
      text: match[4],
      raw: line,
    };
  }

  return null;
}

// ─── MAIN PARSE FUNCTION ────────────────────────────────────────────────────────

export function parseWhatsAppChat(rawText) {
  const lines = rawText.split('\n');
  const messages = [];
  let currentMessage = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const parsed = parseLine(trimmedLine);

    if (parsed && parsed.date) {
      // Save previous message
      if (currentMessage) {
        messages.push(currentMessage);
      }
      currentMessage = parsed;
    } else if (currentMessage && trimmedLine) {
      // Multi-line continuation
      currentMessage.text += '\n' + trimmedLine;
    }
  }

  // Push last message
  if (currentMessage) {
    messages.push(currentMessage);
  }

  // Filter out system messages and invalid dates
  const filtered = messages.filter(msg => 
    msg.date !== null && 
    !isSystemMessage(msg.text) &&
    msg.author
  );

  return filtered;
}

// ─── ANALYTICS COMPUTATION ──────────────────────────────────────────────────────

const STOPWORDS_ES = new Set([
  'de','la','que','el','en','y','a','los','del','se','las','un','por','con',
  'una','su','para','es','al','lo','como','más','pero','sus','le','ya','o',
  'este','sí','porque','esta','entre','cuando','muy','sin','sobre','también',
  'me','hasta','hay','donde','quien','desde','todo','nos','durante','estados',
  'todos','uno','les','ni','contra','otros','ese','eso','ante','ellos','e',
  'esto','mí','antes','algunos','qué','unos','yo','otro','otras','otra','él',
  'tanto','esa','estos','mucho','quienes','nada','muchos','cual','poco','ella',
  'estar','estas','algunas','algo','nosotros','mi','mis','tú','te','ti','tu',
  'tus','vosotros','vosotras','os','ellas','nos','aquí','allí','así','después',
  'ok','sí','no','si','ja','jaja','jajaja','jajajaja','ah','oh','ha',
  'bueno','bien','claro','pues','entonces','ahora','aquí','allá','tan','solo',
  'fue','era','han','son','ser','he','ha','hemos','van','voy','vamos','ir',
  'que','qué','cómo','dónde','cuándo','quién','cuál','ese','eso','esa',
  'con','por','para','sin','sobre','bajo','ante','tras','hacia','hasta',
  'día','días','vez','veces','hoy','mañana','noche','tarde','tiempo',
  'igual','justo','nada','todo','más','menos','muy','mucho','poco',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, '') // Remove URLs
    .replace(/[^\w\sáéíóúüñ]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS_ES.has(w) && !/^\d+$/.test(w));
}

function countEmojis(text) {
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
  const matches = text.match(emojiRegex) || [];
  const counts = {};
  for (const emoji of matches) {
    counts[emoji] = (counts[emoji] || 0) + 1;
  }
  return counts;
}

function getTopN(obj, n) {
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));
}

const LOVE_KEYWORDS = [
  { label: 'Te amo', patterns: [/\bte amo\b/gi] },
  { label: 'Te quiero', patterns: [/\bte quiero\b/gi] },
  { label: 'Amor', patterns: [/\bamor\b/gi] },
  { label: 'Mi vida', patterns: [/\bmi vida\b/gi] },
  { label: 'Corazón', patterns: [/\bcoraz[oó]n\b/gi] },
  { label: 'Bebé', patterns: [/\bbeb[eé]\b/gi] },
  { label: 'Cielo', patterns: [/\bcielo\b/gi] },
  { label: 'Te extraño', patterns: [/\bte extra[ñn]o\b/gi] },
  { label: '❤️', patterns: [/❤️|❤/g] },
  { label: '😘', patterns: [/😘/g] },
];

function countLoveKeywords(messages) {
  const counts = {};
  for (const { label, patterns } of LOVE_KEYWORDS) {
    let total = 0;
    for (const msg of messages) {
      for (const pattern of patterns) {
        const matches = msg.text.match(pattern);
        if (matches) total += matches.length;
      }
    }
    counts[label] = total;
  }
  return counts;
}

function getResponseTimes(messages) {
  const responsesByAuthor = {};
  
  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1];
    const curr = messages[i];
    
    // Different author responding
    if (curr.author !== prev.author) {
      const diffMs = curr.date - prev.date;
      const diffMin = diffMs / 60000;
      
      // Only count responses under 3 hours (reasonable conversation)
      if (diffMin > 0 && diffMin < 180) {
        if (!responsesByAuthor[curr.author]) {
          responsesByAuthor[curr.author] = [];
        }
        responsesByAuthor[curr.author].push(diffMin);
      }
    }
  }
  
  const result = {};
  for (const [author, times] of Object.entries(responsesByAuthor)) {
    const sorted = [...times].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    result[author] = Math.round(median);
  }
  return result;
}

function getDayStarters(messages) {
  const starters = {};
  
  let prevDate = null;
  for (const msg of messages) {
    const dateKey = msg.date.toDateString();
    if (dateKey !== prevDate) {
      starters[msg.author] = (starters[msg.author] || 0) + 1;
      prevDate = dateKey;
    }
  }
  return starters;
}

function getHourlyActivity(messages) {
  const hours = Array(24).fill(0);
  for (const msg of messages) {
    hours[msg.date.getHours()]++;
  }
  return hours;
}

function getDayOfWeekActivity(messages) {
  const days = Array(7).fill(0);
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  for (const msg of messages) {
    days[msg.date.getDay()]++;
  }
  return days.map((count, i) => ({ day: dayNames[i], count }));
}

function getMonthlyTimeline(messages) {
  const monthly = {};
  for (const msg of messages) {
    const key = `${msg.date.getFullYear()}-${String(msg.date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthly[key]) {
      monthly[key] = { total: 0 };
    }
    monthly[key].total++;
    monthly[key][msg.author] = (monthly[key][msg.author] || 0) + 1;
  }
  
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const label = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      return { key, label, ...data };
    });
}

function getBusiestDay(messages) {
  const byDay = {};
  for (const msg of messages) {
    const key = msg.date.toDateString();
    if (!byDay[key]) byDay[key] = { count: 0, date: msg.date, messages: [] };
    byDay[key].count++;
    if (byDay[key].messages.length < 5) byDay[key].messages.push(msg.text);
  }
  
  const sorted = Object.values(byDay).sort((a, b) => b.count - a.count);
  return sorted[0] || null;
}

function getRandomMessage(messages) {
  const contentMessages = messages.filter(m => 
    m.text.length > 10 && 
    !isSystemMessage(m.text) &&
    !/^(ok|sí|no|jaja|jajaja|😂|👍|❤️)$/i.test(m.text.trim())
  );
  if (!contentMessages.length) return messages[0];
  return contentMessages[Math.floor(Math.random() * contentMessages.length)];
}

// ─── MAIN ANALYTICS EXPORT ───────────────────────────────────────────────────────

export function computeAnalytics(messages) {
  if (!messages || messages.length === 0) return null;

  // Detect participants (top 2 by message count)
  const authorCounts = {};
  for (const msg of messages) {
    authorCounts[msg.author] = (authorCounts[msg.author] || 0) + 1;
  }
  const participants = Object.entries(authorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([name]) => name);

  // Filter to only participant messages
  const participantMsgs = messages.filter(m => participants.includes(m.author));

  // Basic stats
  const totalMessages = participantMsgs.length;
  const firstMsg = participantMsgs[0];
  const lastMsg = participantMsgs[participantMsgs.length - 1];
  const daysDiff = Math.floor((lastMsg.date - firstMsg.date) / (1000 * 60 * 60 * 24));

  // Per-author stats
  const perAuthor = {};
  for (const p of participants) {
    const msgs = participantMsgs.filter(m => m.author === p);
    const wordCount = msgs.reduce((acc, m) => acc + m.text.split(/\s+/).length, 0);
    const allEmojis = msgs.reduce((acc, m) => {
      const e = countEmojis(m.text);
      for (const [k, v] of Object.entries(e)) acc[k] = (acc[k] || 0) + v;
      return acc;
    }, {});
    const allWords = msgs.flatMap(m => tokenize(m.text));
    const wordFreq = {};
    for (const w of allWords) wordFreq[w] = (wordFreq[w] || 0) + 1;

    perAuthor[p] = {
      messageCount: msgs.length,
      wordCount,
      topEmojis: getTopN(allEmojis, 5),
      topWords: getTopN(wordFreq, 20),
      percentage: Math.round((msgs.length / totalMessages) * 100),
    };
  }

  // Combined word cloud
  const allWords = participantMsgs.flatMap(m => tokenize(m.text));
  const combinedFreq = {};
  for (const w of allWords) combinedFreq[w] = (combinedFreq[w] || 0) + 1;
  const wordCloud = getTopN(combinedFreq, 60);

  return {
    participants,
    totalMessages,
    totalWords: Object.values(perAuthor).reduce((acc, a) => acc + a.wordCount, 0),
    daysTogether: daysDiff,
    firstMessage: firstMsg,
    lastMessage: lastMsg,
    perAuthor,
    wordCloud,
    responseTimes: getResponseTimes(participantMsgs),
    dayStarters: getDayStarters(participantMsgs),
    hourlyActivity: getHourlyActivity(participantMsgs),
    dayOfWeekActivity: getDayOfWeekActivity(participantMsgs),
    monthlyTimeline: getMonthlyTimeline(participantMsgs),
    busiestDay: getBusiestDay(participantMsgs),
    loveKeywords: countLoveKeywords(participantMsgs),
    allMessages: participantMsgs,
    randomMessage: () => getRandomMessage(participantMsgs),
  };
}
