document.addEventListener('DOMContentLoaded', async () => {
  const contentDiv = document.getElementById('content');

  // Get current tab and load analysis
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  const data = await chrome.storage.local.get(url);
  const result = data[url];

  if (result) {
    displayAnalysis(result);
  } else {
    contentDiv.innerHTML = '<div class="no-analysis">No analysis available for this page. If this is a legal document, it may still be processing or not detected.</div>';
  }
});

function displayAnalysis(result) {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = `
    <div class="risk ${result.risk_level.toLowerCase()}">Risk Level: ${result.risk_level}</div>
    <div id="summary"><strong>Summary:</strong> ${result.summary}</div>
    <div><strong>Key Points:</strong>
      <ul>${result.key_points.map(point => `<li>${point}</li>`).join('')}</ul>
    </div>
    <div><strong>Red Flags:</strong>
      <ul>${result.red_flags.map(flag => `<li>${flag}</li>`).join('')}</ul>
    </div>
  `;
}