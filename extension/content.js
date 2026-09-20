const MAX_EXTRACTED_CHARS = 8000;

function extractText() {
  const source = document.querySelector('main, article') || document.body;
  const body = source.cloneNode(true);
  body.querySelectorAll('script, style, noscript, iframe, nav, footer').forEach((el) => el.remove());
  return (body.textContent || body.innerText || '').replace(/\s+/g, ' ').trim();
}

function containsLegalKeywords(text) {
  const legalPatterns = [
    /acceptable/i, /agreement/i, /community/i, /compliance/i, /conditions/i,
    /confidentiality/i, /cookie/i, /data/i, /disclaimer/i, /eula/i,
    /guidelines/i, /intellectual/i, /legal/i, /license/i, /policy/i,
    /privacy/i, /processing/i, /refund/i, /rights/i, /security/i,
    /service/i, /terms/i,
  ];
  return legalPatterns.some((pattern) => pattern.test(text));
}

async function checkAndAnalyze() {
  const url = window.location.href;
  if (!['http:', 'https:'].includes(window.location.protocol)) return;

  const storageGet = (keys) => new Promise((resolve) => chrome.storage.local.get(keys, resolve));
  const data = await storageGet(url);
  if (data && data[url]) return;

  const text = extractText();
  if (!text || !containsLegalKeywords(text)) return;

  chrome.runtime.sendMessage({
    action: 'analyze',
    text: text.slice(0, MAX_EXTRACTED_CHARS),
    url,
    title: document.title.slice(0, 500),
  });
}

void checkAndAnalyze();
