function extractText() {
  // Simple extraction: get body text, remove scripts and styles
  const body = document.body.cloneNode(true);
  const scripts = body.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());
  return body.textContent || body.innerText || '';
}

function containsLegalKeywords(text) {
    const legalPatterns = [
        /acceptable/i,
        /agreement/i,
        /community/i,
        /compliance/i,
        /conditions/i,
        /confidentiality/i,
        /cookie/i,
        /data/i,
        /disclaimer/i,
        /eula/i,
        /guidelines/i,
        /intellectual/i,
        /legal/i,
        /license/i,
        /policy/i,
        /privacy/i,
        /processing/i,
        /refund/i,
        /rights/i,
        /security/i,
        /service/i,
        /terms/i
      ];
  return legalPatterns.some(pattern => pattern.test(text));
}

async function checkAndAnalyze() {
  const url = window.location.href;

  const data = await chrome.storage.local.get(url);
  if (data[url]) return; // Already analyzed

  if (!containsLegalKeywords(url)) return;

  const text = extractText();

  chrome.runtime.sendMessage({
    action: 'analyze',
    text: text,
    url: url,
    title: document.title
  });
}

checkAndAnalyze();