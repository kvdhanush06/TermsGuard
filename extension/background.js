const storageGet = (keys) => new Promise((resolve) => chrome.storage.local.get(keys, resolve));
const storageSet = (items) => new Promise((resolve) => chrome.storage.local.set(items, resolve));

const MAX_DOCUMENT_CHARS = 8000;
const MAX_URL_CHARS = 2048;
const MAX_TITLE_CHARS = 500;
const MAX_HISTORY_ITEMS = 50;

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.username === '' && url.password === '';
  } catch {
    return false;
  }
}

function validateAnalyzeMessage(message) {
  if (!message || message.action !== 'analyze') return false;
  if (typeof message.text !== 'string' || message.text.trim().length === 0) return false;
  if (message.text.length > MAX_DOCUMENT_CHARS * 4) return false;
  if (typeof message.url !== 'string' || message.url.length > MAX_URL_CHARS || !isValidHttpUrl(message.url)) return false;
  if (typeof message.title !== 'string' || message.title.length > MAX_TITLE_CHARS) return false;
  return true;
}

function normalizeResult(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('INVALID_AI_RESPONSE');
  }
  const { summary, key_points, risk_level, red_flags } = value;
  if (
    typeof summary !== 'string' ||
    !Array.isArray(key_points) ||
    !key_points.every((item) => typeof item === 'string') ||
    !['Low', 'Medium', 'High'].includes(risk_level) ||
    !Array.isArray(red_flags) ||
    !red_flags.every((item) => typeof item === 'string')
  ) {
    throw new Error('INVALID_AI_RESPONSE');
  }
  return {
    summary: summary.slice(0, 5000),
    key_points: key_points.slice(0, 30).map((item) => item.slice(0, 1000)),
    risk_level,
    red_flags: red_flags.slice(0, 30).map((item) => item.slice(0, 1000)),
  };
}

chrome.runtime.onMessage.addListener((message) => {
  if (!validateAnalyzeMessage(message)) return;

  void (async () => {
    try {
      const result = await analyzeDocument(message.text);
      await storageSet({ [message.url]: result });

      const historyObj = await storageGet('history');
      const history = Array.isArray(historyObj?.history) ? historyObj.history : [];
      history.unshift({
        url: message.url,
        title: message.title,
        timestamp: Date.now(),
        result,
      });
      if (history.length > MAX_HISTORY_ITEMS) history.length = MAX_HISTORY_ITEMS;
      await storageSet({ history });

      if (result.risk_level === 'High') {
        chrome.notifications.create({
          type: 'basic',
          title: 'TermsGuard Alert',
          message: 'High risk detected in this legal document.',
        });
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
    }
  })();
});

async function analyzeDocument(text) {
  const prompt = `You are an expert legal assistant. Analyze the following legal document excerpt. Provide a concise summary in plain English. Extract key points including data usage, cancellation policies, user rights, and potential red flags. Assess overall risk level as Low (green), Medium (yellow), or High (red) based on privacy concerns, data collection aggressiveness, and user rights limitations. Format your response as valid JSON with keys: summary (string), key_points (array of strings), risk_level (string: 'Low', 'Medium', or 'High'), red_flags (array of strings). Do not include any other text.`;
  const truncatedText = text.slice(0, MAX_DOCUMENT_CHARS);

  const keyObj = await storageGet('GROQ_API_KEY');
  const GROQ_API_KEY = typeof keyObj?.GROQ_API_KEY === 'string' ? keyObj.GROQ_API_KEY.trim() : '';
  if (!GROQ_API_KEY) {
    try {
      chrome.notifications.create({
        type: 'basic',
        title: 'TermsGuard — API key missing',
        message: 'Groq API key is not set. Open extension options to enter your key.',
      });
    } catch {
      // Notification failures must not mask the actual configuration error.
    }
    throw new Error('GROQ_API_KEY_NOT_SET');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that responds only with valid JSON.' },
        { role: 'user', content: `${prompt}\n\nDocument:\n${truncatedText}` },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      top_p: 1,
      stream: false,
      reasoning_effort: 'medium',
      stop: null,
    }),
  });

  if (!response.ok) throw new Error(`API request failed: ${response.status}`);

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('INVALID_AI_RESPONSE');
  return normalizeResult(JSON.parse(content.trim()));
}
