document.addEventListener('DOMContentLoaded', async () => {
  const contentDiv = document.getElementById('content');
  const exportButtons = document.getElementById('export-buttons');

  // Get current tab and load analysis
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  const data = await chrome.storage.local.get(url);
  const result = data[url];

  if (result) {
    displayAnalysis(result);
    exportButtons.style.display = 'block';
  } else {
    contentDiv.innerHTML = '<div class="no-analysis">No analysis available for this page. If this is a legal document, it may still be processing or not detected.</div>';
  }

  // Add event listeners for export buttons
  document.getElementById('copy-clipboard').addEventListener('click', () => copyToClipboard(result));
});

function displayAnalysis(result) {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = `
    <div class="risk ${result.risk_level.toLowerCase()}">Risk Level: ${result.risk_level}</div>
    <div class="section">
      <div class="section-title">Summary</div>
      <p>${result.summary}</p>
    </div>
    <div class="section">
      <div class="section-title key-points">Key Points</div>
      <ul>${result.key_points.map(point => `<li>${point}</li>`).join('')}</ul>
    </div>
    <div class="section">
      <div class="section-title red-flags">Red Flags</div>
      <ul>${result.red_flags.map(flag => `<li>${flag}</li>`).join('')}</ul>
    </div>
  `;
}

function copyToClipboard(result) {
  const text = `TermsGuard Analysis\n\nRisk Level: ${result.risk_level}\n\nSummary: ${result.summary}\n\nKey Points:\n${result.key_points.map(p => `- ${p}`).join('\n')}\n\nRed Flags:\n${result.red_flags.map(f => `- ${f}`).join('\n')}`;
  navigator.clipboard.writeText(text);
}